import React, { useCallback, useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import type { CanvasElement as El, Breakpoint, BreakpointOverride, BuilderState, CellLayoutMode, FlexItemLayout } from '../types';
import { ElementContent } from './CanvasElement';
import { applyBreakpoint } from '../hooks/useBuilderStore';

// ── DND contract (imported by GridCellView) ────────────────────────────────
export const GRID_EL_DND_TYPE = 'grid-element';

export interface GridElDragItem {
  elementId: string;
  sourceCellId: string;
  sourceIndex: number;
}

// ── Flex width resolver (also used by export) ──────────────────────────────
export function resolveFlexItemWidth(fl: FlexItemLayout, cellMode: CellLayoutMode): React.CSSProperties {
  const grow = fl.flexGrow === 1;
  switch (fl.widthMode) {
    case 'fill':
      // fill already implies grow; the explicit flexGrow field has no additional effect here
      return cellMode === 'column' ? { width: '100%' } : { flex: '1 1 0', minWidth: 0 };
    case 'auto':
      return { width: 'auto', flexShrink: 1, ...(grow ? { flexGrow: 1 } : {}) };
    case 'fixed':
      return { width: fl.widthValue, flexShrink: 0, ...(grow ? { flexGrow: 1 } : {}) };
    case 'percent':
      return { width: `${fl.widthValue}%`, flexShrink: 1, ...(grow ? { flexGrow: 1 } : {}) };
  }
}

// ── Component ──────────────────────────────────────────────────────────────
interface Props {
  element: El;
  cellId: string;
  elementIndex: number;
  cellMode: CellLayoutMode;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<El>) => void;
  onCommit: (prev: BuilderState) => void;
  snapshot: BuilderState;
  previewMode?: boolean;
  breakpoint?: Breakpoint;
  onUpdateResponsive?: (id: string, bp: Breakpoint, updates: Partial<BreakpointOverride>) => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  /** Called on hover so the parent cell can render an insertion line. */
  onDragHover: (afterIndex: number) => void;
  /** Called when a dragged grid element is dropped onto this element. */
  onDropGridElement: (item: GridElDragItem, afterIndex: number) => void;
}

export function GridElementView({
  element: rawEl,
  cellId,
  elementIndex,
  cellMode,
  isSelected,
  onSelect,
  onUpdate,
  onCommit,
  snapshot,
  previewMode,
  breakpoint = 'desktop',
  onUpdateResponsive,
  onDuplicate,
  onDelete,
  onDragHover,
  onDropGridElement,
}: Props) {
  const el = applyBreakpoint(rawEl, breakpoint);

  const [editing, setEditing] = useState(false);

  // ── Drag source ──────────────────────────────────────────────────────────
  const [{ isDragging }, dragRef] = useDrag<GridElDragItem, void, { isDragging: boolean }>({
    type: GRID_EL_DND_TYPE,
    item: { elementId: rawEl.id, sourceCellId: cellId, sourceIndex: elementIndex },
    canDrag: !previewMode && !editing,
    collect: m => ({ isDragging: m.isDragging() }),
  });

  // ── Drop target — computes insertion position relative to this element ───
  const [, dropRef] = useDrop<GridElDragItem, void, Record<string, never>>({
    accept: GRID_EL_DND_TYPE,
    hover(item, monitor) {
      if (!domRef.current || item.elementId === rawEl.id) return;
      const rect = domRef.current.getBoundingClientRect();
      const offset = monitor.getClientOffset();
      if (!offset) return;
      // Row cells: split on X axis; column / wrap: split on Y axis
      const afterThis = cellMode === 'row'
        ? offset.x - rect.left >= (rect.right - rect.left) / 2
        : offset.y - rect.top  >= (rect.bottom - rect.top) / 2;
      onDragHover(afterThis ? elementIndex : elementIndex - 1);
    },
    drop(item, monitor) {
      if (monitor.didDrop() || !domRef.current || item.elementId === rawEl.id) return;
      const rect = domRef.current.getBoundingClientRect();
      const offset = monitor.getClientOffset();
      const afterThis = offset
        ? (cellMode === 'row'
            ? offset.x - rect.left >= (rect.right - rect.left) / 2
            : offset.y - rect.top  >= (rect.bottom - rect.top) / 2)
        : true;
      onDropGridElement(item, afterThis ? elementIndex : elementIndex - 1);
    },
  });

  // Merge drag + drop onto the same DOM node
  const domRef = useRef<HTMLDivElement>(null);
  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => {
      domRef.current = node;
      (dragRef as (el: HTMLDivElement | null) => void)(node);
      (dropRef as (el: HTMLDivElement | null) => void)(node);
    },
    [dragRef, dropRef],
  );

  // Must stay above the early-return so hook call order is stable
  const editRef = useRef<HTMLDivElement | null>(null);

  if (el.state.hidden) return null;

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (previewMode || (el.type !== 'text' && el.type !== 'button')) return;
    e.stopPropagation();
    setEditing(true);
    setTimeout(() => {
      editRef.current?.focus();
      const range = document.createRange();
      const sel = window.getSelection();
      if (editRef.current && sel) {
        range.selectNodeContents(editRef.current);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }, 0);
  };

  const handleEditBlur = () => {
    if (!editing) return;
    const html = editRef.current?.innerHTML ?? '';
    const text = editRef.current?.innerText ?? '';
    onCommit(snapshot);
    if (el.type === 'text') onUpdate({ content: { ...el.content, rich: html, plain: text } });
    if (el.type === 'button') onUpdate({ content: { ...el.content, label: text } });
    setEditing(false);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (editRef.current) editRef.current.innerText = el.type === 'button' ? (el.content.label ?? '') : (el.content.plain ?? '');
      setEditing(false);
    }
    if (e.key === 'Enter' && el.type === 'button') {
      e.preventDefault();
      handleEditBlur();
    }
  };

  const shadow = el.style.shadow.enabled
    ? `${el.style.shadow.x}px ${el.style.shadow.y}px ${el.style.shadow.blur}px ${el.style.shadow.spread}px ${el.style.shadow.color}`
    : undefined;

  const flexSizing = resolveFlexItemWidth(el.flexLayout, cellMode);
  const alignSelf  = el.flexLayout.alignSelf !== 'auto' ? el.flexLayout.alignSelf : undefined;

  const handleClick = (e: React.MouseEvent) => {
    if (previewMode) return;
    e.stopPropagation();
    onSelect();
  };

  return (
    <div
      ref={mergedRef}
      className={[
        'grid-el',
        isSelected && !previewMode ? 'grid-el--selected' : '',
        isDragging ? 'grid-el--dragging' : '',
      ].filter(Boolean).join(' ')}
      style={{
        position: 'relative',
        ...flexSizing,
        alignSelf,
        minHeight: el.layout.height,
        opacity: isDragging ? 0.35 : el.style.opacity,
        boxShadow: shadow,
        borderRadius: el.style.border.radius > 0 ? el.style.border.radius : undefined,
        cursor: previewMode ? 'default' : editing ? 'text' : isDragging ? 'grabbing' : 'grab',
        userSelect: editing ? 'text' : 'none',
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={e => { if (!previewMode) e.preventDefault(); }}
    >
      <ElementContent
        el={el}
        editing={editing}
        editRef={editRef}
        onBlur={handleEditBlur}
        onKeyDown={handleEditKeyDown}
      />

      {isSelected && !previewMode && (
        <div className="grid-el-quick-bar" onMouseDown={e => e.stopPropagation()}>
          {onDuplicate && (
            <button className="el-quick-btn" title="Duplicate" onClick={e => { e.stopPropagation(); onDuplicate(); }}>⧉</button>
          )}
          {onDelete && (
            <button className="el-quick-btn danger" title="Delete" onClick={e => { e.stopPropagation(); onDelete(); }}>✕</button>
          )}
        </div>
      )}
    </div>
  );
}

import React, { useCallback, useRef, useState } from 'react';
import { richTextState } from '../utils/richTextState';
import { useDrag, useDrop } from 'react-dnd';
import type { CanvasElement as El, Breakpoint, BreakpointOverride, BuilderState, CellLayoutMode, FlexItemLayout } from '../types';
import { ElementContent } from './CanvasElement';
import { applyBreakpoint } from '../hooks/useBuilderStore';
import { ElementQuickBar } from './ElementQuickBar';


// ── DND contract (imported by GridCellView) ────────────────────────────────
export const GRID_EL_DND_TYPE = 'grid-element';

export type GridElDragItem =
  | { kind: 'element'; elementId: string; sourceCellId: string; fromChildIdx: number; sourceCellMode: CellLayoutMode }
  | { kind: 'container'; blockId: string; parentCellId: string; fromChildIdx: number };

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
  /** Position of this element in the combined flexChildrenWithIndex list. */
  childIdx: number;
  cellMode: CellLayoutMode;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<El>) => void;
  onCommit: (prev: BuilderState) => void;
  snapshot: BuilderState;
  previewMode?: boolean;
  disableDrag?: boolean;
  breakpoint?: Breakpoint;
  onUpdateResponsive?: (id: string, bp: Breakpoint, updates: Partial<BreakpointOverride>) => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  /** Called on hover so the parent cell can render an insertion line. */
  onDragHover: (afterIndex: number) => void;
  /** Called when a dragged item is dropped onto this element. */
  onDropAtChildIdx: (item: GridElDragItem, afterChildIdx: number) => void;
}

export function GridElementView({
  element: rawEl,
  cellId,
  childIdx,
  cellMode,
  isSelected,
  onSelect,
  onUpdate,
  onCommit,
  snapshot,
  previewMode,
  disableDrag = false,
  breakpoint = 'desktop',
  onUpdateResponsive,
  onDuplicate,
  onDelete,
  onDragHover,
  onDropAtChildIdx,
}: Props) {
  const el = applyBreakpoint(rawEl, breakpoint);

  const [editing, setEditing] = useState(false);
  const [hovered, setHovered] = useState(false);

  // ── Drag source ──────────────────────────────────────────────────────────
  const [{ isDragging }, dragRef] = useDrag<GridElDragItem, void, { isDragging: boolean }>({
    type: GRID_EL_DND_TYPE,
    item: { kind: 'element', elementId: rawEl.id, sourceCellId: cellId, fromChildIdx: childIdx, sourceCellMode: cellMode },
    canDrag: !previewMode && !editing && !disableDrag && !rawEl.state.locked,
    collect: m => ({ isDragging: m.isDragging() }),
  });

  // ── Drop target — computes insertion position relative to this element ───
  const [, dropRef] = useDrop<GridElDragItem, void, Record<string, never>>({
    accept: GRID_EL_DND_TYPE,
    hover(item, monitor) {
      if (!domRef.current) return;
      if (item.kind === 'element' && item.elementId === rawEl.id) return;
      const rect = domRef.current.getBoundingClientRect();
      const offset = monitor.getClientOffset();
      if (!offset) return;
      // Row cells: split on X axis; column / wrap: split on Y axis
      const afterThis = cellMode === 'row'
        ? offset.x - rect.left >= (rect.right - rect.left) / 2
        : offset.y - rect.top  >= (rect.bottom - rect.top) / 2;
      onDragHover(afterThis ? childIdx : childIdx - 1);
    },
    drop(item, monitor) {
      if (monitor.didDrop() || !domRef.current) return;
      if (item.kind === 'element' && item.elementId === rawEl.id) return;
      const rect = domRef.current.getBoundingClientRect();
      const offset = monitor.getClientOffset();
      const afterThis = offset
        ? (cellMode === 'row'
            ? offset.x - rect.left >= (rect.right - rect.left) / 2
            : offset.y - rect.top  >= (rect.bottom - rect.top) / 2)
        : true;
      onDropAtChildIdx(item, afterThis ? childIdx : childIdx - 1);
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
    if (richTextState.applyingFormat) {
      setTimeout(() => editRef.current?.focus(), 0);
      return;
    }
    const html = editRef.current?.innerHTML ?? '';
    const text = editRef.current?.innerText ?? '';
    onCommit(snapshot);
    if (el.type === 'text') onUpdate({ content: { ...el.content, rich: html, plain: text } });
    if (el.type === 'button') onUpdate({ content: { ...el.content, label: text } });
    setEditing(false);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (editRef.current) {
        if (el.type === 'button') editRef.current.innerText = el.content.label ?? '';
        else editRef.current.innerHTML = el.content.rich || el.content.plain || '';
      }
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

  const handleClick = (e: React.MouseEvent) => {
    if (previewMode) return;
    e.stopPropagation();
    onSelect();
  };

  // ── Free-canvas mode: absolutely positioned, dragged via DnD ─────────────
  if (cellMode === 'free') {
    return (
      <div
        ref={mergedRef}
        data-el-id={rawEl.id}
        className={['pb-grid-el', isSelected && !previewMode && 'pb-grid-el--selected', hovered && !isSelected && !previewMode && 'pb-grid-el--hovered', isDragging && 'pb-grid-el--dragging'].filter(Boolean).join(' ')}
        style={{
          position: 'absolute',
          left: rawEl.layout.x,
          top: rawEl.layout.y,
          width: rawEl.layout.width,
          height: rawEl.layout.height,
          zIndex: rawEl.layout.zIndex,
          opacity: isDragging ? 0.35 : el.style.opacity,
          boxShadow: shadow,
          borderRadius: el.style.border.radius > 0 ? el.style.border.radius : undefined,
          cursor: previewMode ? 'default' : disableDrag ? 'inherit' : editing ? 'text' : isDragging ? 'grabbing' : 'grab',
          userSelect: editing ? 'text' : 'none',
          boxSizing: 'border-box',
        }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
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
          <ElementQuickBar anchorRef={domRef} onDuplicate={onDuplicate} onDelete={onDelete} />
        )}
      </div>
    );
  }

  // ── Flex-flow mode (column / row / wrap) ───────────────────────────────────
  const flexSizing = resolveFlexItemWidth(el.flexLayout, cellMode);
  const alignSelf  = el.flexLayout.alignSelf !== 'auto' ? el.flexLayout.alignSelf : undefined;

  return (
    <div
      ref={mergedRef}
      data-el-id={rawEl.id}
      className={[
        'pb-grid-el',
        isSelected && !previewMode && 'pb-grid-el--selected',
        hovered && !isSelected && !previewMode && 'pb-grid-el--hovered',
        isDragging && 'pb-grid-el--dragging',
      ].filter(Boolean).join(' ')}
      style={{
        position: 'relative',
        ...flexSizing,
        alignSelf,
        ...(el.type === 'text' || el.type === 'button'
          ? {}
          : { height: el.layout.height }),
        opacity: isDragging ? 0.35 : el.style.opacity,
        boxShadow: shadow,
        borderRadius: el.style.border.radius > 0 ? el.style.border.radius : undefined,
        cursor: previewMode ? 'default' : editing ? 'text' : isDragging ? 'grabbing' : 'grab',
        userSelect: editing ? 'text' : 'none',
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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
        <ElementQuickBar anchorRef={domRef} onDuplicate={onDuplicate} onDelete={onDelete} />
      )}
    </div>
  );
}

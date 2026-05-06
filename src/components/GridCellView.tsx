import React, { useCallback, useEffect, useState } from 'react';
import { useDrop } from 'react-dnd';
import type { Breakpoint, BreakpointOverride, BuilderState, CanvasElement as El, CellLayoutMode, GridCell, NodeMap, ElementType } from '../types';
import { DND_TYPE } from './LeftSidebar';
import { GridElementView, GRID_EL_DND_TYPE } from './GridElementView';
import type { GridElDragItem } from './GridElementView';

interface Props {
  cell: GridCell;
  nodes: NodeMap;
  isSelected: boolean;
  selectedElementId: string | null;
  onSelectCell: () => void;
  onSelectElement: (id: string) => void;
  onUpdateElement: (id: string, updates: Partial<El>) => void;
  onUpdateCell: (updates: Partial<GridCell>) => void;
  onDeleteCell: () => void;
  onAddElement: (type: ElementType) => void;
  onMoveGridElement?: (elementId: string, sourceCellId: string, targetCellId: string, insertIndex: number) => void;
  onCommit: (prev: BuilderState) => void;
  snapshot: BuilderState;
  previewMode?: boolean;
  breakpoint?: Breakpoint;
  onUpdateResponsive?: (id: string, bp: Breakpoint, updates: Partial<BreakpointOverride>) => void;
  onDuplicateElement?: (id: string) => void;
  onDeleteElement?: (id: string) => void;
}

function getColumnSpan(cell: GridCell, bp: Breakpoint): number {
  if (bp === 'tablet') return cell.responsive.tablet?.columnSpan ?? cell.columnSpan;
  if (bp === 'mobile') return cell.responsive.mobile?.columnSpan ?? cell.responsive.tablet?.columnSpan ?? cell.columnSpan;
  return cell.columnSpan;
}

function getEffectiveCellMode(cell: GridCell, bp: Breakpoint): CellLayoutMode {
  if (bp === 'tablet') return cell.responsive.tablet?.layoutMode ?? cell.style.layoutMode;
  if (bp === 'mobile') return cell.responsive.mobile?.layoutMode ?? cell.responsive.tablet?.layoutMode ?? cell.style.layoutMode;
  return cell.style.layoutMode;
}

export function GridCellView({
  cell, nodes, isSelected, selectedElementId,
  onSelectCell, onSelectElement, onUpdateElement,
  onUpdateCell, onDeleteCell, onAddElement, onMoveGridElement,
  onCommit, snapshot, previewMode,
  breakpoint = 'desktop',
  onUpdateResponsive, onDuplicateElement, onDeleteElement,
}: Props) {

  // ── Values computed early (before hooks so closures can capture them) ─────
  const bp = breakpoint;
  const span = getColumnSpan(cell, bp);
  const elements = cell.children
    .map(id => nodes[id] as El | undefined)
    .filter((el): el is El => !!el);

  // ── Insertion-line state ─────────────────────────────────────────────────
  // afterIndex: render the line after elements[afterIndex].
  // -1 means before the first element.
  const [insertAfterIndex, setInsertAfterIndex] = useState<number | null>(null);

  // ── Drop: new elements from the sidebar (palette) ───────────────────────
  const [{ isOver: isPaletteOver }, paletteDropRef] = useDrop<{ type: ElementType }, void, { isOver: boolean }>({
    accept: DND_TYPE,
    drop: item => { onAddElement(item.type); },
    collect: m => ({ isOver: m.isOver() }),
  });

  // ── Drop: existing grid elements (reorder / cross-cell move) ────────────
  const [{ isGridElOver }, gridElDropRef] = useDrop<GridElDragItem, void, { isGridElOver: boolean }>({
    accept: GRID_EL_DND_TYPE,
    hover(_item, monitor) {
      // Only act when the cursor is directly over the cell background (not a child).
      if (!monitor.isOver({ shallow: true })) return;
      setInsertAfterIndex(elements.length - 1);
    },
    drop(item, monitor) {
      if (monitor.didDrop()) return; // a child element already handled this
      // Defer the store mutation so dragend fires (and react-dnd resets) before
      // React unmounts the source element — prevents the backend getting stuck.
      const { elementId, sourceCellId } = item;
      const insertAt = elements.length;
      setTimeout(() => onMoveGridElement?.(elementId, sourceCellId, cell.id, insertAt), 0);
      setInsertAfterIndex(null);
    },
    // Track whether ANY nested drop target under this cell is active so we can
    // clear the insertion line when the drag leaves entirely.
    collect: m => ({ isGridElOver: m.isOver({ shallow: false }) }),
  });

  // Clear the line whenever the drag leaves the cell entirely.
  useEffect(() => {
    if (!isGridElOver) setInsertAfterIndex(null);
  }, [isGridElOver]);

  // Merge both drop connectors onto the same cell div.
  const combinedDropRef = useCallback(
    (node: HTMLDivElement | null) => {
      (paletteDropRef as (el: HTMLDivElement | null) => void)(node);
      (gridElDropRef  as (el: HTMLDivElement | null) => void)(node);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // ── Span resize ──────────────────────────────────────────────────────────
  const handleSpanChange = useCallback((delta: number) => {
    const newSpan = Math.max(1, Math.min(12, span + delta));
    if (newSpan === span) return;
    // updateGridCell now calls push() internally — no separate onCommit needed here
    if (bp === 'desktop') {
      onUpdateCell({ columnSpan: newSpan });
    } else if (bp === 'tablet') {
      onUpdateCell({ responsive: { ...cell.responsive, tablet: { ...cell.responsive.tablet, columnSpan: newSpan } } });
    } else {
      onUpdateCell({ responsive: { ...cell.responsive, mobile: { ...cell.responsive.mobile, columnSpan: newSpan } } });
    }
  }, [span, bp, cell.responsive, onCommit, snapshot, onUpdateCell]);

  // ── Callbacks for child elements ─────────────────────────────────────────
  const handleDragHover = useCallback((afterIdx: number) => setInsertAfterIndex(afterIdx), []);

  const handleDropOnElement = useCallback((item: GridElDragItem, afterIdx: number) => {
    const { elementId, sourceCellId } = item;
    const insertAt = afterIdx + 1;
    setTimeout(() => onMoveGridElement?.(elementId, sourceCellId, cell.id, insertAt), 0);
    setInsertAfterIndex(null);
  }, [cell.id, onMoveGridElement]);

  // ── Hidden check / early return ───────────────────────────────────────────
  const hidden = bp === 'tablet'
    ? (cell.responsive.tablet?.hidden ?? false)
    : bp === 'mobile'
    ? (cell.responsive.mobile?.hidden ?? cell.responsive.tablet?.hidden ?? false)
    : false;

  if (hidden && previewMode) return null;

  // ── Render helpers ────────────────────────────────────────────────────────
  const cellMode = getEffectiveCellMode(cell, bp);
  const { gap, padding, border, minHeight: desktopMinH } = cell.style;
  const padStr = `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`;

  // Resolve responsive minHeight
  const effectiveMinH =
    bp === 'mobile'
      ? (cell.responsive.mobile?.minHeight ?? cell.responsive.tablet?.minHeight ?? desktopMinH ?? 80)
      : bp === 'tablet'
      ? (cell.responsive.tablet?.minHeight ?? desktopMinH ?? 80)
      : (desktopMinH ?? 80);

  let bgColor: string | undefined;
  let bgImage: string | undefined;
  const bg = cell.style.background;
  if (bg.type === 'linear-gradient') bgImage = `linear-gradient(${bg.angle}deg, ${bg.from}, ${bg.to})`;
  else if (bg.type === 'radial-gradient') bgImage = `radial-gradient(circle, ${bg.from}, ${bg.to})`;
  else if (bg.image) bgImage = `url(${bg.image})`;
  else if (bg.color && bg.color !== 'transparent') bgColor = bg.color;

  // Border styles from cell.style.border
  const borderRadius = border?.radius ?? 0;
  const borderWidth = border?.width ?? 0;
  const borderColor = border?.color ?? '#cccccc';
  const borderStyle = border?.style ?? 'none';

  const isRow = cellMode === 'row';

  const insertionLine = (afterIdx: number) =>
    insertAfterIndex === afterIdx ? (
      <div key={`ins-${afterIdx}`} className={`grid-insert-line${isRow ? ' grid-insert-line--vertical' : ''}`} />
    ) : null;

  return (
    <div
      ref={combinedDropRef}
      className={[
        'grid-cell',
        isSelected && !previewMode ? 'grid-cell--selected' : '',
        isPaletteOver  ? 'grid-cell--drop-over' : '',
        isGridElOver   ? 'grid-cell--el-over'   : '',
      ].filter(Boolean).join(' ')}
      style={{
        gridColumn: `span ${Math.min(span, 12)}`,
        display: 'flex',
        flexDirection: cellMode === 'column' ? 'column' : 'row',
        flexWrap: cellMode === 'wrap' ? 'wrap' : 'nowrap',
        gap,
        padding: padStr,
        backgroundColor: bgColor,
        backgroundImage: bgImage,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        alignItems: cell.style.alignItems,
        justifyContent: cell.style.justifyContent,
        minHeight: effectiveMinH,
        borderRadius,
        borderWidth,
        borderColor,
        borderStyle,
        position: 'relative',
        boxSizing: 'border-box',
      }}
      onClick={e => { if (previewMode) return; e.stopPropagation(); onSelectCell(); }}
    >
      {/* Insertion line BEFORE first element */}
      {insertionLine(-1)}

      {elements.map((el, idx) => (
        <React.Fragment key={el.id}>
          <GridElementView
            element={el}
            cellId={cell.id}
            elementIndex={idx}
            cellMode={cellMode}
            isSelected={selectedElementId === el.id}
            onSelect={() => onSelectElement(el.id)}
            onUpdate={updates => onUpdateElement(el.id, updates)}
            onCommit={onCommit}
            snapshot={snapshot}
            previewMode={previewMode}
            breakpoint={breakpoint}
            onUpdateResponsive={onUpdateResponsive}
            onDuplicate={onDuplicateElement ? () => onDuplicateElement(el.id) : undefined}
            onDelete={onDeleteElement ? () => onDeleteElement(el.id) : undefined}
            onDragHover={handleDragHover}
            onDropGridElement={handleDropOnElement}
          />
          {/* Insertion line AFTER this element */}
          {insertionLine(idx)}
        </React.Fragment>
      ))}

      {elements.length === 0 && !previewMode && (
        <div className="grid-cell-empty">
          <span className="grid-cell-empty-icon">+</span>
          {isPaletteOver ? 'Drop here' : 'Drop element or drag from panel'}
        </div>
      )}

      {isSelected && !previewMode && (
        <div className="grid-cell-toolbar" onMouseDown={e => e.stopPropagation()}>
          <button
            className="grid-cell-span-btn"
            title="Decrease column span"
            onClick={e => { e.stopPropagation(); handleSpanChange(-1); }}
            disabled={span <= 1}
          >−</button>
          <span className="grid-cell-span-label">col&nbsp;{span}/12</span>
          <button
            className="grid-cell-span-btn"
            title="Increase column span"
            onClick={e => { e.stopPropagation(); handleSpanChange(1); }}
            disabled={span >= 12}
          >+</button>
          <div className="grid-cell-toolbar-sep" />
          <button
            className="grid-cell-delete-btn"
            title="Remove column"
            onClick={e => { e.stopPropagation(); onDeleteCell(); }}
          >✕</button>
        </div>
      )}
    </div>
  );
}

import React, { useCallback, useEffect, useState } from 'react';
import { useDrop } from 'react-dnd';
import type { Breakpoint, BreakpointOverride, BuilderState, CanvasElement as El, CellLayoutMode, GridCell, GridCellStyle, NodeMap, ElementType } from '../types';
import { DND_TYPE } from './LeftSidebar';
import { GridElementView, GRID_EL_DND_TYPE } from './GridElementView';
import type { GridElDragItem } from './GridElementView';
import { DraggableCellWrapper } from './DraggableCellWrapper';

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
  isDragOverTarget?: boolean;
  // Nested grid support — raw callbacks for rendering sub-cells
  selectedGridCellId?: string | null;
  onUpdateGridCell?: (id: string, updates: Partial<GridCell>) => void;
  onDeleteGridCell?: (id: string) => void;
  onAddElementToCell?: (type: ElementType, cellId: string) => void;
  onSelectGridCell?: (id: string | null) => void;
  onReorderGridCell?: (parentId: string, fromIndex: number, toIndex: number) => void;
}

function getColumnSpan(cell: GridCell, bp: Breakpoint): number {
  if (bp === 'tablet') return cell.responsive.tablet?.columnSpan ?? cell.columnSpan;
  if (bp === 'mobile') return cell.responsive.mobile?.columnSpan ?? cell.responsive.tablet?.columnSpan ?? cell.columnSpan;
  return cell.columnSpan;
}

function getRowSpan(cell: GridCell): number {
  return cell.rowSpan ?? 1;
}

function getEffectiveCellMode(cell: GridCell, bp: Breakpoint): CellLayoutMode {
  if (bp === 'tablet') return cell.responsive.tablet?.layoutMode ?? cell.style.layoutMode;
  if (bp === 'mobile') return cell.responsive.mobile?.layoutMode ?? cell.responsive.tablet?.layoutMode ?? cell.style.layoutMode;
  return cell.style.layoutMode;
}

function getEffectiveAlign(cell: GridCell, bp: Breakpoint): GridCellStyle['alignItems'] {
  if (bp === 'tablet') return cell.responsive.tablet?.alignItems ?? cell.style.alignItems;
  if (bp === 'mobile') return cell.responsive.mobile?.alignItems ?? cell.responsive.tablet?.alignItems ?? cell.style.alignItems;
  return cell.style.alignItems;
}

function getEffectiveJustify(cell: GridCell, bp: Breakpoint): GridCellStyle['justifyContent'] {
  if (bp === 'tablet') return cell.responsive.tablet?.justifyContent ?? cell.style.justifyContent;
  if (bp === 'mobile') return cell.responsive.mobile?.justifyContent ?? cell.responsive.tablet?.justifyContent ?? cell.style.justifyContent;
  return cell.style.justifyContent;
}

export function GridCellView({
  cell, nodes, isSelected, selectedElementId,
  onSelectCell, onSelectElement, onUpdateElement,
  onUpdateCell, onDeleteCell, onAddElement, onMoveGridElement,
  onCommit, snapshot, previewMode,
  breakpoint = 'desktop',
  onUpdateResponsive, onDuplicateElement, onDeleteElement,
  isDragOverTarget,
  selectedGridCellId, onUpdateGridCell, onDeleteGridCell,
  onAddElementToCell, onSelectGridCell, onReorderGridCell,
}: Props) {

  const bp = breakpoint;
  const span = getColumnSpan(cell, bp);
  const rowSpan = getRowSpan(cell);
  const isNestedGrid = !!cell.nestedGrid;

  const elements = !isNestedGrid
    ? cell.children
      .map(id => nodes[id])
      .filter((node): node is El => !!node && node.type !== 'section' && node.type !== 'grid-cell')
    : [];

  const subCells = isNestedGrid
    ? cell.children
      .map(id => nodes[id])
      .filter((node): node is GridCell => !!node && node.type === 'grid-cell')
    : [];

  // ── Insertion-line state ─────────────────────────────────────────────────
  const [insertAfterIndex, setInsertAfterIndex] = useState<number | null>(null);

  // ── Drop: new elements from sidebar palette ──────────────────────────────
  const [{ isOver: isPaletteOver }, paletteDropRef] = useDrop<{ type: ElementType }, void, { isOver: boolean }>({
    accept: DND_TYPE,
    canDrop: () => !isNestedGrid,
    drop: item => { if (!isNestedGrid) onAddElement(item.type); },
    collect: m => ({ isOver: m.isOver() && !isNestedGrid }),
  });

  // ── Drop: existing grid elements (reorder / cross-cell move) ────────────
  const [{ isGridElOver }, gridElDropRef] = useDrop<GridElDragItem, void, { isGridElOver: boolean }>({
    accept: GRID_EL_DND_TYPE,
    canDrop: () => !isNestedGrid,
    hover(_item, monitor) {
      if (isNestedGrid || !monitor.isOver({ shallow: true })) return;
      setInsertAfterIndex(elements.length - 1);
    },
    drop(item, monitor) {
      if (isNestedGrid || monitor.didDrop()) return;
      const { elementId, sourceCellId } = item;
      const insertAt = elements.length;
      setTimeout(() => onMoveGridElement?.(elementId, sourceCellId, cell.id, insertAt), 0);
      setInsertAfterIndex(null);
    },
    collect: m => ({ isGridElOver: m.isOver({ shallow: false }) && !isNestedGrid }),
  });

  useEffect(() => {
    if (!isGridElOver) setInsertAfterIndex(null);
  }, [isGridElOver]);

  const combinedDropRef = useCallback(
    (node: HTMLDivElement | null) => {
      (paletteDropRef as (el: HTMLDivElement | null) => void)(node);
      (gridElDropRef  as (el: HTMLDivElement | null) => void)(node);
    },
    [paletteDropRef, gridElDropRef],
  );

  // ── Span resize ──────────────────────────────────────────────────────────
  const handleSpanChange = useCallback((delta: number) => {
    const newSpan = Math.max(1, Math.min(12, span + delta));
    if (newSpan === span) return;
    if (bp === 'desktop') onUpdateCell({ columnSpan: newSpan });
    else if (bp === 'tablet') onUpdateCell({ responsive: { ...cell.responsive, tablet: { ...cell.responsive.tablet, columnSpan: newSpan } } });
    else onUpdateCell({ responsive: { ...cell.responsive, mobile: { ...cell.responsive.mobile, columnSpan: newSpan } } });
  }, [span, bp, cell.responsive, onUpdateCell]);

  const handleRowSpanChange = useCallback((delta: number) => {
    const newSpan = Math.max(1, Math.min(6, rowSpan + delta));
    if (newSpan === rowSpan) return;
    onUpdateCell({ rowSpan: newSpan });
  }, [rowSpan, onUpdateCell]);

  const handleDragHover = useCallback((afterIdx: number) => setInsertAfterIndex(afterIdx), []);

  const handleDropOnElement = useCallback((item: GridElDragItem, afterIdx: number) => {
    const { elementId, sourceCellId } = item;
    setTimeout(() => onMoveGridElement?.(elementId, sourceCellId, cell.id, afterIdx + 1), 0);
    setInsertAfterIndex(null);
  }, [cell.id, onMoveGridElement]);

  // ── Hidden check ──────────────────────────────────────────────────────────
  const hidden = bp === 'tablet'
    ? (cell.responsive.tablet?.hidden ?? false)
    : bp === 'mobile'
    ? (cell.responsive.mobile?.hidden ?? cell.responsive.tablet?.hidden ?? false)
    : false;

  if (hidden && previewMode) return null;

  // ── Shared style helpers ───────────────────────────────────────────────────
  const cellMode = getEffectiveCellMode(cell, bp);
  const { gap, padding, border, minHeight: desktopMinH } = cell.style;
  const padStr = `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`;

  const effectiveMinH =
    bp === 'mobile' ? (cell.responsive.mobile?.minHeight ?? cell.responsive.tablet?.minHeight ?? desktopMinH ?? 80)
    : bp === 'tablet' ? (cell.responsive.tablet?.minHeight ?? desktopMinH ?? 80)
    : (desktopMinH ?? 80);

  let bgColor: string | undefined;
  let bgImage: string | undefined;
  const bg = cell.style.background;
  if (bg.type === 'linear-gradient') bgImage = `linear-gradient(${bg.angle}deg, ${bg.from}, ${bg.to})`;
  else if (bg.type === 'radial-gradient') bgImage = `radial-gradient(circle, ${bg.from}, ${bg.to})`;
  else if (bg.image) bgImage = `url(${bg.image})`;
  else if (bg.color && bg.color !== 'transparent') bgColor = bg.color;

  const borderRadius = border?.radius ?? 0;
  const borderWidth = border?.width ?? 0;
  const borderColor = border?.color ?? '#cccccc';
  const borderStyle = border?.style ?? 'none';

  const sharedCellStyle: React.CSSProperties = {
    height: '100%', padding: padStr,
    backgroundColor: bgColor, backgroundImage: bgImage,
    backgroundSize: 'cover', backgroundPosition: 'center',
    minHeight: effectiveMinH,
    borderRadius, borderWidth, borderColor, borderStyle,
    position: 'relative', boxSizing: 'border-box',
  };

  const cellClassName = [
    'grid-cell',
    isSelected && !previewMode ? 'grid-cell--selected' : '',
    isDragOverTarget ? 'grid-cell--drop-over' : '',
    isNestedGrid ? 'grid-cell--nested-container' : '',
  ].filter(Boolean).join(' ');

  // ── Shared toolbar ─────────────────────────────────────────────────────────
  const toolbar = isSelected && !previewMode ? (
    <div className="grid-cell-toolbar" onMouseDown={e => e.stopPropagation()}>
      <button className="grid-cell-span-btn" title="Decrease column span"
        onClick={e => { e.stopPropagation(); handleSpanChange(-1); }} disabled={span <= 1}>−</button>
      <span className="grid-cell-span-label">col&nbsp;{span}/12</span>
      <button className="grid-cell-span-btn" title="Increase column span"
        onClick={e => { e.stopPropagation(); handleSpanChange(1); }} disabled={span >= 12}>+</button>
      <div className="grid-cell-toolbar-sep" />
      <button className="grid-cell-span-btn" title="Decrease row span"
        onClick={e => { e.stopPropagation(); handleRowSpanChange(-1); }} disabled={rowSpan <= 1}>−</button>
      <span className="grid-cell-span-label">row&nbsp;{rowSpan}</span>
      <button className="grid-cell-span-btn" title="Increase row span"
        onClick={e => { e.stopPropagation(); handleRowSpanChange(1); }} disabled={rowSpan >= 6}>+</button>
      <div className="grid-cell-toolbar-sep" />
      <button className="grid-cell-delete-btn" title="Remove column"
        onClick={e => {
          e.stopPropagation();
          const hasContent = isNestedGrid ? subCells.length > 0 : elements.length > 0;
          if (hasContent && !window.confirm('Delete this cell and all its content?')) return;
          onDeleteCell();
        }}>✕</button>
    </div>
  ) : null;

  // ── Nested grid branch ─────────────────────────────────────────────────────
  if (isNestedGrid) {
    return (
      <div
        data-grid-cell-id={cell.id}
        className={cellClassName}
        style={sharedCellStyle}
        onClick={e => { if (previewMode) return; e.stopPropagation(); onSelectCell(); }}
      >
        <div
          className="nested-grid-container"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: `${cell.nestedGrid!.rowGap}px ${cell.nestedGrid!.gap}px`,
            width: '100%',
          }}
        >
          {subCells.map((subCell, idx) => (
            <DraggableCellWrapper
              key={subCell.id}
              cell={subCell}
              index={idx}
              parentId={cell.id}
              breakpoint={bp}
              previewMode={previewMode}
              onReorderCell={(from, to) => onReorderGridCell?.(cell.id, from, to)}
            >
              <GridCellView
                cell={subCell}
                nodes={nodes}
                isSelected={selectedGridCellId === subCell.id}
                selectedElementId={selectedElementId}
                onSelectCell={() => onSelectGridCell?.(subCell.id)}
                onSelectElement={onSelectElement}
                onUpdateElement={onUpdateElement}
                onUpdateCell={updates => onUpdateGridCell?.(subCell.id, updates)}
                onDeleteCell={() => onDeleteGridCell?.(subCell.id)}
                onAddElement={type => onAddElementToCell?.(type, subCell.id)}
                onMoveGridElement={onMoveGridElement}
                onCommit={onCommit}
                snapshot={snapshot}
                previewMode={previewMode}
                breakpoint={breakpoint}
                onUpdateResponsive={onUpdateResponsive}
                onDuplicateElement={onDuplicateElement}
                onDeleteElement={onDeleteElement}
                isDragOverTarget={false}
                selectedGridCellId={selectedGridCellId}
                onUpdateGridCell={onUpdateGridCell}
                onDeleteGridCell={onDeleteGridCell}
                onAddElementToCell={onAddElementToCell}
                onSelectGridCell={onSelectGridCell}
                onReorderGridCell={onReorderGridCell}
              />
            </DraggableCellWrapper>
          ))}

          {subCells.length === 0 && !previewMode && (
            <div className="nested-grid-empty">
              Add columns from the right panel
            </div>
          )}
        </div>
        {toolbar}
      </div>
    );
  }

  // ── Normal elements branch ─────────────────────────────────────────────────
  const isRow = cellMode === 'row';

  const insertionLine = (afterIdx: number) =>
    insertAfterIndex === afterIdx ? (
      <div key={`ins-${afterIdx}`} className={`grid-insert-line${isRow ? ' grid-insert-line--vertical' : ''}`} />
    ) : null;

  return (
    <div
      ref={combinedDropRef}
      data-grid-cell-id={cell.id}
      className={[
        'grid-cell',
        isSelected && !previewMode ? 'grid-cell--selected' : '',
        isDragOverTarget ? 'grid-cell--drop-over' : '',
        isPaletteOver  ? 'grid-cell--drop-over' : '',
        isGridElOver   ? 'grid-cell--el-over'   : '',
      ].filter(Boolean).join(' ')}
      style={{
        ...sharedCellStyle,
        display: 'flex',
        flexDirection: cellMode === 'column' ? 'column' : 'row',
        flexWrap: cellMode === 'wrap' ? 'wrap' : 'nowrap',
        gap,
        alignItems: getEffectiveAlign(cell, bp),
        justifyContent: getEffectiveJustify(cell, bp),
      }}
      onClick={e => { if (previewMode) return; e.stopPropagation(); onSelectCell(); }}
    >
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
          {insertionLine(idx)}
        </React.Fragment>
      ))}

      {elements.length === 0 && !previewMode && (
        <div className="grid-cell-empty">
          <span className="grid-cell-empty-icon">+</span>
          {isPaletteOver ? 'Drop here' : 'Drop element or drag from panel'}
        </div>
      )}

      {toolbar}
    </div>
  );
}

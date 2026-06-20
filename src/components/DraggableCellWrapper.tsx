import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import type { Breakpoint, GridCell } from '../types';

export const GRID_CELL_DND_TYPE = 'BUILDER_GRID_CELL';

export interface CellDragItem {
  cellId: string;
  parentId: string; // section ID or parent cell ID
  fromIndex: number;
}

function getCellSpan(cell: GridCell, bp: Breakpoint): number {
  if (bp === 'mobile') return cell.responsive.mobile?.columnSpan ?? cell.responsive.tablet?.columnSpan ?? cell.columnSpan;
  if (bp === 'tablet') return cell.responsive.tablet?.columnSpan ?? cell.columnSpan;
  return cell.columnSpan;
}

interface Props {
  cell: GridCell;
  index: number;
  parentId: string;
  breakpoint: Breakpoint;
  previewMode?: boolean;
  onReorderCell: (fromIndex: number, toIndex: number) => void;
  children: React.ReactNode;
}

export function DraggableCellWrapper({
  cell, index, parentId, breakpoint, previewMode, onReorderCell, children,
}: Props) {
  const [insertSide, setInsertSide] = useState<'before' | 'after' | null>(null);
  const insertSideRef = useRef<'before' | 'after' | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const span = getCellSpan(cell, breakpoint);
  const rowSpan = cell.rowSpan ?? 1;

  const hidden =
    breakpoint === 'tablet' ? (cell.responsive.tablet?.hidden ?? false)
    : breakpoint === 'mobile' ? (cell.responsive.mobile?.hidden ?? cell.responsive.tablet?.hidden ?? false)
    : false;

  const updateSide = useCallback((side: 'before' | 'after' | null) => {
    insertSideRef.current = side;
    setInsertSide(side);
  }, []);

  const [{ isDragging }, dragHandle] = useDrag<CellDragItem, void, { isDragging: boolean }>({
    type: GRID_CELL_DND_TYPE,
    item: { cellId: cell.id, parentId, fromIndex: index },
    collect: m => ({ isDragging: m.isDragging() }),
    canDrag: () => !previewMode,
  });

  const [{ isOver }, drop] = useDrop<CellDragItem, void, { isOver: boolean }>({
    accept: GRID_CELL_DND_TYPE,
    hover(item, monitor) {
      if (item.cellId === cell.id || item.parentId !== parentId) { updateSide(null); return; }
      const domNode = wrapperRef.current;
      if (!domNode) return;
      const offset = monitor.getClientOffset();
      if (!offset) return;
      const rect = domNode.getBoundingClientRect();
      updateSide(offset.x < rect.left + rect.width / 2 ? 'before' : 'after');
    },
    drop(item) {
      const side = insertSideRef.current;
      if (item.cellId === cell.id || item.parentId !== parentId || side === null) {
        updateSide(null); return;
      }
      let toIndex = side === 'after' ? index + 1 : index;
      if (item.fromIndex < toIndex) toIndex -= 1;
      onReorderCell(item.fromIndex, toIndex);
      updateSide(null);
    },
    collect: m => ({ isOver: m.isOver({ shallow: true }) }),
  });

  useEffect(() => { if (!isOver) updateSide(null); }, [isOver, updateSide]);

  const combinedRef = useCallback((node: HTMLDivElement | null) => {
    (wrapperRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    (drop as (el: HTMLDivElement | null) => void)(node);
  }, [drop]);

  if (hidden && previewMode) return null;

  return (
    <div
      ref={combinedRef}
      className="grid-cell-wrapper"
      style={{
        gridColumn: `span ${Math.min(span, 12)}`,
        gridRow: rowSpan > 1 ? `span ${rowSpan}` : undefined,
        position: 'relative',
        opacity: isDragging ? 0.35 : 1,
      }}
    >
      {!previewMode && (
        <div
          ref={dragHandle as (el: HTMLDivElement | null) => void}
          className="grid-cell-drag-handle"
          title="Drag to reorder"
          onMouseDown={e => e.stopPropagation()}
        >
          ⠿
        </div>
      )}
      {insertSide === 'before' && <div className="grid-cell-insert-indicator grid-cell-insert-indicator--before" />}
      {insertSide === 'after'  && <div className="grid-cell-insert-indicator grid-cell-insert-indicator--after"  />}
      {children}
    </div>
  );
}

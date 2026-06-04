import React, { useRef } from 'react';
import type { Breakpoint, GridCell } from '../types';

function getCellSpan(cell: GridCell, bp: Breakpoint): number {
  if (bp === 'mobile') return cell.responsive.mobile?.columnSpan ?? cell.responsive.tablet?.columnSpan ?? cell.columnSpan;
  if (bp === 'tablet') return cell.responsive.tablet?.columnSpan ?? cell.columnSpan;
  return cell.columnSpan;
}

interface Props {
  cell: GridCell;
  breakpoint: Breakpoint;
  previewMode?: boolean;
  children: React.ReactNode;
  isLast?: boolean;
  isSelected?: boolean;
  onResizeDragStart?: (e: React.MouseEvent, span: number, el: HTMLDivElement) => void;
  onDeleteCell?: () => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  onCopyCell?: () => void;
  onPasteIntoCell?: () => void;
}

export function DraggableCellWrapper({ cell, breakpoint, previewMode, children, isLast, isSelected, onResizeDragStart, onDeleteCell, onMoveLeft, onMoveRight, onCopyCell, onPasteIntoCell }: Props) {
  const span = getCellSpan(cell, breakpoint);
  const rowSpan = cell.rowSpan ?? 1;
  const wrapperRef = useRef<HTMLDivElement>(null);

  const hidden =
    breakpoint === 'tablet' ? (cell.responsive.tablet?.hidden ?? false)
    : breakpoint === 'mobile' ? (cell.responsive.mobile?.hidden ?? cell.responsive.tablet?.hidden ?? false)
    : false;

  if (hidden && previewMode) return null;

  return (
    <div
      ref={wrapperRef}
      className={'pb-grid-cell-wrapper'}
      onMouseDown={e => e.stopPropagation()}
      style={{
        gridColumn: `span ${Math.min(span, 12)}`,
        gridRow: rowSpan > 1 ? `span ${rowSpan}` : undefined,
        flexBasis: `calc(${(Math.min(span, 12) / 12) * 100}% - 16px)`,
        flexGrow: 0,
        flexShrink: 0,
        minWidth: 0,
        position: 'relative',
      }}
    >
      {children}
      {isSelected && !previewMode && (onMoveLeft || onMoveRight || onCopyCell || onPasteIntoCell) && (
        <div className={'pb-cell-action-bar'} onMouseDown={e => e.stopPropagation()}>
          <button className={'pb-cell-action-btn'} title="Move left" disabled={!onMoveLeft}
            onClick={e => { e.stopPropagation(); onMoveLeft?.(); }}>←</button>
          <button className={'pb-cell-action-btn'} title="Move right" disabled={!onMoveRight}
            onClick={e => { e.stopPropagation(); onMoveRight?.(); }}>→</button>
          <div className={'pb-cell-action-divider'} />
          <button className={'pb-cell-action-btn'} title="Copy column"
            onClick={e => { e.stopPropagation(); onCopyCell?.(); }}>⧉</button>
          {onPasteIntoCell && (
            <button className={'pb-cell-action-btn'} title="Paste into this column"
              onClick={e => { e.stopPropagation(); onPasteIntoCell(); }}>⊘</button>
          )}
        </div>
      )}
      {!isLast && !previewMode && (
        <div
          className={'pb-col-resize-handle'}
          onMouseDown={e => {
            if (wrapperRef.current) onResizeDragStart?.(e, span, wrapperRef.current);
          }}
        />
      )}
      {onDeleteCell && !previewMode && (
        <button
          className={'pb-sub-cell-delete-btn'}
          title="Delete column"
          onMouseDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); onDeleteCell(); }}
        >✕</button>
      )}
    </div>
  );
}

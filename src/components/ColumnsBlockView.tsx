import React, { useCallback, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import type {
  Breakpoint, BreakpointOverride, BuilderState, CanvasElement as El,
  CellLayoutMode, Container, ContainerLayoutMode, GridCell, NodeMap, ElementType,
} from '../types';
import { DraggableCellWrapper } from './DraggableCellWrapper';
import { GridCellView } from './GridCellView';
import { getCellColumnSpan } from '../utils/cellUtils';
import { GRID_EL_DND_TYPE } from './GridElementView';
import type { GridElDragItem } from './GridElementView';

const MODE_LABEL: Record<ContainerLayoutMode, string> = {
  grid:     'Columns',
  'flex-col': 'Stack',
  'flex-row': 'Row',
};

interface Props {
  block: Container;
  nodes: NodeMap;
  cellChildIndex: number;
  /** Position in parent cell's combined children list — used for unified DND. */
  childIdx: number;
  isSelected?: boolean;
  onDragHover?: (afterChildIdx: number) => void;
  onDropAtChildIdx?: (item: GridElDragItem, afterChildIdx: number) => void;
  onSelectContainer?: (id: string) => void;
  selectedGridCellId?: string | null;
  selectedElementId: string | null;
  onSelectGridCell?: (id: string | null) => void;
  onSelectElement: (id: string) => void;
  onUpdateElement: (id: string, updates: Partial<El>) => void;
  onUpdateGridCell?: (id: string, updates: Partial<GridCell>) => void;
  onDeleteGridCell?: (id: string) => void;
  onAddElementToCell?: (type: ElementType, cellId: string, x?: number, y?: number) => void;
  onMoveGridElement?: (elementId: string, sourceCellId: string, targetCellId: string, insertIndex: number, dropPos?: { x: number; y: number }, sourceCellMode?: CellLayoutMode) => void;
  onCommit: (prev: BuilderState) => void;
  snapshot: BuilderState;
  previewMode?: boolean;
  breakpoint?: Breakpoint;
  onUpdateResponsive?: (id: string, bp: Breakpoint, updates: Partial<BreakpointOverride>) => void;
  onDuplicateElement?: (id: string) => void;
  onDeleteElement?: (id: string) => void;
  onReorderGridCell?: (parentId: string, fromIndex: number, toIndex: number) => void;
  onRemoveColumnsBlock: (blockId: string) => void;
  onAddContainer?: (cellId: string, mode: ContainerLayoutMode, columnSpans?: number[]) => void;
  onUpdateContainer?: (id: string, updates: Partial<Pick<Container, 'layoutMode' | 'gap' | 'rowGap'>>) => void;
  onAddSubCell?: (containerId: string) => void;
  selectedContainerId?: string | null;
}

export function ColumnsBlockView({
  block, nodes,
  cellChildIndex, childIdx,
  isSelected, onSelectContainer,
  onDragHover, onDropAtChildIdx,
  selectedGridCellId, selectedElementId,
  onSelectGridCell, onSelectElement,
  onUpdateElement, onUpdateGridCell, onDeleteGridCell,
  onAddElementToCell, onMoveGridElement,
  onCommit, snapshot, previewMode,
  breakpoint = 'desktop',
  onUpdateResponsive, onDuplicateElement, onDeleteElement,
  onReorderGridCell,
  onRemoveColumnsBlock,
  onAddContainer, onUpdateContainer, onAddSubCell, selectedContainerId,
}: Props) {
  const subCells = block.children
    .map(id => nodes[id])
    .filter((n): n is GridCell => !!n && n.type === 'grid-cell');

  const wrapperRef = useRef<HTMLDivElement>(null);
  // Track hover side in a ref so the drop handler sees the latest value
  const sideRef = useRef<'before' | 'after'>('after');

  const [{ isDragging }, dragRef] = useDrag<GridElDragItem, void, { isDragging: boolean }>({
    type: GRID_EL_DND_TYPE,
    item: { kind: 'container', blockId: block.id, parentCellId: block.parent, fromChildIdx: childIdx },
    canDrag: !previewMode,
    collect: m => ({ isDragging: m.isDragging() }),
  });

  const [, dropRef] = useDrop<GridElDragItem, void, Record<string, never>>({
    accept: GRID_EL_DND_TYPE,
    hover(item, monitor) {
      if (item.kind === 'container' && item.blockId === block.id) return;
      const node = wrapperRef.current;
      if (!node) return;
      const offset = monitor.getClientOffset();
      if (!offset) return;
      const rect = node.getBoundingClientRect();
      const side: 'before' | 'after' = offset.y < rect.top + rect.height / 2 ? 'before' : 'after';
      sideRef.current = side;
      onDragHover?.(side === 'after' ? childIdx : childIdx - 1);
    },
    drop(item, monitor) {
      if (monitor.didDrop()) return;
      if (item.kind === 'container' && item.blockId === block.id) return;
      onDropAtChildIdx?.(item, sideRef.current === 'after' ? childIdx : childIdx - 1);
    },
  });

  const combinedRef = useCallback((node: HTMLDivElement | null) => {
    (wrapperRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    (dropRef as (el: HTMLDivElement | null) => void)(node);
  }, [dropRef]);

  const resp = block.responsive ?? {};
  const mode: import('../types').ContainerLayoutMode =
    breakpoint === 'mobile'
      ? (resp.mobile?.layoutMode ?? resp.tablet?.layoutMode ?? block.layoutMode)
      : breakpoint === 'tablet'
      ? (resp.tablet?.layoutMode ?? block.layoutMode)
      : block.layoutMode;

  const innerStyle: React.CSSProperties = mode === 'grid'
    ? { display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: `${block.rowGap}px ${block.gap}px`, width: '100%' }
    : mode === 'flex-col'
    ? { display: 'flex', flexDirection: 'column', gap: `${block.gap}px`, width: '100%' }
    : { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: `${block.gap}px`, width: '100%' };

  // True when a descendant element owns selection — container should dim, not show its own border
  const hasSelectedChild = !previewMode && !isSelected && !!(
    selectedElementId && block.children.some(subCellId => {
      const subCell = nodes[subCellId] as GridCell | undefined;
      return subCell?.children.includes(selectedElementId);
    })
  );

  return (
    <div
      ref={combinedRef}
      className={'pb-container-wrapper'}
      style={{ opacity: isDragging ? 0.35 : 1 }}
    >
      <div
        className={['pb-container', isSelected && 'pb-container--selected', hasSelectedChild && 'pb-container--child-selected'].filter(Boolean).join(' ')}
        onClick={e => { e.stopPropagation(); if (!previewMode) onSelectContainer?.(block.id); }}
      >
        {!previewMode && !isSelected && (
          <span className={'pb-container-hover-label'} title="Click to select container">{MODE_LABEL[mode]}</span>
        )}
        {!previewMode && (
          <div
            className={['pb-container-actions', isSelected ? 'pb-container-actions--expanded' : ''].filter(Boolean).join(' ')}
            onClick={e => e.stopPropagation()}
          >
            {/* Mode label / mode toggles */}
            {isSelected ? (
              (['grid', 'flex-col', 'flex-row'] as ContainerLayoutMode[]).map(m => (
                <button
                  key={m}
                  className={['pb-ctb-mode-btn', block.layoutMode === m ? 'pb-ctb-mode-btn--active' : ''].filter(Boolean).join(' ')}
                  title={{ grid: 'Columns (CSS Grid)', 'flex-col': 'Stack (flex column)', 'flex-row': 'Row (flex row)' }[m]}
                  onClick={() => onUpdateContainer?.(block.id, { layoutMode: m })}
                >{MODE_LABEL[m]}</button>
              ))
            ) : (
              <span
                className={'pb-container-label'}
                onClick={() => onSelectContainer?.(block.id)}
                style={{ cursor: 'pointer' }}
                title="Click to select container"
              >{MODE_LABEL[mode]}</span>
            )}

            <div className={'pb-ctb-sep'} />

            {/* Gap — only when selected */}
            {isSelected && (
              <>
                <label className={'pb-ctb-label'}>Gap</label>
                <input
                  className={'pb-ctb-gap-input'}
                  type="number" min={0} max={120} value={block.gap}
                  onClick={e => e.stopPropagation()}
                  onChange={e => onUpdateContainer?.(block.id, { gap: Math.max(0, Number(e.target.value)) })}
                />
                <div className={'pb-ctb-sep'} />
              </>
            )}

            {/* Add column — always visible on hover */}
            <button
              className={'pb-ctb-add-btn'}
              title="Add column"
              onClick={() => onAddSubCell?.(block.id)}
            >+ Col</button>

            <div
              ref={dragRef as (el: HTMLDivElement | null) => void}
              className={'pb-container-handle'}
              title="Drag to reorder"
              onMouseDown={e => e.stopPropagation()}
            >⠿</div>
            <button
              className={'pb-container-delete'}
              title="Remove container"
              onClick={() => onRemoveColumnsBlock(block.id)}
            >✕</button>
          </div>
        )}
        <div className={'pb-container-inner'} style={innerStyle}>
          {subCells.map((subCell, idx) => {
            const nextSubCell = subCells[idx + 1];
            return (
            <DraggableCellWrapper
              key={subCell.id}
              cell={subCell}
              breakpoint={breakpoint}
              previewMode={previewMode}
              isLast={!nextSubCell}
              onDeleteCell={() => onDeleteGridCell?.(subCell.id)}
              onResizeDragStart={nextSubCell ? (e, span, el) => {
                e.preventDefault();
                e.stopPropagation();
                const startX = e.clientX;
                const unitWidth = el.getBoundingClientRect().width / span;
                const startLeft = getCellColumnSpan(subCell, breakpoint);
                const startRight = getCellColumnSpan(nextSubCell, breakpoint);
                const total = startLeft + startRight;
                onCommit(snapshot);
                const onMove = (ev: MouseEvent) => {
                  const delta = Math.round((ev.clientX - startX) / unitWidth);
                  const newLeft = Math.max(1, Math.min(total - 1, startLeft + delta));
                  onUpdateGridCell?.(subCell.id, { columnSpan: newLeft });
                  onUpdateGridCell?.(nextSubCell.id, { columnSpan: total - newLeft });
                };
                const onUp = () => {
                  document.removeEventListener('mousemove', onMove);
                  document.removeEventListener('mouseup', onUp);
                };
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', onUp);
              } : undefined}
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
                onAddElement={(type, x, y) => onAddElementToCell?.(type, subCell.id, x, y)}
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
                onRemoveColumnsBlock={onRemoveColumnsBlock ?? (() => {})}
                onAddContainer={onAddContainer}
                onUpdateContainer={onUpdateContainer}
                onAddSubCell={onAddSubCell}
                selectedContainerId={selectedContainerId}
                onSelectContainer={onSelectContainer}
              />
            </DraggableCellWrapper>
            );
          })}
          {subCells.length === 0 && !previewMode && (
            <div className={'pb-container-empty'}>No columns yet</div>
          )}
        </div>
      </div>
    </div>
  );
}

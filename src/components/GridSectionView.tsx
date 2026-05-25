import React, { useCallback, useRef, useState } from 'react';
import { useDrop } from 'react-dnd';
import { DraggableCellWrapper } from './DraggableCellWrapper';
import { LAYOUT_DND_TYPE } from './LeftSidebar';
import { GridCellView } from './GridCellView';
import { canvasDragShared } from './CanvasElement';
import type {
  Breakpoint, BreakpointOverride, BuilderState, CanvasElement as El,
  GridCell, GridSection, NodeMap, SectionUpdate, ElementType,
} from '../types';
import { CANVAS_W } from '../hooks/useBuilderStore';
import { sectionBgProps } from '../utils/sectionStyle';
import { getCellColumnSpan } from '../utils/cellUtils';


interface Props {
  section: GridSection;
  nodes: NodeMap;
  role: 'header' | 'section' | 'footer';
  isSelected: boolean;
  selectedId: string | null;
  selectedGridCellId?: string | null;
  canvasWidth: number;
  onSelectSection: () => void;
  onSelectGridCell: (id: string | null) => void;
  onSelectElement: (id: string, shift: boolean) => void;
  onUpdateElement: (id: string, updates: Partial<El>) => void;
  onUpdateGridCell: (id: string, updates: Partial<GridCell>) => void;
  onAddGridCell: (sectionId: string, columnSpan?: number) => void;
  onDeleteGridCell: (id: string) => void;
  onAddElementToCell: (type: ElementType, cellId: string, x?: number, y?: number) => void;
  onCommit: (prev: BuilderState) => void;
  snapshot: BuilderState;
  onUpdateSection: (id: string, updates: SectionUpdate) => void;
  onAddSectionBefore?: () => void;
  onAddSectionAfter?: () => void;
  onAddGridSectionBefore?: (columnSpans: number[]) => void;
  onAddGridSectionAfter?: (columnSpans: number[]) => void;
  onDeleteSection?: () => void;
  onDuplicateSection?: () => void;
  onMoveSectionUp?: () => void;
  onMoveSectionDown?: () => void;
  onPromoteSection?: (role: 'header' | 'footer') => void;
  previewMode?: boolean;
  breakpoint?: Breakpoint;
  onUpdateResponsive?: (id: string, bp: Breakpoint, updates: Partial<BreakpointOverride>) => void;
  onDuplicateElement?: (id: string) => void;
  onDeleteElement?: (id: string) => void;
  onMoveGridElement?: (elementId: string, sourceCellId: string, targetCellId: string, insertIndex: number, dropPos?: { x: number; y: number }, sourceCellMode?: import('../types').CellLayoutMode) => void;
  dragOverGridCellId?: string | null;
  onReorderGridCell?: (sectionId: string, fromIndex: number, toIndex: number) => void;
  onDropGridLayout?: (sectionId: string, columnSpans: number[]) => void;
  onRemoveColumnsBlock?: (blockId: string) => void;
  onAddContainer?: (cellId: string, mode: import('../types').ContainerLayoutMode, columnSpans?: number[]) => void;
  onUpdateContainer?: (id: string, updates: Partial<Pick<import('../types').Container, 'layoutMode' | 'gap' | 'rowGap'>>) => void;
  onAddSubCell?: (containerId: string) => void;
  selectedContainerId?: string | null;
  onSelectContainer?: (id: string) => void;
}

export function GridSectionView({
  section, nodes, role, isSelected,
  selectedId, selectedGridCellId,
  canvasWidth, onSelectSection, onSelectGridCell,
  onSelectElement, onUpdateElement,
  onUpdateGridCell, onAddGridCell, onDeleteGridCell, onAddElementToCell,
  onCommit, snapshot, onUpdateSection,
  onAddSectionBefore, onAddSectionAfter, onAddGridSectionBefore, onAddGridSectionAfter,
  onDeleteSection, onDuplicateSection,
  onMoveSectionUp, onMoveSectionDown, onPromoteSection,
  previewMode, breakpoint = 'desktop',
  onUpdateResponsive, onDuplicateElement, onDeleteElement,
  onMoveGridElement,
  dragOverGridCellId,
  onReorderGridCell,
  onDropGridLayout,
  onRemoveColumnsBlock,
  onAddContainer, onUpdateContainer, onAddSubCell,
  selectedContainerId,
  onSelectContainer,
}: Props) {
  const bgRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const handleMinHeightResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startY = e.clientY;
    const startH = section.grid.minHeight ?? 0;
    onCommit(snapshot);
    const onMove = (ev: MouseEvent) => {
      const newH = Math.max(0, Math.round(startH + (ev.clientY - startY) / canvasDragShared.zoom));
      onUpdateSection(section.id, { grid: { ...section.grid, minHeight: newH } });
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [section, onCommit, snapshot, onUpdateSection]);

  const [{ isLayoutOver }, layoutDropRef] = useDrop<{ columnSpans: number[] }, void, { isLayoutOver: boolean }>({
    accept: LAYOUT_DND_TYPE,
    canDrop: () => true,
    drop: (item, monitor) => {
      if (monitor.didDrop()) return;
      onDropGridLayout?.(section.id, item.columnSpans);
    },
    collect: m => ({ isLayoutOver: m.isOver({ shallow: true }) }),
  });

  const bgRefCallback = useCallback((node: HTMLDivElement | null) => {
    (bgRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    (layoutDropRef as unknown as (el: HTMLDivElement | null) => void)(node);
  }, [layoutDropRef]);

  const bg = section.style.background;
  const gridCfg = section.grid;

  const gap =
    breakpoint === 'mobile' ? (section.responsive?.mobile?.gap ?? section.responsive?.tablet?.gap ?? gridCfg.gap) :
    breakpoint === 'tablet' ? (section.responsive?.tablet?.gap ?? gridCfg.gap) :
    gridCfg.gap;
  const rowGap =
    breakpoint === 'mobile' ? (section.responsive?.mobile?.rowGap ?? section.responsive?.tablet?.rowGap ?? gridCfg.rowGap) :
    breakpoint === 'tablet' ? (section.responsive?.tablet?.rowGap ?? gridCfg.rowGap) :
    gridCfg.rowGap;

  const sectionBgStyle: React.CSSProperties = {
    position: 'relative', width: '100%',
    backgroundSize: 'cover', backgroundPosition: 'center', boxSizing: 'border-box',
    ...sectionBgProps(bg),
  };

  const pad = section.style.padding ?? { top: 0, right: 0, bottom: 0, left: 0 };

  const sectionContentStyle: React.CSSProperties = {
    position: 'relative', width: canvasWidth, margin: '0 auto', boxSizing: 'border-box',
    outline: isSelected ? '2px solid #006e75' : undefined, outlineOffset: -2,
    paddingTop: pad.top, paddingRight: pad.right, paddingBottom: pad.bottom, paddingLeft: pad.left,
  };

  const overlayStyle: React.CSSProperties | undefined = bg.overlay > 0 ? {
    position: 'absolute', inset: 0,
    backgroundColor: `rgba(0,0,0,${bg.overlay})`,
    pointerEvents: 'none', zIndex: 0,
  } : undefined;

  const cells = section.children
    .map(id => nodes[id] as GridCell | undefined)
    .filter((c): c is GridCell => !!c);

  const usedSpan = cells.reduce((sum, c) => sum + Math.min(getCellColumnSpan(c, breakpoint), 12), 0);

  const scrollBehavior = section.scrollBehavior ?? 'normal';
  const isSticky = scrollBehavior === 'sticky';
  const isFixed  = scrollBehavior === 'fixed';
  const hasActiveChild = !!(
    (selectedGridCellId && section.children.includes(selectedGridCellId)) ||
    (selectedId && nodes[selectedId] && 'parent' in nodes[selectedId]! && section.children.includes((nodes[selectedId] as { parent: string }).parent))
  );
  const outerStyle: React.CSSProperties = (isSticky || isFixed)
    ? { flexShrink: 0, position: 'sticky', top: section.stickyOffset ?? 0, zIndex: 50 }
    : { position: 'relative', flexShrink: 0, zIndex: (hovered || isSelected || hasActiveChild) ? 10 : undefined };

  return (
    <div
      style={outerStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {!previewMode && (hovered || isSelected) && (
        <>
          <button
            className={'pb-section-insert-btn pb-section-insert-btn--above'}
            title="Insert section above"
            onMouseDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); onAddSectionBefore?.(); }}
          >+</button>
          <button
            className={'pb-section-insert-btn pb-section-insert-btn--below'}
            title="Insert section below"
            onMouseDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); onAddSectionAfter?.(); }}
          >+</button>
        </>
      )}
      <div ref={bgRefCallback} className={'pb-section-bg'} style={{ ...sectionBgStyle, ...(isLayoutOver ? { boxShadow: 'inset 0 -3px 0 0 #006e75' } : {}) }}
        onMouseDown={e => {
          if (e.target !== bgRef.current) return;
          e.stopPropagation(); onSelectSection(); onSelectGridCell(null);
        }}
      >
        {overlayStyle && <div style={overlayStyle} />}
        {breakpoint !== 'desktop' && !previewMode && (
          <>
            <div className={"pb-bp-margin-overlay pb-bp-margin-left"} style={{ width: `calc((100% - ${canvasWidth}px) / 2)` }} />
            <div className={"pb-bp-margin-overlay pb-bp-margin-right"} style={{ width: `calc((100% - ${canvasWidth}px) / 2)` }} />
          </>
        )}

        <div
          className={"pb-section-surface pb-grid-section-surface"}
          data-section-id={section.id}
          style={sectionContentStyle}
          onMouseDown={e => {
            if ((e.target as HTMLElement).closest('.grid-cell')) return;
            e.stopPropagation(); onSelectSection(); onSelectGridCell(null);
          }}
        >
          {!previewMode && (hovered || isSelected) && (
            <div
              className={['pb-section-label-badge', 'pb-section-label-badge--clickable', isSelected && !selectedGridCellId && 'pb-section-label-badge--active'].filter(Boolean).join(' ')}
              title="Click to select grid section"
              onClick={e => { e.stopPropagation(); onSelectSection(); onSelectGridCell(null); }}
            >
              {role === 'header' ? 'Header' : role === 'footer' ? 'Footer' : section.label}
              <span className={'pb-section-label-mode'}> · Grid</span>
              {isSticky && <span className={'pb-section-label-mode'}> · Sticky</span>}
              {isFixed  && <span className={'pb-section-label-mode'}> · Fixed</span>}
              {cells.length > 0 && (
                <span className={['pb-section-col-usage', usedSpan > 12 && 'pb-over', usedSpan === 12 && 'pb-full'].filter(Boolean).join(' ')}>
                  {usedSpan}/12
                </span>
              )}
            </div>
          )}

          {!previewMode && isSelected && (
            <div className={'pb-section-action-bar'} onMouseDown={e => e.stopPropagation()}>
              <button className={'pb-section-action-btn'} title="Move up"
                onClick={e => { e.stopPropagation(); onMoveSectionUp?.(); }}>↑</button>
              <button className={'pb-section-action-btn'} title="Move down"
                onClick={e => { e.stopPropagation(); onMoveSectionDown?.(); }}>↓</button>
              <button className={'pb-section-action-btn'} title="Duplicate section"
                onClick={e => { e.stopPropagation(); onDuplicateSection?.(); }}>⧉</button>
              {onPromoteSection && (
                <>
                  <div className={'pb-section-action-divider'} />
                  <button className={'pb-section-action-btn'} title="Set as Header"
                    onClick={e => { e.stopPropagation(); onPromoteSection('header'); }}>H</button>
                  <button className={'pb-section-action-btn'} title="Set as Footer"
                    onClick={e => { e.stopPropagation(); onPromoteSection('footer'); }}>F</button>
                </>
              )}
              <div className={'pb-section-action-divider'} />
              <button className={'pb-section-action-btn'} title="Add column"
                onClick={e => { e.stopPropagation(); onAddGridCell(section.id); }}>+ Col</button>
              <div className={'pb-section-action-divider'} />
              <button className={"pb-section-action-btn pb-danger"} title="Delete section"
                onClick={e => { e.stopPropagation(); onDeleteSection?.(); }}>✕</button>
            </div>
          )}

          <div className={'pb-grid-area-wrapper'}>
            <div
              className={'pb-grid-cells-row'}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(12, 1fr)',
                gap: `${rowGap}px ${gap}px`,
                gridAutoRows: gridCfg.rowHeight ? `${gridCfg.rowHeight}px` : undefined,
                minHeight: gridCfg.minHeight || undefined,
              }}
            >
              {cells.map((cell) => (
                <DraggableCellWrapper
                  key={cell.id}
                  cell={cell}
                  breakpoint={breakpoint}
                  previewMode={previewMode}
                >
                  <GridCellView
                    cell={cell}
                    nodes={nodes}
                    isSelected={selectedGridCellId === cell.id}
                    selectedElementId={selectedId}
                    selectedGridCellId={selectedGridCellId}
                    onSelectCell={() => { onSelectGridCell(cell.id); onSelectSection(); }}
                    onSelectElement={elId => {
                      // Select section + immediate parent cell + element in one click
                      onSelectSection();
                      const el = nodes[elId];
                      const elParent = el?.type !== 'section' ? el?.parent : undefined;
                      const parentCellId = elParent && nodes[elParent]?.type === 'grid-cell'
                        ? elParent
                        : cell.id;
                      onSelectGridCell(parentCellId);
                      onSelectElement(elId, false);
                    }}
                    onUpdateElement={onUpdateElement}
                    onUpdateCell={updates => onUpdateGridCell(cell.id, updates)}
                    onDeleteCell={() => onDeleteGridCell(cell.id)}
                    onAddElement={(type, x, y) => onAddElementToCell(type, cell.id, x, y)}
                    onCommit={onCommit}
                    snapshot={snapshot}
                    previewMode={previewMode}
                    breakpoint={breakpoint}
                    onUpdateResponsive={onUpdateResponsive}
                    onDuplicateElement={onDuplicateElement}
                    onDeleteElement={onDeleteElement}
                    onMoveGridElement={onMoveGridElement}
                    isDragOverTarget={dragOverGridCellId === cell.id}
                    onUpdateGridCell={onUpdateGridCell}
                    onDeleteGridCell={onDeleteGridCell}
                    onAddElementToCell={onAddElementToCell}
                    onSelectGridCell={onSelectGridCell}
                    onReorderGridCell={onReorderGridCell}
                    onRemoveColumnsBlock={onRemoveColumnsBlock}
                    onAddContainer={onAddContainer}
                    onUpdateContainer={onUpdateContainer}
                    onAddSubCell={onAddSubCell}
                    selectedContainerId={selectedContainerId}
                    onSelectContainer={onSelectContainer}
                  />
                </DraggableCellWrapper>
              ))}
            </div>

            {cells.length === 0 && !previewMode && (
              <div className={'pb-grid-empty-state'}>
                <span className={'pb-grid-empty-icon'}>⊞</span>
                <button className={'pb-grid-empty-add-btn'} onClick={e => { e.stopPropagation(); onAddGridCell(section.id); }}>
                  + Add first column
                </button>
              </div>
            )}
          </div>
        </div>

        {!previewMode && (
          <div
            className={'pb-section-resize-handle'}
            onMouseDown={handleMinHeightResizeMouseDown}
            title="Drag to set minimum height"
          />
        )}
      </div>

    </div>
  );
}

export { CANVAS_W };

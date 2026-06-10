import React, { useCallback, useRef, useState } from 'react';
import { useDrop } from 'react-dnd';
import { DraggableCellWrapper } from './DraggableCellWrapper';
import { LAYOUT_DND_TYPE } from './LeftSidebar';
import { GridCellView } from './GridCellView';
import { canvasDragShared } from './CanvasElement';
import type {
  Breakpoint, BreakpointOverride, BuilderState, CanvasElement as El,
  ContentWidthMode, GridCell, GridSection, NodeMap, SectionUpdate, ElementType,
} from '../types';
import { CANVAS_W } from '../hooks/useBuilderStore';
import { sectionBgProps } from '../utils/sectionStyle';
import { getCellColumnSpan } from '../utils/cellUtils';

function isCellOrDescendant(nodes: NodeMap, parentId: string, targetId: string | null | undefined): boolean {
  if (!targetId) return false;
  if (parentId === targetId) return true;
  const node = nodes[parentId];
  if (!node || !('children' in node)) return false;
  return (node as { children: string[] }).children.some(cid => isCellOrDescendant(nodes, cid, targetId));
}


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
  onCopyGridCell?: (id: string) => void;
  onPasteGridCell?: (sectionId: string, afterCellId?: string) => void;
  onPasteIntoGridCell?: (cellId: string) => void;
  hasCellClipboard?: boolean;
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
  pageLayoutWidth?: 'fixed' | 'fluid'; // page-level layout; drives section default (fixed→constrained, fluid→full)
  // Carousel-in-cell support
  selectedCarouselId?: string | null;
  onSelectCarousel?: (id: string) => void;
  onUpdateCarousel?: (id: string, updates: Partial<Omit<import('../types').Carousel, 'id' | 'type' | 'parent' | 'children'>>) => void;
  onUpdateCarouselResponsive?: (id: string, bp: Breakpoint, updates: import('../types').CarouselBpOverride) => void;
  onSetActiveSlide?: (carouselId: string, index: number) => void;
  onAddSlide?: (carouselId: string, afterSlideId?: string) => void;
  onAddCarouselToCell?: (cellId: string) => void;
  // Accordion-in-cell support
  selectedAccordionId?: string | null;
  onSelectAccordion?: (id: string) => void;
  onUpdateAccordion?: (id: string, updates: Partial<Omit<import('../types').Accordion, 'id' | 'type' | 'parent' | 'children' | 'items'>>) => void;
  onUpdateAccordionResponsive?: (id: string, bp: Breakpoint, updates: import('../types').AccordionBpOverride) => void;
  onToggleAccordionItem?: (accordionId: string, itemId: string) => void;
  onAddAccordionItem?: (accordionId: string, afterItemId?: string) => void;
  onAddAccordionToCell?: (cellId: string) => void;
}

export function GridSectionView({
  section, nodes, role, isSelected,
  selectedId, selectedGridCellId,
  canvasWidth, onSelectSection, onSelectGridCell,
  onSelectElement, onUpdateElement,
  onUpdateGridCell, onAddGridCell, onDeleteGridCell, onAddElementToCell,
  onCommit, snapshot, onUpdateSection,
  onAddSectionBefore, onAddSectionAfter, onAddGridSectionBefore, onAddGridSectionAfter,
  onDeleteSection, onDuplicateSection, onCopyGridCell, onPasteGridCell, onPasteIntoGridCell, hasCellClipboard,
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
  pageLayoutWidth = 'fixed',
  selectedCarouselId, onSelectCarousel, onUpdateCarousel, onUpdateCarouselResponsive, onSetActiveSlide, onAddSlide, onAddCarouselToCell,
  selectedAccordionId, onSelectAccordion, onUpdateAccordion, onUpdateAccordionResponsive, onToggleAccordionItem, onAddAccordionItem, onAddAccordionToCell,
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

  const desktopPad = section.style.padding ?? { top: 0, right: 0, bottom: 0, left: 0 };
  const pad = breakpoint === 'mobile'
    ? { ...desktopPad, ...section.responsive?.tablet?.padding, ...section.responsive?.mobile?.padding }
    : breakpoint === 'tablet'
    ? { ...desktopPad, ...section.responsive?.tablet?.padding }
    : desktopPad;

  const contentWidthMode: ContentWidthMode = gridCfg.contentWidth ?? 'constrained';
  const maxW = gridCfg.maxWidth ?? 1280;

  const cells = section.children
    .map(id => nodes[id] as GridCell | undefined)
    .filter((c): c is GridCell => !!c);

  const usedSpan = cells.reduce((sum, c) => sum + Math.min(getCellColumnSpan(c, breakpoint), 12), 0);

  const scrollBehavior = section.scrollBehavior ?? 'normal';
  const isSticky = scrollBehavior === 'sticky';
  const isFixed  = scrollBehavior === 'fixed';
  // True when a descendant (cell, element, or container) owns the selection — section should dim
  const hasActiveChild = !!(
    (selectedGridCellId && section.children.includes(selectedGridCellId)) ||
    (selectedId && (() => {
      const el = nodes[selectedId];
      if (!el || !('parent' in el)) return false;
      const p1 = (el as any).parent as string;
      if (section.children.includes(p1)) return true;        // element → cell in section
      const p1Node = nodes[p1];
      if (!p1Node || !('parent' in p1Node)) return false;
      const p2 = (p1Node as any).parent as string;
      return section.children.includes(p2);                  // element → container → cell in section
    })())
  );

  const secBorder = section.style.border;
  const sectionContentStyle: React.CSSProperties = {
    position: 'relative', boxSizing: 'border-box', width: '100%',
    outline: (isSelected && !hasActiveChild) ? '2px solid #006e75' : undefined, outlineOffset: -2,
    paddingTop: pad.top, paddingRight: pad.right, paddingBottom: pad.bottom, paddingLeft: pad.left,
    ...(secBorder?.radius ? { borderRadius: secBorder.radius } : {}),
    ...(secBorder?.width && secBorder.width > 0 ? { border: `${secBorder.width}px ${secBorder.style ?? 'solid'} ${secBorder.color}` } : {}),
    ...(contentWidthMode === 'constrained' ? { maxWidth: maxW, margin: '0 auto' } : {}),
  };

  const overlayStyle: React.CSSProperties | undefined = bg.overlay > 0 ? {
    position: 'absolute', inset: 0,
    backgroundColor: `rgba(0,0,0,${bg.overlay})`,
    pointerEvents: 'none', zIndex: 0,
  } : undefined;
  // Hide section at current breakpoint if configured
  const bpHidden =
    breakpoint === 'mobile' ? section.responsive?.mobile?.hidden :
    breakpoint === 'tablet' ? section.responsive?.tablet?.hidden : false;
  if (bpHidden) return null;

  const outerStyle: React.CSSProperties = (isSticky || isFixed)
    ? { flexShrink: 0, position: 'sticky', top: section.stickyOffset ?? 0, zIndex: 50 }
    : { position: 'relative', flexShrink: 0, zIndex: (hovered || isSelected || hasActiveChild) ? 10 : undefined };

  return (
    <div
      style={outerStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {!previewMode && !hasActiveChild && (hovered || isSelected) && (
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

        {/* Label badge lives on pb-section-bg so surface needs no top padding */}
        {!previewMode && !hasActiveChild && (hovered || isSelected) && (
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

        <div
          className={"pb-section-surface pb-grid-section-surface"}
          data-section-id={section.id}
          style={sectionContentStyle}
          onMouseDown={e => {
            if ((e.target as HTMLElement).closest('.grid-cell')) return;
            e.stopPropagation(); onSelectSection(); onSelectGridCell(null);
          }}
        >
          {!previewMode && isSelected && !hasActiveChild && (
            <div className={'pb-section-action-bar'} onMouseDown={e => e.stopPropagation()}>
              <button className={'pb-section-action-btn'} title="Move up"
                onClick={e => { e.stopPropagation(); onMoveSectionUp?.(); }}>↑</button>
              <button className={'pb-section-action-btn'} title="Move down"
                onClick={e => { e.stopPropagation(); onMoveSectionDown?.(); }}>↓</button>
              <button className={'pb-section-action-btn'} title="Duplicate section"
                onClick={e => { e.stopPropagation(); onDuplicateSection?.(); }}>⧉</button>
              <div className={'pb-section-action-divider'} />
              <button className={'pb-section-action-btn'} title="Add column"
                onClick={e => { e.stopPropagation(); onAddGridCell(section.id); }}>+ Col</button>
              <div className={'pb-section-action-divider'} />
              {(() => {
                const effectiveMode = section.grid.contentWidth ?? (pageLayoutWidth === 'fixed' ? 'constrained' : 'full');
                const isOverride = section.grid.contentWidth != null;
                const isBoxed = effectiveMode === 'constrained';
                return (
                  <button
                    className={['pb-section-action-btn', 'pb-section-width-toggle', isOverride && 'pb-section-width-override'].filter(Boolean).join(' ')}
                    title={isBoxed ? 'Section is Boxed (max-width) — click for Full width' : 'Section is Full width — click for Boxed (max-width)'}
                    onClick={e => {
                      e.stopPropagation();
                      onUpdateSection(section.id, { grid: { ...section.grid, contentWidth: isBoxed ? 'full' : 'constrained' } });
                    }}
                  >{isBoxed ? '⊡ Boxed' : '⊞ Full'}</button>
                );
              })()}
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
              {cells.map((cell, idx) => {
                const nextCell = cells[idx + 1];
                return (
                <DraggableCellWrapper
                  key={cell.id}
                  cell={cell}
                  breakpoint={breakpoint}
                  previewMode={previewMode}
                  isLast={!nextCell}
                  isSelected={isCellOrDescendant(nodes, cell.id, selectedGridCellId)}
                  onMoveLeft={idx > 0 ? () => onReorderGridCell?.(section.id, idx, idx - 1) : undefined}
                  onMoveRight={idx < cells.length - 1 ? () => onReorderGridCell?.(section.id, idx, idx + 1) : undefined}
                  onCopyCell={onCopyGridCell ? () => onCopyGridCell(cell.id) : undefined}
                  onPasteIntoCell={hasCellClipboard && onPasteIntoGridCell ? () => onPasteIntoGridCell(cell.id) : undefined}
                  onDeleteCell={cells.length > 1 ? () => onDeleteGridCell(cell.id) : undefined}
                  onResizeDragStart={nextCell ? (e, span, el) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const startX = e.clientX;
                    const unitWidth = el.getBoundingClientRect().width / span;
                    const startLeft = getCellColumnSpan(cell, breakpoint);
                    const startRight = getCellColumnSpan(nextCell, breakpoint);
                    const total = startLeft + startRight;
                    onCommit(snapshot);
                    const onMove = (ev: MouseEvent) => {
                      const delta = Math.round((ev.clientX - startX) / unitWidth);
                      const newLeft = Math.max(1, Math.min(total - 1, startLeft + delta));
                      onUpdateGridCell(cell.id, { columnSpan: newLeft });
                      onUpdateGridCell(nextCell.id, { columnSpan: total - newLeft });
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
                    selectedCarouselId={selectedCarouselId}
                    onSelectCarousel={onSelectCarousel}
                    onUpdateCarousel={onUpdateCarousel}
                    onUpdateCarouselResponsive={onUpdateCarouselResponsive}
                    onSetActiveSlide={onSetActiveSlide}
                    onAddSlide={onAddSlide}
                    onAddCarouselToCell={onAddCarouselToCell}
                    canvasWidth={canvasWidth}
                    selectedAccordionId={selectedAccordionId}
                    onSelectAccordion={onSelectAccordion}
                    onUpdateAccordion={onUpdateAccordion}
                    onUpdateAccordionResponsive={onUpdateAccordionResponsive}
                    onToggleAccordionItem={onToggleAccordionItem}
                    onAddAccordionItem={onAddAccordionItem}
                    onAddAccordionToCell={onAddAccordionToCell}
                  />
                </DraggableCellWrapper>
              );
              })}
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

      </div>

      {!previewMode && (
        <div
          className={'pb-section-resize-handle'}
          onMouseDown={handleMinHeightResizeMouseDown}
          title="Drag to set minimum height"
        />
      )}
    </div>
  );
}

export { CANVAS_W };

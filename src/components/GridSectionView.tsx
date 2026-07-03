import React, { useCallback, useRef, useState } from 'react';
import { IconButton } from './IconButton';
import { useDrop } from 'react-dnd';
import { DraggableCellWrapper } from './DraggableCellWrapper';
import { LAYOUT_DND_TYPE } from './LeftSidebar';
import { GridCellView } from './GridCellView';
import { canvasDragShared } from './CanvasElement';
import type {
  Breakpoint, FlexSection, GridCell, GridSection,
} from '../types';
import { DEFAULT_FLEX_CONFIG } from '../utils/builderDefaults';
import { CANVAS_W } from '../hooks/useBuilderStore';
import { sectionBgProps, sectionHasVideoBg } from '../utils/sectionStyle';
import { getCellColumnSpan } from '../utils/cellUtils';
import { resolveResponsive } from '../utils/responsive';
import { useCanvasContext } from '../contexts/CanvasContext';

function isCellOrDescendant(nodes: import('../types').NodeMap, parentId: string, targetId: string | null | undefined): boolean {
  if (!targetId) return false;
  if (parentId === targetId) return true;
  const node = nodes[parentId];
  if (!node || !('children' in node)) return false;
  return (node as { children: string[] }).children.some(cid => isCellOrDescendant(nodes, cid, targetId));
}

// Props that are truly per-section. All shared canvas state comes from CanvasContext.
interface Props {
  section: GridSection | FlexSection;
  role: 'header' | 'section' | 'footer';
  isSelected: boolean;
  onSelectSection: () => void;
  onAddSectionBefore?: () => void;
  onAddSectionAfter?: () => void;
  onDeleteSection?: () => void;
  onDuplicateSection?: () => void;
  onCopyGridCell?: (id: string) => void;
  onPasteGridCell?: (sectionId: string, afterCellId?: string) => void;
  onPasteIntoGridCell?: (cellId: string) => void;
  hasCellClipboard?: boolean;
  onMoveSectionUp?: () => void;
  onMoveSectionDown?: () => void;
  onPromoteSection?: (role: 'header' | 'footer') => void;
  pageLayoutWidth?: 'fixed' | 'fluid'; // page-level layout; drives section default (fixed→constrained, fluid→full)
  pageMaxWidth?: number; // page-level fixed width; used when a section doesn't set its own grid.maxWidth
  // Carousel-in-cell support (shared grid/container ops come from CanvasContext)
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
  section, role, isSelected,
  onSelectSection,
  onAddSectionBefore, onAddSectionAfter,
  onDeleteSection, onDuplicateSection, onCopyGridCell, onPasteGridCell, onPasteIntoGridCell, hasCellClipboard,
  onMoveSectionUp, onMoveSectionDown, onPromoteSection: _onPromoteSection,
  pageLayoutWidth = 'fixed', pageMaxWidth = 1280,
  selectedCarouselId, onSelectCarousel, onUpdateCarousel, onUpdateCarouselResponsive, onSetActiveSlide, onAddSlide, onAddCarouselToCell,
  selectedAccordionId, onSelectAccordion, onUpdateAccordion, onUpdateAccordionResponsive, onToggleAccordionItem, onAddAccordionItem, onAddAccordionToCell,
}: Props) {
  const {
    nodes, canvasWidth, snapshot, onCommit,
    previewMode, breakpoint = 'desktop',
    selectedId, selectedGridCellId,
    onSelectElement, onSelectGridCell, onUpdateSection,
    onUpdateGridCell, onAddGridCell, onDeleteGridCell, onAddElementToCell,
    onReorderGridCell, onDropGridLayout,
    dragOverGridCellId,
  } = useCanvasContext();

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

  const gap    = resolveResponsive(breakpoint, gridCfg.gap,    section.responsive?.tablet?.gap,    section.responsive?.mobile?.gap);
  const rowGap = resolveResponsive(breakpoint, gridCfg.rowGap, section.responsive?.tablet?.rowGap, section.responsive?.mobile?.rowGap);

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

  const isFlex = section.layoutMode === 'flex';
  const flexCfg = isFlex ? (section as FlexSection).flex ?? DEFAULT_FLEX_CONFIG : DEFAULT_FLEX_CONFIG;
  const contentWidthMode = pageLayoutWidth === 'fluid' ? 'full' : (gridCfg.contentWidth ?? 'full');
  const maxW = gridCfg.maxWidth ?? pageMaxWidth;

  const cells = section.children
    .map(id => nodes[id] as GridCell | undefined)
    .filter((c): c is GridCell => !!c);

  const usedSpan = cells.reduce((sum, c) => sum + Math.min(getCellColumnSpan(c, breakpoint), 12), 0);

  const scrollBehavior = section.scrollBehavior ?? 'normal';
  const isSticky = scrollBehavior === 'sticky';
  const isFixed  = scrollBehavior === 'fixed';
  const hasActiveChild = !!(
    (selectedGridCellId && section.children.includes(selectedGridCellId)) ||
    (selectedId && (() => {
      const el = nodes[selectedId];
      if (!el || !('parent' in el)) return false;
      const p1 = (el as any).parent as string;
      if (section.children.includes(p1)) return true;
      const p1Node = nodes[p1];
      if (!p1Node || !('parent' in p1Node)) return false;
      const p2 = (p1Node as any).parent as string;
      return section.children.includes(p2);
    })())
  );

  const secBorder = section.style.border;
  const secShadow = section.style.shadow;
  const selectionShadow = (isSelected && !hasActiveChild) ? 'inset 0 0 0 2px #006e75' : undefined;

  const sectionContentStyle: React.CSSProperties = {
    position: 'relative', boxSizing: 'border-box', width: '100%',
    paddingTop: pad.top, paddingRight: pad.right, paddingBottom: pad.bottom, paddingLeft: pad.left,
    ...(secBorder?.radius ? { borderRadius: secBorder.radius } : {}),
    ...(secBorder?.width && secBorder.width > 0 ? { border: `${secBorder.width}px ${secBorder.style ?? 'solid'} ${secBorder.color}` } : {}),
    ...(secShadow?.enabled ? { boxShadow: `${secShadow.x}px ${secShadow.y}px ${secShadow.blur}px ${secShadow.spread}px ${secShadow.color}` } : {}),
    ...(contentWidthMode === 'constrained' ? { maxWidth: maxW, margin: '0 auto' } : {}),
  };

  const overlayBase = bg.overlayColor ?? '#000000';
  const overlayStyle: React.CSSProperties | undefined = bg.overlay > 0 ? {
    position: 'absolute', inset: 0,
    backgroundColor: `${overlayBase}${Math.round(bg.overlay * 255).toString(16).padStart(2, '0')}`,
    pointerEvents: 'none', zIndex: 0,
  } : undefined;

  const bpHidden =
    breakpoint === 'mobile' ? section.responsive?.mobile?.hidden :
    breakpoint === 'tablet' ? section.responsive?.tablet?.hidden : false;
  if (bpHidden) return null;

  const sm = section.style.margin;
  const marginStyle: React.CSSProperties = sm
    ? { marginTop: sm.top, marginRight: sm.right, marginBottom: sm.bottom, marginLeft: sm.left }
    : {};
  const outerStyle: React.CSSProperties = (isSticky || isFixed)
    ? { flexShrink: 0, position: 'sticky', top: section.stickyOffset ?? 0, zIndex: 50, ...marginStyle }
    : { position: 'relative', flexShrink: 0, zIndex: (hovered || isSelected || hasActiveChild) ? 10 : undefined, ...marginStyle };

  return (
    <div
      style={outerStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {!previewMode && !hasActiveChild && (hovered || isSelected) && (
        <>
          <button
            className={'pb-section-insert-btn pb-flex-center pb-section-insert-btn--above'}
            title="Insert section above"
            onMouseDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); onAddSectionBefore?.(); }}
          >+</button>
          <button
            className={'pb-section-insert-btn pb-flex-center pb-section-insert-btn--below'}
            title="Insert section below"
            onMouseDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); onAddSectionAfter?.(); }}
          >+</button>
        </>
      )}
      <div ref={bgRefCallback} id={`sec-${section.id}`} className={'pb-section-bg'} style={{ ...sectionBgStyle, boxShadow: isLayoutOver ? 'inset 0 -3px 0 0 #006e75' : selectionShadow }}
        onMouseDown={e => {
          if (e.target !== bgRef.current) return;
          e.stopPropagation(); onSelectSection(); onSelectGridCell?.(null);
        }}
      >
        {sectionHasVideoBg(bg) && (
          <video
            key={bg.video}
            src={bg.video}
            autoPlay
            muted
            loop
            playsInline
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: bg.position || 'center', zIndex: 0, pointerEvents: 'none' }}
          />
        )}
        {overlayStyle && <div style={overlayStyle} />}
        {breakpoint !== 'desktop' && !previewMode && (
          <>
            <div className={"pb-bp-margin-overlay pb-bp-margin-left"} style={{ width: `calc((100% - ${canvasWidth}px) / 2)` }} />
            <div className={"pb-bp-margin-overlay pb-bp-margin-right"} style={{ width: `calc((100% - ${canvasWidth}px) / 2)` }} />
          </>
        )}

        {!previewMode && !hasActiveChild && (hovered || isSelected) && (
          <div
            className={['pb-section-label-badge', 'pb-section-label-badge--clickable', isSelected && !selectedGridCellId && 'pb-section-label-badge--active'].filter(Boolean).join(' ')}
            title="Click to select grid section"
            onClick={e => { e.stopPropagation(); onSelectSection(); onSelectGridCell?.(null); }}
          >
            {role === 'header' ? 'Header' : role === 'footer' ? 'Footer' : section.label}
            <span className={'pb-section-label-mode'}> · {isFlex ? 'Flex' : 'Grid'}</span>
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
            if ((e.target as HTMLElement).closest('.pb-grid-cell')) return;
            e.stopPropagation(); onSelectSection(); onSelectGridCell?.(null);
          }}
        >
          {!previewMode && isSelected && !hasActiveChild && (
            <div className={'pb-section-action-bar'} onMouseDown={e => e.stopPropagation()}>
              <IconButton variant="ghost" size="lg" title="Move up"
                onClick={e => { e.stopPropagation(); onMoveSectionUp?.(); }}>↑</IconButton>
              <IconButton variant="ghost" size="lg" title="Move down"
                onClick={e => { e.stopPropagation(); onMoveSectionDown?.(); }}>↓</IconButton>
              <IconButton variant="ghost" size="lg" title="Duplicate section"
                onClick={e => { e.stopPropagation(); onDuplicateSection?.(); }}>⧉</IconButton>
              <div className={'pb-section-action-divider'} />
              <IconButton variant="ghost" size="lg" className="pb-section-add-col" title="Add column"
                onClick={e => { e.stopPropagation(); onAddGridCell?.(section.id); }}>+ Col</IconButton>
              <div className={'pb-section-action-divider'} />
              <IconButton variant="danger" size="lg" title="Delete section"
                onClick={e => { e.stopPropagation(); onDeleteSection?.(); }}>✕</IconButton>
            </div>
          )}

          <div className={'pb-grid-area-wrapper'}>
            <div
              className={'pb-grid-cells-row'}
              style={isFlex ? {
                display: 'flex',
                flexDirection: flexCfg.direction,
                justifyContent: flexCfg.justify,
                alignItems: flexCfg.align,
                flexWrap: flexCfg.wrap ? 'wrap' : 'nowrap',
                gap: `${rowGap}px ${gap}px`,
                minHeight: gridCfg.minHeight || undefined,
                // Row direction + no wrap: let an overflowing row of cells scroll
                // horizontally instead of clipping/squishing past the section width.
                overflowX: !flexCfg.wrap && (flexCfg.direction === 'row' || flexCfg.direction === 'row-reverse') ? 'auto' : undefined,
              } : {
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
                  onDeleteCell={cells.length > 1 ? () => onDeleteGridCell?.(cell.id) : undefined}
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
                      onUpdateGridCell?.(cell.id, { columnSpan: newLeft });
                      onUpdateGridCell?.(nextCell.id, { columnSpan: total - newLeft });
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
                    isSelected={selectedGridCellId === cell.id}
                    onSelectCell={() => { onSelectSection(); onSelectGridCell?.(cell.id); }}
                    onSelectElement={elId => {
                      onSelectSection();
                      const el = nodes[elId];
                      const elParent = el?.type !== 'section' ? el?.parent : undefined;
                      const parentCellId = elParent && nodes[elParent]?.type === 'grid-cell'
                        ? elParent
                        : cell.id;
                      onSelectGridCell?.(parentCellId);
                      onSelectElement(elId, false);
                    }}
                    onUpdateCell={updates => onUpdateGridCell?.(cell.id, updates)}
                    onDeleteCell={() => onDeleteGridCell?.(cell.id)}
                    onAddElement={(type, x, y) => onAddElementToCell?.(type, cell.id, x, y)}
                    isDragOverTarget={dragOverGridCellId === cell.id}
                    canvasWidth={canvasWidth}
                    selectedCarouselId={selectedCarouselId}
                    onSelectCarousel={onSelectCarousel}
                    onUpdateCarousel={onUpdateCarousel}
                    onUpdateCarouselResponsive={onUpdateCarouselResponsive}
                    onSetActiveSlide={onSetActiveSlide}
                    onAddSlide={onAddSlide}
                    onAddCarouselToCell={onAddCarouselToCell}
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
              <div className={'pb-grid-empty-state pb-flex-center'}>
                <span className={'pb-grid-empty-icon'}>⊞</span>
                <button className={'pb-grid-empty-add-btn'} onClick={e => { e.stopPropagation(); onAddGridCell?.(section.id); }}>
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

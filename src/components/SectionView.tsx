import { useRef, useState } from 'react';
import { IconButton } from './IconButton';
import type React from 'react';
import { useDrop } from 'react-dnd';
import { CanvasElement, canvasDragShared } from './CanvasElement';
import type { GuideLine, DragInfo } from './CanvasElement';
import { DragGuides } from './DragGuides';
import { GridSectionView } from './GridSectionView';
import { CarouselView } from './CarouselView';
import { AccordionView } from './AccordionView';
import { DND_TYPE, LAYOUT_DND_TYPE, CAROUSEL_DND_TYPE, ACCORDION_DND_TYPE, UPLOAD_IMAGE_DND_TYPE } from './LeftSidebar';
import type { UploadImageDragItem } from './LeftSidebar';
import { GRID_EL_DND_TYPE } from './GridElementView';
import type { Accordion, Breakpoint, BreakpointOverride, Carousel, GridCell, GridSection, FlexSection, NodeMap, Section, SectionUpdate, CanvasElement as El, BuilderState, ElementType } from '../types';
import { applyBreakpoint, CANVAS_W } from '../hooks/useBuilderStore';
import { sectionBgProps, sectionHasVideoBg } from '../utils/sectionStyle';
import { resolveResponsive } from '../utils/responsive';
import { useCanvasContext } from '../contexts/CanvasContext';

// Props that are truly per-section — section-specific data and closures.
// Shared canvas state (nodes, breakpoint, selectedId, etc.) is consumed from CanvasContext.
interface Props {
  section: Section;
  role: 'header' | 'section' | 'footer';
  isSelected: boolean;
  onSelectSection: () => void;
  onAddSectionBefore?: () => void;
  onAddSectionAfter?: () => void;
  onPromoteSection?: (role: 'header' | 'footer') => void;
  onDeleteSection?: () => void;
  onDuplicateSection?: () => void;
  onCopyGridCell?: (id: string) => void;
  onPasteGridCell?: (sectionId: string, afterCellId?: string) => void;
  onPasteIntoGridCell?: (cellId: string) => void;
  hasCellClipboard?: boolean;
  onMoveSectionUp?: () => void;
  onMoveSectionDown?: () => void;
  onMarqueeSelect?: (ids: string[]) => void;
  isDragOverTarget?: boolean;
  pageLayoutWidth?: 'fixed' | 'fluid';
  // Carousel
  selectedCarouselId?: string | null;
  onSelectCarousel?: (id: string) => void;
  onSetActiveSlide?: (carouselId: string, index: number) => void;
  onAddSlide?: (carouselId: string, afterSlideId?: string) => void;
  onAddCarousel?: (sectionId: string, dropX?: number, dropY?: number) => void;
  onUpdateCarousel?: (id: string, updates: Partial<Omit<Carousel, 'id' | 'type' | 'parent' | 'children'>>) => void;
  onUpdateCarouselResponsive?: (id: string, bp: Breakpoint, updates: import('../types').CarouselBpOverride) => void;
  // Accordion
  selectedAccordionId?: string | null;
  onSelectAccordion?: (id: string) => void;
  onAddAccordion?: (sectionId: string, dropX?: number, dropY?: number) => void;
  onUpdateAccordion?: (id: string, updates: Partial<Omit<import('../types').Accordion, 'id' | 'type' | 'parent' | 'children' | 'items'>>) => void;
  onUpdateAccordionResponsive?: (id: string, bp: Breakpoint, updates: import('../types').AccordionBpOverride) => void;
  onToggleAccordionItem?: (accordionId: string, itemId: string) => void;
  onAddAccordionItem?: (accordionId: string, afterItemId?: string) => void;
}

// Pure dispatcher — no hooks here, so React hook count never changes between renders.
export function SectionView(props: Props) {
  if (props.section.layoutMode === 'grid' || props.section.layoutMode === 'flex') {
    const { section, ...rest } = props;
    return (
      <GridSectionView
        section={section as GridSection | FlexSection}
        // Carousel/accordion are added into a grid cell; shared grid ops come from CanvasContext.
        onAddCarouselToCell={cellId => rest.onAddCarousel?.(cellId)}
        onAddAccordionToCell={cellId => rest.onAddAccordion?.(cellId)}
        {...rest}
      />
    );
  }
  return <FreeSectionView {...props} />;
}

function FreeSectionView({
  // Section-level props (not part of CanvasContext)
  section, role, isSelected,
  onSelectSection,
  onAddSectionBefore, onAddSectionAfter, onDeleteSection, onDuplicateSection,
  onCopyGridCell: _onCopyGridCell, onPasteGridCell: _onPasteGridCell,
  onPasteIntoGridCell: _onPasteIntoGridCell, hasCellClipboard: _hasCellClipboard,
  onMoveSectionUp, onMoveSectionDown,
  onMarqueeSelect, isDragOverTarget = false,
  // carousel — not part of CanvasContext
  selectedCarouselId, onSelectCarousel, onSetActiveSlide, onAddSlide, onAddCarousel, onUpdateCarousel, onUpdateCarouselResponsive,
  // accordion — not part of CanvasContext
  selectedAccordionId, onSelectAccordion, onAddAccordion, onUpdateAccordion, onUpdateAccordionResponsive, onToggleAccordionItem, onAddAccordionItem,
}: Props) {
  const {
    nodes, canvasWidth, snapshot, snapEnabled, onCommit,
    previewMode, breakpoint = 'desktop', onUpdateResponsive,
    onPreviewNavigatePage,
    selectedId, selectedIds, onSelectElement, onUpdateElement,
    onDrop, onMoveElementToSection, onUpdateSection,
    onDuplicateElement, onDeleteElement, onContextMenu,
    onDropGridLayout,
    // grid-cell / container pipeline (used by carousel slides & accordion content cells)
    selectedGridCellId, selectedContainerId, onSelectGridCell, onSelectContainer,
    onUpdateGridCell, onDeleteGridCell, onAddElementToCell, onMoveGridElement,
    onReorderGridCell, onRemoveColumnsBlock, onAddContainer, onUpdateContainer, onAddSubCell,
    dragOverGridCellId,
  } = useCanvasContext();

  const bgRef = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [guides, setGuides] = useState<GuideLine[]>([]);
  const [dragInfo, setDragInfo] = useState<DragInfo | null>(null);
  const [marquee, setMarquee] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  const bg = section.style.background;
  const basePad = section.style.padding ?? { top: 0, right: 0, bottom: 0, left: 0 };
  const bpPadOverride =
    breakpoint === 'mobile' ? section.responsive?.mobile?.padding
    : breakpoint === 'tablet' ? section.responsive?.tablet?.padding
    : undefined;
  const effPad = { ...basePad, ...bpPadOverride };
  const sectionHeight = resolveResponsive(breakpoint, section.layout.height, section.responsive?.tablet?.height, section.responsive?.mobile?.height);
  const sectionElements = section.children
    .map(id => nodes[id])
    .filter((n): n is El => !!n && n.type !== 'carousel' && n.type !== 'accordion') as El[];
  const sectionCarousels = section.children
    .map(id => nodes[id])
    .filter((n): n is Carousel => !!n && n.type === 'carousel');
  const sectionAccordions = section.children
    .map(id => nodes[id])
    .filter((n): n is Accordion => !!n && n.type === 'accordion');

  const [{ isOver }, dropRef] = useDrop<any, void, { isOver: boolean }>({
    accept: [DND_TYPE, GRID_EL_DND_TYPE, CAROUSEL_DND_TYPE, ACCORDION_DND_TYPE, UPLOAD_IMAGE_DND_TYPE],
    drop: (item, monitor) => {
      if (monitor.didDrop()) return;
      const offset = monitor.getClientOffset();
      if (!offset || !surfaceRef.current) return;
      const rect = surfaceRef.current.getBoundingClientRect();
      const z = canvasDragShared.zoom;

      // Image dragged from the Upload Panel — create an image element seeded
      // with the uploaded asset's URL/metadata at the drop position.
      if (item?.kind === 'upload-image') {
        const up = item as UploadImageDragItem;
        onDrop('image', (offset.x - rect.left) / z, (offset.y - rect.top) / z, section.id, {
          src: up.src,
          imageUrl: up.src,
          assetId: up.assetId,
          assetUrl: up.assetUrl,
          alt: up.fileName,
        });
        return;
      }

      if (item?.kind === 'carousel') {
        onAddCarousel?.(section.id, (offset.x - rect.left) / z, (offset.y - rect.top) / z);
        return;
      }

      if (item?.kind === 'accordion') {
        onAddAccordion?.(section.id, (offset.x - rect.left) / z, (offset.y - rect.top) / z);
        return;
      }

      if ('elementId' in item) {
        // Keep carousel slide content inside its carousel — don't let it be
        // dropped out into the section as a detached free element.
        const sourceCellId = (item as { sourceCellId?: string }).sourceCellId;
        const sourceCell = sourceCellId ? nodes[sourceCellId] : undefined;
        if (sourceCell && sourceCell.type === 'grid-cell' && nodes[(sourceCell as GridCell).parent]?.type === 'carousel') {
          return;
        }
        onMoveElementToSection?.(item.elementId, section.id, (offset.x - rect.left) / z, (offset.y - rect.top) / z);
        return;
      }

      onDrop(item.type, (offset.x - rect.left) / z, (offset.y - rect.top) / z, section.id);
    },
    collect: m => ({ isOver: m.isOver() }),
  });

  const [{ isLayoutOver }, layoutDropRef] = useDrop<{ columnSpans: number[] }, void, { isLayoutOver: boolean }>({
    accept: LAYOUT_DND_TYPE,
    canDrop: () => true,
    drop: (item, monitor) => {
      if (monitor.didDrop()) return;
      onDropGridLayout?.(section.id, item.columnSpans);
    },
    collect: m => ({ isLayoutOver: m.isOver() }),
  });


  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startY = e.clientY;
    const startH = sectionHeight;
    const onMove = (ev: MouseEvent) => {
      onUpdateSection(section.id, { layout: { ...section.layout, height: Math.max(80, Math.round(startH + (ev.clientY - startY) / canvasDragShared.zoom)) } });
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const secBorder = section.style.border;
  const secShadow = section.style.shadow;
  const sectionBgStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: sectionHeight,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    boxSizing: 'border-box',
    ...sectionBgProps(bg),
    ...(secBorder?.radius ? { borderRadius: secBorder.radius } : {}),
    ...(secBorder?.width && secBorder.width > 0 ? { border: `${secBorder.width}px ${secBorder.style ?? 'solid'} ${secBorder.color}` } : {}),
    ...(secShadow?.enabled ? { boxShadow: `${secShadow.x}px ${secShadow.y}px ${secShadow.blur}px ${secShadow.spread}px ${secShadow.color}` } : {}),
  };

  const scrollBehavior = section.scrollBehavior ?? 'normal';
  const isSticky = scrollBehavior === 'sticky';
  const isFixed  = scrollBehavior === 'fixed';
  const hasActiveChild = !!(selectedId && section.children.includes(selectedId));

  const selectionShadow = (isSelected && !hasActiveChild) ? 'inset 0 0 0 2px #006e75'
    : (isOver || isDragOverTarget) ? 'inset 0 0 0 2px #0b978e'
    : undefined;

  const sectionContentStyle: React.CSSProperties = {
    position: 'relative',
    width: canvasWidth,
    height: '100%',
    margin: '0 auto',
    boxSizing: 'border-box',
    paddingTop: effPad.top || undefined,
    paddingRight: effPad.right || undefined,
    paddingBottom: effPad.bottom || undefined,
    paddingLeft: effPad.left || undefined,
  };

  const overlayBase = bg.overlayColor ?? '#000000';
  const overlayStyle: React.CSSProperties | undefined = bg.overlay > 0 ? {
    position: 'absolute', inset: 0,
    backgroundColor: `${overlayBase}${Math.round(bg.overlay * 255).toString(16).padStart(2, '0')}`,
    pointerEvents: 'none', zIndex: 0,
  } : undefined;

  const handleSurfaceMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== surfaceRef.current) return;
    e.stopPropagation();
    const rect = surfaceRef.current!.getBoundingClientRect();
    const z = canvasDragShared.zoom;
    const startX = (e.clientX - rect.left) / z;
    const startY = (e.clientY - rect.top) / z;
    let dragging = false;

    const onMove = (ev: MouseEvent) => {
      const ex = (ev.clientX - rect.left) / z;
      const ey = (ev.clientY - rect.top) / z;
      if (!dragging && (Math.abs(ex - startX) > 4 || Math.abs(ey - startY) > 4)) dragging = true;
      if (dragging) {
        setMarquee({
          x: Math.min(startX, ex), y: Math.min(startY, ey),
          w: Math.abs(ex - startX), h: Math.abs(ey - startY),
        });
      }
    };

    const onUp = (ev: MouseEvent) => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      if (dragging) {
        const ex = (ev.clientX - rect.left) / z;
        const ey = (ev.clientY - rect.top) / z;
        const mx = Math.min(startX, ex), my = Math.min(startY, ey);
        const mw = Math.abs(ex - startX), mh = Math.abs(ey - startY);
        const ids = section.children.filter(id => {
          const node = nodes[id];
          if (!node || node.type === 'carousel' || node.type === 'accordion') return false;  // carousels/accordions aren't marquee-selectable
          const el = node as El;
          return !el.state.hidden
            && el.layout.x < mx + mw && el.layout.x + el.layout.width > mx
            && el.layout.y < my + mh && el.layout.y + el.layout.height > my;
        });
        onMarqueeSelect?.(ids);
      } else {
        onSelectSection();
      }
      setMarquee(null);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  // Hide section at current breakpoint if configured
  const bpHidden =
    breakpoint === 'mobile' ? section.responsive?.mobile?.hidden :
    breakpoint === 'tablet' ? section.responsive?.tablet?.hidden : false;
  if (bpHidden) return null;

  const secMargin = section.style.margin;
  const marginStyle: React.CSSProperties = secMargin
    ? { marginTop: secMargin.top, marginRight: secMargin.right, marginBottom: secMargin.bottom, marginLeft: secMargin.left }
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
      {/* Full-width section background */}
      <div
        ref={node => {
          (bgRef as { current: HTMLDivElement | null }).current = node;
          (layoutDropRef as unknown as (el: HTMLDivElement | null) => void)(node);
        }}
        id={`sec-${section.id}`}
        className={'pb-section-bg'}
        style={{ ...sectionBgStyle, boxShadow: isLayoutOver ? 'inset 0 -3px 0 0 #006e75' : selectionShadow }}
        onMouseDown={e => {
          if (e.target !== bgRef.current) return;
          e.stopPropagation();
          onSelectSection();
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

        <div
          ref={node => {
            (surfaceRef as React.RefObject<HTMLDivElement | null>).current = node;
            (dropRef as unknown as (el: HTMLDivElement | null) => void)(node);
          }}
          className={['pb-section-surface', isOver && 'pb-drag-over'].filter(Boolean).join(' ')}
          data-section-id={section.id}
          style={sectionContentStyle}
          onMouseDown={handleSurfaceMouseDown}
        >
          {!previewMode && (!hasActiveChild && (hovered || isSelected)) && (
            <div className={'pb-section-label-badge'}>
              {role === 'header' ? 'Header' : role === 'footer' ? 'Footer' : section.label}
              {isSticky && <span className={'pb-section-label-mode'}> · Sticky</span>}
              {isFixed  && <span className={'pb-section-label-mode'}> · Fixed</span>}
            </div>
          )}

          {isFixed && !previewMode && (
            <div className={'pb-fixed-notice'}>
              Fixed · preview is sticky — export uses position:fixed
            </div>
          )}

          {section.layoutMode === 'free' && breakpoint !== 'desktop' && !previewMode && (
            <div className={'pb-free-mobile-notice'}>
              Free layout · position each element manually for {breakpoint}
            </div>
          )}

          {!previewMode && isSelected && !hasActiveChild && (
            <div className={'pb-section-action-bar'} onMouseDown={e => e.stopPropagation()}>
              <IconButton variant="ghost" size="lg" title="Move up"
                onClick={e => { e.stopPropagation(); onMoveSectionUp?.(); }}>↑</IconButton>
              <IconButton variant="ghost" size="lg" title="Move down"
                onClick={e => { e.stopPropagation(); onMoveSectionDown?.(); }}>↓</IconButton>
              <IconButton variant="ghost" size="lg" title="Duplicate section"
                onClick={e => { e.stopPropagation(); onDuplicateSection?.(); }}>⧉</IconButton>
              <div className={'pb-section-action-divider'} />
              <IconButton variant="danger" size="lg" title="Delete section"
                onClick={e => { e.stopPropagation(); onDeleteSection?.(); }}>✕</IconButton>
            </div>
          )}


          {!previewMode && guides.map((g, i) =>
            g.type === 'v'
              ? <div key={i} className={'pb-guide-v'} style={{ left: g.pos }} />
              : <div key={i} className={'pb-guide-h'} style={{ top: g.pos }} />
          )}

          {dragInfo && (
            <DragGuides
              x={dragInfo.x} y={dragInfo.y}
              width={dragInfo.width} height={dragInfo.height}
              sectionWidth={canvasWidth} sectionHeight={sectionHeight}
            />
          )}

          {marquee && (
            <div className={'pb-marquee-rect'} style={{
              left: marquee.x, top: marquee.y, width: marquee.w, height: marquee.h,
            }} />
          )}

          {section.children.map(id => {
            const node = nodes[id];
            if (!node || node.type === 'carousel' || node.type === 'accordion') return null;  // carousels/accordions render in their own layer below
            const rawEl = node as El;
            const scale = canvasWidth / CANVAS_W;
            const el = applyBreakpoint(rawEl, breakpoint, scale);
            if (el.state.hidden) return null;

            const handleUpdate = (updates: Partial<El>) => {
              if (breakpoint !== 'desktop' && onUpdateResponsive) {
                const respUpdate: Partial<BreakpointOverride> = {};
                if (updates.layout) respUpdate.layout = updates.layout;
                if (updates.style?.typography) respUpdate.style = { typography: updates.style.typography };
                if (updates.state) respUpdate.state = updates.state;
                if (Object.keys(respUpdate).length > 0) {
                  onUpdateResponsive(id, breakpoint, respUpdate);
                } else {
                  onUpdateElement(id, updates);
                }
              } else {
                onUpdateElement(id, updates);
              }
            };

            return (
              <CanvasElement
                key={id}
                element={el}
                sectionId={section.id}
                isSelected={selectedId === id}
                isMultiSelected={selectedIds.includes(id) && selectedId !== id}
                onSelect={shift => onSelectElement(id, shift)}
                onUpdate={handleUpdate}
                onCommit={onCommit}
                snapshot={snapshot}
                snapEnabled={snapEnabled}
                onContextMenu={(x, y) => onContextMenu(id, x, y)}
                sectionElements={sectionElements}
                onGuides={(gs, di) => { setGuides(gs); setDragInfo(di ?? null); }}
                previewMode={previewMode}
                onPreviewNavigatePage={onPreviewNavigatePage}
                onDuplicate={onDuplicateElement ? () => onDuplicateElement(id) : undefined}
                onDelete={onDeleteElement ? () => onDeleteElement(id) : undefined}
                breakpoint={breakpoint}
              />
            );
          })}

          {/* Carousels — freely positioned boxes (like elements), each self-positions via its layout */}
          {sectionCarousels.map(car => (
            <CarouselView
              key={car.id}
              carousel={car}
              nodes={nodes}
              isSelected={selectedCarouselId === car.id}
              selectedId={selectedId}
              selectedGridCellId={selectedGridCellId}
              selectedContainerId={selectedContainerId}
              previewMode={previewMode}
              breakpoint={breakpoint}
              canvasWidth={canvasWidth}
              onSelectCarousel={() => onSelectCarousel?.(car.id)}
              onUpdateCarousel={onUpdateCarousel}
              onUpdateCarouselResponsive={onUpdateCarouselResponsive}
              onSelectGridCell={onSelectGridCell}
              onSelectElement={onSelectElement}
              onSelectContainer={onSelectContainer}
              onSetActiveSlide={onSetActiveSlide ?? (() => {})}
              onAddSlide={onAddSlide ?? (() => {})}
              onUpdateElement={onUpdateElement}
              onUpdateGridCell={onUpdateGridCell}
              onDeleteGridCell={onDeleteGridCell}
              onAddElementToCell={onAddElementToCell}
              onMoveGridElement={onMoveGridElement}
              onReorderGridCell={onReorderGridCell}
              onRemoveColumnsBlock={onRemoveColumnsBlock}
              onAddContainer={onAddContainer}
              onUpdateContainer={onUpdateContainer}
              onAddSubCell={onAddSubCell}
              onCommit={onCommit}
              snapshot={snapshot}
              onUpdateResponsive={onUpdateResponsive}
              onDuplicateElement={onDuplicateElement}
              onDeleteElement={onDeleteElement}
              dragOverGridCellId={dragOverGridCellId}
            />
          ))}

          {/* Accordions — freely positioned stacked-collapsible boxes (like elements) */}
          {sectionAccordions.map(acc => (
            <AccordionView
              key={acc.id}
              accordion={acc}
              nodes={nodes}
              isSelected={selectedAccordionId === acc.id}
              selectedId={selectedId}
              selectedGridCellId={selectedGridCellId}
              previewMode={previewMode}
              breakpoint={breakpoint}
              canvasWidth={canvasWidth}
              onSelectAccordion={() => onSelectAccordion?.(acc.id)}
              onUpdateAccordion={onUpdateAccordion}
              onUpdateAccordionResponsive={onUpdateAccordionResponsive}
              onToggleAccordionItem={onToggleAccordionItem}
              onAddAccordionItem={onAddAccordionItem}
              onSelectGridCell={onSelectGridCell}
              onSelectElement={onSelectElement}
              onUpdateElement={onUpdateElement}
              onUpdateGridCell={onUpdateGridCell}
              onDeleteGridCell={onDeleteGridCell}
              onAddElementToCell={onAddElementToCell}
              onCommit={onCommit}
              snapshot={snapshot}
              onDuplicateElement={onDuplicateElement}
              onDeleteElement={onDeleteElement}
              dragOverGridCellId={dragOverGridCellId}
            />
          ))}

          {section.children.length === 0 && !previewMode && (
            <div className={'pb-section-empty'}>
              Drag elements here or click palette items to add
            </div>
          )}
        </div>
      </div>

      {!previewMode && (
        <div className={'pb-section-resize-handle'} onMouseDown={handleResizeMouseDown} title="Drag to resize" />
      )}

    </div>
  );
}

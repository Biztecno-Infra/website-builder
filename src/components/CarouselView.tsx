import React, { useRef, useState } from 'react';
import { GridCellView } from './GridCellView';
import { canvasDragShared } from './CanvasElement';
import { ElementQuickBar } from './ElementQuickBar';
import { CANVAS_W } from '../hooks/useBuilderStore';
import type {
  Breakpoint, BreakpointOverride, BuilderState, CanvasElement as El,
  Carousel, CarouselBpOverride, CellLayoutMode, Container, ContainerLayoutMode, GridCell, NodeMap, ElementType,
} from '../types';

const RESIZE_DIRS = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'] as const;
type ResizeDir = (typeof RESIZE_DIRS)[number];
const RESIZE_CURSOR: Record<ResizeDir, string> = {
  nw: 'nw-resize', n: 'n-resize', ne: 'ne-resize', e: 'e-resize',
  se: 'se-resize', s: 's-resize', sw: 'sw-resize', w: 'w-resize',
};
function resizeHandlePos(dir: ResizeDir): React.CSSProperties {
  const top = dir.includes('n') ? 0 : dir.includes('s') ? '100%' : '50%';
  const left = dir.includes('w') ? 0 : dir.includes('e') ? '100%' : '50%';
  return { top, left };
}

interface Props {
  carousel: Carousel;
  nodes: NodeMap;
  isSelected: boolean;
  selectedId: string | null;
  selectedGridCellId?: string | null;
  selectedContainerId?: string | null;
  previewMode?: boolean;
  breakpoint?: Breakpoint;
  canvasWidth: number;
  onSelectCarousel: () => void;
  onUpdateCarousel?: (id: string, updates: Partial<Omit<Carousel, 'id' | 'type' | 'parent' | 'children'>>) => void;
  /** Writes a per-breakpoint override (x/y/width/height). Used for drag/resize on tablet & mobile. */
  onUpdateCarouselResponsive?: (id: string, bp: Breakpoint, updates: CarouselBpOverride) => void;
  onSelectGridCell?: (id: string | null) => void;
  onSelectElement: (id: string, shift: boolean) => void;
  onSelectContainer?: (id: string) => void;
  onSetActiveSlide: (carouselId: string, index: number) => void;
  onAddSlide: (carouselId: string, afterSlideId?: string) => void;
  // Slide content callbacks (slides are GridCells — reuse the grid-cell pipeline)
  onUpdateElement: (id: string, updates: Partial<El>) => void;
  onUpdateGridCell?: (id: string, updates: Partial<GridCell>) => void;
  onDeleteGridCell?: (id: string) => void;
  onAddElementToCell?: (type: ElementType, cellId: string, x?: number, y?: number) => void;
  onMoveGridElement?: (elementId: string, sourceCellId: string, targetCellId: string, insertIndex: number, dropPos?: { x: number; y: number }, sourceCellMode?: CellLayoutMode) => void;
  onReorderGridCell?: (parentId: string, fromIndex: number, toIndex: number) => void;
  onRemoveColumnsBlock?: (blockId: string) => void;
  onAddContainer?: (cellId: string, mode: ContainerLayoutMode, columnSpans?: number[]) => void;
  onUpdateContainer?: (id: string, updates: Partial<Pick<Container, 'layoutMode' | 'gap' | 'rowGap'>>) => void;
  onAddSubCell?: (containerId: string) => void;
  onCommit: (prev: BuilderState) => void;
  snapshot: BuilderState;
  onUpdateResponsive?: (id: string, bp: Breakpoint, updates: Partial<BreakpointOverride>) => void;
  onDuplicateElement?: (id: string) => void;
  onDeleteElement?: (id: string) => void;
  dragOverGridCellId?: string | null;
  /** When true the carousel flows inside a grid cell (relative, full-width) instead of being absolutely positioned on the free canvas. */
  inCell?: boolean;
}

function carouselHeight(carousel: Carousel, bp: Breakpoint): number {
  const r = carousel.responsive;
  if (bp === 'mobile') return r?.mobile?.height ?? r?.tablet?.height ?? carousel.layout.height;
  if (bp === 'tablet') return r?.tablet?.height ?? carousel.layout.height;
  return carousel.layout.height;
}

function carouselHidden(carousel: Carousel, bp: Breakpoint): boolean {
  const r = carousel.responsive;
  if (bp === 'mobile') return r?.mobile?.hidden ?? false;
  if (bp === 'tablet') return r?.tablet?.hidden ?? false;
  return false;
}

// Effective free-canvas geometry for a breakpoint. x/y/width cascade
// mobile ?? tablet ?? desktop (property-level), matching CanvasElement.
function carouselGeometry(carousel: Carousel, bp: Breakpoint): { x: number; y: number; width: number } {
  const { x, y, width } = carousel.layout;
  if (bp === 'desktop' || bp === 'large-desktop') return { x, y, width };
  const t = carousel.responsive?.tablet;
  const m = carousel.responsive?.mobile;
  if (bp === 'tablet') return { x: t?.x ?? x, y: t?.y ?? y, width: t?.width ?? width };
  return { x: m?.x ?? t?.x ?? x, y: m?.y ?? t?.y ?? y, width: m?.width ?? t?.width ?? width };
}

export function CarouselView({
  carousel, nodes, isSelected,
  selectedId, selectedGridCellId, selectedContainerId,
  previewMode, breakpoint = 'desktop', canvasWidth,
  onSelectCarousel, onUpdateCarousel, onUpdateCarouselResponsive, onSelectGridCell, onSelectElement, onSelectContainer,
  onSetActiveSlide, onAddSlide,
  onUpdateElement, onUpdateGridCell, onDeleteGridCell, onAddElementToCell,
  onMoveGridElement, onReorderGridCell, onRemoveColumnsBlock,
  onAddContainer, onUpdateContainer, onAddSubCell,
  onCommit, snapshot, onUpdateResponsive, onDuplicateElement, onDeleteElement,
  dragOverGridCellId, inCell = false,
}: Props) {
  const [hovered, setHovered] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const slides = carousel.children
    .map(id => nodes[id] as GridCell | undefined)
    .filter((c): c is GridCell => !!c && c.type === 'grid-cell');

  const props = carousel.props;
  const height = carouselHeight(carousel, breakpoint);
  const lay = carousel.layout;
  // Effective geometry for the active breakpoint (cascades tablet/mobile overrides).
  const geom = carouselGeometry(carousel, breakpoint);
  const isDesktopBp = breakpoint === 'desktop' || breakpoint === 'large-desktop';

  // Persist a move/resize either to the desktop layout (desktop bp) or as a
  // per-breakpoint responsive override (tablet/mobile), mirroring CanvasElement.
  const writeGeometry = (next: { x?: number; y?: number; width?: number; height?: number }) => {
    if (isDesktopBp) {
      onUpdateCarousel?.(carousel.id, { layout: { ...lay, ...next } });
    } else {
      onUpdateCarouselResponsive?.(carousel.id, breakpoint, next);
    }
  };
  // Either updater path enables editing.
  const canPersist = isDesktopBp ? !!onUpdateCarousel : !!onUpdateCarouselResponsive;

  // Pointer deltas are in screen px. Convert to CANVAS_W space (the space x/y/width
  // are stored in for every breakpoint): divide by both the editor zoom and the
  // breakpoint's canvas scale, so a move tracks the cursor 1:1 on tablet/mobile too.
  const dragScale = (canvasWidth / CANVAS_W) || 1;

  // ── Drag the whole carousel box to reposition (free-canvas only) ──
  const startDrag = (e: React.MouseEvent) => {
    if (inCell) return;  // flowed inside a cell — position is managed by the cell's layout, not free drag
    if (previewMode || !canPersist) return;
    if (e.button !== 0) return;
    e.stopPropagation();
    onSelectCarousel();
    const startX = e.clientX, startY = e.clientY;
    const { x: ox, y: oy } = geom;
    const prev = snapshot;
    let moved = false;
    const onMove = (ev: MouseEvent) => {
      const z = canvasDragShared.zoom;
      const dx = (ev.clientX - startX) / (z * dragScale);
      const dy = (ev.clientY - startY) / (z * dragScale);
      if (!moved && Math.abs(ev.clientX - startX) < 3 && Math.abs(ev.clientY - startY) < 3) return;
      moved = true;
      writeGeometry({ x: Math.round(ox + dx), y: Math.round(oy + dy) });
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      if (moved) onCommit(prev);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const startResize = (dir: ResizeDir) => (e: React.MouseEvent) => {
    if (previewMode || !canPersist) return;
    if (inCell && dir !== 's') return;  // in-cell width is the cell's; only height (south handle) is adjustable
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX, startY = e.clientY;
    const { x: ox, y: oy, width: ow } = geom;
    const oh = height;
    const prev = snapshot;
    const onMove = (ev: MouseEvent) => {
      const z = canvasDragShared.zoom;
      const dx = (ev.clientX - startX) / (z * dragScale);
      const dy = (ev.clientY - startY) / (z * dragScale);
      let x = ox, y = oy, w = ow, h = oh;
      const min = 80;
      if (dir.includes('e')) w = Math.max(min, ow + dx);
      if (dir.includes('s')) h = Math.max(min, oh + dy);
      if (dir.includes('w')) { w = Math.max(min, ow - dx); x = ox + ow - w; }
      if (dir.includes('n')) { h = Math.max(min, oh - dy); y = oy + oh - h; }
      writeGeometry({ x: Math.round(x), y: Math.round(y), width: Math.round(w), height: Math.round(h) });
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      onCommit(prev);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  if (carouselHidden(carousel, breakpoint)) return null;

  // Position the carousel box like a free CanvasElement. x/width scale with the
  // active breakpoint's canvas width so the box stays inside the smaller canvas.
  const scale = canvasWidth / CANVAS_W;
  const wrapperStyle: React.CSSProperties = inCell
    ? {
        // Flowed inside a grid cell: take the cell's full width, fixed height,
        // and let the cell's flex layout place it. No absolute x/y.
        position: 'relative',
        width: '100%',
        height,
        zIndex: isSelected ? (lay.zIndex ?? 0) + 1000 : (lay.zIndex ?? 0),
        boxSizing: 'border-box',
      }
    : {
        position: 'absolute',
        left: Math.round(geom.x * scale),
        top: Math.round(geom.y * scale),
        width: Math.round(geom.width * scale),
        height: Math.round(height * scale),
        zIndex: isSelected ? (lay.zIndex ?? 0) + 1000 : (lay.zIndex ?? 0),
        boxSizing: 'border-box',
      };

  if (slides.length === 0) {
    return previewMode ? null : (
      <div
        ref={wrapperRef}
        className={'pb-carousel pb-carousel--empty'}
        style={{ ...wrapperStyle, minHeight: 120 }}
        onMouseDown={startDrag}
        onClick={e => { e.stopPropagation(); onSelectCarousel(); }}
      >
        <button className={'pb-carousel-empty-add'} onClick={e => { e.stopPropagation(); onAddSlide(carousel.id); }}>+ Add slide</button>
      </div>
    );
  }

  const total = slides.length;
  const rawActive = carousel.activeSlide ?? 0;
  const active = Math.max(0, Math.min(total - 1, rawActive));
  const activeSlide = slides[active];

  const go = (idx: number) => {
    let next = idx;
    if (next < 0) next = props.loop ? total - 1 : 0;
    if (next >= total) next = props.loop ? 0 : total - 1;
    onSetActiveSlide(carousel.id, next);
  };

  // True when a descendant (active slide cell, element, or container) owns the selection.
  const hasActiveChild = !previewMode && !!(
    (selectedGridCellId && carousel.children.includes(selectedGridCellId)) ||
    (selectedId && (() => {
      const el = nodes[selectedId];
      if (!el || !('parent' in el)) return false;
      const p = (el as { parent: string }).parent;
      if (carousel.children.includes(p)) return true;
      const pNode = nodes[p];
      return !!pNode && 'parent' in pNode && carousel.children.includes((pNode as { parent: string }).parent);
    })())
  );

  const showChrome = !previewMode && (hovered || isSelected || hasActiveChild);

  // Editing (drag/resize) is available on every breakpoint now: desktop writes the
  // base layout, tablet/mobile write per-breakpoint overrides via canPersist.
  const canEdit = !previewMode && canPersist;
  // Free-canvas carousels can be moved by dragging; in-cell ones cannot.
  const canMove = canEdit && !inCell;

  return (
    <div
      ref={wrapperRef}
      className={['pb-carousel', isSelected && !hasActiveChild && 'pb-carousel--selected', hasActiveChild && 'pb-carousel--child-selected'].filter(Boolean).join(' ')}
      style={{ ...wrapperStyle, cursor: canMove ? 'move' : undefined }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseDown={startDrag}
      onClick={e => { if (previewMode) return; e.stopPropagation(); onSelectCarousel(); }}
    >
      {showChrome && (
        <div className={'pb-carousel-badge'} onMouseDown={startDrag} onClick={e => { e.stopPropagation(); onSelectCarousel(); }}>
          Carousel · {active + 1}/{total}
        </div>
      )}

      {/* Viewport — one slide visible; fills the positioned wrapper box */}
      <div className={'pb-carousel-viewport'} style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
        <div className={'pb-carousel-slide'} style={{ width: '100%', height: '100%' }}>
          <GridCellView
            cell={activeSlide}
            nodes={nodes}
            isSelected={selectedGridCellId === activeSlide.id}
            selectedElementId={selectedId}
            selectedGridCellId={selectedGridCellId}
            onSelectCell={() => { onSelectGridCell?.(activeSlide.id); }}
            onSelectElement={elId => {
              const el = nodes[elId];
              const elParent = el && el.type !== 'section' ? (el as { parent: string }).parent : undefined;
              const parentCellId = elParent && nodes[elParent]?.type === 'grid-cell' ? elParent : activeSlide.id;
              onSelectGridCell?.(parentCellId);
              onSelectElement(elId, false);
            }}
            onUpdateElement={onUpdateElement}
            onUpdateCell={updates => onUpdateGridCell?.(activeSlide.id, updates)}
            onDeleteCell={() => onDeleteGridCell?.(activeSlide.id)}
            onAddElement={(type, x, y) => onAddElementToCell?.(type, activeSlide.id, x, y)}
            onMoveGridElement={onMoveGridElement}
            onCommit={onCommit}
            snapshot={snapshot}
            previewMode={previewMode}
            breakpoint={breakpoint}
            onUpdateResponsive={onUpdateResponsive}
            onDuplicateElement={onDuplicateElement}
            onDeleteElement={onDeleteElement}
            isDragOverTarget={dragOverGridCellId === activeSlide.id}
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
        </div>

        {/* Arrows */}
        {props.showArrows && total > 1 && (
          <>
            <button
              className={'pb-carousel-arrow pb-carousel-arrow--prev'}
              onClick={e => { e.stopPropagation(); go(active - 1); }}
              onMouseDown={e => e.stopPropagation()}
              title="Previous slide"
              aria-label="Previous slide"
            >‹</button>
            <button
              className={'pb-carousel-arrow pb-carousel-arrow--next'}
              onClick={e => { e.stopPropagation(); go(active + 1); }}
              onMouseDown={e => e.stopPropagation()}
              title="Next slide"
              aria-label="Next slide"
            >›</button>
          </>
        )}

        {/* Dots */}
        {props.showDots && total > 1 && (
          <div className={'pb-carousel-dots'} onMouseDown={e => e.stopPropagation()}>
            {slides.map((s, i) => (
              <button
                key={s.id}
                className={['pb-carousel-dot', i === active && 'pb-carousel-dot--active'].filter(Boolean).join(' ')}
                style={{ background: props.dotColor ?? '#ffffff', opacity: i === active ? 1 : 0.55 }}
                onClick={e => { e.stopPropagation(); onSetActiveSlide(carousel.id, i); }}
                title={`Go to slide ${i + 1}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit-mode slide navigator */}
      {showChrome && (
        <div className={'pb-carousel-editbar'} onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
          <button className={'pb-carousel-editbar-btn'} title="Previous slide" onClick={() => go(active - 1)}>‹</button>
          <span className={'pb-carousel-editbar-pos'}>{active + 1} / {total}</span>
          <button className={'pb-carousel-editbar-btn'} title="Next slide" onClick={() => go(active + 1)}>›</button>
          <div className={'pb-carousel-editbar-sep'} />
          <button className={'pb-carousel-editbar-btn'} title="Add slide after current" onClick={() => onAddSlide(carousel.id, activeSlide.id)}>+ Slide</button>
        </div>
      )}

      {/* Resize handles — only when the carousel itself is selected (not a child).
          In-cell carousels expose only the south handle (height); width follows the cell. */}
      {canEdit && isSelected && !hasActiveChild && (inCell ? (['s'] as const) : RESIZE_DIRS).map(dir => (
        <div
          key={dir}
          className={'pb-resize-handle'}
          style={{ ...resizeHandlePos(dir), cursor: RESIZE_CURSOR[dir] }}
          onMouseDown={startResize(dir)}
        />
      ))}

      {/* Duplicate / delete quick bar — reuses the common element handlers
          (the store routes carousel ids to deep clone / recursive delete). */}
      {!previewMode && isSelected && !hasActiveChild && (onDuplicateElement || onDeleteElement) && (
        <ElementQuickBar
          anchorRef={wrapperRef}
          onDuplicate={onDuplicateElement ? () => onDuplicateElement(carousel.id) : undefined}
          onDelete={onDeleteElement ? () => onDeleteElement(carousel.id) : undefined}
        />
      )}
    </div>
  );
}

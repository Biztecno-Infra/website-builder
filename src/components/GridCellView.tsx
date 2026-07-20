import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDrop } from 'react-dnd';
import type { Accordion, Breakpoint, CanvasElement as El, GridCell, ElementType, Container, Carousel } from '../types';
import { DND_TYPE, LAYOUT_DND_TYPE, CAROUSEL_DND_TYPE, ACCORDION_DND_TYPE } from './LeftSidebar';
import { CarouselView } from './CarouselView';
import { AccordionView } from './AccordionView';
import { canvasDragShared } from './CanvasElement';
import { GridElementView, GRID_EL_DND_TYPE } from './GridElementView';
import type { GridElDragItem } from './GridElementView';
import { ColumnsBlockView } from './ColumnsBlockView';
import { getCellLayoutMode, getCellAlignItems, getCellJustifyContent } from '../utils/cellUtils';
import { applyBreakpoint } from '../hooks/useBuilderStore';
import { resolveResponsive } from '../utils/responsive';
import { useCanvasContext } from '../contexts/CanvasContext';

// Props that are truly per-cell — cell data and closures that close over cell.id.
// All shared canvas state comes from CanvasContext.
interface Props {
  cell: GridCell;
  isSelected: boolean;
  onSelectCell: () => void;
  onSelectElement: (id: string) => void;
  onUpdateCell: (updates: Partial<GridCell>) => void;
  onDeleteCell: () => void;
  onAddElement: (type: ElementType, x?: number, y?: number) => void;
  isDragOverTarget?: boolean;
  // Carousel support — a carousel can flow inside a cell (parallel to elements/containers).
  // Shared grid/container ops come from CanvasContext.
  selectedCarouselId?: string | null;
  onSelectCarousel?: (id: string) => void;
  onUpdateCarousel?: (id: string, updates: Partial<Omit<Carousel, 'id' | 'type' | 'parent' | 'children'>>) => void;
  onUpdateCarouselResponsive?: (id: string, bp: Breakpoint, updates: import('../types').CarouselBpOverride) => void;
  onSetActiveSlide?: (carouselId: string, index: number) => void;
  onAddSlide?: (carouselId: string, afterSlideId?: string) => void;
  onAddCarouselToCell?: (cellId: string) => void;
  canvasWidth?: number;
  // Accordion support — an accordion can flow inside a cell too
  selectedAccordionId?: string | null;
  onSelectAccordion?: (id: string) => void;
  onUpdateAccordion?: (id: string, updates: Partial<Omit<Accordion, 'id' | 'type' | 'parent' | 'children' | 'items'>>) => void;
  onUpdateAccordionResponsive?: (id: string, bp: Breakpoint, updates: import('../types').AccordionBpOverride) => void;
  onToggleAccordionItem?: (accordionId: string, itemId: string) => void;
  onAddAccordionItem?: (accordionId: string, afterItemId?: string) => void;
  onAddAccordionToCell?: (cellId: string) => void;
}

function getRowSpan(cell: GridCell): number {
  return cell.rowSpan ?? 1;
}

export function GridCellView({
  cell, isSelected,
  onSelectCell, onSelectElement, onUpdateCell, onDeleteCell, onAddElement,
  isDragOverTarget,
  // Carousel/accordion-in-cell props (shared grid/container ops come from CanvasContext)
  selectedCarouselId, onSelectCarousel, onUpdateCarousel, onUpdateCarouselResponsive, onSetActiveSlide, onAddSlide,
  onAddCarouselToCell, canvasWidth = 1200,
  selectedAccordionId, onSelectAccordion, onUpdateAccordion, onUpdateAccordionResponsive, onToggleAccordionItem, onAddAccordionItem,
  onAddAccordionToCell,
}: Props) {
  const {
    nodes, snapshot, onCommit, previewMode,
    breakpoint = 'desktop', onUpdateResponsive,
    selectedId, selectedGridCellId, onUpdateElement,
    onDuplicateElement, onDeleteElement, onMoveGridElement,
    onUpdateGridCell, onDeleteGridCell, onAddElementToCell, onSelectGridCell,
    onReorderGridCell, onRemoveColumnsBlock,
    onAddContainer, onUpdateContainer, onAddSubCell,
    selectedContainerId, onSelectContainer,
  } = useCanvasContext();

  const bp = breakpoint;
  const _rowSpan = getRowSpan(cell);

  // Canvas elements only (no containers) — used for free branch, overlay els, drop logic
  const allElements = cell.children
    .map(id => nodes[id])
    .filter((node): node is El => !!node && node.type !== 'section' && node.type !== 'grid-cell' && node.type !== 'container' && node.type !== 'carousel' && node.type !== 'accordion');

  const elements = allElements.filter(el => !el.overlayInCell);
  const overlayEls = allElements.filter(el => !!el.overlayInCell);

  // Ordered mix of canvas elements + containers + carousels + accordions for the flex branch, with per-item indices
  let _elIdx = 0;
  const flexChildrenWithIndex = cell.children
    .map((id, rawIdx) => {
      const node = nodes[id];
      if (!node || node.type === 'section' || node.type === 'grid-cell') return null;
      const item = node as El | Container | Carousel | Accordion;
      const isElement = item.type !== 'container' && item.type !== 'carousel' && item.type !== 'accordion';
      return { item, elIdx: isElement ? _elIdx++ : -1, childIdx: rawIdx };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
  const flexChildren = flexChildrenWithIndex.map(x => x.item);

  // ── Insertion-line state ─────────────────────────────────────────────────
  const [insertAfterIndex, setInsertAfterIndex] = useState<number | null>(null);

  // Drag-guide state (overlay element moves)
  type LiveDragPos = { x: number; y: number; width: number; height: number; cellW: number };
  const [liveDragPos, setLiveDragPos] = useState<LiveDragPos | null>(null);

  const cellDomRef = useRef<HTMLDivElement>(null);

  // ── Drop: new elements from sidebar palette ──────────────────────────────
  const [{ isOver: isPaletteOver }, paletteDropRef] = useDrop<{ type: ElementType }, void, { isOver: boolean }>({
    accept: DND_TYPE,
    drop: (item, monitor) => {
      if (monitor.didDrop()) return;
      onAddElement(item.type);
    },
    collect: m => ({ isOver: m.isOver() }),
  });

  // ── Drop: existing grid elements (reorder / cross-cell move) ─────────────
  const [{ isGridElOver }, gridElDropRef] = useDrop<GridElDragItem, void, { isGridElOver: boolean }>({
    accept: GRID_EL_DND_TYPE,
    hover(item, monitor) {
      if (!monitor.isOver({ shallow: true })) return;
      setInsertAfterIndex(flexChildrenWithIndex.length - 1);
    },
    drop(item, monitor) {
      if (monitor.didDrop()) return;
      if (item.kind === 'element') {
        const { elementId, sourceCellId, sourceCellMode } = item;
        const insertAt = flexChildrenWithIndex.length;
        setTimeout(() => onMoveGridElement?.(elementId, sourceCellId, cell.id, insertAt, undefined, sourceCellMode), 0);
      }
      setInsertAfterIndex(null);
    },
    collect: m => ({ isGridElOver: m.isOver({ shallow: false }) }),
  });

  useEffect(() => {
    if (!isGridElOver) { setInsertAfterIndex(null); setLiveDragPos(null); }
  }, [isGridElOver]);

  // Accept grid layout presets dropped into a cell → create a nested container
  const [{ isLayoutOver }, layoutDropRef] = useDrop<{ columnSpans: number[] }, void, { isLayoutOver: boolean }>({
    accept: LAYOUT_DND_TYPE,
    drop: (item, monitor) => {
      if (monitor.didDrop()) return;
      onAddContainer?.(cell.id, 'grid', item.columnSpans);
    },
    collect: m => ({ isLayoutOver: m.isOver({ shallow: true }) }),
  });

  // ── Drop: carousel palette item → flow a carousel inside this cell ───────
  const [{ isCarouselOver }, carouselDropRef] = useDrop<{ kind: 'carousel' }, void, { isCarouselOver: boolean }>({
    accept: CAROUSEL_DND_TYPE,
    drop: (_item, monitor) => {
      if (monitor.didDrop()) return;
      onAddCarouselToCell?.(cell.id);
    },
    collect: m => ({ isCarouselOver: m.isOver({ shallow: true }) }),
  });

  // ── Drop: accordion palette item → flow an accordion inside this cell ────
  const [{ isAccordionOver }, accordionDropRef] = useDrop<{ kind: 'accordion' }, void, { isAccordionOver: boolean }>({
    accept: ACCORDION_DND_TYPE,
    drop: (_item, monitor) => {
      if (monitor.didDrop()) return;
      onAddAccordionToCell?.(cell.id);
    },
    collect: m => ({ isAccordionOver: m.isOver({ shallow: true }) }),
  });

  const combinedDropRef = useCallback(
    (node: HTMLDivElement | null) => {
      cellDomRef.current = node;
      (paletteDropRef     as (el: HTMLDivElement | null) => void)(node);
      (gridElDropRef      as (el: HTMLDivElement | null) => void)(node);
      (layoutDropRef      as (el: HTMLDivElement | null) => void)(node);
      (carouselDropRef    as (el: HTMLDivElement | null) => void)(node);
      (accordionDropRef   as (el: HTMLDivElement | null) => void)(node);
    },
    [paletteDropRef, gridElDropRef, layoutDropRef, carouselDropRef, accordionDropRef],
  );

  const handleDragHover = useCallback((afterIdx: number) => setInsertAfterIndex(afterIdx), []);

  const handleDropAtChildIdx = useCallback((item: GridElDragItem, afterChildIdx: number) => {
    setInsertAfterIndex(null);
    if (item.kind === 'element') {
      const { elementId, sourceCellId, sourceCellMode } = item;
      const insertAt = afterChildIdx + 1;
      setTimeout(() => onMoveGridElement?.(elementId, sourceCellId, cell.id, insertAt, undefined, sourceCellMode), 0);
    } else if (item.kind === 'container' && item.parentCellId === cell.id) {
      const toIndex = afterChildIdx >= item.fromChildIdx ? afterChildIdx : afterChildIdx + 1;
      onReorderGridCell?.(cell.id, item.fromChildIdx, toIndex);
    }
  }, [cell.id, onMoveGridElement, onReorderGridCell]);

  // ── Overlay element drag ──────────────────────────────────────────────────
  const handleOverlayMouseDown = useCallback((rawEl: El, e: React.MouseEvent<HTMLDivElement>) => {
    if (previewMode) return;
    e.stopPropagation();
    onSelectElement(rawEl.id);
    if (!cellDomRef.current) return;
    const cellRect = cellDomRef.current.getBoundingClientRect();
    const elRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const grabX = e.clientX - elRect.left;
    const grabY = e.clientY - elRect.top;
    onCommit(snapshot);
    const bpNow = breakpoint ?? 'desktop';
    const onMove = (me: MouseEvent) => {
      const nx = Math.max(0, Math.round(me.clientX - cellRect.left - grabX));
      const ny = Math.max(0, Math.round(me.clientY - cellRect.top - grabY));
      if (bpNow === 'desktop') {
        onUpdateElement(rawEl.id, { layout: { ...rawEl.layout, x: nx, y: ny } });
      } else {
        onUpdateResponsive?.(rawEl.id, bpNow, { layout: { x: nx, y: ny } });
      }
      setLiveDragPos({ x: nx, y: ny, width: rawEl.layout.width, height: rawEl.layout.height, cellW: cellRect.width });
    };
    const onUp = () => {
      setLiveDragPos(null);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [previewMode, onSelectElement, onCommit, snapshot, onUpdateElement, breakpoint, onUpdateResponsive]);

  // ── Hidden check ──────────────────────────────────────────────────────────
  const hidden = bp === 'tablet'
    ? (cell.responsive.tablet?.hidden ?? false)
    : bp === 'mobile'
    ? (cell.responsive.mobile?.hidden ?? cell.responsive.tablet?.hidden ?? false)
    : false;

  if (hidden && previewMode) return null;

  // ── Shared style helpers ───────────────────────────────────────────────────
  const cellMode = getCellLayoutMode(cell, bp);
  const { gap, padding, border, minHeight: desktopMinH } = cell.style;

  const bpPadding =
    bp === 'mobile'
      ? { ...padding, ...cell.responsive.tablet?.padding, ...cell.responsive.mobile?.padding }
      : bp === 'tablet'
      ? { ...padding, ...cell.responsive.tablet?.padding }
      : padding;

  const padStr = `${bpPadding.top}px ${bpPadding.right}px ${bpPadding.bottom}px ${bpPadding.left}px`;

  const effectiveMinH = resolveResponsive(bp, desktopMinH, cell.responsive.tablet?.minHeight, cell.responsive.mobile?.minHeight);

  const cellIsEmpty = flexChildren.length === 0 && allElements.length === 0;
  const appliedMinH = effectiveMinH ?? (cellIsEmpty ? 40 : undefined);

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
    padding: padStr,
    backgroundColor: bgColor, backgroundImage: bgImage,
    backgroundSize: 'cover', backgroundPosition: cell.style.background.position || 'center',
    minHeight: appliedMinH,
    height: '100%',
    borderRadius, borderWidth, borderColor, borderStyle,
    position: 'relative', boxSizing: 'border-box',
    opacity: cell.style.opacity !== undefined && cell.style.opacity !== 1 ? cell.style.opacity : undefined,
  };

  // ── Min-height resize drag ────────────────────────────────────────────────
  const handleMinHeightDragMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startY = e.clientY;
    const startH = appliedMinH ?? 0;
    onCommit(snapshot);
    const onMove = (ev: MouseEvent) => {
      const newH = Math.max(0, Math.round(startH + (ev.clientY - startY) / canvasDragShared.zoom));
      if (bp === 'mobile') {
        onUpdateCell({ responsive: { ...cell.responsive, mobile: { ...cell.responsive.mobile, minHeight: newH } } });
      } else if (bp === 'tablet') {
        onUpdateCell({ responsive: { ...cell.responsive, tablet: { ...cell.responsive.tablet, minHeight: newH } } });
      } else {
        onUpdateCell({ style: { ...cell.style, minHeight: newH } });
      }
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [effectiveMinH, bp, cell, onUpdateCell, onCommit, snapshot]);

  // True when a descendant element or container owns selection
  const hasSelectedChild = !previewMode && !isSelected && !!(
    (selectedId && cell.children.includes(selectedId)) ||
    (selectedContainerId && cell.children.includes(selectedContainerId))
  );

  const isRow = cellMode === 'row';

  const insertionLine = (afterIdx: number) =>
    insertAfterIndex === afterIdx ? (
      <div key={`ins-${afterIdx}`} className={['pb-grid-insert-line', isRow && 'pb-grid-insert-line--vertical'].filter(Boolean).join(' ')} />
    ) : null;

  // Void reference to suppress unused-variable warnings for variables only used in callbacks
  void elements;
  void _rowSpan;
  void liveDragPos;

  return (
    <div
      ref={combinedDropRef}
      data-grid-cell-id={cell.id}
      className={[
        'pb-grid-cell',
        isSelected && !previewMode && 'pb-grid-cell--selected',
        hasSelectedChild && 'pb-child-selected',
        (isDragOverTarget || isPaletteOver) && 'pb-grid-cell--drop-over',
        isGridElOver && 'pb-grid-cell--el-over',
        isRow && 'pb-grid-cell--flex-row',
        isLayoutOver && 'pb-grid-cell--layout-hover',
        (isCarouselOver || isAccordionOver) && 'pb-grid-cell--drop-over',
        cellIsEmpty && !previewMode && 'pb-grid-cell--empty',
      ].filter(Boolean).join(' ')}
      style={{
        ...sharedCellStyle,
        display: 'flex',
        flexDirection: cellMode === 'column' ? 'column' : 'row',
        flexWrap: cellMode === 'wrap' ? 'wrap' : 'nowrap',
        gap,
        alignItems: getCellAlignItems(cell, bp),
        justifyContent: getCellJustifyContent(cell, bp),
        overflow: flexChildren.some(c => c.type === 'container' || c.type === 'carousel' || c.type === 'accordion') ? 'visible' : 'hidden',
      }}
      onClick={e => { if (previewMode) return; e.stopPropagation(); onSelectCell(); }}
    >
      {insertionLine(-1)}

      {flexChildrenWithIndex
        .filter(({ item }) => item.type === 'container' || item.type === 'carousel' || item.type === 'accordion' || !(item as El).overlayInCell)
        .map(({ item, childIdx }) => {
          if (item.type === 'accordion') {
            const acc = item as Accordion;
            return (
              <React.Fragment key={acc.id}>
                <AccordionView
                  accordion={acc}
                  nodes={nodes}
                  isSelected={selectedAccordionId === acc.id}
                  selectedId={selectedId}
                  selectedGridCellId={selectedGridCellId}
                  previewMode={previewMode}
                  breakpoint={breakpoint}
                  canvasWidth={canvasWidth}
                  inCell
                  onSelectAccordion={() => onSelectAccordion?.(acc.id)}
                  onUpdateAccordion={onUpdateAccordion}
                  onUpdateAccordionResponsive={onUpdateAccordionResponsive}
                  onToggleAccordionItem={onToggleAccordionItem}
                  onAddAccordionItem={onAddAccordionItem}
                  onSelectGridCell={onSelectGridCell}
                  onSelectElement={id => onSelectElement(id)}
                  onUpdateElement={onUpdateElement}
                  onUpdateGridCell={onUpdateGridCell}
                  onDeleteGridCell={onDeleteGridCell}
                  onAddElementToCell={onAddElementToCell}
                  onCommit={onCommit}
                  snapshot={snapshot}
                  onDuplicateElement={onDuplicateElement}
                  onDeleteElement={onDeleteElement}
                />
                {insertionLine(childIdx)}
              </React.Fragment>
            );
          }
          if (item.type === 'carousel') {
            const car = item as Carousel;
            return (
              <React.Fragment key={car.id}>
                <CarouselView
                  carousel={car}
                  nodes={nodes}
                  isSelected={selectedCarouselId === car.id}
                  selectedId={selectedId}
                  selectedGridCellId={selectedGridCellId}
                  selectedContainerId={selectedContainerId}
                  previewMode={previewMode}
                  breakpoint={breakpoint}
                  canvasWidth={canvasWidth}
                  inCell
                  onSelectCarousel={() => onSelectCarousel?.(car.id)}
                  onUpdateCarousel={onUpdateCarousel}
                  onUpdateCarouselResponsive={onUpdateCarouselResponsive}
                  onSelectGridCell={onSelectGridCell}
                  onSelectElement={id => onSelectElement(id)}
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
                />
                {insertionLine(childIdx)}
              </React.Fragment>
            );
          }
          if (item.type === 'container') {
            const block = item as Container;
            return (
              <React.Fragment key={block.id}>
                <ColumnsBlockView
                  block={block}
                  nodes={nodes}
                  childIdx={childIdx}
                  isSelected={selectedContainerId === block.id}
                  onSelectContainer={onSelectContainer}
                  selectedGridCellId={selectedGridCellId}
                  selectedElementId={selectedId}
                  onSelectGridCell={onSelectGridCell}
                  onSelectElement={onSelectElement}
                  onUpdateGridCell={onUpdateGridCell}
                  onDeleteGridCell={onDeleteGridCell}
                  onAddElementToCell={onAddElementToCell}
                  onCommit={onCommit}
                  snapshot={snapshot}
                  previewMode={previewMode}
                  breakpoint={breakpoint}
                  onRemoveColumnsBlock={onRemoveColumnsBlock ?? (() => {})}
                  onUpdateContainer={onUpdateContainer}
                  onAddSubCell={onAddSubCell}
                  selectedContainerId={selectedContainerId}
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
                  onDragHover={handleDragHover}
                  onDropAtChildIdx={handleDropAtChildIdx}
                />
                {insertionLine(childIdx)}
              </React.Fragment>
            );
          }
          const el = item as El;
          return (
            <React.Fragment key={el.id}>
              <GridElementView
                element={el}
                cellId={cell.id}
                childIdx={childIdx}
                cellMode={cellMode}
                isSelected={selectedId === el.id}
                onSelect={() => onSelectElement(el.id)}
                onUpdate={updates => onUpdateElement(el.id, updates)}
                onDuplicate={onDuplicateElement ? () => onDuplicateElement(el.id) : undefined}
                onDelete={onDeleteElement ? () => onDeleteElement(el.id) : undefined}
                onDragHover={handleDragHover}
                onDropAtChildIdx={handleDropAtChildIdx}
              />
              {insertionLine(childIdx)}
            </React.Fragment>
          );
        })
      }

      {flexChildren.length === 0 && !previewMode && (
        <div className={'pb-grid-cell-empty pb-flex-center pb-grid-cell-empty--overlay'}>
          <span className={'pb-grid-cell-empty-icon'}>+</span>
          <span className={'pb-grid-cell-empty-text'}>{isPaletteOver ? 'Drop here' : 'Drop element'}</span>
        </div>
      )}

      {overlayEls.length > 0 && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 50 }}>
          {overlayEls.map(rawOverlay => {
            const el = applyBreakpoint(rawOverlay, bp);
            const tO = rawOverlay.responsive.tablet?.layout;
            const mO = rawOverlay.responsive.mobile?.layout;
            const hasExplicitX = bp === 'desktop' || (bp === 'tablet' ? tO?.x !== undefined : (mO?.x ?? tO?.x) !== undefined);
            const hasExplicitY = bp === 'desktop' || (bp === 'tablet' ? tO?.y !== undefined : (mO?.y ?? tO?.y) !== undefined);
            const overlayX = hasExplicitX ? el.layout.x : 0;
            const overlayY = hasExplicitY ? el.layout.y : 0;
            return (
            <div
              key={rawOverlay.id}
              className={['pb-grid-overlay-el', selectedId === rawOverlay.id && !previewMode && 'pb-grid-overlay-el--selected'].filter(Boolean).join(' ')}
              style={{
                position: 'absolute',
                left: overlayX,
                top: overlayY,
                width: el.layout.width,
                // Text/button grow with their content instead of a hard-clipped height,
                // matching the same exemption in the non-overlay flex branch and in export.
                ...(el.type === 'text' || el.type === 'button'
                  ? { minHeight: el.layout.height }
                  : { height: el.layout.height }),
                zIndex: el.layout.zIndex ?? 1,
                opacity: el.style.opacity,
                cursor: previewMode ? 'default' : 'move',
                boxSizing: 'border-box',
                pointerEvents: 'all',
              }}
              onMouseDown={e => handleOverlayMouseDown(rawOverlay, e)}
              onClick={e => { e.stopPropagation(); if (!previewMode) onSelectElement(rawOverlay.id); }}
              onDragStart={e => e.preventDefault()}
            >
              <GridElementView
                element={rawOverlay}
                cellId={cell.id}
                childIdx={0}
                cellMode={cellMode}
                isSelected={false}
                onSelect={() => onSelectElement(rawOverlay.id)}
                onUpdate={updates => onUpdateElement(rawOverlay.id, updates)}
                disableDrag={true}
                onDuplicate={onDuplicateElement ? () => onDuplicateElement(rawOverlay.id) : undefined}
                onDelete={onDeleteElement ? () => onDeleteElement(rawOverlay.id) : undefined}
                onDragHover={() => {}}
                onDropAtChildIdx={() => {}}
              />
            </div>
          );
          })}
        </div>
      )}

      {!previewMode && !flexChildren.some(c => c.type === 'container') && (
        <div className={'pb-grid-cell-height-resize-handle'} onMouseDown={handleMinHeightDragMouseDown} title="Drag to set minimum height" />
      )}
    </div>
  );
}

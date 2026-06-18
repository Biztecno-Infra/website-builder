import type {
  Accordion, AccordionBpOverride, Breakpoint, CanvasElement, BuilderState, Carousel, Container, Section, SectionUpdate, GridCell,
  BreakpointOverride, NodeMap, Page, SiteTheme,
} from '../types';
import { IconButton } from './IconButton';
import { GridCellPanel } from './panels/GridCellPanel';
import { SectionPanel } from './panels/SectionPanel';
import { ElementPanel } from './panels/ElementPanel';
import { ContainerPanel } from './panels/ContainerPanel';
import { CarouselPanel } from './panels/CarouselPanel';
import { AccordionPanel } from './panels/AccordionPanel';

interface Props {
  element: CanvasElement | null;
  section: Section | null;
  gridCell?: GridCell | null;
  isInGridCell?: boolean;
  nodes: NodeMap;
  snapshot: BuilderState;
  onUpdate: (id: string, updates: Partial<CanvasElement>) => void;
  onUpdateSection: (id: string, updates: SectionUpdate) => void;
  onUpdateGridCell?: (id: string, updates: Partial<GridCell>) => void;
  onDeleteGridCell?: (id: string) => void;
  onAddGridCell?: (sectionId: string) => void;
  onPushSnapshot: (snapshot: BuilderState) => void;
  onDelete: (id: string) => void;
  container?: Container | null;
  onUpdateContainer?: (id: string, updates: Partial<Pick<Container, 'layoutMode' | 'gap' | 'rowGap'>>) => void;
  carousel?: Carousel | null;
  onUpdateCarousel?: (id: string, updates: Partial<Omit<Carousel, 'id' | 'type' | 'parent' | 'children'>>) => void;
  onUpdateCarouselResponsive?: (id: string, bp: Breakpoint, updates: { height?: number; minHeight?: number; hidden?: boolean }) => void;
  onAddSlide?: (carouselId: string, afterSlideId?: string) => void;
  onDeleteSlide?: (slideId: string) => void;
  onDuplicateSlide?: (slideId: string) => void;
  onReorderSlide?: (carouselId: string, fromIndex: number, toIndex: number) => void;
  onSetActiveSlide?: (carouselId: string, index: number) => void;
  onSelectSlide?: (slideId: string) => void;
  selectedSlideId?: string | null;
  // Accordion
  accordion?: Accordion | null;
  onUpdateAccordion?: (id: string, updates: Partial<Omit<Accordion, 'id' | 'type' | 'parent' | 'children' | 'items'>>) => void;
  onUpdateAccordionResponsive?: (id: string, bp: Breakpoint, updates: AccordionBpOverride) => void;
  onAddAccordionItem?: (accordionId: string, afterItemId?: string) => void;
  onDeleteAccordionItem?: (accordionId: string, itemId: string) => void;
  onDuplicateAccordionItem?: (accordionId: string, itemId: string) => void;
  onReorderAccordionItem?: (accordionId: string, fromIndex: number, toIndex: number) => void;
  onToggleAccordionItem?: (accordionId: string, itemId: string) => void;
  onSelectAccordionItemCell?: (cellId: string) => void;
  breakpoint?: Breakpoint;
  onUpdateResponsive?: (id: string, bp: Breakpoint, updates: Partial<BreakpointOverride>) => void;
  theme: SiteTheme;
  pages: Page[];
  isOpen: boolean;
  onClose: () => void;
}

export function RightSidebar({
  element, section, gridCell = null, isInGridCell = false,
  nodes, snapshot,
  onUpdate, onUpdateSection, onUpdateGridCell, onDeleteGridCell,
  onAddGridCell,
  onPushSnapshot, onDelete,
  container, onUpdateContainer,
  carousel, onUpdateCarousel, onUpdateCarouselResponsive,
  onAddSlide, onDeleteSlide, onDuplicateSlide, onReorderSlide, onSetActiveSlide, onSelectSlide, selectedSlideId,
  accordion, onUpdateAccordion, onUpdateAccordionResponsive,
  onAddAccordionItem, onDeleteAccordionItem, onDuplicateAccordionItem, onReorderAccordionItem, onToggleAccordionItem, onSelectAccordionItemCell,
  breakpoint = 'desktop', onUpdateResponsive,
  theme, pages,
  isOpen, onClose,
}: Props) {
  const showAccordionPanel = !!(!element && accordion && onUpdateAccordion && onUpdateAccordionResponsive
    && onAddAccordionItem && onDeleteAccordionItem && onDuplicateAccordionItem && onReorderAccordionItem && onToggleAccordionItem && onSelectAccordionItemCell);
  const showCarouselPanel = !!(!element && !accordion && carousel && onUpdateCarousel && onUpdateCarouselResponsive
    && onAddSlide && onDeleteSlide && onDuplicateSlide && onReorderSlide && onSetActiveSlide && onSelectSlide);
  const hasSelection = !!(element || showAccordionPanel || showCarouselPanel || (container && onUpdateContainer) || (gridCell && onUpdateGridCell) || section);

  return (
    <aside className={['pb-right-sidebar pb-flex-col', !isOpen && 'pb-right-sidebar--hidden'].filter(Boolean).join(' ')}>
      {!hasSelection && (
        <div className="pb-right-sidebar-idle pb-flex-col">
          <IconButton variant="close" size="sm" onClick={onClose} title="Close panel" className="pb-sidebar-close-btn">✕</IconButton>
          <div className="pb-right-sidebar-idle-body pb-flex-col-center">
            <div className="pb-right-sidebar-idle-icon">↖</div>
            <p className="pb-right-sidebar-idle-text">Select an element, section, or layer to edit its properties</p>
          </div>
        </div>
      )}
      {hasSelection && (
        <>
          <IconButton variant="close" size="sm" onClick={onClose} title="Close panel" className="pb-sidebar-close-btn">✕</IconButton>
          {showAccordionPanel && accordion && (
            <AccordionPanel
              accordion={accordion}
              nodes={nodes}
              snapshot={snapshot}
              breakpoint={breakpoint}
              selectedItemCellId={selectedSlideId}
              onUpdateAccordion={onUpdateAccordion!}
              onUpdateAccordionResponsive={onUpdateAccordionResponsive!}
              onAddItem={onAddAccordionItem!}
              onDeleteItem={onDeleteAccordionItem!}
              onDuplicateItem={onDuplicateAccordionItem!}
              onReorderItem={onReorderAccordionItem!}
              onToggleItem={onToggleAccordionItem!}
              onSelectItemCell={onSelectAccordionItemCell!}
              onPushSnapshot={onPushSnapshot}
            />
          )}
          {showCarouselPanel && carousel && (
            <CarouselPanel
              carousel={carousel}
              nodes={nodes}
              snapshot={snapshot}
              breakpoint={breakpoint}
              selectedSlideId={selectedSlideId}
              onUpdateCarousel={onUpdateCarousel!}
              onUpdateCarouselResponsive={onUpdateCarouselResponsive!}
              onAddSlide={onAddSlide!}
              onDeleteSlide={onDeleteSlide!}
              onDuplicateSlide={onDuplicateSlide!}
              onReorderSlide={onReorderSlide!}
              onSetActiveSlide={onSetActiveSlide!}
              onSelectSlide={onSelectSlide!}
              onPushSnapshot={onPushSnapshot}
            />
          )}
          {!element && !accordion && !carousel && container && onUpdateContainer && (
            <ContainerPanel
              container={container}
              snapshot={snapshot}
              onUpdateContainer={onUpdateContainer}
              onPushSnapshot={onPushSnapshot}
              breakpoint={breakpoint}
            />
          )}
          {!element && !accordion && !carousel && !container && gridCell && onUpdateGridCell && (
            <GridCellPanel
              gridCell={gridCell}
              nodes={nodes}
              snapshot={snapshot}
              onUpdateGridCell={onUpdateGridCell}
              onDeleteGridCell={onDeleteGridCell}
              onPushSnapshot={onPushSnapshot}
              breakpoint={breakpoint}
              theme={theme}
            />
          )}
          {!element && !accordion && !carousel && !container && !gridCell && section && (
            <SectionPanel
              section={section}
              nodes={nodes}
              snapshot={snapshot}
              onUpdateSection={onUpdateSection}
              onAddGridCell={onAddGridCell}
              onUpdateGridCell={onUpdateGridCell}
              onPushSnapshot={onPushSnapshot}
              breakpoint={breakpoint}
              theme={theme}
            />
          )}
          {element && (
            <ElementPanel
              element={element}
              isInGridCell={isInGridCell}
              nodes={nodes}
              snapshot={snapshot}
              onUpdate={onUpdate}
              onPushSnapshot={onPushSnapshot}
              onDelete={onDelete}
              breakpoint={breakpoint}
              onUpdateResponsive={onUpdateResponsive}
              theme={theme}
              pages={pages}
            />
          )}
        </>
      )}
    </aside>
  );
}

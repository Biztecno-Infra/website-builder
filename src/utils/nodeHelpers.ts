import type {
  Accordion, AccordionItem, AccordionProps, AnyNode, CanvasElement, Carousel, CarouselProps,
  Container, FreeSection, GridCell, GridSection, NodeMap, Section, SectionRole, SectionUpdate, SiteTheme,
} from '../types';
import {
  DEFAULT_ACCORDION_ICON_SVG, DEFAULT_ACCORDION_PROPS, DEFAULT_ACCORDION_WIDTH,
  DEFAULT_BG, DEFAULT_CAROUSEL_HEIGHT, DEFAULT_CAROUSEL_PROPS, DEFAULT_CAROUSEL_WIDTH,
  DEFAULT_FLEX_LAYOUT, DEFAULT_GRID_CELL_STYLE, DEFAULT_SECTION_BG, DEFAULT_THEME,
} from './builderDefaults';
import { newId, newGridCellId, newCarouselId, newAccordionId, newAccordionItemId } from './ids';
import { CANVAS_W, createDefaultElement } from './elementDefaults';

export function isContainer(node: AnyNode): node is Container {
  return node.type === 'container';
}

export function isCarousel(node: AnyNode): node is Carousel {
  return node.type === 'carousel';
}

export function isAccordion(node: AnyNode): node is Accordion {
  return node.type === 'accordion';
}

// True if the node lives inside a Carousel (its parent chain reaches a carousel
// before reaching a Section). Used to keep carousel slide content from being
// dragged out of the carousel and detached.
export function isInsideCarousel(nodes: NodeMap, node: AnyNode | undefined): boolean {
  let cur = node;
  while (cur && 'parent' in cur) {
    const parent = nodes[(cur as { parent: string }).parent];
    if (!parent) return false;
    if (isCarousel(parent)) return true;
    if (isSection(parent)) return false;
    cur = parent;
  }
  return false;
}

export function isSection(node: AnyNode): node is Section {
  return (node as Section).type === 'section';
}

export function isGridCell(node: AnyNode): node is GridCell {
  return (node as GridCell).type === 'grid-cell';
}

export function isGridSection(node: AnyNode): node is GridSection {
  return isSection(node) && (node as Section).layoutMode === 'grid';
}

export function isFreeSection(node: AnyNode): node is FreeSection {
  return isSection(node) && (node as Section).layoutMode === 'free';
}

export function makeSection(id: string, role: SectionRole, partial?: SectionUpdate, bgColor?: string): Section {
  return {
    id, type: 'section', role,
    label: role === 'header' ? 'Header' : role === 'footer' ? 'Footer' : 'Section',
    layout: { height: role === 'header' ? 80 : role === 'footer' ? 100 : 400 },
    style: {
      background: { ...DEFAULT_SECTION_BG, color: bgColor ?? (role === 'footer' ? '#f5f5f5' : '#ffffff') },
      columns: { count: 1, widths: [], styles: {} },
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
    },
    children: [],
    layoutMode: 'free',
    ...partial,
  } as Section;
}

export function makeGridCell(id: string, parentId: string, columnSpan = 4): GridCell {
  return {
    id, type: 'grid-cell', parent: parentId,
    columnSpan,
    rowSpan: 1,
    style: {
      ...DEFAULT_GRID_CELL_STYLE,
      padding: { ...DEFAULT_GRID_CELL_STYLE.padding },
      background: { ...DEFAULT_BG, overlay: 0 },
      border: { ...DEFAULT_GRID_CELL_STYLE.border! },
    },
    children: [],
    responsive: { mobile: { columnSpan: 12 } },
  };
}

// Recursively delete a grid cell and all its descendants (elements, sub-cells,
// nested containers, carousels, or accordions).
export function removeGridCellNodes(nodes: NodeMap, cell: GridCell): void {
  for (const childId of cell.children) {
    const child = nodes[childId];
    if (child?.type === 'container') {
      const block = child as Container;
      for (const subId of block.children) {
        const sub = nodes[subId] as GridCell | undefined;
        if (sub) { removeGridCellNodes(nodes, sub); delete nodes[subId]; }
      }
    } else if (child?.type === 'carousel') {
      removeCarouselNodes(nodes, child as Carousel);
    } else if (child?.type === 'accordion') {
      removeAccordionNodes(nodes, child as Accordion);
    }
    delete nodes[childId];
  }
}


export function removeNodesForSection(nodes: NodeMap, sec: Section): void {
  if (sec.layoutMode === 'grid' || sec.layoutMode === 'flex') {
    for (const cellId of sec.children) {
      const cell = nodes[cellId] as GridCell | undefined;
      if (cell) { removeGridCellNodes(nodes, cell); delete nodes[cellId]; }
    }
  } else {
    for (const childId of sec.children) {
      const child = nodes[childId];
      if (child?.type === 'carousel') removeCarouselNodes(nodes, child as Carousel);
      else if (child?.type === 'accordion') removeAccordionNodes(nodes, child as Accordion);
      delete nodes[childId];
    }
  }
}

export function removeFromParent(nodes: NodeMap, parentId: string, childId: string): void {
  const parent = nodes[parentId];
  if (!parent) return;
  if (isSection(parent) || isGridCell(parent) || isContainer(parent) || isCarousel(parent)) {
    const p = parent as { children: string[] };
    nodes[parentId] = { ...parent, children: p.children.filter(c => c !== childId) } as AnyNode;
  }
}

export function appendToParent(nodes: NodeMap, parentId: string, childId: string): void {
  const parent = nodes[parentId];
  if (!parent) return;
  if (isSection(parent) || isGridCell(parent) || isContainer(parent) || isCarousel(parent)) {
    const p = parent as { children: string[] };
    nodes[parentId] = { ...parent, children: [...p.children, childId] } as AnyNode;
  }
}

export function equalWidths(n: number): number[] {
  if (n <= 1) return [];
  const w = Math.floor(100 / n);
  const widths = new Array<number>(n).fill(w);
  widths[n - 1] = 100 - w * (n - 1);
  return widths;
}

// ── Carousel factories ─────────────────────────────────────────────────

// A slide is a GridCell parented to a Carousel. It fills the carousel's full
// width (span 12) and stretches to the configured height. Reusing GridCell
// means slides inherit drop / style / responsive / copy-paste behaviour for free.
export function makeSlide(id: string, carouselId: string): GridCell {
  return {
    id, type: 'grid-cell', parent: carouselId,
    columnSpan: 12,
    rowSpan: 1,
    style: {
      ...DEFAULT_GRID_CELL_STYLE,
      layoutMode: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: { top: 24, right: 24, bottom: 24, left: 24 },
      background: { ...DEFAULT_BG, overlay: 0 },
      border: { radius: 0, width: 0, color: '#cccccc', style: 'none' },
    },
    children: [],
    responsive: {},
  };
}

// A placeholder image element used to populate fresh slides so the carousel is
// immediately visible. `n` is the 1-based slide number, used only in the label text.
export function makeSlidePlaceholderImage(slideId: string, n: number, theme?: SiteTheme): CanvasElement {
  const el = createDefaultElement('image', 0, slideId, undefined, undefined, theme);
  return {
    ...el,
    layout: { ...el.layout, width: 480, height: 280 },
    flexLayout: { ...DEFAULT_FLEX_LAYOUT, widthMode: 'fill' },
    content: { ...el.content, src: `https://placehold.co/960x540/e2e8f0/64748b?text=Slide+${n}`, alt: `Slide ${n}` },
  };
}

export function makeCarousel(id: string, sectionId: string, dropX?: number, dropY?: number, props?: Partial<CarouselProps>): Carousel {
  const x = dropX ?? Math.round(CANVAS_W / 2 - DEFAULT_CAROUSEL_WIDTH / 2);
  const y = dropY ?? 120;
  return {
    id, type: 'carousel', parent: sectionId,
    children: [],
    props: { ...DEFAULT_CAROUSEL_PROPS, ...props },
    layout: { x, y, width: DEFAULT_CAROUSEL_WIDTH, height: DEFAULT_CAROUSEL_HEIGHT, zIndex: 0 },
    responsive: {},
    activeSlide: 0,
  };
}

// Recursively delete a carousel and all of its slide cells (and their contents).
export function removeCarouselNodes(nodes: NodeMap, carousel: Carousel): void {
  for (const slideId of carousel.children) {
    const slide = nodes[slideId] as GridCell | undefined;
    if (slide) { removeGridCellNodes(nodes, slide); delete nodes[slideId]; }
  }
}

// ── Accordion factories ────────────────────────────────────────────────
// Each item is built from real nodes so it reuses all existing behaviour:
//   • title  → a 'text' CanvasElement (full typography editing + inline edit)
//   • icon   → an 'icon' CanvasElement (icon picker, size/color)
//   • content→ a GridCell (the entire droppable container pipeline)
// All three are parented to the Accordion id and live in the flat NodeMap.

// The content panel for an item: a GridCell in column layout, full width,
// behaving exactly like a Section/Container droppable area.
export function makeAccordionContentCell(id: string, accordionId: string): GridCell {
  return {
    id, type: 'grid-cell', parent: accordionId,
    columnSpan: 12,
    rowSpan: 1,
    style: {
      ...DEFAULT_GRID_CELL_STYLE,
      layoutMode: 'column',
      alignItems: 'stretch',
      justifyContent: 'flex-start',
      padding: { top: 16, right: 16, bottom: 16, left: 16 },
      background: { ...DEFAULT_BG, overlay: 0 },
      border: { radius: 0, width: 0, color: '#cccccc', style: 'none' },
      minHeight: 60,
    },
    children: [],
    responsive: {},
  };
}

// Build one accordion item plus its three backing nodes, mutating `nodes`.
// `n` is the 1-based item number used for the default heading text.
export function makeAccordionItem(accordionId: string, n: number, nodes: NodeMap, theme?: SiteTheme): AccordionItem {
  const titleId = newId();
  const iconId = newId();
  const cellId = newGridCellId();

  const tc = theme?.colors ?? DEFAULT_THEME.colors;

  // Title — a text element flowing to fill the header's free space.
  const titleBase = createDefaultElement('text', 0, accordionId, undefined, undefined, theme);
  nodes[titleId] = {
    ...titleBase, id: titleId, parent: accordionId,
    flexLayout: { ...DEFAULT_FLEX_LAYOUT, widthMode: 'fill' },
    style: { ...titleBase.style, typography: { ...titleBase.style.typography, size: 16, weight: '600', color: tc.text } },
    content: { ...titleBase.content, plain: 'Heading' },
  };

  // Icon — the chevron, fixed-size, theme-colored, with the default chevron SVG.
  const iconBase = createDefaultElement('icon', 0, accordionId, undefined, undefined, theme);
  nodes[iconId] = {
    ...iconBase, id: iconId, parent: accordionId,
    layout: { ...iconBase.layout, width: 20, height: 20 },
    flexLayout: { ...DEFAULT_FLEX_LAYOUT, widthMode: 'fixed', widthValue: 20 },
    style: { ...iconBase.style, typography: { ...iconBase.style.typography, color: tc.text } },
    content: { ...iconBase.content, iconSvg: DEFAULT_ACCORDION_ICON_SVG, iconSize: 20 },
  };

  // Content panel.
  nodes[cellId] = makeAccordionContentCell(cellId, accordionId);

  void n;
  return { id: newAccordionItemId(), titleElId: titleId, iconElId: iconId, contentCellId: cellId };
}

export function makeAccordion(id: string, parentId: string, dropX?: number, dropY?: number, props?: Partial<AccordionProps>): Accordion {
  const x = dropX ?? Math.round(CANVAS_W / 2 - DEFAULT_ACCORDION_WIDTH / 2);
  const y = dropY ?? 120;
  return {
    id, type: 'accordion', parent: parentId,
    children: [],
    items: [],
    props: { ...DEFAULT_ACCORDION_PROPS, ...props },
    layout: { x, y, width: DEFAULT_ACCORDION_WIDTH, zIndex: 0 },
    responsive: {},
    activeItems: [],
  };
}

// Recursively delete an accordion: every item's title/icon elements and its
// content cell (with all nested descendants).
export function removeAccordionNodes(nodes: NodeMap, accordion: Accordion): void {
  for (const item of accordion.items) {
    delete nodes[item.titleElId];
    delete nodes[item.iconElId];
    const cell = nodes[item.contentCellId] as GridCell | undefined;
    if (cell) { removeGridCellNodes(nodes, cell); delete nodes[item.contentCellId]; }
  }
}

// Deep-clone an accordion (header elements + content cells) into `nodes`,
// returning the new accordion id. `cloneCell` clones a content GridCell and all
// its descendants under a new parent (each call site supplies its own cloner so
// the id-prefix scheme stays consistent).
export function cloneAccordionInto(
  nodes: NodeMap,
  accordion: Accordion,
  newParentId: string,
  cloneCell: (cellId: string, newParentId: string) => string,
): string {
  const newAccId = newAccordionId();
  const newItems: AccordionItem[] = accordion.items.map(item => {
    const newTitleId = newId();
    const newIconId = newId();
    const title = nodes[item.titleElId] as CanvasElement | undefined;
    const icon = nodes[item.iconElId] as CanvasElement | undefined;
    if (title) nodes[newTitleId] = { ...title, id: newTitleId, parent: newAccId };
    if (icon) nodes[newIconId] = { ...icon, id: newIconId, parent: newAccId };
    const newCellId = cloneCell(item.contentCellId, newAccId);
    return { id: newAccordionItemId(), titleElId: newTitleId, iconElId: newIconId, contentCellId: newCellId };
  });
  nodes[newAccId] = { ...accordion, id: newAccId, parent: newParentId, items: newItems, children: [] };
  return newAccId;
}

// Carousel id generator re-exported for callers building carousels.
export { newCarouselId, newAccordionId, newAccordionItemId };

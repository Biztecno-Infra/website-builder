import type { Accordion, CanvasElement, Carousel, Container, GridCell, NodeMap, Section } from '../types';

/** Synthetic id for the virtual "Page" root row, which isn't a real node. */
export const PAGE_ROOT_ID = '__page__';

const TYPE_FRIENDLY_NAME: Record<string, string> = {
  text: 'Text', image: 'Image', button: 'Button', box: 'Box',
  divider: 'Divider', video: 'Video', spacer: 'Spacer', icon: 'Icon', form: 'Form',
};

export function elementLabel(el: CanvasElement): string {
  switch (el.type) {
    case 'text':    return el.content.plain?.slice(0, 24) || 'Text';
    case 'button':  return el.content.label || 'Button';
    case 'image':   return el.content.alt || 'Image';
    case 'video':   return 'Video';
    case 'divider': return 'Divider';
    case 'spacer':  return 'Spacer';
    case 'icon':    return el.content.iconName ? `Icon ${el.content.iconName}` : 'Icon';
    default:        return 'Box';
  }
}

export interface SearchMatches {
  /** Ids of nodes whose own label/type/name matches the query — rows to highlight. Iteration order == visual top-to-bottom order. */
  matchedIds: Set<string>;
  /** Ids of nodes that must be displayed expanded to reveal a match somewhere below them (includes PAGE_ROOT_ID). */
  ancestorIds: Set<string>;
  /** For each matched id, its chain of ancestor ids (root-first, nearest parent last) — lets a caller reveal just the branch leading to one specific match. */
  matchPath: Map<string, string[]>;
}

interface WalkCtx {
  nodes: NodeMap;
  q: string;
  matchedIds: Set<string>;
  ancestorIds: Set<string>;
  matchPath: Map<string, string[]>;
}

function textMatches(candidates: string[], q: string): boolean {
  return candidates.some(c => c.toLowerCase().includes(q));
}

function recordMatch(ctx: WalkCtx, id: string, path: string[]): void {
  ctx.matchedIds.add(id);
  ctx.matchPath.set(id, [...path]);
}

function visitElement(el: CanvasElement, ctx: WalkCtx, path: string[]): boolean {
  const isMatch = textMatches([elementLabel(el), TYPE_FRIENDLY_NAME[el.type] ?? el.type], ctx.q);
  if (isMatch) recordMatch(ctx, el.id, path);
  return isMatch;
}

// ── Grid-layout subtree (cells always labeled "Col N", used for top-level
// section cells, container sub-cells, and carousel/accordion content when
// nested inside a grid section — mirrors LayerPanel's renderCellLayerRow). ──

function visitGridCell(cell: GridCell, index: number, ctx: WalkCtx, path: string[]): boolean {
  const selfMatch = textMatches([`Col ${index + 1}`], ctx.q);
  if (selfMatch) recordMatch(ctx, cell.id, path);
  const childPath = [...path, cell.id];
  const childMatch = cell.children
    .map(id => ctx.nodes[id])
    .filter((n): n is NodeMap[string] => !!n)
    .map(child => visitGridChild(child, ctx, childPath))
    .some(Boolean);
  if (selfMatch || childMatch) ctx.ancestorIds.add(cell.id);
  return selfMatch || childMatch;
}

function visitGridChild(node: NodeMap[string], ctx: WalkCtx, path: string[]): boolean {
  switch (node.type) {
    case 'container': return visitContainer(node as Container, ctx, path);
    case 'carousel':  return visitCarouselInGrid(node as Carousel, ctx, path);
    case 'accordion': return visitAccordionInGrid(node as Accordion, ctx, path);
    default:          return visitElement(node as CanvasElement, ctx, path);
  }
}

function visitContainer(block: Container, ctx: WalkCtx, path: string[]): boolean {
  const selfMatch = textMatches(['Container'], ctx.q);
  if (selfMatch) recordMatch(ctx, block.id, path);
  const childPath = [...path, block.id];
  const subCells = block.children.map(id => ctx.nodes[id] as GridCell | undefined).filter((c): c is GridCell => !!c);
  const childMatch = subCells.map((c, i) => visitGridCell(c, i, ctx, childPath)).some(Boolean);
  if (selfMatch || childMatch) ctx.ancestorIds.add(block.id);
  return selfMatch || childMatch;
}

function visitCarouselInGrid(carousel: Carousel, ctx: WalkCtx, path: string[]): boolean {
  const selfMatch = textMatches(['Carousel'], ctx.q);
  if (selfMatch) recordMatch(ctx, carousel.id, path);
  const childPath = [...path, carousel.id];
  const slides = carousel.children.map(id => ctx.nodes[id] as GridCell | undefined).filter((c): c is GridCell => !!c);
  const childMatch = slides.map((s, i) => visitGridCell(s, i, ctx, childPath)).some(Boolean);
  if (selfMatch || childMatch) ctx.ancestorIds.add(carousel.id);
  return selfMatch || childMatch;
}

function visitAccordionInGrid(acc: Accordion, ctx: WalkCtx, path: string[]): boolean {
  const selfMatch = textMatches(['Accordion'], ctx.q);
  if (selfMatch) recordMatch(ctx, acc.id, path);
  const childPath = [...path, acc.id];
  const childMatch = acc.items
    .map((it, i) => {
      const cell = ctx.nodes[it.contentCellId] as GridCell | undefined;
      return cell ? visitGridCell(cell, i, ctx, childPath) : false;
    })
    .some(Boolean);
  if (selfMatch || childMatch) ctx.ancestorIds.add(acc.id);
  return selfMatch || childMatch;
}

// ── Free-layout subtree (carousel/accordion content cells are labeled
// "Content" with no index, mirroring LayerPanel's renderCellContents). ──

function visitFreeCellContents(cell: GridCell, ctx: WalkCtx, path: string[]): boolean {
  const selfMatch = textMatches(['Content'], ctx.q);
  if (selfMatch) recordMatch(ctx, cell.id, path);
  const childPath = [...path, cell.id];
  const els = cell.children.map(id => ctx.nodes[id]).filter((n): n is CanvasElement => !!n && n.type !== 'container');
  const childMatch = els.map(el => visitElement(el, ctx, childPath)).some(Boolean);
  if (selfMatch || childMatch) ctx.ancestorIds.add(cell.id);
  return selfMatch || childMatch;
}

function visitCarouselFree(carousel: Carousel, ctx: WalkCtx, path: string[]): boolean {
  const selfMatch = textMatches(['Carousel'], ctx.q);
  if (selfMatch) recordMatch(ctx, carousel.id, path);
  const childPath = [...path, carousel.id];
  const slides = carousel.children.map(id => ctx.nodes[id] as GridCell | undefined).filter((c): c is GridCell => !!c);
  const childMatch = slides.map(s => visitFreeCellContents(s, ctx, childPath)).some(Boolean);
  if (selfMatch || childMatch) ctx.ancestorIds.add(carousel.id);
  return selfMatch || childMatch;
}

function visitAccordionFree(acc: Accordion, ctx: WalkCtx, path: string[]): boolean {
  const selfMatch = textMatches(['Accordion'], ctx.q);
  if (selfMatch) recordMatch(ctx, acc.id, path);
  const childPath = [...path, acc.id];
  const childMatch = acc.items
    .map(it => {
      const cell = ctx.nodes[it.contentCellId] as GridCell | undefined;
      return cell ? visitFreeCellContents(cell, ctx, childPath) : false;
    })
    .some(Boolean);
  if (selfMatch || childMatch) ctx.ancestorIds.add(acc.id);
  return selfMatch || childMatch;
}

function visitSection(section: Section, role: 'header' | 'section' | 'footer', ctx: WalkCtx, path: string[]): boolean {
  const name = role === 'header' ? 'Header' : role === 'footer' ? 'Footer' : section.label;
  const selfMatch = textMatches([name], ctx.q);
  if (selfMatch) recordMatch(ctx, section.id, path);
  const childPath = [...path, section.id];

  let childMatch: boolean;
  if (section.layoutMode === 'grid') {
    const cells = section.children.map(id => ctx.nodes[id] as GridCell | undefined).filter((c): c is GridCell => !!c);
    childMatch = cells.map((c, i) => visitGridCell(c, i, ctx, childPath)).some(Boolean);
  } else {
    // Mirrors LayerPanel's free-layout render order exactly: elements are
    // drawn in REVERSED child order, then all carousels, then all accordions
    // — so match order (used for next/prev numbering) must follow the same
    // three passes rather than raw `section.children` order.
    const reversedIds = section.children.slice().reverse();
    const elementResults = reversedIds.map(id => {
      const node = ctx.nodes[id];
      if (!node || node.type === 'carousel' || node.type === 'accordion') return false;
      return visitElement(node as CanvasElement, ctx, childPath);
    });
    const carouselResults = section.children
      .map(id => ctx.nodes[id])
      .filter((n): n is Carousel => !!n && n.type === 'carousel')
      .map(c => visitCarouselFree(c, ctx, childPath));
    const accordionResults = section.children
      .map(id => ctx.nodes[id])
      .filter((n): n is Accordion => !!n && n.type === 'accordion')
      .map(acc => visitAccordionFree(acc, ctx, childPath));
    childMatch = [...elementResults, ...carouselResults, ...accordionResults].some(Boolean);
  }

  if (selfMatch || childMatch) ctx.ancestorIds.add(section.id);
  return selfMatch || childMatch;
}

/** Walks the full layer tree once, in visual top-to-bottom order, and reports which nodes match `query`, which need to be expanded to reveal a match, and each match's ancestor chain. Empty query short-circuits to empty results. */
export function collectSearchMatches(query: string, header: Section, sections: Section[], footer: Section | undefined, nodes: NodeMap): SearchMatches {
  const ctx: WalkCtx = {
    nodes,
    q: query.trim().toLowerCase(),
    matchedIds: new Set<string>(),
    ancestorIds: new Set<string>(),
    matchPath: new Map<string, string[]>(),
  };
  if (!ctx.q) return { matchedIds: ctx.matchedIds, ancestorIds: ctx.ancestorIds, matchPath: ctx.matchPath };

  visitSection(header, 'header', ctx, []);
  sections.forEach(sec => visitSection(sec, 'section', ctx, []));
  if (footer) visitSection(footer, 'footer', ctx, []);

  if (ctx.matchedIds.size > 0) ctx.ancestorIds.add(PAGE_ROOT_ID);
  return { matchedIds: ctx.matchedIds, ancestorIds: ctx.ancestorIds, matchPath: ctx.matchPath };
}

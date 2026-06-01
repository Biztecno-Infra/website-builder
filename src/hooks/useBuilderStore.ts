import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { makeDemoState } from '../data/demoState';
import type { TemplateIds, TemplateResult } from '../data/sectionTemplates';
import type {
  AnyNode, Breakpoint, BreakpointOverride, BuilderState, CanvasElement, CellLayoutMode,
  ColumnStyle, Container, ContainerLayoutMode, ElementLayout, ElementType, FreeSection, GridCell,
  GridSection, NodeMap, Page, Section, SectionRole,
  SectionUpdate, SiteTheme, TextAlign, TextTransform,
} from '../types';
import { useUndoRedo } from './useUndoRedo';
import { hydrateNodes, sparsifyNodes } from '../utils/sparse';
import {
  DEFAULT_BG, DEFAULT_SECTION_BG, DEFAULT_STYLE, DEFAULT_CONTENT,
  DEFAULT_INTERACTION, DEFAULT_ANIMATION, DEFAULT_THEME, DEFAULT_FLEX_LAYOUT, DEFAULT_GRID_CELL_STYLE,
} from '../utils/builderDefaults';

export {
  DEFAULT_BG, DEFAULT_SECTION_BG, DEFAULT_STYLE, DEFAULT_CONTENT,
  DEFAULT_INTERACTION, DEFAULT_ANIMATION, DEFAULT_THEME, DEFAULT_FLEX_LAYOUT, DEFAULT_GRID_CELL_STYLE,
} from '../utils/builderDefaults';

const STORAGE_KEY = 'microsite-builder-v5';
const LEGACY_KEYS = ['page-builder-v3', 'page-builder-v2', 'page-builder-v1'];
export const CANVAS_W = 1280;
export const SCHEMA_VERSION = '2.0';

let _idCounter = 0;
const newId = () => `el_${Date.now()}_${_idCounter++}`;
const newSectionId = () => `sec_${Date.now()}_${_idCounter++}`;
const newPageId = () => `page_${Date.now()}_${_idCounter++}`;
const newGridCellId = () => `gc_${Date.now()}_${_idCounter++}`;
const newColumnsId  = () => `cb_${Date.now()}_${_idCounter++}`;

// ── Type guards ────────────────────────────────────────────────────────

function isContainer(node: AnyNode): node is Container {
  return node.type === 'container';
}

function isSection(node: AnyNode): node is Section {
  return (node as Section).type === 'section';
}

function isGridCell(node: AnyNode): node is GridCell {
  return (node as GridCell).type === 'grid-cell';
}

function isGridSection(node: AnyNode): node is GridSection {
  return isSection(node) && (node as Section).layoutMode === 'grid';
}

function isFreeSection(node: AnyNode): node is FreeSection {
  return isSection(node) && (node as Section).layoutMode === 'free';
}


// ── Defaults ───────────────────────────────────────────────────────────

// ── Factory helpers ────────────────────────────────────────────────────

function makeSection(id: string, role: SectionRole, partial?: SectionUpdate, bgColor?: string): Section {
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
    layoutMode: 'free',  // default; overridden by partial when creating grid sections
    ...partial,
  } as Section;
}


function makeGridCell(id: string, parentId: string, columnSpan = 4): GridCell {
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

// Recursively delete a grid cell and all its descendants (elements or sub-cells)
function removeGridCellNodes(nodes: NodeMap, cell: GridCell): void {
  for (const childId of cell.children) {
    const child = nodes[childId];
    if (child?.type === 'container') {
      const block = child as Container;
      for (const subId of block.children) {
        const sub = nodes[subId] as GridCell | undefined;
        if (sub) { removeGridCellNodes(nodes, sub); delete nodes[subId]; }
      }
    }
    delete nodes[childId];
  }
}

// Collect all leaf element IDs from a cell (recursing into columns blocks)
function collectElementIds(cell: GridCell, nodes: NodeMap): string[] {
  return cell.children.flatMap(childId => {
    const child = nodes[childId];
    if (!child) return [];
    if (child.type === 'container') {
      const block = child as Container;
      return block.children.flatMap(subId => {
        const sub = nodes[subId] as GridCell | undefined;
        return sub ? collectElementIds(sub, nodes) : [];
      });
    }
    return [childId];
  });
}

function removeNodesForSection(nodes: NodeMap, sec: Section): void {
  if (sec.layoutMode === 'grid') {
    for (const cellId of sec.children) {
      const cell = nodes[cellId] as GridCell | undefined;
      if (cell) { removeGridCellNodes(nodes, cell); delete nodes[cellId]; }
    }
  } else {
    for (const elId of sec.children) delete nodes[elId];
  }
}

function removeFromParent(nodes: NodeMap, parentId: string, childId: string): void {
  const parent = nodes[parentId];
  if (!parent) return;
  if (isSection(parent) || isGridCell(parent) || isContainer(parent)) {
    const p = parent as { children: string[] };
    nodes[parentId] = { ...parent, children: p.children.filter(c => c !== childId) } as AnyNode;
  }
}

function appendToParent(nodes: NodeMap, parentId: string, childId: string): void {
  const parent = nodes[parentId];
  if (!parent) return;
  if (isSection(parent) || isGridCell(parent) || isContainer(parent)) {
    const p = parent as { children: string[] };
    nodes[parentId] = { ...parent, children: [...p.children, childId] } as AnyNode;
  }
}

function createDefaultElement(type: ElementType, count: number, parentId: string, dropX?: number, dropY?: number, theme?: SiteTheme, useAccent = false): CanvasElement {
  const offset = (count % 8) * 20;
  const cx = Math.round(CANVAS_W / 2 - 100 + offset);
  const cy = Math.round(150 + offset);
  const id = newId();
  const tc = theme?.colors ?? DEFAULT_THEME.colors;
  const tf = theme?.fonts.body ?? DEFAULT_STYLE.typography.family;

  const base: CanvasElement = {
    id, type, parent: parentId,
    layout: { x: dropX ?? cx, y: dropY ?? cy, width: 200, height: 100, zIndex: count, rotation: 0 },
    style: { ...DEFAULT_STYLE, background: { ...DEFAULT_BG }, padding: { top: 0, right: 0, bottom: 0, left: 0 }, border: { radius: 0, width: 0, color: '#cccccc', style: 'solid' }, shadow: { enabled: false, x: 4, y: 4, blur: 12, spread: 0, color: 'rgba(0,0,0,0.2)' }, typography: { ...DEFAULT_STYLE.typography, family: tf, color: tc.text } },
    content: { ...DEFAULT_CONTENT },
    interaction: { ...DEFAULT_INTERACTION },
    animation: { ...DEFAULT_ANIMATION },
    state: { hidden: false, locked: false },
    responsive: {},
    flexLayout: { ...DEFAULT_FLEX_LAYOUT },
  };

  switch (type) {
    case 'text':    return { ...base, layout: { ...base.layout, width: 220, height: 48 }, flexLayout: { ...DEFAULT_FLEX_LAYOUT, widthMode: 'auto' }, content: { ...base.content, plain: 'Click to edit text' } };
    case 'image':   return { ...base, layout: { ...base.layout, width: 240, height: 240 }, flexLayout: { ...DEFAULT_FLEX_LAYOUT, widthMode: 'fill' }, style: { ...base.style, background: { ...base.style.background, color: '#e2e8f0' } }, content: { ...base.content, src: 'https://placehold.co/240x160/e2e8f0/64748b?text=Image' } };
    case 'button':  return { ...base, layout: { ...base.layout, width: 140, height: 44 }, flexLayout: { ...DEFAULT_FLEX_LAYOUT, widthMode: 'auto' }, style: { ...base.style, background: { ...base.style.background, color: useAccent ? tc.accent : tc.primary }, border: { radius: 6, width: 0, color: '#cccccc', style: 'solid' }, padding: { top: 10, right: 24, bottom: 10, left: 24 }, typography: { ...base.style.typography, size: 15, weight: '600', color: '#ffffff', align: 'center' } }, content: { ...base.content, label: useAccent ? 'Learn more' : 'Click me' } };
    case 'box':     return { ...base, layout: { ...base.layout, width: 200, height: 160 }, style: { ...base.style, background: { ...base.style.background, color: tc.light }, border: { radius: 0, width: 2, color: tc.light, style: 'solid' } } };
    case 'divider': return { ...base, layout: { ...base.layout, width: 400, height: 4 }, style: { ...base.style, background: { ...base.style.background, color: tc.light }, border: { ...base.style.border, radius: 2 } }, content: { ...base.content, orientation: 'horizontal' } };
    case 'video':   return { ...base, layout: { ...base.layout, width: 400, height: 225 }, style: { ...base.style, background: { ...base.style.background, color: '#000000' } } };
    case 'spacer':  return { ...base, layout: { ...base.layout, width: 200, height: 60 } };
    case 'icon':    return { ...base, layout: { ...base.layout, width: 60, height: 60 }, flexLayout: { ...DEFAULT_FLEX_LAYOUT, widthMode: 'fixed', widthValue: 60 }, style: { ...base.style, typography: { ...base.style.typography, color: tc.primary } } };
  }
}

export function equalWidths(n: number): number[] {
  if (n <= 1) return [];
  const w = Math.floor(100 / n);
  const widths = new Array<number>(n).fill(w);
  widths[n - 1] = 100 - w * (n - 1);
  return widths;
}

// ── applyBreakpoint ────────────────────────────────────────────────────

export function applyBreakpoint(el: CanvasElement, bp: Breakpoint, scale = 1): CanvasElement {
  const baseState = el.state ?? { hidden: false, locked: false };
  const baseResponsive = el.responsive ?? {};
  if (bp === 'desktop') return el.state && el.responsive ? el : { ...el, state: baseState, responsive: baseResponsive };
  const tOvr = baseResponsive.tablet;
  // Cascade: mobile falls back to tablet, then desktop. Tablet falls back to desktop only.
  const srcOvr = bp === 'mobile' ? baseResponsive.mobile : tOvr;
  const fallOvr = bp === 'mobile' ? tOvr : undefined;

  // Layout: property-level cascade (mobile ?? tablet ?? desktop)
  const slo = srcOvr?.layout;
  const flo = fallOvr?.layout;
  const layout: ElementLayout = {
    ...el.layout,
    x:      slo?.x      ?? flo?.x      ?? (scale !== 1 ? Math.round(el.layout.x * scale)                   : el.layout.x),
    y:      slo?.y      ?? flo?.y      ?? (scale !== 1 ? Math.round(el.layout.y * scale)                   : el.layout.y),
    width:  slo?.width  ?? flo?.width  ?? (scale !== 1 ? Math.max(20, Math.round(el.layout.width * scale)) : el.layout.width),
    height: slo?.height ?? flo?.height ?? (scale !== 1 ? Math.max(4,  Math.round(el.layout.height * scale)): el.layout.height),
  };

  // Typography: deep merge — tablet values as base, mobile overrides on top
  const sTypo = srcOvr?.style?.typography;
  const fTypo = fallOvr?.style?.typography;
  const mergedTypo = (sTypo || fTypo) ? { ...(fTypo ?? {}), ...(sTypo ?? {}) } : undefined;
  const style = mergedTypo ? { ...el.style, typography: { ...el.style.typography, ...mergedTypo } } : el.style;

  // Flex layout: deep merge — tablet values as base, mobile overrides on top
  const sFl = srcOvr?.flexLayout;
  const fFl = fallOvr?.flexLayout;
  const mergedFl = (sFl || fFl) ? { ...(fFl ?? {}), ...(sFl ?? {}) } : undefined;
  const flexLayout = mergedFl ? { ...el.flexLayout, ...mergedFl } : el.flexLayout;

  const hidden = srcOvr?.state?.hidden ?? fallOvr?.state?.hidden;

  return { ...el, layout, style, flexLayout, responsive: baseResponsive, state: hidden !== undefined ? { ...baseState, hidden } : baseState };
}

// ── Migration helpers ──────────────────────────────────────────────────

function migrateOldBreakpoint(old: Record<string, unknown>): BreakpointOverride {
  const hasLayout = old.x !== undefined || old.y !== undefined || old.width !== undefined || old.height !== undefined;
  const hasTypo = old.fontSize !== undefined || old.fontWeight !== undefined || old.textAlign !== undefined;
  const hasState = old.hidden !== undefined;
  return {
    layout: hasLayout ? { x: old.x as number | undefined, y: old.y as number | undefined, width: old.width as number | undefined, height: old.height as number | undefined } : undefined,
    style: hasTypo ? { typography: { size: old.fontSize as number | undefined, weight: old.fontWeight as string | undefined, align: old.textAlign as TextAlign | undefined } } : undefined,
    state: hasState ? { hidden: old.hidden as boolean } : undefined,
  };
}

function migrateOldElement(r: Record<string, unknown>, parentId: string): CanvasElement {
  return {
    id: r.id as string,
    type: r.type as ElementType,
    parent: parentId,
    layout: { x: (r.x as number) ?? 0, y: (r.y as number) ?? 0, width: (r.width as number) ?? 200, height: (r.height as number) ?? 100, zIndex: (r.zIndex as number) ?? 0, rotation: (r.rotation as number) ?? 0 },
    style: {
      opacity: (r.opacity as number) ?? 1,
      background: { type: (r.backgroundType as import('../types').BgType) ?? 'solid', color: (r.backgroundColor as string) ?? 'transparent', image: (r.backgroundImage as string) ?? '', position: (r.backgroundPosition as string) ?? 'center', from: (r.gradientFrom as string) ?? '#006e75', to: (r.gradientTo as string) ?? '#0b978e', angle: (r.gradientAngle as number) ?? 135 },
      padding: { top: (r.paddingTop as number) ?? 0, right: (r.paddingRight as number) ?? 0, bottom: (r.paddingBottom as number) ?? 0, left: (r.paddingLeft as number) ?? 0 },
      border: { radius: (r.borderRadius as number) ?? 0, width: (r.borderWidth as number) ?? 0, color: (r.borderColor as string) ?? '#cccccc', style: (r.borderStyle as import('../types').BorderStyle) ?? 'solid' },
      shadow: { enabled: (r.shadowEnabled as boolean) ?? false, x: (r.shadowX as number) ?? 4, y: (r.shadowY as number) ?? 4, blur: (r.shadowBlur as number) ?? 12, spread: (r.shadowSpread as number) ?? 0, color: (r.shadowColor as string) ?? 'rgba(0,0,0,0.2)' },
      typography: { family: (r.fontFamily as string) ?? 'Inter, sans-serif', size: (r.fontSize as number) ?? 16, weight: (r.fontWeight as string) ?? 'normal', color: (r.color as string) ?? '#333333', align: (r.textAlign as TextAlign) ?? 'left', lineHeight: (r.lineHeight as number) ?? 1.5, letterSpacing: 0, textTransform: 'none' as TextTransform },
    },
    content: { plain: (r.text as string) ?? '', rich: (r.richText as string) ?? '', src: (r.src as string) ?? '', alt: (r.alt as string) ?? 'image', objectFit: (r.objectFit as import('../types').ObjectFit) ?? 'cover', label: (r.label as string) ?? 'Button', videoUrl: (r.videoUrl as string) ?? '', iconName: (r.iconName as string) ?? '★', iconSize: (r.iconSize as number) ?? 40 },
    interaction: { type: 'link', linkUrl: (r.linkUrl as string) ?? '', linkTarget: (r.linkTarget as '_self' | '_blank') ?? '_self', smoothScroll: false },
    animation: { type: (r.animationType as import('../types').AnimationType) ?? 'none', trigger: (r.animationTrigger as import('../types').AnimationTrigger) ?? 'load', duration: (r.animationDuration as number) ?? 600, delay: (r.animationDelay as number) ?? 0 },
    state: { hidden: (r.hidden as boolean) ?? false, locked: (r.locked as boolean) ?? false },
    responsive: {
      tablet: r.responsiveTablet ? migrateOldBreakpoint(r.responsiveTablet as Record<string, unknown>) : undefined,
      mobile: r.responsiveMobile ? migrateOldBreakpoint(r.responsiveMobile as Record<string, unknown>) : undefined,
    },
    flexLayout: { ...DEFAULT_FLEX_LAYOUT },
  };
}

function migrateOldSection(r: Record<string, unknown>, role: SectionRole, nodes: NodeMap): Section {
  const id = r.id as string;
  const elements = (r.elements as Record<string, unknown>) ?? {};
  const order = (r.order as string[]) ?? [];
  for (const elId of order) {
    const el = elements[elId] as Record<string, unknown> | undefined;
    if (el) nodes[elId] = migrateOldElement(el, id);
  }
  const oldStyles = (r.columnStyles as Record<string, unknown>) ?? {};
  const newStyles: Record<string, ColumnStyle> = {};
  for (const [idx, cs] of Object.entries(oldStyles)) {
    const c = cs as Record<string, unknown>;
    newStyles[idx] = { background: { type: (c.backgroundType as import('../types').BgType) ?? 'solid', color: (c.backgroundColor as string) ?? '#ffffff', image: (c.backgroundImage as string) ?? '', position: 'center', from: (c.gradientFrom as string) ?? '#006e75', to: (c.gradientTo as string) ?? '#0b978e', angle: (c.gradientAngle as number) ?? 135, overlay: (c.backgroundOverlay as number) ?? 0 } };
  }
  return {
    id, type: 'section', role,
    label: (r.label as string) ?? (role === 'header' ? 'Header' : role === 'footer' ? 'Footer' : 'Section'),
    layout: { height: (r.height as number) ?? (role === 'header' ? 80 : role === 'footer' ? 100 : 400) },
    style: {
      background: { type: (r.backgroundType as import('../types').BgType) ?? 'solid', color: (r.backgroundColor as string) ?? '#ffffff', image: (r.backgroundImage as string) ?? '', position: 'center', from: (r.gradientFrom as string) ?? '#006e75', to: (r.gradientTo as string) ?? '#0b978e', angle: (r.gradientAngle as number) ?? 135, overlay: (r.backgroundOverlay as number) ?? 0 },
      columns: { count: (r.columns as number) ?? 1, widths: (r.columnWidths as number[]) ?? [], styles: newStyles },
    },
    children: order,
    layoutMode: 'free',
  } as Section;
}

function migrateFromOldFormat(r: Record<string, unknown>): BuilderState {
  const nodes: NodeMap = {};
  let headerId = '';
  let footerId = '';

  if (r.header && typeof r.header === 'object') {
    const h = r.header as Record<string, unknown>;
    headerId = (h.id as string) || newSectionId(); h.id = headerId;
    nodes[headerId] = migrateOldSection(h, 'header', nodes);
  } else { headerId = newSectionId(); nodes[headerId] = makeSection(headerId, 'header'); }

  if (r.footer && typeof r.footer === 'object') {
    const f = r.footer as Record<string, unknown>;
    footerId = (f.id as string) || newSectionId(); f.id = footerId;
    nodes[footerId] = migrateOldSection(f, 'footer', nodes);
  } else { footerId = newSectionId(); nodes[footerId] = makeSection(footerId, 'footer'); }

  let pages: Page[] = [];
  let activePageId = '';

  if (r.pages && Array.isArray(r.pages)) {
    for (const p of r.pages as Array<Record<string, unknown>>) {
      const pSections: string[] = [];
      for (const s of ((p.sections ?? []) as Array<Record<string, unknown>>)) {
        const secId = (s.id as string) || newSectionId(); s.id = secId;
        nodes[secId] = migrateOldSection(s, 'section', nodes);
        pSections.push(secId);
      }
      const pid = (p.id as string) || newPageId();
      pages.push({ id: pid, name: (p.name as string) ?? 'Page', slug: (p.slug as string) ?? '/', seo: { title: `${(p.name as string) ?? 'Page'} | My Site`, description: '', ogImage: '' }, sections: [headerId, ...pSections, footerId] });
    }
    activePageId = (r.activePageId as string) ?? pages[0]?.id ?? '';
  } else if (r.sections && Array.isArray(r.sections)) {
    const pSections: string[] = [];
    for (const s of r.sections as Array<Record<string, unknown>>) {
      const secId = (s.id as string) || newSectionId(); s.id = secId;
      nodes[secId] = migrateOldSection(s, 'section', nodes);
      pSections.push(secId);
    }
    const pageId = newPageId();
    pages = [{ id: pageId, name: 'Home', slug: '/', seo: { title: 'Home | My Site', description: '', ogImage: '' }, sections: [headerId, ...pSections, footerId] }];
    activePageId = pageId;
  } else {
    const sectionId = newSectionId();
    nodes[sectionId] = migrateOldSection({ id: sectionId, elements: r.elements, order: r.order }, 'section', nodes);
    const pageId = newPageId();
    pages = [{ id: pageId, name: 'Home', slug: '/', seo: { title: 'Home | My Site', description: '', ogImage: '' }, sections: [headerId, sectionId, footerId] }];
    activePageId = pageId;
  }

  const oldTheme = r.theme as Record<string, unknown> | undefined;
  const oldColors = oldTheme?.colors as string[] | undefined;
  const theme: SiteTheme = {
    colors: { primary: oldColors?.[0] ?? '#006e75', secondary: oldColors?.[1] ?? '#0b978e', text: oldColors?.[2] ?? '#333333', background: oldColors?.[3] ?? '#ffffff', light: oldColors?.[4] ?? '#f5f5f5', accent: oldColors?.[5] ?? '#e74c3c', sectionBg: DEFAULT_THEME.colors.sectionBg },
    fonts: { body: (oldTheme?.bodyFont as string) ?? ((oldTheme as any)?.fonts?.body as string) ?? 'Inter, sans-serif' },
  };

  return { schema: SCHEMA_VERSION, site: { name: 'My Site', favicon: '', language: 'en' }, theme, pages, activePageId, nodes };
}


export function migrateState(raw: unknown): BuilderState {
  if (!raw || typeof raw !== 'object') return makeEmpty();
  const r = raw as Record<string, unknown>;
  if (r.schema === '2.0' && r.nodes) {
    const nodes = hydrateNodes(r.nodes as Record<string, unknown>);
    const rt = (r.theme as Partial<SiteTheme> | undefined);
    const mergedTheme: SiteTheme = { ...DEFAULT_THEME, ...rt, colors: { ...DEFAULT_THEME.colors, ...(rt?.colors ?? {}) }, fonts: { ...DEFAULT_THEME.fonts, ...(rt?.fonts ?? {}) } };
    // Migrate old page format that had separate header/footer fields
    const rawPages = (r.pages as Array<Record<string, unknown>>) ?? [];
    const pages: Page[] = rawPages.map(p => {
      if ('header' in p && 'footer' in p) {
        const hId = p.header as string;
        const fId = p.footer as string;
        const body = (p.sections as string[]) ?? [];
        return { id: p.id, name: p.name, slug: p.slug, seo: p.seo, sections: [hId, ...body, fId] } as Page;
      }
      return p as unknown as Page;
    });
    return { schema: SCHEMA_VERSION, site: { name: 'My Site', favicon: '', language: 'en', ...((r.site as object) ?? {}) }, theme: mergedTheme, pages, activePageId: (r.activePageId as string) ?? '', nodes };
  }
  if ((r.pages || r.sections || r.elements) && (r.header || r.sections || r.elements)) {
    return migrateFromOldFormat(r);
  }
  return makeEmpty();
}

export function makeEmpty(): BuilderState {
  const pageId = newPageId();
  const headerId = newSectionId();
  const sectionId = newSectionId();
  const footerId = newSectionId();
  return {
    schema: SCHEMA_VERSION,
    site: { name: 'My Site', favicon: '', language: 'en' },
    theme: DEFAULT_THEME,
    pages: [{ id: pageId, name: 'Home', slug: '/', seo: { title: 'Home | My Site', description: '', ogImage: '' }, sections: [headerId, sectionId, footerId] }],
    activePageId: pageId,
    nodes: { [headerId]: makeSection(headerId, 'header'), [footerId]: makeSection(footerId, 'footer'), [sectionId]: makeSection(sectionId, 'section', { label: 'Section 1' }) },
  };
}

function loadFromStorage(): BuilderState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return migrateState(JSON.parse(raw));
    for (const key of LEGACY_KEYS) { const old = localStorage.getItem(key); if (old) return migrateState(JSON.parse(old)); }
    return makeDemoState();
  } catch { return makeDemoState(); }
}

function saveToStorage(s: BuilderState) {
  try {
    const sparse = { ...s, nodes: sparsifyNodes(s.nodes) };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sparse));
  } catch {}
}

function getActivePage(state: BuilderState): Page {
  return state.pages.find(p => p.id === state.activePageId) ?? state.pages[0];
}

export function useBuilderStore() {
  const [state, setState] = useState<BuilderState>(loadFromStorage);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedGridCellId, setSelectedGridCellId] = useState<string | null>(null);
  const { push, undo, redo, canUndo, canRedo } = useUndoRedo();

  const clipboard = useRef<CanvasElement | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const selectedIdsRef = useRef(selectedIds);
  selectedIdsRef.current = selectedIds;
  const selectedGridCellIdRef = useRef(selectedGridCellId);
  selectedGridCellIdRef.current = selectedGridCellId;

  useEffect(() => { saveToStorage(state); }, [state]);

  const allElements = useMemo(() => {
    const map: Record<string, CanvasElement> = {};
    for (const [id, node] of Object.entries(state.nodes)) {
      if (!isSection(node) && !isGridCell(node)) map[id] = node as CanvasElement;
    }
    return map;
  }, [state]);


  const allOrder = useMemo(() => {
    const page = getActivePage(state);
    return page.sections.flatMap(secId => {
      const sec = state.nodes[secId] as Section | undefined;
      if (!sec) return [];
      if (sec.layoutMode === 'grid') {
        return sec.children.flatMap(cellId => {
          const cell = state.nodes[cellId] as GridCell | undefined;
          return cell ? collectElementIds(cell, state.nodes) : [];
        });
      }
      return sec.children;
    });
  }, [state]);

  const selectedId = selectedIds.length === 1 ? selectedIds[0]
    : selectedIds.length > 1 ? selectedIds[selectedIds.length - 1] : null;

  const setSelectedId = useCallback((id: string | null) => {
    setSelectedIds(id ? [id] : []);
    if (id) {
      const node = stateRef.current.nodes[id];
      if (node && !isSection(node) && !isGridCell(node)) {
        const cel = node as CanvasElement;
        const parent = stateRef.current.nodes[cel.parent];
        if (parent && isGridCell(parent)) {
          setSelectedGridCellId(parent.id);
          // Walk up through GridCells AND Containers until we reach a Section
          let ancestorId = parent.parent;
          let ancestor = stateRef.current.nodes[ancestorId];
          while (ancestor && (isGridCell(ancestor) || isContainer(ancestor))) {
            ancestorId = isGridCell(ancestor)
              ? (ancestor as GridCell).parent
              : (ancestor as Container).parent;
            ancestor = stateRef.current.nodes[ancestorId];
          }
          setSelectedSectionId(ancestorId);
        } else {
          setSelectedSectionId(cel.parent);
        }
      }
    }
  }, []);

  const toggleSelectedId = useCallback((id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  }, []);

  // ── Page ops ───────────────────────────────────────────────────────

  const addPage = useCallback(() => {
    const n = stateRef.current.pages.length + 1;
    const pageId = newPageId(); const headerId = newSectionId(); const footerId = newSectionId(); const sectionId = newSectionId();
    push(stateRef.current);
    setState(s => ({ ...s, nodes: { ...s.nodes, [headerId]: makeSection(headerId, 'header'), [footerId]: makeSection(footerId, 'footer'), [sectionId]: makeSection(sectionId, 'section', { label: 'Section 1' }) }, pages: [...s.pages, { id: pageId, name: `Page ${n}`, slug: `/page-${n}`, seo: { title: `Page ${n} | My Site`, description: '', ogImage: '' }, sections: [headerId, sectionId, footerId] }], activePageId: pageId }));
    setSelectedIds([]); setSelectedSectionId(null);
  }, [push]);

  const deletePage = useCallback((id: string) => {
    setState(s => {
      if (s.pages.length <= 1) return s;
      push(stateRef.current);
      const page = s.pages.find(p => p.id === id);
      if (!page) return s;
      const nodes = { ...s.nodes };
      for (const secId of page.sections) {
        const sec = nodes[secId] as Section | undefined;
        if (sec) { removeNodesForSection(nodes, sec); delete nodes[secId]; }
      }
      const pages = s.pages.filter(p => p.id !== id);
      return { ...s, nodes, pages, activePageId: s.activePageId === id ? pages[0].id : s.activePageId };
    });
    setSelectedIds([]); setSelectedSectionId(null);
  }, [push]);

  const renamePage = useCallback((id: string, name: string) => {
    setState(s => ({ ...s, pages: s.pages.map(p => p.id === id ? { ...p, name } : p) }));
  }, []);

  const updatePageSlug = useCallback((id: string, slug: string) => {
    setState(s => ({ ...s, pages: s.pages.map(p => p.id === id ? { ...p, slug } : p) }));
  }, []);

  const updatePageLayout = useCallback((id: string, layoutWidth: 'fixed' | 'fluid', maxWidth?: number) => {
    setState(s => ({ ...s, pages: s.pages.map(p => p.id === id ? { ...p, layoutWidth, ...(maxWidth !== undefined ? { maxWidth } : {}) } : p) }));
  }, []);

  const setActivePage = useCallback((id: string) => {
    setState(s => ({ ...s, activePageId: id }));
    setSelectedIds([]); setSelectedSectionId(null);
  }, []);

  const reorderPage = useCallback((fromIndex: number, toIndex: number) => {
    push(stateRef.current);
    setState(s => { const pages = [...s.pages]; const [moved] = pages.splice(fromIndex, 1); pages.splice(toIndex, 0, moved); return { ...s, pages }; });
  }, [push]);

  // ── Section ops ────────────────────────────────────────────────────

  const addSection = useCallback((afterId?: string, atStart?: boolean) => {
    push(stateRef.current);
    const page = getActivePage(stateRef.current);
    const secId = newSectionId();
    const sec = makeSection(secId, 'section', { label: `Section ${page.sections.length + 1}` }, stateRef.current.theme.colors.sectionBg);
    setState(s => {
      const p = getActivePage(s);
      let sections: string[];
      if (atStart) { sections = [secId, ...p.sections]; }
      else if (!afterId) { sections = [...p.sections, secId]; }
      else { const idx = p.sections.indexOf(afterId); sections = [...p.sections]; sections.splice(idx + 1, 0, secId); }
      return { ...s, nodes: { ...s.nodes, [secId]: sec }, pages: s.pages.map(pg => pg.id === p.id ? { ...pg, sections } : pg) };
    });
    setSelectedSectionId(secId);
  }, [push]);

  // Change a section's role; demotes any other section that held that role.
  const promoteSection = useCallback((id: string, role: 'header' | 'footer' | 'section') => {
    push(stateRef.current);
    setState(s => {
      const p = getActivePage(s);
      const nodes = { ...s.nodes };
      // Demote any other section that currently holds this role
      for (const secId of p.sections) {
        const sec = nodes[secId] as Section | undefined;
        if (sec && sec.role === role && secId !== id) {
          nodes[secId] = { ...sec, role: 'section' };
        }
      }
      nodes[id] = { ...(nodes[id] as Section), role };
      return { ...s, nodes };
    });
  }, [push]);

  const deleteSection = useCallback((id: string) => {
    setState(s => {
      const p = getActivePage(s);
      if (p.sections.length <= 1) return s;
      push(stateRef.current);
      const sec = s.nodes[id] as Section | undefined;
      const nodes = { ...s.nodes };
      if (sec) { removeNodesForSection(nodes, sec); }
      delete nodes[id];
      return { ...s, nodes, pages: s.pages.map(pg => pg.id === p.id ? { ...pg, sections: pg.sections.filter(sid => sid !== id) } : pg) };
    });
    setSelectedSectionId(null); setSelectedGridCellId(null);
  }, [push]);

  const updateSection = useCallback((id: string, updates: SectionUpdate) => {
    const newMode = updates.layoutMode;
    if (newMode !== undefined) {
      const currentNode = stateRef.current.nodes[id];
      const currentMode = (isSection(currentNode) ? currentNode.layoutMode : undefined) ?? 'free';
      if (newMode !== currentMode) {
        push(stateRef.current);
        setState(s => {
          const node = s.nodes[id];
          if (!node || !isSection(node)) return s;
          const nodes = { ...s.nodes };
          if (newMode === 'grid') {
            for (const elId of node.children) delete nodes[elId];
            const c1 = newGridCellId(), c2 = newGridCellId(), c3 = newGridCellId();
            nodes[c1] = makeGridCell(c1, id, 4);
            nodes[c2] = makeGridCell(c2, id, 4);
            nodes[c3] = makeGridCell(c3, id, 4);
            nodes[id] = { ...node, ...updates, children: [c1, c2, c3] } as Section;
          } else {
            for (const cellId of node.children) {
              const cell = nodes[cellId] as GridCell | undefined;
              if (cell) { for (const elId of cell.children) delete nodes[elId]; delete nodes[cellId]; }
            }
            nodes[id] = { ...node, ...updates, children: [] } as Section;
          }
          return { ...s, nodes };
        });
        setSelectedIds([]); setSelectedGridCellId(null);
        return;
      }
    }
    setState(s => {
      const node = s.nodes[id];
      if (!node || !isSection(node)) return s;
      return { ...s, nodes: { ...s.nodes, [id]: { ...node, ...updates } as Section } };
    });
  }, [push]);

  const reorderSection = useCallback((fromIndex: number, toIndex: number) => {
    push(stateRef.current);
    setState(s => {
      const p = getActivePage(s);
      const sections = [...p.sections];
      const [moved] = sections.splice(fromIndex, 1);
      sections.splice(toIndex, 0, moved);
      return { ...s, pages: s.pages.map(pg => pg.id === p.id ? { ...pg, sections } : pg) };
    });
  }, [push]);

  const duplicateSection = useCallback((id: string) => {
    push(stateRef.current);
    setState(s => {
      const p = getActivePage(s);
      const idx = p.sections.indexOf(id);
      if (idx === -1) return s;
      const src = s.nodes[id] as Section | undefined;
      if (!src) return s;
      const newSecId = newSectionId();
      const nodes = { ...s.nodes };
      let newChildren: string[];
      if (src.layoutMode === 'grid') {
        const deepCopyCell = (cell: GridCell, newParentId: string): string => {
          const newCellId = newGridCellId();
          const newCellChildren = cell.children.map(childId => {
              const child = nodes[childId];
              if (!child) return '';
              if (child.type === 'container') {
                const block = child as Container;
                const newBlockId = newColumnsId();
                const newSubIds = block.children.map(subId => {
                  const sub = nodes[subId] as GridCell | undefined;
                  return sub ? deepCopyCell(sub, newBlockId) : '';
                }).filter(Boolean);
                nodes[newBlockId] = { ...block, id: newBlockId, parent: newCellId, children: newSubIds } as Container;
                return newBlockId;
              }
              const el = child as CanvasElement;
              const newElId = newId();
              nodes[newElId] = { ...el, id: newElId, parent: newCellId };
              return newElId;
            }).filter(Boolean);
          nodes[newCellId] = { ...cell, id: newCellId, parent: newParentId, children: newCellChildren };
          return newCellId;
        };
        newChildren = src.children.map(cellId => {
          const cell = nodes[cellId] as GridCell | undefined;
          return cell ? deepCopyCell(cell, newSecId) : '';
        }).filter(Boolean);
      } else {
        newChildren = src.children.map(elId => {
          const newElId = newId();
          const el = nodes[elId] as CanvasElement | undefined;
          if (el) nodes[newElId] = { ...el, id: newElId, parent: newSecId };
          return newElId;
        });
      }
      nodes[newSecId] = { ...src, id: newSecId, label: `${src.label} Copy`, children: newChildren };
      const sections = [...p.sections]; sections.splice(idx + 1, 0, newSecId);
      return { ...s, nodes, pages: s.pages.map(pg => pg.id === p.id ? { ...pg, sections } : pg) };
    });
  }, [push]);

  // ── Element ops ────────────────────────────────────────────────────

  const addElementToCell = useCallback((type: ElementType, cellId: string, x = 0, y = 0) => {
    const s = stateRef.current;
    const cell = s.nodes[cellId] as GridCell | undefined;
    if (!cell) return;
    // Second button in the same cell uses accent color instead of primary
    const hasButton = type === 'button' && cell.children.some(id => s.nodes[id]?.type === 'button');
    const el = createDefaultElement(type, cell.children.length, cellId, x, y, stateRef.current.theme, hasButton);
    push(s);
    setState(prev => {
      const c = prev.nodes[cellId] as GridCell | undefined;
      if (!c) return prev;
      return { ...prev, nodes: { ...prev.nodes, [el.id]: el, [cellId]: { ...c, children: [...c.children, el.id] } } };
    });
    setSelectedIds([el.id]); setSelectedGridCellId(cellId);
  }, [push]);

  const addElement = useCallback((type: ElementType) => {
    const s = stateRef.current;
    // If a grid cell is selected, add directly there
    const gcId = selectedGridCellIdRef.current;
    if (gcId && s.nodes[gcId] && isGridCell(s.nodes[gcId])) {
      addElementToCell(type, gcId); return;
    }
    const page = getActivePage(s);
    const sectionId = selectedSectionId ?? page.sections[0];
    if (!sectionId) return;
    const sec = s.nodes[sectionId] as Section | undefined;
    if (!sec) return;
    // Grid section with no cell selected — add to first available cell
    if (sec.layoutMode === 'grid') {
      for (const cellId of sec.children) {
        const c = s.nodes[cellId] as GridCell | undefined;
        if (c) { addElementToCell(type, cellId); return; }
      }
      return;
    }
    const hasButton = type === 'button' && sec.children.some(id => stateRef.current.nodes[id]?.type === 'button');
    const el = createDefaultElement(type, sec.children.length, sectionId, undefined, undefined, stateRef.current.theme, hasButton);
    push(s);
    setState(prev => {
      const section = prev.nodes[sectionId] as Section | undefined;
      if (!section) return prev;
      return { ...prev, nodes: { ...prev.nodes, [el.id]: el, [sectionId]: { ...section, children: [...section.children, el.id] } } };
    });
    setSelectedIds([el.id]); setSelectedSectionId(sectionId);
  }, [push, selectedSectionId, addElementToCell]);

  const addElementAt = useCallback((type: ElementType, x: number, y: number, sectionId: string) => {
    const s = stateRef.current;
    const node = s.nodes[sectionId];
    if (!node || !isFreeSection(node)) return;  // grid sections don't accept direct element drops
    const hasButton = type === 'button' && node.children.some(id => stateRef.current.nodes[id]?.type === 'button');
    const el = createDefaultElement(type, node.children.length, sectionId, Math.round(x), Math.round(y), stateRef.current.theme, hasButton);
    push(s);
    setState(prev => {
      const sec = prev.nodes[sectionId];
      if (!sec || !isFreeSection(sec)) return prev;
      return { ...prev, nodes: { ...prev.nodes, [el.id]: el, [sectionId]: { ...sec, children: [...sec.children, el.id] } } };
    });
    setSelectedIds([el.id]); setSelectedSectionId(sectionId);
  }, [push]);

  const updateElement = useCallback((id: string, updates: Partial<CanvasElement>) => {
    setState(s => {
      const el = s.nodes[id];
      if (!el || isSection(el) || isGridCell(el) || isContainer(el)) return s;
      // Deep-merge content so partial content updates never drop existing content fields
      const merged = { ...el, ...updates } as CanvasElement;
      if (updates.content) {
        merged.content = { ...(el as CanvasElement).content, ...updates.content };
      }
      return { ...s, nodes: { ...s.nodes, [id]: merged } };
    });
  }, []);

  const updateElements = useCallback((updates: Array<{ id: string; changes: Partial<CanvasElement> }>) => {
    setState(s => {
      const nodes = { ...s.nodes };
      for (const { id, changes } of updates) {
        const el = nodes[id];
        if (!el || isSection(el) || isGridCell(el) || isContainer(el)) continue;
        nodes[id] = { ...el, ...changes } as CanvasElement;
      }
      return { ...s, nodes };
    });
  }, []);

  const pushSnapshot = useCallback((snapshot: BuilderState) => { push(snapshot); }, [push]);

  const deleteElement = useCallback((id: string) => {
    const node = stateRef.current.nodes[id];
    if (!node || isSection(node) || isGridCell(node) || isContainer(node)) return;
    const cel = node as CanvasElement;
    push(stateRef.current);
    setState(s => {
      const { [id]: _r, ...nodes } = s.nodes;
      removeFromParent(nodes, cel.parent, id);
      return { ...s, nodes };
    });
    setSelectedIds(prev => prev.filter(s => s !== id));
  }, [push]);

  const deleteSelected = useCallback(() => {
    const ids = selectedIdsRef.current;
    if (!ids.length) return;
    push(stateRef.current);
    setState(s => {
      const nodes = { ...s.nodes };
      for (const id of ids) {
        const el = nodes[id];
        if (!el || isSection(el) || isGridCell(el) || isContainer(el)) continue;
        const cel = el as CanvasElement;
        removeFromParent(nodes, cel.parent, id);
        delete nodes[id];
      }
      return { ...s, nodes };
    });
    setSelectedIds([]);
  }, [push]);

  const duplicateElement = useCallback((id: string) => {
    const node = stateRef.current.nodes[id];
    if (!node || isSection(node) || isGridCell(node) || isContainer(node)) return;
    const cel = node as CanvasElement;
    const copy: CanvasElement = { ...cel, id: newId(), layout: { ...cel.layout, x: cel.layout.x + 20, y: cel.layout.y + 20, zIndex: cel.layout.zIndex + 1 } };
    push(stateRef.current);
    setState(s => {
      const nodes = { ...s.nodes };
      nodes[copy.id] = copy;
      appendToParent(nodes, cel.parent, copy.id);
      return { ...s, nodes };
    });
    setSelectedIds([copy.id]);
  }, [push]);

  const copyElement = useCallback((id: string) => {
    const el = stateRef.current.nodes[id];
    if (el && !isSection(el) && !isGridCell(el) && !isContainer(el)) clipboard.current = el as CanvasElement;
  }, []);

  const pasteElement = useCallback(() => {
    const el = clipboard.current;
    if (!el) return;
    // Paste into selected grid cell if available
    const gcId = selectedGridCellIdRef.current;
    if (gcId) {
      const cell = stateRef.current.nodes[gcId] as GridCell | undefined;
      if (cell) {
        const copy: CanvasElement = { ...el, id: newId(), parent: gcId, layout: { ...el.layout, x: 0, y: 0, zIndex: cell.children.length } };
        push(stateRef.current);
        setState(s => {
          const c = s.nodes[gcId] as GridCell | undefined;
          if (!c) return s;
          return { ...s, nodes: { ...s.nodes, [copy.id]: copy, [gcId]: { ...c, children: [...c.children, copy.id] } } };
        });
        setSelectedIds([copy.id]);
        clipboard.current = { ...el, layout: { ...el.layout, x: 0, y: 0 } };
        return;
      }
    }
    const page = getActivePage(stateRef.current);
    const sectionId = selectedSectionId ?? page.sections[0];
    if (!sectionId) return;
    const secNode = stateRef.current.nodes[sectionId];
    // Grid sections require a selected cell — handled by the gcId branch above
    if (!secNode || !isFreeSection(secNode)) return;
    const copy: CanvasElement = { ...el, id: newId(), parent: sectionId, layout: { ...el.layout, x: el.layout.x + 20, y: el.layout.y + 20, zIndex: secNode.children.length } };
    push(stateRef.current);
    setState(s => {
      const sec = s.nodes[sectionId];
      if (!sec || !isFreeSection(sec)) return s;
      return { ...s, nodes: { ...s.nodes, [copy.id]: copy, [sectionId]: { ...sec, children: [...sec.children, copy.id] } } };
    });
    setSelectedIds([copy.id]);
    clipboard.current = { ...el, layout: { ...el.layout, x: el.layout.x + 20, y: el.layout.y + 20 } };
  }, [push, selectedSectionId]);

  const reorderElement = useCallback((id: string, newIndex: number) => {
    const el = stateRef.current.nodes[id];
    if (!el || isSection(el) || isGridCell(el)) return;
    const cel = el as CanvasElement;
    push(stateRef.current);
    setState(s => {
      const parent = s.nodes[cel.parent];
      if (!parent || (!isSection(parent) && !isGridCell(parent))) return s;
      const parentWithChildren = parent as Section | GridCell;
      const children = parentWithChildren.children.filter(c => c !== id);
      children.splice(Math.max(0, Math.min(children.length, newIndex)), 0, id);
      const nodes = { ...s.nodes };
      children.forEach((cid, idx) => { const n = nodes[cid]; if (n && !isSection(n) && !isGridCell(n)) nodes[cid] = { ...(n as CanvasElement), layout: { ...(n as CanvasElement).layout, zIndex: idx } }; });
      nodes[cel.parent] = { ...parentWithChildren, children } as AnyNode;
      return { ...s, nodes };
    });
  }, [push]);

  const moveElementToSection = useCallback((id: string, toSectionId: string, atIndex: number, pos?: { x: number; y: number }) => {
    const s = stateRef.current;
    const el = s.nodes[id];
    if (!el || isSection(el) || isGridCell(el)) return;
    const cel = el as CanvasElement;
    if (cel.parent === toSectionId) return;
    // Only allow moving into free sections — grid sections require a cell target
    const toNode = s.nodes[toSectionId];
    if (!toNode || !isFreeSection(toNode)) return;
    const fromGrid = isGridCell(s.nodes[cel.parent]);
    push(s);
    setState(prev => {
      const nodes = { ...prev.nodes };
      const toSec = nodes[toSectionId];
      if (!toSec || !isFreeSection(toSec)) return prev;
      // Remove from source — works for both FreeSection parent and GridCell parent
      removeFromParent(nodes, cel.parent, id);
      // Derive concrete pixel width when coming from a grid cell
      let width = cel.layout.width;
      if (fromGrid) {
        const fl = cel.flexLayout;
        if (fl.widthMode === 'fixed' && fl.widthValue) width = fl.widthValue;
        else if (fl.widthMode === 'percent' && fl.widthValue) width = Math.round(fl.widthValue / 100 * CANVAS_W);
        else width = cel.layout.width || 200;
      }
      nodes[id] = {
        ...cel,
        parent: toSectionId,
        layout: { ...cel.layout, x: pos?.x ?? cel.layout.x, y: pos?.y ?? 20, width },
        // Reset grid-specific flex fields when entering free layout
        flexLayout: fromGrid
          ? { ...cel.flexLayout, widthMode: 'auto', flexGrow: 0, alignSelf: 'auto' }
          : cel.flexLayout,
        responsive: fromGrid ? {
          tablet: cel.responsive.tablet ? { ...cel.responsive.tablet, flexLayout: undefined } : cel.responsive.tablet,
          mobile: cel.responsive.mobile ? { ...cel.responsive.mobile, flexLayout: undefined } : cel.responsive.mobile,
        } : cel.responsive,
      };
      const toChildren = [...toSec.children];
      toChildren.splice(Math.max(0, Math.min(toChildren.length, atIndex)), 0, id);
      nodes[toSectionId] = { ...toSec, children: toChildren };
      return { ...prev, nodes };
    });
  }, [push]);

  const moveElementToGridCell = useCallback((id: string, toCellId: string, insertIndex: number) => {
    const s = stateRef.current;
    const el = s.nodes[id];
    const toCell = s.nodes[toCellId];
    if (!el || isSection(el) || isGridCell(el) || !toCell || !isGridCell(toCell)) return;
    const cel = el as CanvasElement;
    const fromFree = isFreeSection(s.nodes[cel.parent]);
    push(s);
    setState(prev => {
      const nodes = { ...prev.nodes };
      const targetCell = nodes[toCellId] as GridCell;
      if (!targetCell || !isGridCell(targetCell)) return prev;
      removeFromParent(nodes, cel.parent, id);
      const children = [...targetCell.children];
      children.splice(Math.max(0, Math.min(children.length, insertIndex)), 0, id);
      nodes[toCellId] = { ...targetCell, children };
      if (fromFree) {
        // Reset absolute-position fields; derive fixed width from the element's pixel width
        nodes[id] = {
          ...cel,
          parent: toCellId,
          layout: { ...cel.layout, x: 0, y: 0, zIndex: 0, rotation: 0 },
          flexLayout: { ...cel.flexLayout, widthMode: 'fixed', widthValue: cel.layout.width },
          responsive: {
            tablet: cel.responsive.tablet ? { ...cel.responsive.tablet, layout: undefined } : cel.responsive.tablet,
            mobile: cel.responsive.mobile ? { ...cel.responsive.mobile, layout: undefined } : cel.responsive.mobile,
          },
        };
      } else {
        nodes[id] = { ...cel, parent: toCellId };
      }
      return { ...prev, nodes };
    });
    setSelectedIds([id]);
    setSelectedGridCellId(toCellId);
  }, [push]);

  const bringToFront = useCallback((id: string) => {
    const node = stateRef.current.nodes[id];
    if (!node || isSection(node) || isGridCell(node)) return;
    push(stateRef.current);
    const cel = node as CanvasElement;
    setState(s => {
      const parent = s.nodes[cel.parent];
      // parent is FreeSection or GridCell — guard out GridSection and CanvasElement
      if (!parent || isGridSection(parent) || (!isSection(parent) && !isGridCell(parent))) return s;
      const parentNode = parent as FreeSection | GridCell;
      const children = [...parentNode.children.filter((c: string) => c !== id), id];
      const nodes = { ...s.nodes };
      children.forEach((cid: string, idx: number) => { const n = nodes[cid]; if (n && !isSection(n) && !isGridCell(n)) nodes[cid] = { ...(n as CanvasElement), layout: { ...(n as CanvasElement).layout, zIndex: idx } }; });
      nodes[cel.parent] = { ...parentNode, children } as AnyNode;
      return { ...s, nodes };
    });
  }, [push]);

  const sendToBack = useCallback((id: string) => {
    const node = stateRef.current.nodes[id];
    if (!node || isSection(node) || isGridCell(node)) return;
    push(stateRef.current);
    const cel = node as CanvasElement;
    setState(s => {
      const parent = s.nodes[cel.parent];
      // parent is FreeSection or GridCell — guard out GridSection and CanvasElement
      if (!parent || isGridSection(parent) || (!isSection(parent) && !isGridCell(parent))) return s;
      const parentNode = parent as FreeSection | GridCell;
      const children = [id, ...parentNode.children.filter((c: string) => c !== id)];
      const nodes = { ...s.nodes };
      children.forEach((cid: string, idx: number) => { const n = nodes[cid]; if (n && !isSection(n) && !isGridCell(n)) nodes[cid] = { ...(n as CanvasElement), layout: { ...(n as CanvasElement).layout, zIndex: idx } }; });
      nodes[cel.parent] = { ...parentNode, children } as AnyNode;
      return { ...s, nodes };
    });
  }, [push]);

  const updateResponsive = useCallback((id: string, bp: Breakpoint, updates: Partial<BreakpointOverride>) => {
    setState(s => {
      const el = s.nodes[id];
      if (!el || isSection(el) || isGridCell(el)) return s;
      const cel = el as CanvasElement;
      const key = bp === 'tablet' ? 'tablet' : 'mobile';
      const existing: BreakpointOverride = cel.responsive[key] ?? {};
      const merged: BreakpointOverride = {
        layout:     updates.layout     ? { ...existing.layout,     ...updates.layout     } : existing.layout,
        style:      updates.style      ? { typography: updates.style.typography ? { ...existing.style?.typography, ...updates.style.typography } : existing.style?.typography } : existing.style,
        state:      updates.state      ? { ...existing.state,      ...updates.state      } : existing.state,
        flexLayout: updates.flexLayout ? { ...existing.flexLayout, ...updates.flexLayout } : existing.flexLayout,
      };
      return { ...s, nodes: { ...s.nodes, [id]: { ...cel, responsive: { ...cel.responsive, [key]: merged } } } };
    });
  }, []);

  const addGridSection = useCallback((afterId?: string, columnSpans?: number[], atStart?: boolean) => {
    push(stateRef.current);
    const page = getActivePage(stateRef.current);
    const secId = newSectionId();
    const spans = columnSpans ?? [4, 4, 4];
    const cellIds = spans.map(() => newGridCellId());
    const sec = makeSection(secId, 'section', {
      label: `Grid Section ${page.sections.length + 1}`,
      layoutMode: 'grid',
      grid: { gap: 16, rowGap: 0, contentWidth: 'constrained', maxWidth: 1280 },
      children: cellIds,
    }, stateRef.current.theme.colors.sectionBg);
    setState(s => {
      const p = getActivePage(s);
      let sections: string[];
      if (atStart) { sections = [secId, ...p.sections]; }
      else if (!afterId) { sections = [...p.sections, secId]; }
      else { const idx = p.sections.indexOf(afterId); sections = [...p.sections]; sections.splice(idx + 1, 0, secId); }
      const newNodes = { ...s.nodes, [secId]: sec };
      spans.forEach((span, i) => { newNodes[cellIds[i]] = makeGridCell(cellIds[i], secId, span); });
      return { ...s, nodes: newNodes, pages: s.pages.map(pg => pg.id === p.id ? { ...pg, sections } : pg) };
    });
    setSelectedSectionId(secId);
    setSelectedGridCellId(null);
  }, [push]);

  const addSectionFromTemplate = useCallback((
    buildFn: (ids: TemplateIds, theme: SiteTheme) => TemplateResult,
    afterId?: string,
    atStart?: boolean,
  ) => {
    push(stateRef.current);
    const theme = stateRef.current.theme;
    console.log('[template] inserting with theme primary:', theme.colors.primary);
    const result = buildFn({ el: newId, cell: newGridCellId, sec: newSectionId }, theme);
    // Apply theme font to all text/button elements in the template
    const fontFamily = theme.fonts.body;
    Object.values(result.nodes).forEach(node => {
      if (node.type !== 'section' && node.type !== 'grid-cell' && node.type !== 'container') {
        const el = node as CanvasElement;
        if (el.style?.typography) el.style.typography.family = fontFamily;
      }
    });
    setState(s => {
      const p = getActivePage(s);
      let sections: string[];
      if (atStart) { sections = [result.sectionId, ...p.sections]; }
      else if (!afterId) { sections = [...p.sections, result.sectionId]; }
      else { const idx = p.sections.indexOf(afterId); sections = [...p.sections]; sections.splice(idx + 1, 0, result.sectionId); }
      return { ...s, nodes: { ...s.nodes, ...result.nodes }, pages: s.pages.map(pg => pg.id === p.id ? { ...pg, sections } : pg) };
    });
    setSelectedSectionId(result.sectionId);
    setSelectedGridCellId(null);
  }, [push]);

  // ── Grid cell ops ──────────────────────────────────────────────────

  const addGridCell = useCallback((parentId: string, columnSpan = 4, afterCellId?: string) => {
    push(stateRef.current);
    const cellId = newGridCellId();
    const cell = makeGridCell(cellId, parentId, columnSpan);
    setState(s => {
      const parent = s.nodes[parentId] as Section | GridCell | undefined;
      if (!parent) return s;
      let children: string[];
      if (afterCellId) {
        const idx = parent.children.indexOf(afterCellId);
        children = [...parent.children];
        children.splice(idx + 1, 0, cellId);
      } else {
        children = [...parent.children, cellId];
      }
      return { ...s, nodes: { ...s.nodes, [cellId]: cell, [parentId]: { ...parent, children } } };
    });
    setSelectedGridCellId(cellId);
  }, [push]);

  const updateGridCell = useCallback((id: string, updates: Partial<GridCell>) => {
    setState(s => {
      const cell = s.nodes[id] as GridCell | undefined;
      if (!cell || !isGridCell(cell)) return s;
      const merged: GridCell = { ...cell, ...updates };
      if (updates.responsive) {
        merged.responsive = {
          tablet: { ...cell.responsive.tablet, ...updates.responsive.tablet },
          mobile: { ...cell.responsive.mobile, ...updates.responsive.mobile },
        };
      }
      return { ...s, nodes: { ...s.nodes, [id]: merged } };
    });
  }, []);

  const deleteGridCell = useCallback((id: string) => {
    const node = stateRef.current.nodes[id];
    if (!node || !isGridCell(node)) return;
    const cell = node as GridCell;
    const parentId = cell.parent;
    const parentNode = stateRef.current.nodes[parentId];
    push(stateRef.current);
    setState(s => {
      const nodes = { ...s.nodes };
      removeGridCellNodes(nodes, cell);
      delete nodes[id];
      const parent = nodes[parentId] as Section | GridCell | undefined;
      if (parent) nodes[parentId] = { ...parent, children: parent.children.filter(c => c !== id) } as typeof parent;
      return { ...s, nodes };
    });
    setSelectedIds([]);
    // After delete: navigate to parent context so user keeps their place
    if (parentNode && isSection(parentNode)) {
      // Deleted a top-level cell — select the section
      setSelectedSectionId(parentId);
      setSelectedGridCellId(null);
    } else if (parentNode && isContainer(parentNode)) {
      // Deleted a sub-cell inside a container — select the container's parent cell
      const containerParentCellId = (parentNode as Container).parent;
      setSelectedGridCellId(containerParentCellId ?? null);
    } else {
      setSelectedGridCellId(null);
    }
  }, [push]);

  const reorderGridCell = useCallback((parentId: string, fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    push(stateRef.current);
    setState(s => {
      const parent = s.nodes[parentId] as Section | GridCell | Container | undefined;
      if (!parent) return s;
      if (parent.type === 'section' && (parent as Section).layoutMode !== 'grid') return s;
      // grid-cell: allow reorder for nested grids AND flex cells (when ColumnsBlocks are children)
      const children = [...(parent as { children: string[] }).children];
      const [moved] = children.splice(fromIndex, 1);
      children.splice(toIndex, 0, moved);
      return { ...s, nodes: { ...s.nodes, [parentId]: { ...parent, children } as AnyNode } };
    });
  }, [push]);

  // Add a column to an existing container without touching existing cell spans.
  const addContainerColumn = useCallback((containerId: string) => {
    const cellId = newGridCellId();
    push(stateRef.current);
    setState(s => {
      const nodes = { ...s.nodes };
      const c = nodes[containerId] as Container | undefined;
      if (!c || c.type !== 'container') return s;
      nodes[cellId] = makeGridCell(cellId, containerId, 4);
      nodes[containerId] = { ...c, children: [...c.children, cellId] };
      return { ...s, nodes };
    });
    setSelectedGridCellId(cellId);
  }, [push]);

  // Append a container (inline layout block) to a cell — never converts the whole cell.
  const addContainer = useCallback((cellId: string, mode: ContainerLayoutMode = 'grid', columnSpans?: number[]) => {
    const node = stateRef.current.nodes[cellId];
    if (!node || !isGridCell(node)) return;
    push(stateRef.current);
    const blockId = newColumnsId();
    const spans = columnSpans && columnSpans.length >= 2 ? columnSpans : [6, 6];
    const subIds = spans.map(() => newGridCellId());
    setState(s => {
      const nodes = { ...s.nodes };
      const c = nodes[cellId] as GridCell;
      nodes[blockId] = { id: blockId, type: 'container', parent: cellId, children: subIds, layoutMode: mode, gap: 8, rowGap: 0 } as Container;
      subIds.forEach((id, i) => {
        nodes[id] = makeGridCell(id, blockId, spans[i]);
      });
      nodes[cellId] = { ...c, children: [...c.children, blockId] };
      return { ...s, nodes };
    });
    setSelectedGridCellId(cellId);
  }, [push]);

  // Remove a container and all its sub-cell contents.
  const removeContainer = useCallback((blockId: string) => {
    const node = stateRef.current.nodes[blockId];
    if (!node || node.type !== 'container') return;
    const block = node as Container;
    push(stateRef.current);
    setState(s => {
      const nodes = { ...s.nodes };
      for (const subId of block.children) {
        const sub = nodes[subId] as GridCell | undefined;
        if (sub) { removeGridCellNodes(nodes, sub); delete nodes[subId]; }
      }
      const parentCell = nodes[block.parent] as GridCell | undefined;
      if (parentCell) nodes[block.parent] = { ...parentCell, children: parentCell.children.filter(id => id !== blockId) };
      delete nodes[blockId];
      return { ...s, nodes };
    });
    setSelectedIds([]);
    setSelectedGridCellId(block.parent);  // select parent cell so user keeps context
  }, [push]);

  const updateContainer = useCallback((id: string, updates: Partial<Pick<Container, 'layoutMode' | 'gap' | 'rowGap' | 'responsive'>>) => {
    setState(s => {
      const node = s.nodes[id];
      if (!node || !isContainer(node)) return s;
      return { ...s, nodes: { ...s.nodes, [id]: { ...node, ...updates } as Container } };
    });
  }, []);


  const moveGridElement = useCallback((
    elementId: string,
    sourceCellId: string,
    targetCellId: string,
    insertIndex: number,
    dropPos?: { x: number; y: number },
    sourceCellMode?: CellLayoutMode,
  ) => {
    const s = stateRef.current;
    const src = s.nodes[sourceCellId] as GridCell | undefined;
    const tgt = s.nodes[targetCellId] as GridCell | undefined;
    const el  = s.nodes[elementId]   as CanvasElement | undefined;
    if (!src || !tgt || !el) return;

    // Use caller-supplied effective mode (respects responsive overrides) when available
    const srcFree = sourceCellMode !== undefined ? sourceCellMode === 'free' : src.style.layoutMode === 'free';
    const tgtFree = tgt.style.layoutMode === 'free';

    push(s);
    setState(prev => {
      const nodes = { ...prev.nodes };
      const srcCell = nodes[sourceCellId] as GridCell;
      const tgtCell = nodes[targetCellId] as GridCell;
      const cel = nodes[elementId] as CanvasElement;

      // Adapt element layout based on source → target container mode change
      let updatedEl: CanvasElement = cel;
      if (sourceCellId !== targetCellId) {
        if (tgtFree && dropPos) {
          // Any → free: place at drop coordinates, keep existing width/height
          updatedEl = { ...cel, parent: targetCellId,
            layout: { ...cel.layout, x: Math.max(0, Math.round(dropPos.x)), y: Math.max(0, Math.round(dropPos.y)) },
          };
        } else if (srcFree && !tgtFree) {
          // Free → flex: reset to auto flex sizing, keep content dimensions
          updatedEl = { ...cel, parent: targetCellId,
            flexLayout: { widthMode: 'auto', widthValue: 0, flexGrow: 0, alignSelf: 'auto' },
          };
        } else {
          updatedEl = { ...cel, parent: targetCellId };
        }
        nodes[elementId] = updatedEl;
      } else if (tgtFree && dropPos) {
        // Within-cell move in free mode: update x/y
        nodes[elementId] = { ...cel, layout: { ...cel.layout,
          x: Math.max(0, Math.round(dropPos.x)), y: Math.max(0, Math.round(dropPos.y)) } };
      }

      if (sourceCellId === targetCellId) {
        if (!tgtFree) {
          // Flex reorder
          const children = [...srcCell.children];
          const fromIdx  = children.indexOf(elementId);
          if (fromIdx === -1) return prev;
          children.splice(fromIdx, 1);
          const idx = Math.max(0, Math.min(children.length, insertIndex > fromIdx ? insertIndex - 1 : insertIndex));
          children.splice(idx, 0, elementId);
          nodes[sourceCellId] = { ...srcCell, children };
        }
        // Free same-cell: only layout.x/y updated above, children order unchanged
      } else {
        nodes[sourceCellId] = { ...srcCell, children: srcCell.children.filter(id => id !== elementId) };
        const tgtChildren = [...tgtCell.children];
        if (!tgtFree) tgtChildren.splice(Math.max(0, Math.min(tgtChildren.length, insertIndex)), 0, elementId);
        else tgtChildren.push(elementId);
        nodes[targetCellId] = { ...tgtCell, children: tgtChildren };
      }
      return { ...prev, nodes };
    });
    setSelectedIds([elementId]);
    setSelectedGridCellId(targetCellId);
  }, [push]);

  const updateTheme = useCallback((updates: Partial<SiteTheme>) => {
    setState(s => ({ ...s, theme: { ...s.theme, ...updates } }));
  }, []);

  const importState = useCallback((raw: unknown) => {
    try { const migrated = migrateState(raw); push(stateRef.current); setState(migrated); setSelectedIds([]); setSelectedSectionId(null); setSelectedGridCellId(null); } catch { /* ignore */ }
  }, [push]);

  const handleUndo = useCallback(() => {
    const prev = undo(stateRef.current);
    if (prev) { setState(prev); setSelectedIds([]); setSelectedGridCellId(null); }
  }, [undo]);

  const handleRedo = useCallback(() => {
    const next = redo(stateRef.current);
    if (next) { setState(next); setSelectedIds([]); setSelectedGridCellId(null); }
  }, [redo]);

  const activePage = getActivePage(state);
  const allSections = activePage.sections.map(id => state.nodes[id] as Section).filter(Boolean);
  // Derive header/footer/sections for backward-compat with LayerPanel/LeftSidebar
  const header = allSections.find(s => s.role === 'header') ?? allSections[0];
  const footer = allSections.find(s => s.role === 'footer');
  const sections = allSections.filter(s => s !== header && s !== footer);

  return {
    state, nodes: state.nodes, elements: allElements, order: allOrder,
    header, sections, footer, allSections,
    pages: state.pages, activePageId: state.activePageId, activePage,
    selectedId, selectedIds, selectedSectionId, selectedGridCellId,
    setSelectedId, setSelectedIds, setSelectedSectionId, setSelectedGridCellId, toggleSelectedId,
    addPage, deletePage, renamePage, updatePageSlug, updatePageLayout, setActivePage, reorderPage,
    addSection, addGridSection, addSectionFromTemplate, deleteSection, promoteSection, updateSection, reorderSection, duplicateSection,
    addElement, addElementAt, addElementToCell, duplicateElement, copyElement, pasteElement,
    updateElement, updateElements, updateResponsive, pushSnapshot,
    deleteElement, deleteSelected, reorderElement, moveElementToSection, moveElementToGridCell,
    bringToFront, sendToBack, importState, updateTheme,
    addGridCell, updateGridCell, deleteGridCell, reorderGridCell, removeColumnsBlock: removeContainer, addContainer, addContainerColumn, updateContainer, moveGridElement,
    handleUndo, handleRedo, canUndo, canRedo, stateRef,
  };
}

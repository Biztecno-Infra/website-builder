import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  AnyNode, Breakpoint, BreakpointOverride, BuilderState, CanvasElement, ColumnStyle,
  ElementAnimation, ElementBackground, ElementContent, ElementInteraction, ElementLayout,
  ElementStyle, ElementType, NodeMap, Page, Section, SectionBackground, SectionRole,
  SiteTheme, TextAlign,
} from '../types';
import { useUndoRedo } from './useUndoRedo';

const STORAGE_KEY = 'microsite-builder-v5';
const LEGACY_KEYS = ['page-builder-v3', 'page-builder-v2', 'page-builder-v1'];
export const CANVAS_W = 1280;
export const SCHEMA_VERSION = '2.0';

let _idCounter = 0;
const newId = () => `el_${Date.now()}_${_idCounter++}`;
const newSectionId = () => `sec_${Date.now()}_${_idCounter++}`;
const newPageId = () => `page_${Date.now()}_${_idCounter++}`;

// ── Type guard ─────────────────────────────────────────────────────────

function isSection(node: AnyNode): node is Section {
  return (node as Section).type === 'section';
}

// ── Defaults ───────────────────────────────────────────────────────────

const DEFAULT_BG: ElementBackground = {
  type: 'solid', color: 'transparent', image: '', position: 'center',
  from: '#006e75', to: '#0b978e', angle: 135,
};

const DEFAULT_SECTION_BG: SectionBackground = {
  type: 'solid', color: '#ffffff', image: '', position: 'center',
  from: '#006e75', to: '#0b978e', angle: 135, overlay: 0,
};

const DEFAULT_STYLE: ElementStyle = {
  opacity: 1,
  background: { ...DEFAULT_BG },
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
  border: { radius: 0, width: 0, color: '#cccccc', style: 'solid' },
  shadow: { enabled: false, x: 4, y: 4, blur: 12, spread: 0, color: 'rgba(0,0,0,0.2)' },
  typography: { family: 'Inter, sans-serif', size: 16, weight: 'normal', color: '#333333', align: 'left', lineHeight: 1.5 },
};

const DEFAULT_CONTENT: ElementContent = {
  plain: 'Sample text', rich: '',
  src: '', alt: 'image', objectFit: 'cover',
  label: 'Button',
  videoUrl: '',
  iconName: '★', iconSize: 40,
};

const DEFAULT_INTERACTION: ElementInteraction = { linkUrl: '', linkTarget: '_self' };
const DEFAULT_ANIMATION: ElementAnimation = { type: 'none', trigger: 'load', duration: 600, delay: 0 };

export const DEFAULT_THEME: SiteTheme = {
  colors: { primary: '#006e75', secondary: '#0b978e', text: '#333333', background: '#ffffff', light: '#f5f5f5', accent: '#e74c3c' },
  fonts: { heading: 'Inter, sans-serif', body: 'Inter, sans-serif' },
};

// ── Factory helpers ────────────────────────────────────────────────────

function makeSection(id: string, role: SectionRole, partial?: Partial<Section>): Section {
  return {
    id, type: 'section', role,
    label: role === 'header' ? 'Header' : role === 'footer' ? 'Footer' : 'Section',
    layout: { height: role === 'header' ? 80 : role === 'footer' ? 100 : 400 },
    style: {
      background: { ...DEFAULT_SECTION_BG, color: role === 'footer' ? '#f5f5f5' : '#ffffff' },
      columns: { count: 1, widths: [], styles: {} },
    },
    children: [],
    ...partial,
  };
}

function createDefaultElement(type: ElementType, count: number, parentId: string, dropX?: number, dropY?: number): CanvasElement {
  const offset = (count % 8) * 20;
  const cx = Math.round(CANVAS_W / 2 - 100 + offset);
  const cy = Math.round(150 + offset);
  const id = newId();

  const base: CanvasElement = {
    id, type, parent: parentId,
    layout: { x: dropX ?? cx, y: dropY ?? cy, width: 200, height: 100, zIndex: count, rotation: 0 },
    style: { ...DEFAULT_STYLE, background: { ...DEFAULT_BG }, padding: { top: 0, right: 0, bottom: 0, left: 0 }, border: { radius: 0, width: 0, color: '#cccccc', style: 'solid' }, shadow: { enabled: false, x: 4, y: 4, blur: 12, spread: 0, color: 'rgba(0,0,0,0.2)' }, typography: { family: 'Inter, sans-serif', size: 16, weight: 'normal', color: '#333333', align: 'left', lineHeight: 1.5 } },
    content: { ...DEFAULT_CONTENT },
    interaction: { ...DEFAULT_INTERACTION },
    animation: { ...DEFAULT_ANIMATION },
    state: { hidden: false, locked: false },
    responsive: {},
  };

  switch (type) {
    case 'text':    return { ...base, layout: { ...base.layout, width: 220, height: 48 }, content: { ...base.content, plain: 'Click to edit text' } };
    case 'image':   return { ...base, layout: { ...base.layout, width: 240, height: 160 }, style: { ...base.style, background: { ...base.style.background, color: '#e2e8f0' } }, content: { ...base.content, src: 'https://placehold.co/240x160/e2e8f0/64748b?text=Image' } };
    case 'button':  return { ...base, layout: { ...base.layout, width: 140, height: 44 }, style: { ...base.style, background: { ...base.style.background, color: '#0B978E' }, border: { radius: 6, width: 0, color: '#cccccc', style: 'solid' }, typography: { ...base.style.typography, size: 15, weight: '600', color: '#ffffff', align: 'center' } }, content: { ...base.content, label: 'Click me' } };
    case 'box':     return { ...base, layout: { ...base.layout, width: 200, height: 160 }, style: { ...base.style, background: { ...base.style.background, color: '#f1f5f9' }, border: { radius: 0, width: 2, color: '#cbd5e1', style: 'solid' } } };
    case 'divider': return { ...base, layout: { ...base.layout, width: 400, height: 4 }, style: { ...base.style, background: { ...base.style.background, color: '#dddddd' }, border: { ...base.style.border, radius: 2 } } };
    case 'video':   return { ...base, layout: { ...base.layout, width: 400, height: 225 }, style: { ...base.style, background: { ...base.style.background, color: '#000000' } } };
    case 'spacer':  return { ...base, layout: { ...base.layout, width: 200, height: 60 } };
    case 'icon':    return { ...base, layout: { ...base.layout, width: 60, height: 60 }, style: { ...base.style, typography: { ...base.style.typography, color: '#006e75' } } };
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
  if (bp === 'desktop') return el;
  const override = bp === 'tablet' ? el.responsive.tablet : el.responsive.mobile;
  const lo = override?.layout;
  const typo = override?.style?.typography;
  const hidden = override?.state?.hidden;

  const layout: ElementLayout = {
    ...el.layout,
    x: lo?.x ?? (scale !== 1 ? Math.round(el.layout.x * scale) : el.layout.x),
    width: lo?.width ?? (scale !== 1 ? Math.max(20, Math.round(el.layout.width * scale)) : el.layout.width),
    y: lo?.y ?? el.layout.y,
    height: lo?.height ?? el.layout.height,
  };

  const typography = typo ? { ...el.style.typography, ...typo } : el.style.typography;
  const style = typo ? { ...el.style, typography } : el.style;

  return { ...el, layout, style, state: hidden !== undefined ? { ...el.state, hidden } : el.state };
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
      typography: { family: (r.fontFamily as string) ?? 'Inter, sans-serif', size: (r.fontSize as number) ?? 16, weight: (r.fontWeight as string) ?? 'normal', color: (r.color as string) ?? '#333333', align: (r.textAlign as TextAlign) ?? 'left', lineHeight: (r.lineHeight as number) ?? 1.5 },
    },
    content: { plain: (r.text as string) ?? '', rich: (r.richText as string) ?? '', src: (r.src as string) ?? '', alt: (r.alt as string) ?? 'image', objectFit: (r.objectFit as import('../types').ObjectFit) ?? 'cover', label: (r.label as string) ?? 'Button', videoUrl: (r.videoUrl as string) ?? '', iconName: (r.iconName as string) ?? '★', iconSize: (r.iconSize as number) ?? 40 },
    interaction: { linkUrl: (r.linkUrl as string) ?? '', linkTarget: (r.linkTarget as '_self' | '_blank') ?? '_self' },
    animation: { type: (r.animationType as import('../types').AnimationType) ?? 'none', trigger: (r.animationTrigger as import('../types').AnimationTrigger) ?? 'load', duration: (r.animationDuration as number) ?? 600, delay: (r.animationDelay as number) ?? 0 },
    state: { hidden: (r.hidden as boolean) ?? false, locked: (r.locked as boolean) ?? false },
    responsive: {
      tablet: r.responsiveTablet ? migrateOldBreakpoint(r.responsiveTablet as Record<string, unknown>) : undefined,
      mobile: r.responsiveMobile ? migrateOldBreakpoint(r.responsiveMobile as Record<string, unknown>) : undefined,
    },
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
  };
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
      pages.push({ id: pid, name: (p.name as string) ?? 'Page', slug: (p.slug as string) ?? '/', seo: { title: `${(p.name as string) ?? 'Page'} | My Site`, description: '', ogImage: '' }, header: headerId, footer: footerId, sections: pSections });
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
    pages = [{ id: pageId, name: 'Home', slug: '/', seo: { title: 'Home | My Site', description: '', ogImage: '' }, header: headerId, footer: footerId, sections: pSections }];
    activePageId = pageId;
  } else {
    const sectionId = newSectionId();
    nodes[sectionId] = migrateOldSection({ id: sectionId, elements: r.elements, order: r.order }, 'section', nodes);
    const pageId = newPageId();
    pages = [{ id: pageId, name: 'Home', slug: '/', seo: { title: 'Home | My Site', description: '', ogImage: '' }, header: headerId, footer: footerId, sections: [sectionId] }];
    activePageId = pageId;
  }

  const oldTheme = r.theme as Record<string, unknown> | undefined;
  const oldColors = oldTheme?.colors as string[] | undefined;
  const theme: SiteTheme = {
    colors: { primary: oldColors?.[0] ?? '#006e75', secondary: oldColors?.[1] ?? '#0b978e', text: oldColors?.[2] ?? '#333333', background: oldColors?.[3] ?? '#ffffff', light: oldColors?.[4] ?? '#f5f5f5', accent: oldColors?.[5] ?? '#e74c3c' },
    fonts: { heading: (oldTheme?.headingFont as string) ?? 'Inter, sans-serif', body: (oldTheme?.bodyFont as string) ?? 'Inter, sans-serif' },
  };

  return { schema: SCHEMA_VERSION, site: { name: 'My Site', favicon: '', language: 'en' }, theme, pages, activePageId, nodes };
}

export function migrateState(raw: unknown): BuilderState {
  if (!raw || typeof raw !== 'object') return makeEmpty();
  const r = raw as Record<string, unknown>;
  if (r.schema === '2.0' && r.nodes) {
    return { schema: SCHEMA_VERSION, site: { name: 'My Site', favicon: '', language: 'en', ...((r.site as object) ?? {}) }, theme: { ...DEFAULT_THEME, ...((r.theme as object) ?? {}) }, pages: (r.pages as Page[]) ?? [], activePageId: (r.activePageId as string) ?? '', nodes: (r.nodes as NodeMap) ?? {} };
  }
  if ((r.pages || r.sections || r.elements) && (r.header || r.sections || r.elements)) {
    return migrateFromOldFormat(r);
  }
  return makeEmpty();
}

function makeEmpty(): BuilderState {
  const pageId = newPageId();
  const headerId = newSectionId();
  const footerId = newSectionId();
  const sectionId = newSectionId();
  return {
    schema: SCHEMA_VERSION,
    site: { name: 'My Site', favicon: '', language: 'en' },
    theme: DEFAULT_THEME,
    pages: [{ id: pageId, name: 'Home', slug: '/', seo: { title: 'Home | My Site', description: '', ogImage: '' }, header: headerId, footer: footerId, sections: [sectionId] }],
    activePageId: pageId,
    nodes: { [headerId]: makeSection(headerId, 'header'), [footerId]: makeSection(footerId, 'footer'), [sectionId]: makeSection(sectionId, 'section', { label: 'Section 1' }) },
  };
}

function loadFromStorage(): BuilderState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return migrateState(JSON.parse(raw));
    for (const key of LEGACY_KEYS) { const old = localStorage.getItem(key); if (old) return migrateState(JSON.parse(old)); }
    return makeEmpty();
  } catch { return makeEmpty(); }
}

function saveToStorage(s: BuilderState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}

function getActivePage(state: BuilderState): Page {
  return state.pages.find(p => p.id === state.activePageId) ?? state.pages[0];
}

export function useBuilderStore() {
  const [state, setState] = useState<BuilderState>(loadFromStorage);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const { push, undo, redo, canUndo, canRedo } = useUndoRedo();

  const clipboard = useRef<CanvasElement | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const selectedIdsRef = useRef(selectedIds);
  selectedIdsRef.current = selectedIds;

  useEffect(() => { saveToStorage(state); }, [state]);

  const allElements = useMemo(() => {
    const map: Record<string, CanvasElement> = {};
    for (const [id, node] of Object.entries(state.nodes)) {
      if (!isSection(node)) map[id] = node as CanvasElement;
    }
    return map;
  }, [state]);

  const allOrder = useMemo(() => {
    const page = getActivePage(state);
    return [page.header, ...page.sections, page.footer].flatMap(secId => {
      const sec = state.nodes[secId] as Section | undefined;
      return sec?.children ?? [];
    });
  }, [state]);

  const selectedId = selectedIds.length === 1 ? selectedIds[0]
    : selectedIds.length > 1 ? selectedIds[selectedIds.length - 1] : null;

  const setSelectedId = useCallback((id: string | null) => {
    setSelectedIds(id ? [id] : []);
    if (id) {
      const el = stateRef.current.nodes[id];
      if (el && !isSection(el)) setSelectedSectionId((el as CanvasElement).parent);
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
    setState(s => ({ ...s, nodes: { ...s.nodes, [headerId]: makeSection(headerId, 'header'), [footerId]: makeSection(footerId, 'footer'), [sectionId]: makeSection(sectionId, 'section', { label: 'Section 1' }) }, pages: [...s.pages, { id: pageId, name: `Page ${n}`, slug: `/page-${n}`, seo: { title: `Page ${n} | My Site`, description: '', ogImage: '' }, header: headerId, footer: footerId, sections: [sectionId] }], activePageId: pageId }));
    setSelectedIds([]); setSelectedSectionId(null);
  }, [push]);

  const deletePage = useCallback((id: string) => {
    setState(s => {
      if (s.pages.length <= 1) return s;
      push(stateRef.current);
      const page = s.pages.find(p => p.id === id);
      if (!page) return s;
      const nodes = { ...s.nodes };
      for (const secId of [page.header, ...page.sections, page.footer]) {
        const sec = nodes[secId] as Section | undefined;
        if (sec) { for (const elId of sec.children) delete nodes[elId]; delete nodes[secId]; }
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
    const sec = makeSection(secId, 'section', { label: `Section ${page.sections.length + 1}` });
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

  const deleteSection = useCallback((id: string) => {
    setState(s => {
      const p = getActivePage(s);
      if (p.sections.length <= 1) return s;
      push(stateRef.current);
      const sec = s.nodes[id] as Section | undefined;
      const nodes = { ...s.nodes };
      if (sec) { for (const elId of sec.children) delete nodes[elId]; }
      delete nodes[id];
      return { ...s, nodes, pages: s.pages.map(pg => pg.id === p.id ? { ...pg, sections: pg.sections.filter(sid => sid !== id) } : pg) };
    });
    setSelectedSectionId(null);
  }, [push]);

  const updateSection = useCallback((id: string, updates: Partial<Section>) => {
    setState(s => {
      const sec = s.nodes[id] as Section | undefined;
      if (!sec) return s;
      return { ...s, nodes: { ...s.nodes, [id]: { ...sec, ...updates } } };
    });
  }, []);

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
      const newChildren = src.children.map(elId => {
        const newElId = newId();
        const el = nodes[elId] as CanvasElement | undefined;
        if (el) nodes[newElId] = { ...el, id: newElId, parent: newSecId };
        return newElId;
      });
      nodes[newSecId] = { ...src, id: newSecId, label: `${src.label} Copy`, children: newChildren };
      const sections = [...p.sections]; sections.splice(idx + 1, 0, newSecId);
      return { ...s, nodes, pages: s.pages.map(pg => pg.id === p.id ? { ...pg, sections } : pg) };
    });
  }, [push]);

  // ── Element ops ────────────────────────────────────────────────────

  const addElement = useCallback((type: ElementType) => {
    const s = stateRef.current;
    const page = getActivePage(s);
    const sectionId = selectedSectionId ?? page.sections[0];
    if (!sectionId) return;
    const sec = s.nodes[sectionId] as Section | undefined;
    if (!sec) return;
    const el = createDefaultElement(type, sec.children.length, sectionId);
    push(s);
    setState(prev => {
      const section = prev.nodes[sectionId] as Section | undefined;
      if (!section) return prev;
      return { ...prev, nodes: { ...prev.nodes, [el.id]: el, [sectionId]: { ...section, children: [...section.children, el.id] } } };
    });
    setSelectedIds([el.id]); setSelectedSectionId(sectionId);
  }, [push, selectedSectionId]);

  const addElementAt = useCallback((type: ElementType, x: number, y: number, sectionId: string) => {
    const s = stateRef.current;
    const sec = s.nodes[sectionId] as Section | undefined;
    if (!sec) return;
    const el = createDefaultElement(type, sec.children.length, sectionId, Math.round(x), Math.round(y));
    push(s);
    setState(prev => {
      const section = prev.nodes[sectionId] as Section | undefined;
      if (!section) return prev;
      return { ...prev, nodes: { ...prev.nodes, [el.id]: el, [sectionId]: { ...section, children: [...section.children, el.id] } } };
    });
    setSelectedIds([el.id]); setSelectedSectionId(sectionId);
  }, [push]);

  const updateElement = useCallback((id: string, updates: Partial<CanvasElement>) => {
    setState(s => {
      const el = s.nodes[id];
      if (!el || isSection(el)) return s;
      return { ...s, nodes: { ...s.nodes, [id]: { ...el, ...updates } } };
    });
  }, []);

  const updateElements = useCallback((updates: Array<{ id: string; changes: Partial<CanvasElement> }>) => {
    setState(s => {
      const nodes = { ...s.nodes };
      for (const { id, changes } of updates) {
        const el = nodes[id];
        if (!el || isSection(el)) continue;
        nodes[id] = { ...el, ...changes };
      }
      return { ...s, nodes };
    });
  }, []);

  const pushSnapshot = useCallback((snapshot: BuilderState) => { push(snapshot); }, [push]);

  const deleteElement = useCallback((id: string) => {
    const el = stateRef.current.nodes[id];
    if (!el || isSection(el)) return;
    const cel = el as CanvasElement;
    push(stateRef.current);
    setState(s => {
      const { [id]: _r, ...nodes } = s.nodes;
      const sec = nodes[cel.parent] as Section | undefined;
      if (sec) nodes[cel.parent] = { ...sec, children: sec.children.filter(c => c !== id) };
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
        if (!el || isSection(el)) continue;
        const cel = el as CanvasElement;
        const sec = nodes[cel.parent] as Section | undefined;
        if (sec) nodes[cel.parent] = { ...sec, children: sec.children.filter(c => c !== id) };
        delete nodes[id];
      }
      return { ...s, nodes };
    });
    setSelectedIds([]);
  }, [push]);

  const duplicateElement = useCallback((id: string) => {
    const el = stateRef.current.nodes[id];
    if (!el || isSection(el)) return;
    const cel = el as CanvasElement;
    const copy: CanvasElement = { ...cel, id: newId(), layout: { ...cel.layout, x: cel.layout.x + 20, y: cel.layout.y + 20, zIndex: cel.layout.zIndex + 1 } };
    push(stateRef.current);
    setState(s => {
      const sec = s.nodes[cel.parent] as Section | undefined;
      if (!sec) return s;
      return { ...s, nodes: { ...s.nodes, [copy.id]: copy, [cel.parent]: { ...sec, children: [...sec.children, copy.id] } } };
    });
    setSelectedIds([copy.id]);
  }, [push]);

  const copyElement = useCallback((id: string) => {
    const el = stateRef.current.nodes[id];
    if (el && !isSection(el)) clipboard.current = el as CanvasElement;
  }, []);

  const pasteElement = useCallback(() => {
    const el = clipboard.current;
    if (!el) return;
    const page = getActivePage(stateRef.current);
    const sectionId = selectedSectionId ?? page.sections[0];
    if (!sectionId) return;
    const sec = stateRef.current.nodes[sectionId] as Section | undefined;
    if (!sec) return;
    const copy: CanvasElement = { ...el, id: newId(), parent: sectionId, layout: { ...el.layout, x: el.layout.x + 20, y: el.layout.y + 20, zIndex: sec.children.length } };
    push(stateRef.current);
    setState(s => {
      const section = s.nodes[sectionId] as Section | undefined;
      if (!section) return s;
      return { ...s, nodes: { ...s.nodes, [copy.id]: copy, [sectionId]: { ...section, children: [...section.children, copy.id] } } };
    });
    setSelectedIds([copy.id]);
    clipboard.current = { ...el, layout: { ...el.layout, x: el.layout.x + 20, y: el.layout.y + 20 } };
  }, [push, selectedSectionId]);

  const reorderElement = useCallback((id: string, newIndex: number) => {
    const el = stateRef.current.nodes[id];
    if (!el || isSection(el)) return;
    const cel = el as CanvasElement;
    push(stateRef.current);
    setState(s => {
      const sec = s.nodes[cel.parent] as Section | undefined;
      if (!sec) return s;
      const children = sec.children.filter(c => c !== id);
      children.splice(Math.max(0, Math.min(children.length, newIndex)), 0, id);
      const nodes = { ...s.nodes };
      children.forEach((cid, idx) => { const n = nodes[cid]; if (n && !isSection(n)) nodes[cid] = { ...(n as CanvasElement), layout: { ...(n as CanvasElement).layout, zIndex: idx } }; });
      nodes[cel.parent] = { ...sec, children };
      return { ...s, nodes };
    });
  }, [push]);

  const moveElementToSection = useCallback((id: string, toSectionId: string, atIndex: number, pos?: { x: number; y: number }) => {
    const el = stateRef.current.nodes[id];
    if (!el || isSection(el)) return;
    const cel = el as CanvasElement;
    if (cel.parent === toSectionId) return;
    push(stateRef.current);
    setState(s => {
      const fromSec = s.nodes[cel.parent] as Section | undefined;
      const toSec = s.nodes[toSectionId] as Section | undefined;
      if (!fromSec || !toSec) return s;
      const updatedEl: CanvasElement = { ...cel, parent: toSectionId, layout: { ...cel.layout, x: pos?.x ?? cel.layout.x, y: pos?.y ?? 20 } };
      const fromChildren = fromSec.children.filter(c => c !== id);
      const toChildren = [...toSec.children];
      toChildren.splice(Math.max(0, Math.min(toChildren.length, atIndex)), 0, id);
      return { ...s, nodes: { ...s.nodes, [id]: updatedEl, [cel.parent]: { ...fromSec, children: fromChildren }, [toSectionId]: { ...toSec, children: toChildren } } };
    });
  }, [push]);

  const bringToFront = useCallback((id: string) => {
    const el = stateRef.current.nodes[id];
    if (!el || isSection(el)) return;
    const cel = el as CanvasElement;
    setState(s => {
      const sec = s.nodes[cel.parent] as Section | undefined;
      if (!sec) return s;
      const children = [...sec.children.filter(c => c !== id), id];
      const nodes = { ...s.nodes };
      children.forEach((cid, idx) => { const n = nodes[cid]; if (n && !isSection(n)) nodes[cid] = { ...(n as CanvasElement), layout: { ...(n as CanvasElement).layout, zIndex: idx } }; });
      nodes[cel.parent] = { ...sec, children };
      return { ...s, nodes };
    });
  }, []);

  const sendToBack = useCallback((id: string) => {
    const el = stateRef.current.nodes[id];
    if (!el || isSection(el)) return;
    const cel = el as CanvasElement;
    setState(s => {
      const sec = s.nodes[cel.parent] as Section | undefined;
      if (!sec) return s;
      const children = [id, ...sec.children.filter(c => c !== id)];
      const nodes = { ...s.nodes };
      children.forEach((cid, idx) => { const n = nodes[cid]; if (n && !isSection(n)) nodes[cid] = { ...(n as CanvasElement), layout: { ...(n as CanvasElement).layout, zIndex: idx } }; });
      nodes[cel.parent] = { ...sec, children };
      return { ...s, nodes };
    });
  }, []);

  const updateResponsive = useCallback((id: string, bp: Breakpoint, updates: Partial<BreakpointOverride>) => {
    setState(s => {
      const el = s.nodes[id];
      if (!el || isSection(el)) return s;
      const cel = el as CanvasElement;
      const key = bp === 'tablet' ? 'tablet' : 'mobile';
      const existing: BreakpointOverride = cel.responsive[key] ?? {};
      const merged: BreakpointOverride = {
        layout: updates.layout ? { ...existing.layout, ...updates.layout } : existing.layout,
        style: updates.style ? { typography: updates.style.typography ? { ...existing.style?.typography, ...updates.style.typography } : existing.style?.typography } : existing.style,
        state: updates.state ? { ...existing.state, ...updates.state } : existing.state,
      };
      return { ...s, nodes: { ...s.nodes, [id]: { ...cel, responsive: { ...cel.responsive, [key]: merged } } } };
    });
  }, []);

  const updateTheme = useCallback((updates: Partial<SiteTheme>) => {
    setState(s => ({ ...s, theme: { ...s.theme, ...updates } }));
  }, []);

  const importState = useCallback((raw: unknown) => {
    try { const migrated = migrateState(raw); push(stateRef.current); setState(migrated); setSelectedIds([]); setSelectedSectionId(null); } catch { /* ignore */ }
  }, [push]);

  const handleUndo = useCallback(() => {
    const prev = undo(stateRef.current);
    if (prev) { setState(prev); setSelectedIds([]); }
  }, [undo]);

  const handleRedo = useCallback(() => {
    const next = redo(stateRef.current);
    if (next) { setState(next); setSelectedIds([]); }
  }, [redo]);

  const activePage = getActivePage(state);
  const header = state.nodes[activePage.header] as Section;
  const footer = state.nodes[activePage.footer] as Section;
  const sections = activePage.sections.map(id => state.nodes[id] as Section).filter(Boolean);

  return {
    state, nodes: state.nodes, elements: allElements, order: allOrder,
    header, sections, footer,
    pages: state.pages, activePageId: state.activePageId, activePage,
    selectedId, selectedIds, selectedSectionId,
    setSelectedId, setSelectedIds, setSelectedSectionId, toggleSelectedId,
    addPage, deletePage, renamePage, updatePageSlug, setActivePage, reorderPage,
    addSection, deleteSection, updateSection, reorderSection, duplicateSection,
    addElement, addElementAt, duplicateElement, copyElement, pasteElement,
    updateElement, updateElements, updateResponsive, pushSnapshot,
    deleteElement, deleteSelected, reorderElement, moveElementToSection,
    bringToFront, sendToBack, importState, updateTheme,
    handleUndo, handleRedo, canUndo, canRedo, stateRef,
  };
}

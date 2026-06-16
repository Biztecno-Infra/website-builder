import type {
  BgType, BorderStyle, BreakpointOverride, BuilderState,
  CanvasElement, ColumnStyle, ElementType, NodeMap, ObjectFit, Page, SectionRole, SiteTheme, TextAlign, TextTransform,
} from '../types';
import { DEFAULT_FLEX_LAYOUT, DEFAULT_THEME, interactionToAction } from './builderDefaults';
import { hydrateNodes } from './sparse';
import { newPageId, newSectionId } from './ids';
import { makeSection } from './nodeHelpers';

export const SCHEMA_VERSION = '2.0';

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
      background: { type: (r.backgroundType as BgType) ?? 'solid', color: (r.backgroundColor as string) ?? 'transparent', image: (r.backgroundImage as string) ?? '', position: (r.backgroundPosition as string) ?? 'center', from: (r.gradientFrom as string) ?? '#006e75', to: (r.gradientTo as string) ?? '#0b978e', angle: (r.gradientAngle as number) ?? 135 },
      padding: { top: (r.paddingTop as number) ?? 0, right: (r.paddingRight as number) ?? 0, bottom: (r.paddingBottom as number) ?? 0, left: (r.paddingLeft as number) ?? 0 },
      border: { radius: (r.borderRadius as number) ?? 0, width: (r.borderWidth as number) ?? 0, color: (r.borderColor as string) ?? '#cccccc', style: (r.borderStyle as BorderStyle) ?? 'solid' },
      shadow: { enabled: (r.shadowEnabled as boolean) ?? false, x: (r.shadowX as number) ?? 4, y: (r.shadowY as number) ?? 4, blur: (r.shadowBlur as number) ?? 12, spread: (r.shadowSpread as number) ?? 0, color: (r.shadowColor as string) ?? 'rgba(0,0,0,0.2)' },
      typography: { family: (r.fontFamily as string) ?? 'Inter, sans-serif', size: (r.fontSize as number) ?? 16, weight: (r.fontWeight as string) ?? 'normal', color: (r.color as string) ?? '#333333', align: (r.textAlign as TextAlign) ?? 'left', lineHeight: (r.lineHeight as number) ?? 1.5, letterSpacing: 0, textTransform: 'none' as TextTransform },
    },
    content: { plain: (r.text as string) ?? '', rich: (r.richText as string) ?? '', src: (r.src as string) ?? '', alt: (r.alt as string) ?? 'image', objectFit: (r.objectFit as ObjectFit) ?? 'cover', label: (r.label as string) ?? 'Button', videoUrl: (r.videoUrl as string) ?? '', iconName: (r.iconName as string) ?? '★', iconSize: (r.iconSize as number) ?? 40 },
    interaction: { type: 'link', linkUrl: (r.linkUrl as string) ?? '', linkTarget: (r.linkTarget as '_self' | '_blank') ?? '_self', smoothScroll: false },
    state: { hidden: (r.hidden as boolean) ?? false, locked: (r.locked as boolean) ?? false },
    responsive: {
      tablet: r.responsiveTablet ? migrateOldBreakpoint(r.responsiveTablet as Record<string, unknown>) : undefined,
      mobile: r.responsiveMobile ? migrateOldBreakpoint(r.responsiveMobile as Record<string, unknown>) : undefined,
    },
    flexLayout: { ...DEFAULT_FLEX_LAYOUT },
  };
}

function migrateOldSection(r: Record<string, unknown>, role: SectionRole, nodes: NodeMap): import('../types').Section {
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
    newStyles[idx] = { background: { type: (c.backgroundType as BgType) ?? 'solid', color: (c.backgroundColor as string) ?? '#ffffff', image: (c.backgroundImage as string) ?? '', position: 'center', from: (c.gradientFrom as string) ?? '#006e75', to: (c.gradientTo as string) ?? '#0b978e', angle: (c.gradientAngle as number) ?? 135, overlay: (c.backgroundOverlay as number) ?? 0 } };
  }
  return {
    id, type: 'section', role,
    label: (r.label as string) ?? (role === 'header' ? 'Header' : role === 'footer' ? 'Footer' : 'Section'),
    layout: { height: (r.height as number) ?? (role === 'header' ? 80 : role === 'footer' ? 100 : 400) },
    style: {
      background: { type: (r.backgroundType as BgType) ?? 'solid', color: (r.backgroundColor as string) ?? '#ffffff', image: (r.backgroundImage as string) ?? '', position: 'center', from: (r.gradientFrom as string) ?? '#006e75', to: (r.gradientTo as string) ?? '#0b978e', angle: (r.gradientAngle as number) ?? 135, overlay: (r.backgroundOverlay as number) ?? 0 },
      columns: { count: (r.columns as number) ?? 1, widths: (r.columnWidths as number[]) ?? [], styles: newStyles },
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
    },
    children: order,
    layoutMode: 'free',
  } as import('../types').Section;
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
    fonts: { body: (oldTheme?.bodyFont as string) ?? ((oldTheme as Record<string, unknown>)?.fonts as Record<string, unknown>)?.body as string ?? 'Inter, sans-serif' },
  };

  for (const node of Object.values(nodes)) {
    if (node.type !== 'section' && node.type !== 'grid-cell' && node.type !== 'container') {
      const el = node as CanvasElement;
      if (!el.action || el.action.type === 'none') {
        const migrated = interactionToAction(el.interaction);
        if (migrated) el.action = migrated;
      }
    }
  }
  return { schema: SCHEMA_VERSION, site: { name: 'My Site', favicon: '', language: 'en' }, theme, pages, activePageId, nodes };
}

export function migrateState(raw: unknown): BuilderState {
  if (!raw || typeof raw !== 'object') return makeEmpty();
  const r = raw as Record<string, unknown>;
  if (r.schema === '2.0' && r.nodes) {
    const nodes = hydrateNodes(r.nodes as Record<string, unknown>);
    const rt = (r.theme as Partial<SiteTheme> | undefined);
    const mergedTheme: SiteTheme = { ...DEFAULT_THEME, ...rt, colors: { ...DEFAULT_THEME.colors, ...(rt?.colors ?? {}) }, fonts: { ...DEFAULT_THEME.fonts, ...(rt?.fonts ?? {}) } };
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

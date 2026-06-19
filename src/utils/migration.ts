import type { BuilderState, Page, SiteTheme } from '../types';
import { DEFAULT_THEME } from './builderDefaults';
import { hydrateNodes } from './sparse';
import { newPageId, newSectionId } from './ids';
import { makeSection } from './nodeHelpers';

const SCHEMA_VERSION = '2.0';

export function migrateState(raw: unknown): BuilderState {
  if (!raw || typeof raw !== 'object') return makeEmpty();
  const r = raw as Record<string, unknown>;
  if (!r.nodes || !r.pages) return makeEmpty();

  const nodes = hydrateNodes(r.nodes as Record<string, unknown>);
  const rt = r.theme as Partial<SiteTheme> | undefined;
  const theme: SiteTheme = {
    ...DEFAULT_THEME,
    ...rt,
    colors: { ...DEFAULT_THEME.colors, ...(rt?.colors ?? {}) },
    fonts:  { ...DEFAULT_THEME.fonts,  ...(rt?.fonts  ?? {}) },
  };

  return {
    schema: SCHEMA_VERSION,
    site: { name: 'My Site', favicon: '', language: 'en', ...((r.site as object) ?? {}) },
    theme,
    pages: (r.pages as Page[]) ?? [],
    activePageId: (r.activePageId as string) ?? '',
    nodes,
  };
}

export function makeEmpty(): BuilderState {
  const pageId    = newPageId();
  const headerId  = newSectionId();
  const sectionId = newSectionId();
  const footerId  = newSectionId();
  return {
    schema: SCHEMA_VERSION,
    site: { name: 'My Site', favicon: '', language: 'en' },
    theme: DEFAULT_THEME,
    pages: [{ id: pageId, name: 'Home', slug: '/', seo: { title: 'Home | My Site', description: '', ogImage: '' }, sections: [headerId, sectionId, footerId] }],
    activePageId: pageId,
    nodes: {
      [headerId]:  makeSection(headerId,  'header'),
      [footerId]:  makeSection(footerId,  'footer'),
      [sectionId]: makeSection(sectionId, 'section', { label: 'Section 1' }),
    },
  };
}

import { useCallback, type Dispatch, type MutableRefObject, type SetStateAction } from 'react';
import type { BuilderState, Section } from '../types';
import { newPageId, newSectionId } from '../utils/ids';
import { makeSection, removeNodesForSection } from '../utils/nodeHelpers';

function activePage(s: BuilderState) {
  return s.pages.find(p => p.id === s.activePageId) ?? s.pages[0];
}

export function usePageOps(
  stateRef: MutableRefObject<BuilderState>,
  setState: Dispatch<SetStateAction<BuilderState>>,
  push: (s: BuilderState) => void,
  setSelectedIds: Dispatch<SetStateAction<string[]>>,
  setSelectedSectionId: Dispatch<SetStateAction<string | null>>,
  setSelectedGridCellId: Dispatch<SetStateAction<string | null>>,
) {
  const addPage = useCallback(() => {
    const n = stateRef.current.pages.length + 1;
    const pageId = newPageId();
    const headerId = newSectionId(); const footerId = newSectionId(); const sectionId = newSectionId();
    push(stateRef.current);
    setState(s => ({
      ...s,
      nodes: {
        ...s.nodes,
        [headerId]: makeSection(headerId, 'header'),
        [footerId]: makeSection(footerId, 'footer'),
        [sectionId]: makeSection(sectionId, 'section', { label: 'Section 1' }),
      },
      pages: [...s.pages, {
        id: pageId, name: `Page ${n}`, slug: `/page-${n}`,
        seo: { title: `Page ${n} | My Site`, description: '', ogImage: '' },
        sections: [headerId, sectionId, footerId],
      }],
      activePageId: pageId,
    }));
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

  const updatePageLayout = useCallback((id: string, layoutWidth: 'fixed' | 'fluid', maxWidth?: number) => {
    setState(s => ({
      ...s,
      pages: s.pages.map(p => p.id === id ? { ...p, layoutWidth, ...(maxWidth !== undefined ? { maxWidth } : {}) } : p),
    }));
  }, []);

  const setActivePage = useCallback((id: string) => {
    setState(s => ({ ...s, activePageId: id }));
    setSelectedIds([]); setSelectedSectionId(null); setSelectedGridCellId(null);
  }, []);

  void activePage; // used in addPage/deletePage via stateRef.current

  return { addPage, deletePage, renamePage, updatePageLayout, setActivePage };
}

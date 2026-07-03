import { useCallback, type Dispatch, type MutableRefObject, type SetStateAction } from 'react';
import type { BuilderState, Container, GridCell, Section, SectionUpdate, SiteTheme } from '../types';
import type { TemplateIds, TemplateResult } from '../data/sectionTemplates';
import { newGridCellId, newSectionId, newColumnsId, newId } from '../utils/ids';
import {
  isSection, makeSection, makeGridCell,
  removeNodesForSection,
} from '../utils/nodeHelpers';
import { CanvasElement } from '../types';

function getActivePage(s: BuilderState) {
  return s.pages.find(p => p.id === s.activePageId) ?? s.pages[0];
}

export function useSectionOps(
  stateRef: MutableRefObject<BuilderState>,
  setState: Dispatch<SetStateAction<BuilderState>>,
  push: (s: BuilderState) => void,
  setSelectedIds: Dispatch<SetStateAction<string[]>>,
  setSelectedSectionId: Dispatch<SetStateAction<string | null>>,
  setSelectedGridCellId: Dispatch<SetStateAction<string | null>>,
) {
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

  const promoteSection = useCallback((id: string, role: 'header' | 'footer' | 'section') => {
    push(stateRef.current);
    setState(s => {
      const p = getActivePage(s);
      const nodes = { ...s.nodes };
      for (const secId of p.sections) {
        const sec = nodes[secId] as Section | undefined;
        if (sec && sec.role === role && secId !== id) { nodes[secId] = { ...sec, role: 'section' }; }
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

  // `opts.preserveContent` (free → grid only): instead of discarding the free
  // section's existing children, reparent them all into the first grid cell so
  // no element / styling / order is lost during the conversion.
  const updateSection = useCallback((id: string, updates: SectionUpdate, opts?: { preserveContent?: boolean }) => {
    const newMode = updates.layoutMode;
    if (newMode !== undefined) {
      const currentNode = stateRef.current.nodes[id];
      const currentMode = (isSection(currentNode) ? currentNode.layoutMode : undefined) ?? 'free';
      if (newMode !== currentMode) {
        push(stateRef.current);
        // Pre-generate cell ids so selection can target cell 1 without depending
        // on the (lazily-run) state updater having executed first.
        const c1 = newGridCellId(), c2 = newGridCellId(), c3 = newGridCellId();
        setState(s => {
          const node = s.nodes[id];
          if (!node || !isSection(node)) return s;
          const nodes = { ...s.nodes };
          const preserve =
            opts?.preserveContent === true &&
            newMode === 'grid' &&
            currentMode === 'free' &&
            node.children.length > 0;

          if (preserve) {
            // Carry the existing free children into the first grid cell. The
            // old child nodes are NOT removed — they are reparented to cell 1,
            // keeping their configuration, styling and order intact.
            const movedChildren = [...node.children];
            nodes[c1] = { ...makeGridCell(c1, id, 4), children: movedChildren };
            nodes[c2] = makeGridCell(c2, id, 4);
            nodes[c3] = makeGridCell(c3, id, 4);
            movedChildren.forEach(childId => {
              const child = nodes[childId];
              if (!child) return;
              if (child.type === 'section' || child.type === 'grid-cell') return;
              if (child.type === 'carousel' || child.type === 'accordion') {
                // Containers without a flex layout — just reparent.
                nodes[childId] = { ...child, parent: c1 };
                return;
              }
              // CanvasElement: normalise the free-positioned element for in-cell
              // flow exactly as a drag from a free section into a cell would.
              const cel = child as CanvasElement;
              nodes[childId] = {
                ...cel, parent: c1,
                layout: { ...cel.layout, x: 0, y: 0, zIndex: 0, rotation: 0 },
                flexLayout: { ...cel.flexLayout, widthMode: 'fixed', widthValue: cel.layout.width },
                responsive: {
                  tablet: cel.responsive.tablet ? { ...cel.responsive.tablet, layout: undefined } : cel.responsive.tablet,
                  mobile: cel.responsive.mobile ? { ...cel.responsive.mobile, layout: undefined } : cel.responsive.mobile,
                },
              };
            });
            nodes[id] = { ...node, ...updates, children: [c1, c2, c3] } as Section;
            return { ...s, nodes };
          }

          removeNodesForSection(nodes, node);
          if (newMode === 'grid') {
            nodes[c1] = makeGridCell(c1, id, 4);
            nodes[c2] = makeGridCell(c2, id, 4);
            nodes[c3] = makeGridCell(c3, id, 4);
            nodes[id] = { ...node, ...updates, children: [c1, c2, c3] } as Section;
          } else {
            nodes[id] = { ...node, ...updates, children: [] } as Section;
          }
          return { ...s, nodes };
        });
        setSelectedIds([]);
        // When preserving content, keep cell 1 selected so the moved elements
        // stay visible/in focus; otherwise clear the grid-cell selection.
        const willPreserve =
          opts?.preserveContent === true && newMode === 'grid' && currentMode === 'free';
        setSelectedGridCellId(willPreserve ? c1 : null);
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
      if (src.layoutMode === 'grid' || src.layoutMode === 'flex') {
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
        newChildren = src.children.flatMap(elId => {
          const el = nodes[elId] as CanvasElement | undefined;
          if (!el) return [];
          const newElId = newId();
          nodes[newElId] = { ...el, id: newElId, parent: newSecId };
          return [newElId];
        });
      }
      nodes[newSecId] = { ...src, id: newSecId, label: `${src.label} Copy`, children: newChildren };
      const sections = [...p.sections]; sections.splice(idx + 1, 0, newSecId);
      return { ...s, nodes, pages: s.pages.map(pg => pg.id === p.id ? { ...pg, sections } : pg) };
    });
  }, [push]);

  const addGridSection = useCallback((afterId?: string, columnSpans?: number[], atStart?: boolean) => {
    push(stateRef.current);
    const page = getActivePage(stateRef.current);
    const secId = newSectionId();
    const spans = columnSpans ?? [4, 4, 4];
    const cellIds = spans.map(() => newGridCellId());
    const sec = makeSection(secId, 'section', {
      label: `Grid Section ${page.sections.length + 1}`,
      layoutMode: 'grid',
      grid: { gap: 16, rowGap: 0, contentWidth: 'full' },
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
    const result = buildFn({ el: newId, cell: newGridCellId, sec: newSectionId }, theme);
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

  return {
    addSection, addGridSection, addSectionFromTemplate,
    promoteSection, deleteSection, updateSection, reorderSection, duplicateSection,
  };
}

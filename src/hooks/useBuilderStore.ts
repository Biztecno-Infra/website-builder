import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { TemplateIds, TemplateResult } from '../data/sectionTemplates';
import type {
  AnyNode, Breakpoint, BreakpointOverride, BuilderState, CanvasElement, CellLayoutMode,
  Container, ContainerLayoutMode, ElementLayout, ElementType, FreeSection, GridCell,
  GridSection, NodeMap, Page, Section, SectionUpdate, SiteTheme,
} from '../types';
import { useUndoRedo } from './useUndoRedo';
import { sparsifyNodes } from '../utils/sparse';
import { newId, newSectionId, newPageId, newGridCellId, newColumnsId } from '../utils/ids';
import {
  isContainer, isSection, isGridCell, isGridSection, isFreeSection,
  makeSection, makeGridCell, removeGridCellNodes, removeNodesForSection, removeFromParent, appendToParent,
} from '../utils/nodeHelpers';
import { CANVAS_W, createDefaultElement } from '../utils/elementDefaults';
import { migrateState, makeEmpty } from '../utils/migration';

export {
  DEFAULT_BG, DEFAULT_SECTION_BG, DEFAULT_STYLE, DEFAULT_CONTENT,
  DEFAULT_INTERACTION, DEFAULT_ANIMATION, DEFAULT_THEME, DEFAULT_FLEX_LAYOUT, DEFAULT_GRID_CELL_STYLE,
} from '../utils/builderDefaults';
export { CANVAS_W } from '../utils/elementDefaults';
export { equalWidths } from '../utils/nodeHelpers';
export { migrateState, makeEmpty } from '../utils/migration';

const STORAGE_KEY = 'microsite-builder-v5';
const LEGACY_KEYS = ['page-builder-v3', 'page-builder-v2', 'page-builder-v1'];

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
  // Dividers are thin lines and may legitimately be a few px on either axis, so
  // they bypass the usual 20px scaled-width floor applied to other elements.
  const minScaledW = el.type === 'divider' ? 1 : 20;
  const layout: ElementLayout = {
    ...el.layout,
    x:      slo?.x      ?? flo?.x      ?? (scale !== 1 ? Math.round(el.layout.x * scale)                          : el.layout.x),
    y:      slo?.y      ?? flo?.y      ?? el.layout.y,
    width:  slo?.width  ?? flo?.width  ?? (scale !== 1 ? Math.max(minScaledW, Math.round(el.layout.width * scale)) : el.layout.width),
    height: slo?.height ?? flo?.height ?? (scale !== 1 ? Math.max(1,           Math.round(el.layout.height * scale)): el.layout.height),
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

function loadFromStorage(): BuilderState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return migrateState(JSON.parse(raw));
    for (const key of LEGACY_KEYS) { const old = localStorage.getItem(key); if (old) return migrateState(JSON.parse(old)); }
    return makeEmpty();  // fresh install → clean empty canvas
  } catch { return makeEmpty(); }
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
  const [selectedContainerId, setSelectedContainerId] = useState<string | null>(null);
  const { push, undo, redo, canUndo, canRedo } = useUndoRedo();

  const clipboard = useRef<CanvasElement | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const selectedIdsRef = useRef(selectedIds);
  selectedIdsRef.current = selectedIds;
  const selectedGridCellIdRef = useRef(selectedGridCellId);
  selectedGridCellIdRef.current = selectedGridCellId;

  useEffect(() => { saveToStorage(state); }, [state]);

  // Clear selectedContainerId if the node was removed (e.g. after undo)
  useEffect(() => {
    if (selectedContainerId && !state.nodes[selectedContainerId]) {
      setSelectedContainerId(null);
    }
  }, [state.nodes, selectedContainerId]);

  const allElements = useMemo(() => {
    const map: Record<string, CanvasElement> = {};
    for (const [id, node] of Object.entries(state.nodes)) {
      if (!isSection(node) && !isGridCell(node) && !isContainer(node)) map[id] = node as CanvasElement;
    }
    return map;
  }, [state]);



  // null when multi-select is active so the sidebar doesn't show a single element panel
  const selectedId = selectedIds.length === 1 ? selectedIds[0] : null;

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

  const updatePageLayout = useCallback((id: string, layoutWidth: 'fixed' | 'fluid', maxWidth?: number) => {
    setState(s => ({ ...s, pages: s.pages.map(p => p.id === id ? { ...p, layoutWidth, ...(maxWidth !== undefined ? { maxWidth } : {}) } : p) }));
  }, []);

  const setActivePage = useCallback((id: string) => {
    setState(s => ({ ...s, activePageId: id }));
    setSelectedIds([]); setSelectedSectionId(null); setSelectedGridCellId(null);
  }, []);

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
          removeNodesForSection(nodes, node);
          if (newMode === 'grid') {
            const c1 = newGridCellId(), c2 = newGridCellId(), c3 = newGridCellId();
            nodes[c1] = makeGridCell(c1, id, 4);
            nodes[c2] = makeGridCell(c2, id, 4);
            nodes[c3] = makeGridCell(c3, id, 4);
            nodes[id] = { ...node, ...updates, children: [c1, c2, c3] } as Section;
          } else {
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

  // ── Grid cell clipboard ─────────────────────────────────────────────

  const cellClipboard = useRef<{ cell: GridCell; nodes: NodeMap } | null>(null);
  const [hasCellClipboard, setHasCellClipboard] = useState(false);

  const copyGridCell = useCallback((id: string) => {
    const s = stateRef.current;
    const src = s.nodes[id] as GridCell | undefined;
    if (!src || !isGridCell(src)) return;
    const clipped: NodeMap = {};
    const collect = (nodeId: string) => {
      const node = s.nodes[nodeId];
      if (!node) return;
      clipped[nodeId] = node;
      if (isGridCell(node) || isContainer(node)) (node as GridCell | Container).children.forEach(collect);
    };
    collect(id);
    cellClipboard.current = { cell: src, nodes: clipped };
    setHasCellClipboard(true);
  }, []);

  const pasteGridCellIntoSection = useCallback((sectionId: string, afterCellId?: string) => {
    const clip = cellClipboard.current;
    if (!clip) return;
    push(stateRef.current);
    setState(s => {
      const sec = s.nodes[sectionId] as Section | undefined;
      if (!sec || !isSection(sec) || sec.layoutMode !== 'grid') return s;
      const newCellId = newGridCellId();
      const idMap: Record<string, string> = { [clip.cell.id]: newCellId };
      const newNodes: NodeMap = {};
      const remapNode = (oldId: string, newParentId: string): string => {
        const node = clip.nodes[oldId];
        if (!node) return '';
        let mid = idMap[oldId];
        if (!mid) { mid = isGridCell(node) ? newGridCellId() : isContainer(node) ? newColumnsId() : newId(); idMap[oldId] = mid; }
        if (isGridCell(node) || isContainer(node)) {
          const children = (node as GridCell | Container).children.map(cid => remapNode(cid, mid)).filter(Boolean);
          newNodes[mid] = { ...node, id: mid, parent: newParentId, children } as AnyNode;
        } else {
          newNodes[mid] = { ...node, id: mid, parent: newParentId } as AnyNode;
        }
        return mid;
      };
      remapNode(clip.cell.id, sectionId);
      let children = [...sec.children];
      if (afterCellId) {
        const idx = children.indexOf(afterCellId);
        if (idx === -1) return s;
        children.splice(idx + 1, 0, newCellId);
      } else {
        children.push(newCellId);
      }
      const nodes = { ...s.nodes, ...newNodes };
      // Preserve existing cells' columnSpan — pasted cell keeps its original span.
      // The section usage badge will show if total exceeds 12; user can use Equal to fix.
      nodes[sectionId] = { ...sec, children } as AnyNode;
      return { ...s, nodes };
    });
  }, [push]);

  const pasteIntoGridCell = useCallback((targetCellId: string) => {
    const clip = cellClipboard.current;
    if (!clip) return;
    push(stateRef.current);
    setState(s => {
      const target = s.nodes[targetCellId] as GridCell | undefined;
      if (!target || !isGridCell(target)) return s;
      const idMap: Record<string, string> = {};
      const newNodes: NodeMap = {};
      const remapNode = (oldId: string, newParentId: string): string => {
        const node = clip.nodes[oldId];
        if (!node) return '';
        let mid = idMap[oldId];
        if (!mid) { mid = isGridCell(node) ? newGridCellId() : isContainer(node) ? newColumnsId() : newId(); idMap[oldId] = mid; }
        if (isGridCell(node) || isContainer(node)) {
          const children = (node as GridCell | Container).children.map(cid => remapNode(cid, mid)).filter(Boolean);
          newNodes[mid] = { ...node, id: mid, parent: newParentId, children } as AnyNode;
        } else {
          newNodes[mid] = { ...node, id: mid, parent: newParentId } as AnyNode;
        }
        return mid;
      };
      const newChildren = clip.cell.children.map(cid => remapNode(cid, targetCellId)).filter(Boolean);
      // Remove old children from nodes
      const nodes = { ...s.nodes };
      const collectOld = (nodeId: string) => {
        delete nodes[nodeId];
        const node = s.nodes[nodeId];
        if (node && 'children' in node) (node as { children: string[] }).children.forEach(collectOld);
      };
      target.children.forEach(collectOld);
      Object.assign(nodes, newNodes);
      nodes[targetCellId] = { ...target, children: newChildren } as AnyNode;
      return { ...s, nodes };
    });
  }, [push]);

  // ── Element ops ────────────────────────────────────────────────────

  const addElementToCell = useCallback((type: ElementType, cellId: string, x = 0, y = 0) => {
    const s = stateRef.current;
    const cell = s.nodes[cellId] as GridCell | undefined;
    if (!cell) return;
    const hasButton = type === 'button' && cell.children.some(id => s.nodes[id]?.type === 'button');
    const theme = stateRef.current.theme;
    // Pre-build element for id; zIndex is overwritten inside setState from live state to avoid race
    const el = createDefaultElement(type, cell.children.length, cellId, x, y, theme, hasButton);
    push(s);
    setState(prev => {
      const c = prev.nodes[cellId] as GridCell | undefined;
      if (!c) return prev;
      const fixed = { ...el, layout: { ...el.layout, zIndex: c.children.length } };
      return { ...prev, nodes: { ...prev.nodes, [el.id]: fixed, [cellId]: { ...c, children: [...c.children, el.id] } } };
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
      const nodes = { ...s.nodes, [cellId]: cell, [parentId]: { ...parent, children } };
      // Redistribute spans for grid-layout parents (top-level grid sections + grid-mode containers)
      const shouldRedistribute = isSection(parent) ||
        (isContainer(parent) && (parent as Container).layoutMode === 'grid');
      if (shouldRedistribute) {
        const n = children.length;
        const base = Math.floor(12 / n);
        const extra = 12 % n;
        children.forEach((cid, i) => {
          const c = nodes[cid] as GridCell;
          if (c) nodes[cid] = { ...c, columnSpan: i < extra ? base + 1 : base };
        });
      }
      return { ...s, nodes };
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
      if (parent) {
        const remaining = parent.children.filter(c => c !== id);
        nodes[parentId] = { ...parent, children: remaining } as typeof parent;
        const shouldRedistribute = isSection(parent) ||
          (isContainer(parent) && (parent as Container).layoutMode === 'grid');
        if (shouldRedistribute && remaining.length > 0) {
          const n = remaining.length;
          const base = Math.floor(12 / n);
          const extra = 12 % n;
          remaining.forEach((cid, i) => {
            const c = nodes[cid] as GridCell;
            if (c) nodes[cid] = { ...c, columnSpan: i < extra ? base + 1 : base };
          });
        }
      }
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

    push(s);
    setState(prev => {
      const nodes = { ...prev.nodes };
      const srcCell = nodes[sourceCellId] as GridCell;
      const tgtCell = nodes[targetCellId] as GridCell;
      const cel = nodes[elementId] as CanvasElement;

      if (sourceCellId !== targetCellId) {
        nodes[elementId] = { ...cel, parent: targetCellId };
      }

      if (sourceCellId === targetCellId) {
        const children = [...srcCell.children];
        const fromIdx  = children.indexOf(elementId);
        if (fromIdx === -1) return prev;
        children.splice(fromIdx, 1);
        const idx = Math.max(0, Math.min(children.length, insertIndex > fromIdx ? insertIndex - 1 : insertIndex));
        children.splice(idx, 0, elementId);
        nodes[sourceCellId] = { ...srcCell, children };
      } else {
        nodes[sourceCellId] = { ...srcCell, children: srcCell.children.filter(id => id !== elementId) };
        const tgtChildren = [...tgtCell.children];
        tgtChildren.splice(Math.max(0, Math.min(tgtChildren.length, insertIndex)), 0, elementId);
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
    if (prev) {
      setState(prev);
      setSelectedIds(ids => ids.filter(id => id in prev.nodes));
      setSelectedGridCellId(id => (id && id in prev.nodes) ? id : null);
      setSelectedSectionId(id => (id && id in prev.nodes) ? id : null);
    }
  }, [undo]);

  const handleRedo = useCallback(() => {
    const next = redo(stateRef.current);
    if (next) {
      setState(next);
      setSelectedIds(ids => ids.filter(id => id in next.nodes));
      setSelectedGridCellId(id => (id && id in next.nodes) ? id : null);
      setSelectedSectionId(id => (id && id in next.nodes) ? id : null);
    }
  }, [redo]);

  const activePage = getActivePage(state);
  const allSections = activePage.sections.map(id => state.nodes[id] as Section).filter(Boolean);
  // Derive header/footer/sections for backward-compat with LayerPanel/LeftSidebar
  const header = allSections.find(s => s.role === 'header') ?? allSections[0];
  const footer = allSections.find(s => s.role === 'footer');
  const sections = allSections.filter(s => s !== header && s !== footer);

  return {
    state, nodes: state.nodes, elements: allElements,
    header, sections, footer, allSections,
    pages: state.pages, activePageId: state.activePageId, activePage,
    selectedId, selectedIds, selectedSectionId, selectedGridCellId, selectedContainerId,
    setSelectedId, setSelectedIds, setSelectedSectionId, setSelectedGridCellId, setSelectedContainerId, toggleSelectedId,
    addPage, deletePage, renamePage, updatePageLayout, setActivePage,
    addSection, addGridSection, addSectionFromTemplate, deleteSection, promoteSection, updateSection, reorderSection, duplicateSection,
    addElement, addElementAt, addElementToCell, duplicateElement, copyElement, pasteElement,
    updateElement, updateElements, updateResponsive, pushSnapshot,
    deleteElement, deleteSelected, reorderElement, moveElementToSection, moveElementToGridCell,
    bringToFront, sendToBack, importState, updateTheme,
    addGridCell, updateGridCell, deleteGridCell, reorderGridCell, copyGridCell, pasteGridCellIntoSection, pasteIntoGridCell, hasCellClipboard, removeColumnsBlock: removeContainer, addContainer, addContainerColumn, updateContainer, moveGridElement,
    handleUndo, handleRedo, canUndo, canRedo, stateRef,
  };
}

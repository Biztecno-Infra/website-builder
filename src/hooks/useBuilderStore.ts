import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  Breakpoint, BuilderState, CanvasElement,
  Container, GridCell, Section, SiteTheme,
} from '../types';
import { useUndoRedo } from './useUndoRedo';
import { usePageOps } from './usePageOps';
import { useSectionOps } from './useSectionOps';
import { useGridCellOps } from './useGridCellOps';
import { useContainerOps } from './useContainerOps';
import { useElementOps } from './useElementOps';
import { sparsifyNodes } from '../utils/sparse';
import { isContainer, isSection, isGridCell } from '../utils/nodeHelpers';
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
  const srcOvr = bp === 'mobile' ? baseResponsive.mobile : tOvr;
  const fallOvr = bp === 'mobile' ? tOvr : undefined;

  const slo = srcOvr?.layout;
  const flo = fallOvr?.layout;
  const minScaledW = el.type === 'divider' ? 1 : 20;
  const layout = {
    ...el.layout,
    x:      slo?.x      ?? flo?.x      ?? (scale !== 1 ? Math.round(el.layout.x * scale)                          : el.layout.x),
    y:      slo?.y      ?? flo?.y      ?? el.layout.y,
    width:  slo?.width  ?? flo?.width  ?? (scale !== 1 ? Math.max(minScaledW, Math.round(el.layout.width * scale)) : el.layout.width),
    height: slo?.height ?? flo?.height ?? (scale !== 1 ? Math.max(1,           Math.round(el.layout.height * scale)): el.layout.height),
  };

  const sTypo = srcOvr?.style?.typography;
  const fTypo = fallOvr?.style?.typography;
  const mergedTypo = (sTypo || fTypo) ? { ...(fTypo ?? {}), ...(sTypo ?? {}) } : undefined;
  const style = mergedTypo ? { ...el.style, typography: { ...el.style.typography, ...mergedTypo } } : el.style;

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
    return makeEmpty();
  } catch { return makeEmpty(); }
}

function saveToStorage(s: BuilderState) {
  try {
    const sparse = { ...s, nodes: sparsifyNodes(s.nodes) };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sparse));
  } catch {}
}

export function useBuilderStore() {
  const [state, setState] = useState<BuilderState>(loadFromStorage);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedGridCellId, setSelectedGridCellId] = useState<string | null>(null);
  const [selectedContainerId, setSelectedContainerId] = useState<string | null>(null);
  const { push, undo, redo, canUndo, canRedo } = useUndoRedo();

  const stateRef = useRef(state);
  stateRef.current = state;
  const selectedSectionIdRef = useRef(selectedSectionId);
  selectedSectionIdRef.current = selectedSectionId;
  const selectedGridCellIdRef = useRef(selectedGridCellId);
  selectedGridCellIdRef.current = selectedGridCellId;

  useEffect(() => { saveToStorage(state); }, [state]);

  useEffect(() => {
    if (selectedContainerId && !state.nodes[selectedContainerId]) setSelectedContainerId(null);
  }, [state.nodes, selectedContainerId]);

  const allElements = useMemo(() => {
    const map: Record<string, CanvasElement> = {};
    for (const [id, node] of Object.entries(state.nodes)) {
      if (!isSection(node) && !isGridCell(node) && !isContainer(node)) map[id] = node as CanvasElement;
    }
    return map;
  }, [state]);

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
          let ancestorId = parent.parent;
          let ancestor = stateRef.current.nodes[ancestorId];
          while (ancestor && (isGridCell(ancestor) || isContainer(ancestor))) {
            ancestorId = isGridCell(ancestor) ? (ancestor as GridCell).parent : (ancestor as Container).parent;
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

  // ── Sub-hooks ──────────────────────────────────────────────────────────

  const pageOps = usePageOps(stateRef, setState, push, setSelectedIds, setSelectedSectionId, setSelectedGridCellId);
  const sectionOps = useSectionOps(stateRef, setState, push, setSelectedIds, setSelectedSectionId, setSelectedGridCellId);
  const gridCellOps = useGridCellOps(stateRef, setState, push, setSelectedIds, setSelectedSectionId, setSelectedGridCellId);
  const containerOps = useContainerOps(stateRef, setState, push, setSelectedIds, setSelectedGridCellId);
  const elementOps = useElementOps(stateRef, setState, push, setSelectedIds, setSelectedSectionId, setSelectedGridCellId, selectedSectionIdRef, selectedGridCellIdRef);

  // Keep selectedIdsRef in sync for deleteSelected inside useElementOps
  elementOps.selectedIdsRef.current = selectedIds;

  // ── Undo / Redo ────────────────────────────────────────────────────────

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

  // ── Theme / Import ─────────────────────────────────────────────────────

  const updateTheme = useCallback((updates: Partial<SiteTheme>) => {
    setState(s => ({ ...s, theme: { ...s.theme, ...updates } }));
  }, []);

  const importState = useCallback((raw: unknown) => {
    try {
      const migrated = migrateState(raw);
      push(stateRef.current);
      setState(migrated);
      setSelectedIds([]);
      setSelectedSectionId(null);
      setSelectedGridCellId(null);
    } catch { /* ignore */ }
  }, [push]);

  // ── Derived values ─────────────────────────────────────────────────────

  const activePage = state.pages.find(p => p.id === state.activePageId) ?? state.pages[0];
  const allSections = activePage.sections.map(id => state.nodes[id] as Section).filter(Boolean);
  const header = allSections.find(s => s.role === 'header') ?? allSections[0];
  const footer = allSections.find(s => s.role === 'footer');
  const sections = allSections.filter(s => s !== header && s !== footer);

  const { selectedIdsRef: _ref, ...elementOpsPublic } = elementOps;

  return {
    state, nodes: state.nodes, elements: allElements,
    header, sections, footer, allSections,
    pages: state.pages, activePageId: state.activePageId, activePage,
    selectedId, selectedIds, selectedSectionId, selectedGridCellId, selectedContainerId,
    setSelectedId, setSelectedIds, setSelectedSectionId, setSelectedGridCellId, setSelectedContainerId, toggleSelectedId,
    ...pageOps,
    ...sectionOps,
    ...gridCellOps,
    ...containerOps,
    ...elementOpsPublic,
    removeColumnsBlock: containerOps.removeContainer,
    addSubCell: containerOps.addContainerColumn,
    handleUndo, handleRedo, canUndo, canRedo,
    updateTheme, importState,
    stateRef,
  };
}

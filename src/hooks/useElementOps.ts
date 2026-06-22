import { useCallback, useRef, type Dispatch, type MutableRefObject, type SetStateAction } from 'react';
import type {
  AnyNode, Breakpoint, BreakpointOverride, BuilderState, CanvasElement, CellLayoutMode,
  ElementContent, ElementType, FreeSection, GridCell, Section,
} from '../types';
import { newId } from '../utils/ids';
import {
  isContainer, isSection, isGridCell, isGridSection, isFreeSection,
  appendToParent, removeFromParent,
} from '../utils/nodeHelpers';
import { CANVAS_W, createDefaultElement } from '../utils/elementDefaults';

export function useElementOps(
  stateRef: MutableRefObject<BuilderState>,
  setState: Dispatch<SetStateAction<BuilderState>>,
  push: (s: BuilderState) => void,
  setSelectedIds: Dispatch<SetStateAction<string[]>>,
  setSelectedSectionId: Dispatch<SetStateAction<string | null>>,
  setSelectedGridCellId: Dispatch<SetStateAction<string | null>>,
  selectedSectionIdRef: MutableRefObject<string | null>,
  selectedGridCellIdRef: MutableRefObject<string | null>,
) {
  const clipboard = useRef<CanvasElement | null>(null);

  // ── Add ────────────────────────────────────────────────────────────────

  const addElementToCell = useCallback((type: ElementType, cellId: string, x = 0, y = 0) => {
    const s = stateRef.current;
    const cell = s.nodes[cellId] as GridCell | undefined;
    if (!cell) return;
    const hasButton = type === 'button' && cell.children.some(id => s.nodes[id]?.type === 'button');
    const el = createDefaultElement(type, cell.children.length, cellId, x, y, stateRef.current.theme, hasButton);
    push(s);
    setState(prev => {
      const c = prev.nodes[cellId] as GridCell | undefined;
      if (!c) return prev;
      const fixed = { ...el, layout: { ...el.layout, zIndex: c.children.length } };
      return { ...prev, nodes: { ...prev.nodes, [el.id]: fixed, [cellId]: { ...c, children: [...c.children, el.id] } } };
    });
    setSelectedIds([el.id]);
    setSelectedGridCellId(cellId);
  }, [push]);

  const addElement = useCallback((type: ElementType) => {
    const s = stateRef.current;
    const gcId = selectedGridCellIdRef.current;
    if (gcId && s.nodes[gcId] && isGridCell(s.nodes[gcId])) {
      addElementToCell(type, gcId);
      return;
    }
    const page = s.pages.find(p => p.id === s.activePageId) ?? s.pages[0];
    const fallbackSectionId =
      page.sections.find(id => (s.nodes[id] as Section | undefined)?.role === 'section') ??
      page.sections[0];
    const sectionId = selectedSectionIdRef.current ?? fallbackSectionId;
    if (!sectionId) return;
    const sec = s.nodes[sectionId] as Section | undefined;
    if (!sec) return;
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
    setSelectedIds([el.id]);
    setSelectedSectionId(sectionId);
  }, [push, addElementToCell]);

  const addElementAt = useCallback((type: ElementType, x: number, y: number, sectionId: string, contentOverride?: Partial<ElementContent>) => {
    const s = stateRef.current;
    const node = s.nodes[sectionId];
    if (!node || !isFreeSection(node)) return;
    const hasButton = type === 'button' && node.children.some(id => stateRef.current.nodes[id]?.type === 'button');
    const base = createDefaultElement(type, node.children.length, sectionId, Math.round(x), Math.round(y), stateRef.current.theme, hasButton);
    const el = contentOverride ? { ...base, content: { ...base.content, ...contentOverride } } : base;
    push(s);
    setState(prev => {
      const sec = prev.nodes[sectionId];
      if (!sec || !isFreeSection(sec)) return prev;
      return { ...prev, nodes: { ...prev.nodes, [el.id]: el, [sectionId]: { ...sec, children: [...sec.children, el.id] } } };
    });
    setSelectedIds([el.id]);
    setSelectedSectionId(sectionId);
  }, [push]);

  // ── Update ─────────────────────────────────────────────────────────────

  const updateElement = useCallback((id: string, updates: Partial<CanvasElement>) => {
    setState(s => {
      const el = s.nodes[id];
      if (!el || isSection(el) || isGridCell(el) || isContainer(el)) return s;
      const merged = { ...el, ...updates } as CanvasElement;
      if (updates.content) merged.content = { ...(el as CanvasElement).content, ...updates.content };
      const newNodes = { ...s.nodes, [id]: merged };

      if (updates.layout) {
        const parentId = (el as CanvasElement).parent;
        const parent = newNodes[parentId];
        if (parent && isFreeSection(parent)) {
          const sec = parent as FreeSection;
          const elementBottom = merged.layout.y + merged.layout.height;
          if (elementBottom + 40 > sec.layout.height) {
            newNodes[parentId] = { ...sec, layout: { ...sec.layout, height: elementBottom + 40 } };
          }
        }
      }

      return { ...s, nodes: newNodes };
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

  const pushSnapshot = useCallback((snapshot: BuilderState) => { push(snapshot); }, [push]);

  // ── Delete ─────────────────────────────────────────────────────────────

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

  const selectedIdsRef = useRef<string[]>([]);
  const deleteSelected = useCallback(() => {
    const ids = selectedIdsRef.current;
    if (!ids.length) return;
    push(stateRef.current);
    setState(s => {
      const nodes = { ...s.nodes };
      for (const id of ids) {
        const el = nodes[id];
        if (!el || isSection(el) || isGridCell(el) || isContainer(el)) continue;
        removeFromParent(nodes, (el as CanvasElement).parent, id);
        delete nodes[id];
      }
      return { ...s, nodes };
    });
    setSelectedIds([]);
  }, [push]);

  // ── Duplicate / Copy / Paste ───────────────────────────────────────────

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
    const s = stateRef.current;
    const page = s.pages.find(p => p.id === s.activePageId) ?? s.pages[0];
    const sectionId = selectedSectionIdRef.current ?? page.sections[0];
    if (!sectionId) return;
    const secNode = stateRef.current.nodes[sectionId];
    if (!secNode || !isFreeSection(secNode)) return;
    const copy: CanvasElement = { ...el, id: newId(), parent: sectionId, layout: { ...el.layout, x: el.layout.x + 20, y: el.layout.y + 20, zIndex: secNode.children.length } };
    push(stateRef.current);
    setState(s2 => {
      const sec = s2.nodes[sectionId];
      if (!sec || !isFreeSection(sec)) return s2;
      return { ...s2, nodes: { ...s2.nodes, [copy.id]: copy, [sectionId]: { ...sec, children: [...sec.children, copy.id] } } };
    });
    setSelectedIds([copy.id]);
    clipboard.current = { ...el, layout: { ...el.layout, x: el.layout.x + 20, y: el.layout.y + 20 } };
  }, [push]);

  // ── Reorder / Move ─────────────────────────────────────────────────────

  const reorderElement = useCallback((id: string, newIndex: number) => {
    const el = stateRef.current.nodes[id];
    if (!el || isSection(el) || isGridCell(el)) return;
    const cel = el as CanvasElement;
    push(stateRef.current);
    setState(s => {
      const parent = s.nodes[cel.parent];
      if (!parent || (!isSection(parent) && !isGridCell(parent))) return s;
      const parentNode = parent as Section | GridCell;
      const children = parentNode.children.filter(c => c !== id);
      children.splice(Math.max(0, Math.min(children.length, newIndex)), 0, id);
      const nodes = { ...s.nodes };
      children.forEach((cid, idx) => { const n = nodes[cid]; if (n && !isSection(n) && !isGridCell(n)) nodes[cid] = { ...(n as CanvasElement), layout: { ...(n as CanvasElement).layout, zIndex: idx } }; });
      nodes[cel.parent] = { ...parentNode, children } as AnyNode;
      return { ...s, nodes };
    });
  }, [push]);

  const moveElementToSection = useCallback((id: string, toSectionId: string, atIndex: number, pos?: { x: number; y: number }) => {
    const s = stateRef.current;
    const el = s.nodes[id];
    if (!el || isSection(el) || isGridCell(el)) return;
    const cel = el as CanvasElement;
    if (cel.parent === toSectionId) return;
    const toNode = s.nodes[toSectionId];
    if (!toNode || !isFreeSection(toNode)) return;
    const fromGrid = isGridCell(s.nodes[cel.parent]);
    push(s);
    setState(prev => {
      const nodes = { ...prev.nodes };
      const toSec = nodes[toSectionId];
      if (!toSec || !isFreeSection(toSec)) return prev;
      removeFromParent(nodes, cel.parent, id);
      let width = cel.layout.width;
      if (fromGrid) {
        const fl = cel.flexLayout;
        if (fl.widthMode === 'fixed' && fl.widthValue) width = fl.widthValue;
        else if (fl.widthMode === 'percent' && fl.widthValue) width = Math.round(fl.widthValue / 100 * CANVAS_W);
        else width = cel.layout.width || 200;
      }
      nodes[id] = {
        ...cel, parent: toSectionId,
        layout: { ...cel.layout, x: pos?.x ?? cel.layout.x, y: pos?.y ?? 20, width },
        flexLayout: fromGrid ? { ...cel.flexLayout, widthMode: 'auto', flexGrow: 0, alignSelf: 'auto' } : cel.flexLayout,
        responsive: fromGrid ? {
          tablet: cel.responsive.tablet ? { ...cel.responsive.tablet, flexLayout: undefined } : cel.responsive.tablet,
          mobile: cel.responsive.mobile ? { ...cel.responsive.mobile, flexLayout: undefined } : cel.responsive.mobile,
        } : cel.responsive,
      };
      const toChildren = [...toSec.children];
      toChildren.splice(Math.max(0, Math.min(toChildren.length, atIndex)), 0, id);
      const placedEl = nodes[id] as CanvasElement;
      const elBottom = placedEl.layout.y + placedEl.layout.height;
      const newHeight = elBottom + 40 > toSec.layout.height ? elBottom + 40 : toSec.layout.height;
      nodes[toSectionId] = { ...toSec, children: toChildren, layout: { ...toSec.layout, height: newHeight } };
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
        nodes[id] = {
          ...cel, parent: toCellId,
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

  const moveGridElement = useCallback((
    elementId: string,
    sourceCellId: string,
    targetCellId: string,
    insertIndex: number,
    dropPos?: { x: number; y: number },
    _sourceCellMode?: CellLayoutMode,
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
        const fromIdx = children.indexOf(elementId);
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

  // ── Z-order ────────────────────────────────────────────────────────────

  const bringToFront = useCallback((id: string) => {
    const node = stateRef.current.nodes[id];
    if (!node || isSection(node) || isGridCell(node)) return;
    push(stateRef.current);
    const cel = node as CanvasElement;
    setState(s => {
      const parent = s.nodes[cel.parent];
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
      if (!parent || isGridSection(parent) || (!isSection(parent) && !isGridCell(parent))) return s;
      const parentNode = parent as FreeSection | GridCell;
      const children = [id, ...parentNode.children.filter((c: string) => c !== id)];
      const nodes = { ...s.nodes };
      children.forEach((cid: string, idx: number) => { const n = nodes[cid]; if (n && !isSection(n) && !isGridCell(n)) nodes[cid] = { ...(n as CanvasElement), layout: { ...(n as CanvasElement).layout, zIndex: idx } }; });
      nodes[cel.parent] = { ...parentNode, children } as AnyNode;
      return { ...s, nodes };
    });
  }, [push]);

  return {
    selectedIdsRef,
    addElement, addElementAt, addElementToCell,
    updateElement, updateElements, updateResponsive, pushSnapshot,
    deleteElement, deleteSelected,
    duplicateElement, copyElement, pasteElement,
    reorderElement, moveElementToSection, moveElementToGridCell, moveGridElement,
    bringToFront, sendToBack,
  };
}

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  Accordion, AccordionBpOverride, AccordionItem,
   Breakpoint,  BuilderState, CanvasElement, Carousel, CarouselBpOverride, CarouselProps, CellLayoutMode,
   Container,    GridCell,
  NodeMap, Page, Section,
  SiteTheme,
} from '../types';
import { useUndoRedo } from './useUndoRedo';
import { usePageOps } from './usePageOps';
import { useSectionOps } from './useSectionOps';
import { useGridCellOps } from './useGridCellOps';
import { useContainerOps } from './useContainerOps';
import { useElementOps } from './useElementOps';
import { sparsifyNodes } from '../utils/sparse';
import { newId, newGridCellId, newColumnsId } from '../utils/ids';
import {
  DEFAULT_CAROUSEL_SLIDE_COUNT, DEFAULT_ACCORDION_ITEM_COUNT,
} from '../utils/builderDefaults';
import {
  isContainer, isSection, isGridCell, isFreeSection,
  isCarousel, isAccordion,
  removeGridCellNodes, removeFromParent, appendToParent,
  makeSlide, makeSlidePlaceholderImage, makeCarousel, removeCarouselNodes,
  makeAccordion, makeAccordionItem, removeAccordionNodes, cloneAccordionInto,
  newCarouselId, newAccordionId, newAccordionItemId,
} from '../utils/nodeHelpers';
import { CANVAS_W, createDefaultElement } from '../utils/elementDefaults';
import { migrateState, makeEmpty } from '../utils/migration';

export { DEFAULT_THEME } from '../utils/builderDefaults';
export { CANVAS_W } from '../utils/elementDefaults';
export { equalWidths } from '../utils/nodeHelpers';
export { makeEmpty } from '../utils/migration';

const STORAGE_KEY = 'microsite-builder-v5';

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
    return makeEmpty();
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

export function useBuilderStore(externalInitialState?: BuilderState) {
  const [state, setState] = useState<BuilderState>(() =>
    externalInitialState ? migrateState(externalInitialState) : loadFromStorage()
  );
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
      if (!isSection(node) && !isGridCell(node) && !isContainer(node) && !isCarousel(node) && !isAccordion(node)) map[id] = node as CanvasElement;
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
          // Walk up through GridCells, Containers, Carousels AND Accordions until we reach a Section
          let ancestorId = parent.parent;
          let ancestor = stateRef.current.nodes[ancestorId];
          while (ancestor && (isGridCell(ancestor) || isContainer(ancestor) || isCarousel(ancestor) || isAccordion(ancestor))) {
            ancestorId = (ancestor as GridCell | Container | Carousel | Accordion).parent;
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

  // ── Carousel & Accordion actions (not split into sub-hooks) ──────────────

  const deepCloneSlide = (nodes: NodeMap, cellId: string, newParentId: string): string => {
    const cell = nodes[cellId] as GridCell | undefined;
    if (!cell) return '';
    const newCellId = newGridCellId();
    const newChildren = cell.children.map(childId => {
      const child = nodes[childId];
      if (!child) return '';
      if (child.type === 'container') {
        const block = child as Container;
        const newBlockId = newColumnsId();
        const newSubIds = block.children.map(subId => deepCloneSlide(nodes, subId, newBlockId)).filter(Boolean);
        nodes[newBlockId] = { ...block, id: newBlockId, parent: newCellId, children: newSubIds } as Container;
        return newBlockId;
      }
      if (child.type === 'carousel') {
        const car = child as Carousel;
        const newCarId = newCarouselId();
        const newSlideIds = car.children.map(slideId => deepCloneSlide(nodes, slideId, newCarId)).filter(Boolean);
        nodes[newCarId] = { ...car, id: newCarId, parent: newCellId, children: newSlideIds } as Carousel;
        return newCarId;
      }
      if (child.type === 'accordion') {
        return cloneAccordionInto(nodes, child as Accordion, newCellId, (cid, np) => deepCloneSlide(nodes, cid, np));
      }
      const el = child as CanvasElement;
      const newElId = newId();
      nodes[newElId] = { ...el, id: newElId, parent: newCellId };
      return newElId;
    }).filter(Boolean);
    nodes[newCellId] = { ...cell, id: newCellId, parent: newParentId, children: newChildren };
    return newCellId;
  };

  // Insert a carousel (with N placeholder slides). `targetId` may name a free
  // Section (the carousel becomes a free-positioned section child) OR a GridCell
  // (the carousel flows inside the cell, just like a form element). When omitted,
  // a selected grid cell wins over the selected section — mirroring addElement.
  const addCarousel = useCallback((targetId?: string, dropX?: number, dropY?: number) => {
    const s = stateRef.current;
    const page = getActivePage(s);

    // Resolve the parent: explicit cell/section, else selected cell, else selected section.
    const gcId = selectedGridCellIdRef.current;
    let parentId = targetId;
    if (!parentId) parentId = (gcId && isGridCell(s.nodes[gcId])) ? gcId : (selectedSectionId ?? page.sections[0]);
    if (!parentId) return;

    const parent = s.nodes[parentId];
    if (!parent) return;
    const intoCell = isGridCell(parent);
    // Section target must be a free section; grid sections hold cells, not free children.
    if (!intoCell && !isFreeSection(parent)) return;

    const carouselId = newCarouselId();
    const slideIds: string[] = [];
    const newNodes: NodeMap = {};
    for (let i = 0; i < DEFAULT_CAROUSEL_SLIDE_COUNT; i++) {
      const slideId = newGridCellId();
      const slide = makeSlide(slideId, carouselId);
      const img = makeSlidePlaceholderImage(slideId, i + 1, s.theme);
      slide.children = [img.id];
      newNodes[slideId] = slide;
      newNodes[img.id] = img;
      slideIds.push(slideId);
    }
    const carousel = makeCarousel(carouselId, parentId, dropX, dropY);
    carousel.children = slideIds;
    newNodes[carouselId] = carousel;

    push(s);
    setState(prev => {
      const p = prev.nodes[parentId!];
      if (!p) return prev;
      if (intoCell) {
        if (!isGridCell(p)) return prev;
        return { ...prev, nodes: { ...prev.nodes, ...newNodes, [parentId!]: { ...p, children: [...p.children, carouselId] } } };
      }
      if (!isFreeSection(p)) return prev;
      return { ...prev, nodes: { ...prev.nodes, ...newNodes, [parentId!]: { ...p, children: [...p.children, carouselId] } } };
    });
    if (intoCell) {
      // Keep the cell selected so the carousel lands visibly inside it.
      setSelectedGridCellId(parentId);
    } else {
      setSelectedSectionId(parentId);
      setSelectedGridCellId(null);
    }
    setSelectedIds([]);
    return carouselId;
  }, [push, selectedSectionId]);

  const updateCarousel = useCallback((id: string, updates: Partial<Omit<Carousel, 'id' | 'type' | 'parent' | 'children'>>) => {
    setState(s => {
      const node = s.nodes[id];
      if (!node || !isCarousel(node)) return s;
      const merged: Carousel = { ...node, ...updates };
      if (updates.props) merged.props = { ...node.props, ...updates.props };
      if (updates.layout) merged.layout = { ...node.layout, ...updates.layout };
      if (updates.responsive) merged.responsive = { ...node.responsive, ...updates.responsive };
      return { ...s, nodes: { ...s.nodes, [id]: merged } };
    });
  }, []);

  // Set per-breakpoint height/minHeight on a carousel (desktop writes layout directly).
  const updateCarouselResponsive = useCallback((id: string, bp: Breakpoint, updates: CarouselBpOverride) => {
    setState(s => {
      const node = s.nodes[id];
      if (!node || !isCarousel(node)) return s;
      if (bp === 'desktop' || bp === 'large-desktop') {
        const layout = { ...node.layout };
        if (updates.x !== undefined) layout.x = updates.x;
        if (updates.y !== undefined) layout.y = updates.y;
        if (updates.width !== undefined) layout.width = updates.width;
        if (updates.height !== undefined) layout.height = updates.height;
        if (updates.minHeight !== undefined) layout.minHeight = updates.minHeight;
        return { ...s, nodes: { ...s.nodes, [id]: { ...node, layout } } };
      }
      const key = bp === 'tablet' ? 'tablet' : 'mobile';
      const responsive = { ...node.responsive, [key]: { ...node.responsive?.[key], ...updates } };
      return { ...s, nodes: { ...s.nodes, [id]: { ...node, responsive } } };
    });
  }, []);

  const addSlide = useCallback((carouselId: string, afterSlideId?: string) => {
    const s = stateRef.current;
    const carousel = s.nodes[carouselId] as Carousel | undefined;
    if (!carousel || !isCarousel(carousel)) return;
    const slideId = newGridCellId();
    const slide = makeSlide(slideId, carouselId);
    const img = makeSlidePlaceholderImage(slideId, carousel.children.length + 1, s.theme);
    slide.children = [img.id];
    push(s);
    setState(prev => {
      const c = prev.nodes[carouselId] as Carousel | undefined;
      if (!c || !isCarousel(c)) return prev;
      let children: string[];
      if (afterSlideId && c.children.includes(afterSlideId)) {
        children = [...c.children];
        children.splice(children.indexOf(afterSlideId) + 1, 0, slideId);
      } else {
        children = [...c.children, slideId];
      }
      const activeSlide = children.indexOf(slideId);
      return { ...prev, nodes: { ...prev.nodes, [slideId]: slide, [img.id]: img, [carouselId]: { ...c, children, activeSlide } } };
    });
    setSelectedGridCellId(slideId);
  }, [push]);

  const deleteSlide = useCallback((slideId: string) => {
    const s = stateRef.current;
    const slide = s.nodes[slideId] as GridCell | undefined;
    if (!slide || !isGridCell(slide)) return;
    const carousel = s.nodes[slide.parent] as Carousel | undefined;
    if (!carousel || !isCarousel(carousel)) return;
    if (carousel.children.length <= 1) return;  // keep at least one slide
    push(s);
    setState(prev => {
      const c = prev.nodes[carousel.id] as Carousel | undefined;
      if (!c || !isCarousel(c)) return prev;
      const nodes = { ...prev.nodes };
      const target = nodes[slideId] as GridCell | undefined;
      if (target) { removeGridCellNodes(nodes, target); delete nodes[slideId]; }
      const idx = c.children.indexOf(slideId);
      const children = c.children.filter(id => id !== slideId);
      const activeSlide = Math.max(0, Math.min(children.length - 1, (c.activeSlide ?? 0) > idx ? (c.activeSlide ?? 0) - 1 : (c.activeSlide ?? 0)));
      nodes[carousel.id] = { ...c, children, activeSlide };
      return { ...prev, nodes };
    });
    setSelectedGridCellId(null);
  }, [push]);

  const duplicateSlide = useCallback((slideId: string) => {
    const s = stateRef.current;
    const slide = s.nodes[slideId] as GridCell | undefined;
    if (!slide || !isGridCell(slide)) return;
    const carousel = s.nodes[slide.parent] as Carousel | undefined;
    if (!carousel || !isCarousel(carousel)) return;
    push(s);
    setState(prev => {
      const c = prev.nodes[carousel.id] as Carousel | undefined;
      if (!c || !isCarousel(c)) return prev;
      const nodes = { ...prev.nodes };
      const newSlideId = deepCloneSlide(nodes, slideId, carousel.id);
      if (!newSlideId) return prev;
      const children = [...c.children];
      children.splice(children.indexOf(slideId) + 1, 0, newSlideId);
      nodes[carousel.id] = { ...c, children, activeSlide: children.indexOf(newSlideId) };
      return { ...prev, nodes };
    });
    setSelectedGridCellId(null);
  }, [push]);

  // Reorder a carousel's slides (reuses the generic cell reorder).
  const reorderSlide = gridCellOps.reorderGridCell;

  // Change which slide is shown on the canvas — editor-only, no undo entry.
  const setActiveSlide = useCallback((carouselId: string, index: number) => {
    setState(s => {
      const c = s.nodes[carouselId] as Carousel | undefined;
      if (!c || !isCarousel(c)) return s;
      const clamped = Math.max(0, Math.min(c.children.length - 1, index));
      if (clamped === (c.activeSlide ?? 0)) return s;
      return { ...s, nodes: { ...s.nodes, [carouselId]: { ...c, activeSlide: clamped } } };
    });
  }, []);

  // ── Accordion ops ──────────────────────────────────────────────────────
  // An accordion lives in a section's OR grid-cell's children. Each item's
  // title/icon are CanvasElements and its content panel is a GridCell, so all
  // header + content editing reuses the existing element + grid-cell pipelines.

  // Insert an accordion (with N default items). `targetId` may name a free
  // Section or a GridCell; mirrors addCarousel's parent resolution.
  const addAccordion = useCallback((targetId?: string, dropX?: number, dropY?: number) => {
    const s = stateRef.current;
    const page = getActivePage(s);

    const gcId = selectedGridCellIdRef.current;
    let parentId = targetId;
    if (!parentId) parentId = (gcId && isGridCell(s.nodes[gcId])) ? gcId : (selectedSectionId ?? page.sections[0]);
    if (!parentId) return;

    const parent = s.nodes[parentId];
    if (!parent) return;
    const intoCell = isGridCell(parent);
    if (!intoCell && !isFreeSection(parent)) return;

    const accordionId = newAccordionId();
    const newNodes: NodeMap = {};
    const items: AccordionItem[] = [];
    for (let i = 0; i < DEFAULT_ACCORDION_ITEM_COUNT; i++) {
      items.push(makeAccordionItem(accordionId, i + 1, newNodes, s.theme));
    }
    const accordion = makeAccordion(accordionId, parentId, dropX, dropY);
    accordion.items = items;
    accordion.activeItems = items.length ? [items[0].id] : [];  // first open by default in editor
    newNodes[accordionId] = accordion;

    push(s);
    setState(prev => {
      const p = prev.nodes[parentId!];
      if (!p) return prev;
      if (intoCell) {
        if (!isGridCell(p)) return prev;
        return { ...prev, nodes: { ...prev.nodes, ...newNodes, [parentId!]: { ...p, children: [...p.children, accordionId] } } };
      }
      if (!isFreeSection(p)) return prev;
      return { ...prev, nodes: { ...prev.nodes, ...newNodes, [parentId!]: { ...p, children: [...p.children, accordionId] } } };
    });
    if (intoCell) setSelectedGridCellId(parentId);
    else { setSelectedSectionId(parentId); setSelectedGridCellId(null); }
    setSelectedIds([]);
    return accordionId;
  }, [push, selectedSectionId]);

  const updateAccordion = useCallback((id: string, updates: Partial<Omit<Accordion, 'id' | 'type' | 'parent' | 'children' | 'items'>>) => {
    setState(s => {
      const node = s.nodes[id];
      if (!node || !isAccordion(node)) return s;
      const merged: Accordion = { ...node, ...updates };
      if (updates.props) merged.props = { ...node.props, ...updates.props };
      if (updates.layout) merged.layout = { ...node.layout, ...updates.layout };
      if (updates.responsive) merged.responsive = { ...node.responsive, ...updates.responsive };
      return { ...s, nodes: { ...s.nodes, [id]: merged } };
    });
  }, []);

  // Per-breakpoint x/y/width (desktop writes layout directly), mirroring carousel.
  const updateAccordionResponsive = useCallback((id: string, bp: Breakpoint, updates: AccordionBpOverride) => {
    setState(s => {
      const node = s.nodes[id];
      if (!node || !isAccordion(node)) return s;
      if (bp === 'desktop' || bp === 'large-desktop') {
        const layout = { ...node.layout };
        if (updates.x !== undefined) layout.x = updates.x;
        if (updates.y !== undefined) layout.y = updates.y;
        if (updates.width !== undefined) layout.width = updates.width;
        return { ...s, nodes: { ...s.nodes, [id]: { ...node, layout } } };
      }
      const key = bp === 'tablet' ? 'tablet' : 'mobile';
      const responsive = { ...node.responsive, [key]: { ...node.responsive?.[key], ...updates } };
      return { ...s, nodes: { ...s.nodes, [id]: { ...node, responsive } } };
    });
  }, []);

  const addAccordionItem = useCallback((accordionId: string, afterItemId?: string) => {
    const s = stateRef.current;
    const accordion = s.nodes[accordionId] as Accordion | undefined;
    if (!accordion || !isAccordion(accordion)) return;
    const newNodes: NodeMap = {};
    const item = makeAccordionItem(accordionId, accordion.items.length + 1, newNodes, s.theme);
    push(s);
    setState(prev => {
      const a = prev.nodes[accordionId] as Accordion | undefined;
      if (!a || !isAccordion(a)) return prev;
      const items = [...a.items];
      const insertAt = afterItemId ? items.findIndex(it => it.id === afterItemId) + 1 : items.length;
      items.splice(insertAt > 0 ? insertAt : items.length, 0, item);
      const activeItems = [...(a.activeItems ?? []), item.id];  // newly added item starts expanded
      return { ...prev, nodes: { ...prev.nodes, ...newNodes, [accordionId]: { ...a, items, activeItems } } };
    });
  }, [push]);

  const deleteAccordionItem = useCallback((accordionId: string, itemId: string) => {
    const s = stateRef.current;
    const accordion = s.nodes[accordionId] as Accordion | undefined;
    if (!accordion || !isAccordion(accordion)) return;
    if (accordion.items.length <= 1) return;  // keep at least one item
    push(s);
    setState(prev => {
      const a = prev.nodes[accordionId] as Accordion | undefined;
      if (!a || !isAccordion(a)) return prev;
      const item = a.items.find(it => it.id === itemId);
      if (!item) return prev;
      const nodes = { ...prev.nodes };
      delete nodes[item.titleElId];
      delete nodes[item.iconElId];
      const cell = nodes[item.contentCellId] as GridCell | undefined;
      if (cell) { removeGridCellNodes(nodes, cell); delete nodes[item.contentCellId]; }
      const items = a.items.filter(it => it.id !== itemId);
      const activeItems = (a.activeItems ?? []).filter(id => id !== itemId);
      nodes[accordionId] = { ...a, items, activeItems };
      return { ...prev, nodes };
    });
  }, [push]);

  const duplicateAccordionItem = useCallback((accordionId: string, itemId: string) => {
    const s = stateRef.current;
    const accordion = s.nodes[accordionId] as Accordion | undefined;
    if (!accordion || !isAccordion(accordion)) return;
    push(s);
    setState(prev => {
      const a = prev.nodes[accordionId] as Accordion | undefined;
      if (!a || !isAccordion(a)) return prev;
      const item = a.items.find(it => it.id === itemId);
      if (!item) return prev;
      const nodes = { ...prev.nodes };
      // Clone the three backing nodes.
      const title = nodes[item.titleElId] as CanvasElement | undefined;
      const icon = nodes[item.iconElId] as CanvasElement | undefined;
      const newTitleId = newId(), newIconId = newId();
      if (title) nodes[newTitleId] = { ...title, id: newTitleId, parent: accordionId };
      if (icon) nodes[newIconId] = { ...icon, id: newIconId, parent: accordionId };
      const newCellId = deepCloneSlide(nodes, item.contentCellId, accordionId);
      const newItem: AccordionItem = { id: newAccordionItemId(), titleElId: newTitleId, iconElId: newIconId, contentCellId: newCellId };
      const items = [...a.items];
      items.splice(items.findIndex(it => it.id === itemId) + 1, 0, newItem);
      const activeItems = [...(a.activeItems ?? []), newItem.id];
      nodes[accordionId] = { ...a, items, activeItems };
      return { ...prev, nodes };
    });
  }, [push]);

  const reorderAccordionItem = useCallback((accordionId: string, fromIndex: number, toIndex: number) => {
    push(stateRef.current);
    setState(prev => {
      const a = prev.nodes[accordionId] as Accordion | undefined;
      if (!a || !isAccordion(a)) return prev;
      if (fromIndex < 0 || fromIndex >= a.items.length || toIndex < 0 || toIndex >= a.items.length) return prev;
      const items = [...a.items];
      const [moved] = items.splice(fromIndex, 1);
      items.splice(toIndex, 0, moved);
      return { ...prev, nodes: { ...prev.nodes, [accordionId]: { ...a, items } } };
    });
  }, [push]);

  // Expand/collapse an item on the canvas — editor-only, no undo entry.
  const toggleAccordionItem = useCallback((accordionId: string, itemId: string) => {
    setState(s => {
      const a = s.nodes[accordionId] as Accordion | undefined;
      if (!a || !isAccordion(a)) return s;
      const open = a.activeItems ?? [];
      const isOpen = open.includes(itemId);
      let activeItems: string[];
      if (a.props.allowMultiple) {
        activeItems = isOpen ? open.filter(id => id !== itemId) : [...open, itemId];
      } else {
        activeItems = isOpen ? [] : [itemId];
      }
      return { ...s, nodes: { ...s.nodes, [accordionId]: { ...a, activeItems } } };
    });
  }, []);


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
    // Carousel & Accordion actions (live in this hook — not split into sub-hooks)
    addCarousel, updateCarousel, updateCarouselResponsive, addSlide, deleteSlide, duplicateSlide, reorderSlide, setActiveSlide,
    addAccordion, updateAccordion, updateAccordionResponsive, addAccordionItem, deleteAccordionItem, duplicateAccordionItem, reorderAccordionItem, toggleAccordionItem,
    handleUndo, handleRedo, canUndo, canRedo,
    updateTheme, importState,
    stateRef,
  };
}

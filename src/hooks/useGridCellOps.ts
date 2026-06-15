import { useCallback, useRef, useState, type Dispatch, type MutableRefObject, type SetStateAction } from 'react';
import type { AnyNode, BuilderState, Container, GridCell, NodeMap, Section } from '../types';
import { newGridCellId, newColumnsId, newId } from '../utils/ids';
import { isSection, isGridCell, isContainer, makeGridCell, removeGridCellNodes } from '../utils/nodeHelpers';

export function useGridCellOps(
  stateRef: MutableRefObject<BuilderState>,
  setState: Dispatch<SetStateAction<BuilderState>>,
  push: (s: BuilderState) => void,
  setSelectedIds: Dispatch<SetStateAction<string[]>>,
  setSelectedSectionId: Dispatch<SetStateAction<string | null>>,
  setSelectedGridCellId: Dispatch<SetStateAction<string | null>>,
) {
  // ── Grid cell clipboard ──────────────────────────────────────────────────
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

  // ── Grid cell CRUD ───────────────────────────────────────────────────────

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
    if (parentNode && isSection(parentNode)) {
      setSelectedSectionId(parentId);
      setSelectedGridCellId(null);
    } else if (parentNode && isContainer(parentNode)) {
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
      const children = [...(parent as { children: string[] }).children];
      const [moved] = children.splice(fromIndex, 1);
      children.splice(toIndex, 0, moved);
      return { ...s, nodes: { ...s.nodes, [parentId]: { ...parent, children } as AnyNode } };
    });
  }, [push]);

  return {
    hasCellClipboard, copyGridCell, pasteGridCellIntoSection, pasteIntoGridCell,
    addGridCell, updateGridCell, deleteGridCell, reorderGridCell,
  };
}

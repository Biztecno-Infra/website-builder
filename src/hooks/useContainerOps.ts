import { useCallback, type Dispatch, type MutableRefObject, type SetStateAction } from 'react';
import type { BuilderState, Container, ContainerLayoutMode, GridCell } from '../types';
import { newColumnsId, newGridCellId } from '../utils/ids';
import { isContainer, isGridCell, makeGridCell, removeGridCellNodes } from '../utils/nodeHelpers';

export function useContainerOps(
  stateRef: MutableRefObject<BuilderState>,
  setState: Dispatch<SetStateAction<BuilderState>>,
  push: (s: BuilderState) => void,
  setSelectedIds: Dispatch<SetStateAction<string[]>>,
  setSelectedGridCellId: Dispatch<SetStateAction<string | null>>,
) {
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
      subIds.forEach((id, i) => { nodes[id] = makeGridCell(id, blockId, spans[i]); });
      nodes[cellId] = { ...c, children: [...c.children, blockId] };
      return { ...s, nodes };
    });
    setSelectedGridCellId(cellId);
  }, [push]);

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
    setSelectedGridCellId(block.parent);
  }, [push]);

  const updateContainer = useCallback((id: string, updates: Partial<Pick<Container, 'layoutMode' | 'gap' | 'rowGap' | 'responsive'>>) => {
    setState(s => {
      const node = s.nodes[id];
      if (!node || !isContainer(node)) return s;
      return { ...s, nodes: { ...s.nodes, [id]: { ...node, ...updates } as Container } };
    });
  }, []);

  return { addContainer, addContainerColumn, removeContainer, updateContainer };
}

import type { AnyNode, Container, FreeSection, GridCell, GridSection, NodeMap, Section, SectionRole, SectionUpdate } from '../types';
import { DEFAULT_BG, DEFAULT_GRID_CELL_STYLE, DEFAULT_SECTION_BG } from './builderDefaults';

export function isContainer(node: AnyNode): node is Container {
  return node.type === 'container';
}

export function isSection(node: AnyNode): node is Section {
  return (node as Section).type === 'section';
}

export function isGridCell(node: AnyNode): node is GridCell {
  return (node as GridCell).type === 'grid-cell';
}

export function isGridSection(node: AnyNode): node is GridSection {
  return isSection(node) && (node as Section).layoutMode === 'grid';
}

export function isFreeSection(node: AnyNode): node is FreeSection {
  return isSection(node) && (node as Section).layoutMode === 'free';
}

export function makeSection(id: string, role: SectionRole, partial?: SectionUpdate, bgColor?: string): Section {
  return {
    id, type: 'section', role,
    label: role === 'header' ? 'Header' : role === 'footer' ? 'Footer' : 'Section',
    layout: { height: role === 'header' ? 80 : role === 'footer' ? 100 : 400 },
    style: {
      background: { ...DEFAULT_SECTION_BG, color: bgColor ?? (role === 'footer' ? '#f5f5f5' : '#ffffff') },
      columns: { count: 1, widths: [], styles: {} },
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
    },
    children: [],
    layoutMode: 'free',
    ...partial,
  } as Section;
}

export function makeGridCell(id: string, parentId: string, columnSpan = 4): GridCell {
  return {
    id, type: 'grid-cell', parent: parentId,
    columnSpan,
    rowSpan: 1,
    style: {
      ...DEFAULT_GRID_CELL_STYLE,
      padding: { ...DEFAULT_GRID_CELL_STYLE.padding },
      background: { ...DEFAULT_BG, overlay: 0 },
      border: { ...DEFAULT_GRID_CELL_STYLE.border! },
    },
    children: [],
    responsive: { mobile: { columnSpan: 12 } },
  };
}

export function removeGridCellNodes(nodes: NodeMap, cell: GridCell): void {
  for (const childId of cell.children) {
    const child = nodes[childId];
    if (child?.type === 'container') {
      const block = child as Container;
      for (const subId of block.children) {
        const sub = nodes[subId] as GridCell | undefined;
        if (sub) { removeGridCellNodes(nodes, sub); delete nodes[subId]; }
      }
    }
    delete nodes[childId];
  }
}


export function removeNodesForSection(nodes: NodeMap, sec: Section): void {
  if (sec.layoutMode === 'grid' || sec.layoutMode === 'flex') {
    for (const cellId of sec.children) {
      const cell = nodes[cellId] as GridCell | undefined;
      if (cell) { removeGridCellNodes(nodes, cell); delete nodes[cellId]; }
    }
  } else {
    for (const elId of sec.children) delete nodes[elId];
  }
}

export function removeFromParent(nodes: NodeMap, parentId: string, childId: string): void {
  const parent = nodes[parentId];
  if (!parent) return;
  if (isSection(parent) || isGridCell(parent) || isContainer(parent)) {
    const p = parent as { children: string[] };
    nodes[parentId] = { ...parent, children: p.children.filter(c => c !== childId) } as AnyNode;
  }
}

export function appendToParent(nodes: NodeMap, parentId: string, childId: string): void {
  const parent = nodes[parentId];
  if (!parent) return;
  if (isSection(parent) || isGridCell(parent) || isContainer(parent)) {
    const p = parent as { children: string[] };
    nodes[parentId] = { ...parent, children: [...p.children, childId] } as AnyNode;
  }
}

export function equalWidths(n: number): number[] {
  if (n <= 1) return [];
  const w = Math.floor(100 / n);
  const widths = new Array<number>(n).fill(w);
  widths[n - 1] = 100 - w * (n - 1);
  return widths;
}

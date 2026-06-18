import { createContext, useContext, type ReactNode } from 'react';
import type {
  NodeMap, BuilderState, Breakpoint, BreakpointOverride, SectionUpdate,
  CanvasElement, GridCell, ElementType, ElementContent, ContainerLayoutMode,
  Container, CellLayoutMode,
} from '../types';
// All props that are shared across the canvas hierarchy and drilled through
// multiple component levels. Components consume these via useCanvasContext()
// rather than receiving them as props.
export interface CanvasContextValue {
  // Data
  nodes: NodeMap;
  snapshot: BuilderState;
  canvasWidth: number;

  // Config
  breakpoint: Breakpoint;
  previewMode: boolean;
  snapEnabled: boolean;

  // Preview navigation — switch the active page for internal-page link actions.
  // Only used while previewMode is true.
  onPreviewNavigatePage?: (pageId: string) => void;

  // Undo
  onCommit: (prev: BuilderState) => void;

  // Element operations
  selectedId: string | null;
  selectedIds: string[];
  onSelectElement: (id: string, shift: boolean) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onUpdateResponsive?: (id: string, bp: Breakpoint, updates: Partial<BreakpointOverride>) => void;
  onDuplicateElement?: (id: string) => void;
  onDeleteElement?: (id: string) => void;
  onContextMenu: (id: string, x: number, y: number) => void;

  // Section operations
  onUpdateSection: (id: string, updates: SectionUpdate) => void;
  onDrop: (type: ElementType, x: number, y: number, sectionId: string, contentOverride?: Partial<ElementContent>) => void;
  onMoveElementToSection?: (id: string, toSectionId: string, x: number, y: number) => void;

  // Grid cell operations
  selectedGridCellId: string | null;
  onSelectGridCell?: (id: string | null) => void;
  onUpdateGridCell?: (id: string, updates: Partial<GridCell>) => void;
  onDeleteGridCell?: (id: string) => void;
  onAddGridCell?: (sectionId: string, columnSpan?: number) => void;
  onAddElementToCell?: (type: ElementType, cellId: string, x?: number, y?: number) => void;
  onMoveGridElement?: (
    elementId: string, sourceCellId: string, targetCellId: string,
    insertIndex: number, dropPos?: { x: number; y: number },
    sourceCellMode?: CellLayoutMode,
  ) => void;
  onReorderGridCell?: (parentId: string, fromIndex: number, toIndex: number) => void;
  onDropGridLayout?: (sectionId: string | null, columnSpans: number[], atStart?: boolean) => void;
  onRemoveColumnsBlock?: (blockId: string) => void;
  dragOverGridCellId: string | null;

  // Container operations
  onAddContainer?: (cellId: string, mode: ContainerLayoutMode, columnSpans?: number[]) => void;
  onUpdateContainer?: (id: string, updates: Partial<Pick<Container, 'layoutMode' | 'gap' | 'rowGap'>>) => void;
  onAddSubCell?: (containerId: string) => void;
  selectedContainerId?: string | null;
  onSelectContainer?: (id: string) => void;
}

const CanvasContext = createContext<CanvasContextValue | null>(null);

export function CanvasContextProvider({ value, children }: { value: CanvasContextValue; children: ReactNode }) {
  return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>;
}

export function useCanvasContext(): CanvasContextValue {
  const ctx = useContext(CanvasContext);
  if (!ctx) throw new Error('useCanvasContext must be used within a CanvasContextProvider');
  return ctx;
}


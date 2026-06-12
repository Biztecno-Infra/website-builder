import type {
  Breakpoint, CanvasElement, BuilderState, Container, Section, SectionUpdate, GridCell,
  BreakpointOverride, NodeMap, Page, SiteTheme,
} from '../types';
import { GridCellPanel } from './panels/GridCellPanel';
import { SectionPanel } from './panels/SectionPanel';
import { ElementPanel } from './panels/ElementPanel';
import { ContainerPanel } from './panels/ContainerPanel';

interface Props {
  element: CanvasElement | null;
  section: Section | null;
  gridCell?: GridCell | null;
  isInGridCell?: boolean;
  nodes: NodeMap;
  snapshot: BuilderState;
  onUpdate: (id: string, updates: Partial<CanvasElement>) => void;
  onUpdateSection: (id: string, updates: SectionUpdate) => void;
  onUpdateGridCell?: (id: string, updates: Partial<GridCell>) => void;
  onDeleteGridCell?: (id: string) => void;
  onAddGridCell?: (sectionId: string) => void;
  onPushSnapshot: (snapshot: BuilderState) => void;
  onDelete: (id: string) => void;
  container?: Container | null;
  onUpdateContainer?: (id: string, updates: Partial<Pick<Container, 'layoutMode' | 'gap' | 'rowGap'>>) => void;
  breakpoint?: Breakpoint;
  onUpdateResponsive?: (id: string, bp: Breakpoint, updates: Partial<BreakpointOverride>) => void;
  theme: SiteTheme;
  pages: Page[];
}

export function RightSidebar({
  element, section, gridCell = null, isInGridCell = false,
  nodes, snapshot,
  onUpdate, onUpdateSection, onUpdateGridCell, onDeleteGridCell,
  onAddGridCell,
  onPushSnapshot, onDelete,
  container, onUpdateContainer,
  breakpoint = 'desktop', onUpdateResponsive,
  theme, pages,
}: Props) {
  const hasSelection = !!(element || (container && onUpdateContainer) || (gridCell && onUpdateGridCell) || section);

  return (
    <aside className={['pb-right-sidebar', !hasSelection && 'pb-right-sidebar--hidden'].filter(Boolean).join(' ')}>
      {!element && container && onUpdateContainer && (
        <ContainerPanel
          container={container}
          snapshot={snapshot}
          onUpdateContainer={onUpdateContainer}
          onPushSnapshot={onPushSnapshot}
          breakpoint={breakpoint}
        />
      )}
      {!element && !container && gridCell && onUpdateGridCell && (
        <GridCellPanel
          gridCell={gridCell}
          nodes={nodes}
          snapshot={snapshot}
          onUpdateGridCell={onUpdateGridCell}
          onDeleteGridCell={onDeleteGridCell}
          onPushSnapshot={onPushSnapshot}
          breakpoint={breakpoint}
          theme={theme}
        />
      )}
      {!element && !container && !gridCell && section && (
        <SectionPanel
          section={section}
          nodes={nodes}
          snapshot={snapshot}
          onUpdateSection={onUpdateSection}
          onAddGridCell={onAddGridCell}
          onUpdateGridCell={onUpdateGridCell}
          onPushSnapshot={onPushSnapshot}
          breakpoint={breakpoint}
          theme={theme}
        />
      )}
      {element && (
        <ElementPanel
          element={element}
          isInGridCell={isInGridCell}
          nodes={nodes}
          snapshot={snapshot}
          onUpdate={onUpdate}
          onPushSnapshot={onPushSnapshot}
          onDelete={onDelete}
          breakpoint={breakpoint}
          onUpdateResponsive={onUpdateResponsive}
          theme={theme}
          pages={pages}
        />
      )}
    </aside>
  );
}

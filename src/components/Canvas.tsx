import React, { useEffect, useRef, useState } from 'react';
import { SectionView } from './SectionView';
import { SectionDropZone } from './SectionDropZone';
import { canvasDragShared } from './CanvasElement';
import type { Breakpoint, BreakpointOverride, GridCell, Section, SectionUpdate, CanvasElement as El, BuilderState, ElementType, NodeMap } from '../types';
import { CANVAS_W } from '../hooks/useBuilderStore';


export { CANVAS_W };
export const BREAKPOINT_WIDTHS: Record<Breakpoint, number> = {
  desktop: CANVAS_W,
  'large-desktop': 1440,
  tablet: 768,
  mobile: 375,
};

interface Props {
  sections: Section[];  // All sections in render order
  nodes: NodeMap;
  selectedId: string | null;
  selectedIds: string[];
  selectedSectionId: string | null;
  selectedGridCellId?: string | null;
  onSelectSection: (id: string) => void;
  onSelectElement: (id: string, shift: boolean) => void;
  onSelectGridCell?: (id: string | null) => void;
  onDeselect: () => void;
  onUpdate: (id: string, updates: Partial<El>) => void;
  onCommit: (prevSnapshot: BuilderState) => void;
  snapshot: BuilderState;
  onDrop: (type: ElementType, x: number, y: number, sectionId: string) => void;
  onUpdateSection: (id: string, updates: SectionUpdate) => void;
  onAddSection: (afterId?: string, atStart?: boolean) => void;
  onDeleteSection: (id: string) => void;
  onDuplicateSection: (id: string) => void;
  onMoveSectionUp: (index: number) => void;
  onMoveSectionDown: (index: number) => void;
  snapEnabled: boolean;
  onContextMenu: (id: string, x: number, y: number) => void;
  onMultiSelect: (ids: string[], sectionId: string) => void;
  previewMode?: boolean;
  previewWidth?: number;
  breakpoint?: Breakpoint;
  onUpdateResponsive?: (id: string, bp: Breakpoint, updates: Partial<BreakpointOverride>) => void;
  onDuplicateElement?: (id: string) => void;
  onDeleteElement?: (id: string) => void;
  onMoveElementToSection?: (id: string, toSectionId: string, x: number, y: number) => void;
  onMoveElementToGridCell?: (id: string, toCellId: string, insertIndex: number) => void;
  onUpdateGridCell?: (id: string, updates: Partial<GridCell>) => void;
  onAddGridCell?: (sectionId: string, columnSpan?: number) => void;
  onDeleteGridCell?: (id: string) => void;
  onAddElementToCell?: (type: ElementType, cellId: string, x?: number, y?: number) => void;
  onMoveGridElement?: (elementId: string, sourceCellId: string, targetCellId: string, insertIndex: number, dropPos?: { x: number; y: number }, sourceCellMode?: import('../types').CellLayoutMode) => void;
  onReorderGridCell?: (sectionId: string, fromIndex: number, toIndex: number) => void;
  onDropGridLayout?: (sectionId: string | null, columnSpans: number[], atStart?: boolean) => void;
  onAddNestedGrid?: (cellId: string, columnSpans: number[]) => void;
  onRemoveColumnsBlock?: (blockId: string) => void;
  onPromoteSection?: (sectionId: string, role: 'header' | 'footer') => void;
  onAddContainer?: (cellId: string, mode: import('../types').ContainerLayoutMode, columnSpans?: number[]) => void;
  onUpdateContainer?: (id: string, updates: Partial<Pick<import('../types').Container, 'layoutMode' | 'gap' | 'rowGap'>>) => void;
  onAddSubCell?: (containerId: string) => void;
  selectedContainerId?: string | null;
  onSelectContainer?: (id: string) => void;
  zoom?: number;
}

export function Canvas({
  sections, nodes,
  selectedId, selectedIds, selectedSectionId, selectedGridCellId = null,
  onSelectSection, onSelectElement, onSelectGridCell, onDeselect,
  onUpdate, onCommit, snapshot,
  onDrop, onUpdateSection, onAddSection, onDeleteSection,
  onDuplicateSection, onMoveSectionUp, onMoveSectionDown,
  snapEnabled, onContextMenu, onMultiSelect, previewMode, previewWidth,
  breakpoint = 'desktop', onUpdateResponsive,
  onDuplicateElement, onDeleteElement,
  onMoveElementToSection, onMoveElementToGridCell,
  onUpdateGridCell, onAddGridCell, onDeleteGridCell, onAddElementToCell,
  onMoveGridElement, onReorderGridCell,
  onDropGridLayout, onAddNestedGrid, onRemoveColumnsBlock, onPromoteSection,
  onAddContainer, onUpdateContainer, onAddSubCell, selectedContainerId, onSelectContainer,
  zoom = 1,
}: Props) {
  const canvasWidth = previewWidth ?? BREAKPOINT_WIDTHS[breakpoint];
  const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(null);
  const [dragOverGridCellId, setDragOverGridCellId] = useState<string | null>(null);

  canvasDragShared.zoom = previewMode ? 1 : zoom;

  const dragOverRef = useRef<{ id: string; type: 'section' | 'grid-cell' } | null>(null);
  const onMoveRef = useRef(onMoveElementToSection);
  const onMoveToGridCellRef = useRef(onMoveElementToGridCell);
  const scaleRef = useRef(canvasWidth / CANVAS_W);
  const zoomRef = useRef(zoom);
  const snapRef = useRef(snapEnabled);
  const previewRef = useRef(previewMode);
  onMoveRef.current = onMoveElementToSection;
  onMoveToGridCellRef.current = onMoveElementToGridCell;
  scaleRef.current = canvasWidth / CANVAS_W;
  zoomRef.current = zoom;
  snapRef.current = snapEnabled;
  previewRef.current = previewMode;

  useEffect(() => {
    const SNAP_GRID = 8;
    const snapVal = (v: number) =>
      snapRef.current ? Math.round(v / SNAP_GRID) * SNAP_GRID : Math.round(v);

    const onMove = (e: MouseEvent) => {
      if (previewRef.current || !canvasDragShared.active) return;
      const target = document.elementFromPoint(e.clientX, e.clientY);
      const cellSurface = target?.closest('[data-grid-cell-id]') as HTMLElement | null;
      const sectionSurface = target?.closest('[data-section-id]') as HTMLElement | null;
      const cellId = cellSurface?.dataset.gridCellId ?? null;
      const sectionId = sectionSurface?.dataset.sectionId ?? null;

      if (cellId) {
        canvasDragShared.isCrossSection = true;
        if (!dragOverRef.current || dragOverRef.current.id !== cellId || dragOverRef.current.type !== 'grid-cell') {
          dragOverRef.current = { id: cellId, type: 'grid-cell' };
          setDragOverSectionId(null);
          setDragOverGridCellId(cellId);
        }
      } else if (sectionId && sectionId !== canvasDragShared.active.fromSectionId) {
        canvasDragShared.isCrossSection = true;
        if (!dragOverRef.current || dragOverRef.current.id !== sectionId || dragOverRef.current.type !== 'section') {
          dragOverRef.current = { id: sectionId, type: 'section' };
          setDragOverGridCellId(null);
          setDragOverSectionId(sectionId);
        }
      } else {
        canvasDragShared.isCrossSection = false;
        if (dragOverRef.current !== null) {
          dragOverRef.current = null;
          setDragOverGridCellId(null);
          setDragOverSectionId(null);
        }
      }
    };

    const onUp = (e: MouseEvent) => {
      const drag = canvasDragShared.active;
      const target = dragOverRef.current;
      canvasDragShared.isCrossSection = false;
      dragOverRef.current = null;
      setDragOverGridCellId(null);
      setDragOverSectionId(null);

      if (!drag || !target) return;

      if (target.type === 'grid-cell') {
        onMoveToGridCellRef.current?.(drag.id, target.id, 999);
        return;
      }

      const surface = document.querySelector(
        `[data-section-id="${target.id}"]`
      ) as HTMLElement | null;
      if (!surface) return;

      const surfaceRect = surface.getBoundingClientRect();
      const scale = scaleRef.current * zoomRef.current;
      const newX = snapVal((e.clientX - surfaceRect.left - drag.grabOffsetX) / scale);
      const newY = snapVal((e.clientY - surfaceRect.top - drag.grabOffsetY) / scale);

      onMoveRef.current?.(drag.id, target.id, Math.max(0, newX), Math.max(0, newY));
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, []);

  const commonProps = {
    nodes,
    selectedId, selectedIds, selectedGridCellId, canvasWidth,
    onSelectElement, onSelectGridCell, onUpdateElement: onUpdate,
    onCommit, snapshot, snapEnabled, onContextMenu,
    onDrop, onUpdateSection, onMoveElementToSection, previewMode,
    breakpoint, onUpdateResponsive,
    onDuplicateElement, onDeleteElement,
    onUpdateGridCell, onAddGridCell, onDeleteGridCell, onAddElementToCell,
    onMoveGridElement, onReorderGridCell,
    onDropGridLayout, onAddNestedGrid, onRemoveColumnsBlock,
    onAddContainer, onUpdateContainer, onAddSubCell, selectedContainerId, onSelectContainer,
  };

  const BP_CLASS_MAP: Record<string, string | undefined> = { tablet: 'pb-bp-tablet', mobile: 'pb-bp-mobile' };
  const bpClass = BP_CLASS_MAP[breakpoint];

  return (
    <div className={['pb-canvas-wrapper', previewMode && 'pb-preview-mode', bpClass].filter(Boolean).join(' ')}
      style={previewWidth ? { maxWidth: previewWidth } : undefined}
      onMouseDown={previewMode ? undefined : onDeselect}>
      <div className={'pb-canvas-column'} style={{ minWidth: canvasWidth, ...(!previewMode && zoom !== 1 ? { zoom } : {}) }}>

        {breakpoint !== 'desktop' && !previewMode && (
          <div className={'pb-bp-width-indicator'} style={{ width: canvasWidth }}>
            <span>{breakpoint === 'tablet' ? '768px — Tablet' : '375px — Mobile'}</span>
          </div>
        )}

        <SectionDropZone
          atStart
          onDrop={(_afterId, spans, atStart) => onDropGridLayout?.(null, spans, atStart)}
        />

        {sections.map((sec, i) => (
          <React.Fragment key={sec.id}>
            <SectionView
              {...commonProps}
              section={sec}
              role={sec.role}
              isSelected={selectedSectionId === sec.id}
              onSelectSection={() => onSelectSection(sec.id)}
              onAddSectionAfter={() => onAddSection(sec.id)}
              onAddSectionBefore={i === 0 ? () => onAddSection(undefined, true) : () => onAddSection(sections[i - 1].id)}
              onAddGridSectionAfter={(spans: number[]) => onDropGridLayout?.(sec.id, spans)}
              onAddGridSectionBefore={(spans: number[]) => i === 0 ? onDropGridLayout?.(null, spans, true) : onDropGridLayout?.(sections[i - 1].id, spans)}
              onPromoteSection={onPromoteSection ? (role) => onPromoteSection(sec.id, role) : undefined}
              onDeleteSection={() => {
                if (sections.length <= 1) { alert('At least one section is required.'); return; }
                onDeleteSection(sec.id);
              }}
              onDuplicateSection={() => onDuplicateSection(sec.id)}
              onMoveSectionUp={i > 0 ? () => onMoveSectionUp(i) : undefined}
              onMoveSectionDown={i < sections.length - 1 ? () => onMoveSectionDown(i) : undefined}
              onMarqueeSelect={ids => onMultiSelect(ids, sec.id)}
              isDragOverTarget={dragOverSectionId === sec.id}
              dragOverGridCellId={dragOverGridCellId}
            />
            <SectionDropZone
              afterId={sec.id}
              onDrop={(afterId, spans) => onDropGridLayout?.(afterId!, spans)}
            />
          </React.Fragment>
        ))}

      </div>
    </div>
  );
}

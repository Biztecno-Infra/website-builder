import { useEffect, useRef, useState } from 'react';
import { SectionView } from './SectionView';
import { canvasDragShared } from './CanvasElement';
import type { Breakpoint, BreakpointOverride, Section, CanvasElement as El, BuilderState, ElementType, NodeMap } from '../types';
import { CANVAS_W } from '../hooks/useBuilderStore';

export { CANVAS_W };
export const BREAKPOINT_WIDTHS: Record<Breakpoint, number> = {
  desktop: CANVAS_W,
  tablet: 768,
  mobile: 375,
};

interface Props {
  header: Section;
  sections: Section[];
  footer: Section;
  nodes: NodeMap;
  selectedId: string | null;
  selectedIds: string[];
  selectedSectionId: string | null;
  onSelectSection: (id: string) => void;
  onSelectElement: (id: string, shift: boolean) => void;
  onDeselect: () => void;
  onUpdate: (id: string, updates: Partial<El>) => void;
  onCommit: (prevSnapshot: BuilderState) => void;
  snapshot: BuilderState;
  onDrop: (type: ElementType, x: number, y: number, sectionId: string) => void;
  onUpdateSection: (id: string, updates: Partial<Section>) => void;
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
  zoom?: number;
}

export function Canvas({
  header, sections, footer, nodes,
  selectedId, selectedIds, selectedSectionId,
  onSelectSection, onSelectElement, onDeselect,
  onUpdate, onCommit, snapshot,
  onDrop, onUpdateSection, onAddSection, onDeleteSection,
  onDuplicateSection, onMoveSectionUp, onMoveSectionDown,
  snapEnabled, onContextMenu, onMultiSelect, previewMode, previewWidth,
  breakpoint = 'desktop', onUpdateResponsive,
  onDuplicateElement, onDeleteElement,
  onMoveElementToSection,
  zoom = 1,
}: Props) {
  const canvasWidth = previewWidth ?? BREAKPOINT_WIDTHS[breakpoint];
  const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(null);

  canvasDragShared.zoom = previewMode ? 1 : zoom;

  const dragOverRef = useRef<string | null>(null);
  const onMoveRef = useRef(onMoveElementToSection);
  const scaleRef = useRef(canvasWidth / CANVAS_W);
  const zoomRef = useRef(zoom);
  const snapRef = useRef(snapEnabled);
  const previewRef = useRef(previewMode);
  onMoveRef.current = onMoveElementToSection;
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
      const surface = target?.closest('[data-section-id]') as HTMLElement | null;
      const targetId = surface?.dataset.sectionId ?? null;

      if (targetId && targetId !== canvasDragShared.active.fromSectionId) {
        canvasDragShared.isCrossSection = true;
        if (dragOverRef.current !== targetId) {
          dragOverRef.current = targetId;
          setDragOverSectionId(targetId);
        }
      } else {
        canvasDragShared.isCrossSection = false;
        if (dragOverRef.current !== null) {
          dragOverRef.current = null;
          setDragOverSectionId(null);
        }
      }
    };

    const onUp = (e: MouseEvent) => {
      const drag = canvasDragShared.active;
      const targetId = dragOverRef.current;
      canvasDragShared.isCrossSection = false;
      dragOverRef.current = null;
      setDragOverSectionId(null);

      if (!drag || !targetId) return;

      const surface = document.querySelector(
        `[data-section-id="${targetId}"]`
      ) as HTMLElement | null;
      if (!surface) return;

      const surfaceRect = surface.getBoundingClientRect();
      const scale = scaleRef.current * zoomRef.current;
      const newX = snapVal((e.clientX - surfaceRect.left - drag.grabOffsetX) / scale);
      const newY = snapVal((e.clientY - surfaceRect.top - drag.grabOffsetY) / scale);

      onMoveRef.current?.(drag.id, targetId, Math.max(0, newX), Math.max(0, newY));
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
    selectedId, selectedIds, canvasWidth,
    onSelectElement, onUpdateElement: onUpdate,
    onCommit, snapshot, snapEnabled, onContextMenu,
    onDrop, onUpdateSection, previewMode,
    breakpoint, onUpdateResponsive,
    onDuplicateElement, onDeleteElement,
  };

  const bpClass = breakpoint !== 'desktop' ? ` bp-${breakpoint}` : '';

  return (
    <div className={`canvas-wrapper${previewMode ? ' preview-mode' : ''}${bpClass}`}
      style={previewWidth ? { maxWidth: previewWidth } : undefined}
      onMouseDown={previewMode ? undefined : onDeselect}>
      <div className="canvas-column" style={{ minWidth: canvasWidth, zoom: previewMode ? 1 : zoom }}>

        {breakpoint !== 'desktop' && !previewMode && (
          <div className="bp-width-indicator" style={{ width: canvasWidth }}>
            <span>{breakpoint === 'tablet' ? '768px — Tablet' : '375px — Mobile'}</span>
          </div>
        )}

        <SectionView
          {...commonProps}
          section={header}
          role="header"
          isSelected={selectedSectionId === header.id}
          onSelectSection={() => onSelectSection(header.id)}
          onMarqueeSelect={ids => onMultiSelect(ids, header.id)}
          isDragOverTarget={dragOverSectionId === header.id}
        />

        {sections.map((sec, i) => (
          <SectionView
            key={sec.id}
            {...commonProps}
            section={sec}
            role="section"
            isSelected={selectedSectionId === sec.id}
            onSelectSection={() => onSelectSection(sec.id)}
            onAddSectionAfter={() => onAddSection(sec.id)}
            onAddSectionBefore={i === 0 ? () => onAddSection(undefined, true) : undefined}
            onDeleteSection={() => onDeleteSection(sec.id)}
            onDuplicateSection={() => onDuplicateSection(sec.id)}
            onMoveSectionUp={i > 0 ? () => onMoveSectionUp(i) : undefined}
            onMoveSectionDown={i < sections.length - 1 ? () => onMoveSectionDown(i) : undefined}
            onMarqueeSelect={ids => onMultiSelect(ids, sec.id)}
            isDragOverTarget={dragOverSectionId === sec.id}
          />
        ))}

        <SectionView
          {...commonProps}
          section={footer}
          role="footer"
          isSelected={selectedSectionId === footer.id}
          onSelectSection={() => onSelectSection(footer.id)}
          onMarqueeSelect={ids => onMultiSelect(ids, footer.id)}
          isDragOverTarget={dragOverSectionId === footer.id}
        />

      </div>
    </div>
  );
}

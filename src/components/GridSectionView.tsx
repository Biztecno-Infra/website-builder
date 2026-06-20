import React, { useRef, useState } from 'react';
import { DraggableCellWrapper } from './DraggableCellWrapper';
import { GridCellView } from './GridCellView';
import type {
  Breakpoint, BreakpointOverride, BuilderState, CanvasElement as El,
  GridCell, GridSection, NodeMap, Section, SectionUpdate, ElementType,
} from '../types';
import { CANVAS_W } from '../hooks/useBuilderStore';

export { GRID_CELL_DND_TYPE } from './DraggableCellWrapper';

interface Props {
  section: GridSection;
  nodes: NodeMap;
  role: 'header' | 'section' | 'footer';
  isSelected: boolean;
  selectedId: string | null;
  selectedGridCellId?: string | null;
  canvasWidth: number;
  onSelectSection: () => void;
  onSelectGridCell: (id: string | null) => void;
  onSelectElement: (id: string, shift: boolean) => void;
  onUpdateElement: (id: string, updates: Partial<El>) => void;
  onUpdateGridCell: (id: string, updates: Partial<GridCell>) => void;
  onAddGridCell: (sectionId: string, columnSpan?: number) => void;
  onDeleteGridCell: (id: string) => void;
  onAddElementToCell: (type: ElementType, cellId: string) => void;
  onCommit: (prev: BuilderState) => void;
  snapshot: BuilderState;
  onUpdateSection: (id: string, updates: SectionUpdate) => void;
  onAddSectionBefore?: () => void;
  onAddSectionAfter?: () => void;
  onDeleteSection?: () => void;
  onDuplicateSection?: () => void;
  onMoveSectionUp?: () => void;
  onMoveSectionDown?: () => void;
  previewMode?: boolean;
  breakpoint?: Breakpoint;
  onUpdateResponsive?: (id: string, bp: Breakpoint, updates: Partial<BreakpointOverride>) => void;
  onDuplicateElement?: (id: string) => void;
  onDeleteElement?: (id: string) => void;
  onMoveGridElement?: (elementId: string, sourceCellId: string, targetCellId: string, insertIndex: number) => void;
  dragOverGridCellId?: string | null;
  onReorderGridCell?: (sectionId: string, fromIndex: number, toIndex: number) => void;
}

export function GridSectionView({
  section, nodes, role, isSelected,
  selectedId, selectedGridCellId,
  canvasWidth, onSelectSection, onSelectGridCell,
  onSelectElement, onUpdateElement,
  onUpdateGridCell, onAddGridCell, onDeleteGridCell, onAddElementToCell,
  onCommit, snapshot, onUpdateSection,
  onAddSectionBefore, onAddSectionAfter, onDeleteSection, onDuplicateSection,
  onMoveSectionUp, onMoveSectionDown,
  previewMode, breakpoint = 'desktop',
  onUpdateResponsive, onDuplicateElement, onDeleteElement,
  onMoveGridElement,
  dragOverGridCellId,
  onReorderGridCell,
}: Props) {
  const bgRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const bg = section.style.background;
  const gridCfg = section.grid;

  const secBgImage = bg.type === 'linear-gradient'
    ? `linear-gradient(${bg.angle}deg, ${bg.from}, ${bg.to})`
    : bg.type === 'radial-gradient'
    ? `radial-gradient(circle, ${bg.from}, ${bg.to})`
    : bg.image ? `url(${bg.image})` : undefined;

  const sectionBgStyle: React.CSSProperties = {
    position: 'relative', width: '100%',
    backgroundColor: bg.type === 'solid' ? (bg.color || '#ffffff') : undefined,
    backgroundImage: secBgImage,
    backgroundSize: 'cover', backgroundPosition: 'center', boxSizing: 'border-box',
  };

  const pad = section.style.padding ?? { top: 0, right: 0, bottom: 0, left: 0 };

  const sectionContentStyle: React.CSSProperties = {
    position: 'relative', width: canvasWidth, margin: '0 auto', boxSizing: 'border-box',
    outline: isSelected ? '2px solid #006e75' : undefined, outlineOffset: -2,
    paddingTop: pad.top, paddingRight: pad.right, paddingBottom: pad.bottom, paddingLeft: pad.left,
  };

  const overlayStyle: React.CSSProperties | undefined = bg.overlay > 0 ? {
    position: 'absolute', inset: 0,
    backgroundColor: `rgba(0,0,0,${bg.overlay})`,
    pointerEvents: 'none', zIndex: 0,
  } : undefined;

  const getCellSpan = (cell: GridCell): number => {
    if (breakpoint === 'mobile') return cell.responsive.mobile?.columnSpan ?? cell.responsive.tablet?.columnSpan ?? cell.columnSpan;
    if (breakpoint === 'tablet') return cell.responsive.tablet?.columnSpan ?? cell.columnSpan;
    return cell.columnSpan;
  };

  const cells = section.children
    .map(id => nodes[id] as GridCell | undefined)
    .filter((c): c is GridCell => !!c);

  const usedSpan = cells.reduce((sum, c) => sum + Math.min(getCellSpan(c), 12), 0);

  return (
    <div
      style={{ position: 'relative', flexShrink: 0, zIndex: (hovered || isSelected) ? 1 : undefined }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div ref={bgRef} className="section-bg" style={sectionBgStyle}
        onMouseDown={e => {
          if (e.target !== bgRef.current) return;
          e.stopPropagation(); onSelectSection(); onSelectGridCell(null);
        }}
      >
        {overlayStyle && <div style={overlayStyle} />}
        {breakpoint !== 'desktop' && !previewMode && (
          <>
            <div className="bp-margin-overlay bp-margin-left" style={{ width: `calc((100% - ${canvasWidth}px) / 2)` }} />
            <div className="bp-margin-overlay bp-margin-right" style={{ width: `calc((100% - ${canvasWidth}px) / 2)` }} />
          </>
        )}

        <div
          className="section-surface grid-section-surface"
          data-section-id={section.id}
          style={sectionContentStyle}
          onMouseDown={e => {
            if ((e.target as HTMLElement).closest('.grid-cell')) return;
            e.stopPropagation(); onSelectSection(); onSelectGridCell(null);
          }}
        >
          {!previewMode && (hovered || isSelected) && (
            <div className="section-label-badge">
              {role === 'header' ? 'Header' : role === 'footer' ? 'Footer' : section.label}
              <span className="section-label-mode"> · Grid</span>
              {cells.length > 0 && (
                <span className={`section-col-usage${usedSpan > 12 ? ' over' : usedSpan === 12 ? ' full' : ''}`}>
                  {usedSpan}/12
                </span>
              )}
            </div>
          )}

          {!previewMode && (hovered || isSelected) && role === 'section' && (
            <div className="section-action-bar">
              <button className="section-action-btn" title="Move up"
                onClick={e => { e.stopPropagation(); onMoveSectionUp?.(); }}>↑</button>
              <button className="section-action-btn" title="Move down"
                onClick={e => { e.stopPropagation(); onMoveSectionDown?.(); }}>↓</button>
              <button className="section-action-btn" title="Duplicate section"
                onClick={e => { e.stopPropagation(); onDuplicateSection?.(); }}>⧉</button>
              <div className="section-action-divider" />
              <button className="section-action-btn danger" title="Delete section"
                onClick={e => { e.stopPropagation(); onDeleteSection?.(); }}>✕</button>
            </div>
          )}

          <div className="grid-area-wrapper">
            <div
              className="grid-cells-row"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(12, 1fr)',
                gap: `${gridCfg.rowGap}px ${gridCfg.gap}px`,
              }}
            >
              {cells.map((cell, index) => (
                <DraggableCellWrapper
                  key={cell.id}
                  cell={cell}
                  index={index}
                  parentId={section.id}
                  breakpoint={breakpoint}
                  previewMode={previewMode}
                  onReorderCell={(from, to) => onReorderGridCell?.(section.id, from, to)}
                >
                  <GridCellView
                    cell={cell}
                    nodes={nodes}
                    isSelected={selectedGridCellId === cell.id}
                    selectedElementId={selectedId}
                    selectedGridCellId={selectedGridCellId}
                    onSelectCell={() => { onSelectGridCell(cell.id); onSelectSection(); }}
                    onSelectElement={elId => {
                      // Select section + immediate parent cell + element in one click
                      onSelectSection();
                      const el = nodes[elId];
                      const elParent = el?.type !== 'section' ? el?.parent : undefined;
                      const parentCellId = elParent && nodes[elParent]?.type === 'grid-cell'
                        ? elParent
                        : cell.id;
                      onSelectGridCell(parentCellId);
                      onSelectElement(elId, false);
                    }}
                    onUpdateElement={onUpdateElement}
                    onUpdateCell={updates => onUpdateGridCell(cell.id, updates)}
                    onDeleteCell={() => onDeleteGridCell(cell.id)}
                    onAddElement={type => onAddElementToCell(type, cell.id)}
                    onCommit={onCommit}
                    snapshot={snapshot}
                    previewMode={previewMode}
                    breakpoint={breakpoint}
                    onUpdateResponsive={onUpdateResponsive}
                    onDuplicateElement={onDuplicateElement}
                    onDeleteElement={onDeleteElement}
                    onMoveGridElement={onMoveGridElement}
                    isDragOverTarget={dragOverGridCellId === cell.id}
                    onUpdateGridCell={onUpdateGridCell}
                    onDeleteGridCell={onDeleteGridCell}
                    onAddElementToCell={onAddElementToCell}
                    onSelectGridCell={onSelectGridCell}
                    onReorderGridCell={onReorderGridCell}
                  />
                </DraggableCellWrapper>
              ))}
            </div>

            {cells.length === 0 && !previewMode && (
              <div className="grid-empty-state">
                <span className="grid-empty-icon">⊞</span>
                <span>Select this section, then use the right panel to add columns</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {!previewMode && (hovered || isSelected) && onAddSectionBefore && (
        <button className="section-add-btn section-add-btn--top" title="Add section above"
          onClick={e => { e.stopPropagation(); onAddSectionBefore(); }}>+</button>
      )}
      {!previewMode && (hovered || isSelected) && onAddSectionAfter && (
        <button className="section-add-btn section-add-btn--bottom" title="Add section below"
          onClick={e => { e.stopPropagation(); onAddSectionAfter(); }}>+</button>
      )}
    </div>
  );
}

export { CANVAS_W };

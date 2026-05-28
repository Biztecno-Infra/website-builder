import { useRef, useState } from 'react';
import type React from 'react';
import { useDrop } from 'react-dnd';
import { CanvasElement, canvasDragShared } from './CanvasElement';
import type { GuideLine } from './CanvasElement';
import { GridSectionView } from './GridSectionView';
import { DND_TYPE, LAYOUT_DND_TYPE } from './LeftSidebar';
import { GRID_EL_DND_TYPE } from './GridElementView';
import type { Breakpoint, BreakpointOverride, GridCell, GridSection, NodeMap, Section, SectionUpdate, CanvasElement as El, BuilderState, ElementType } from '../types';
import { applyBreakpoint, CANVAS_W } from '../hooks/useBuilderStore';
import { sectionBgProps } from '../utils/sectionStyle';


interface Props {
  section: Section;
  nodes: NodeMap;
  role: 'header' | 'section' | 'footer';
  isSelected: boolean;
  selectedId: string | null;
  selectedIds: string[];
  selectedGridCellId?: string | null;
  canvasWidth: number;
  onSelectSection: () => void;
  onSelectElement: (id: string, shift: boolean) => void;
  onSelectGridCell?: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<El>) => void;
  onUpdateGridCell?: (id: string, updates: Partial<GridCell>) => void;
  onAddGridCell?: (sectionId: string, columnSpan?: number) => void;
  onDeleteGridCell?: (id: string) => void;
  onAddElementToCell?: (type: ElementType, cellId: string, x?: number, y?: number) => void;
  onCommit: (prev: BuilderState) => void;
  snapshot: BuilderState;
  snapEnabled: boolean;
  onContextMenu: (id: string, x: number, y: number) => void;
  onDrop: (type: ElementType, x: number, y: number, sectionId: string) => void;
  onMoveElementToSection?: (id: string, toSectionId: string, x: number, y: number) => void;
  onUpdateSection: (id: string, updates: SectionUpdate) => void;
  onAddSectionBefore?: () => void;
  onAddSectionAfter?: () => void;
  onPromoteSection?: (role: 'header' | 'footer') => void;
  onAddGridSectionBefore?: (columnSpans: number[]) => void;
  onAddGridSectionAfter?: (columnSpans: number[]) => void;
  onDeleteSection?: () => void;
  onDuplicateSection?: () => void;
  onMoveSectionUp?: () => void;
  onMoveSectionDown?: () => void;
  onMarqueeSelect?: (ids: string[]) => void;
  previewMode?: boolean;
  breakpoint?: Breakpoint;
  onUpdateResponsive?: (id: string, bp: Breakpoint, updates: Partial<BreakpointOverride>) => void;
  onDuplicateElement?: (id: string) => void;
  onDeleteElement?: (id: string) => void;
  onMoveGridElement?: (elementId: string, sourceCellId: string, targetCellId: string, insertIndex: number, dropPos?: { x: number; y: number }, sourceCellMode?: import('../types').CellLayoutMode) => void;
  isDragOverTarget?: boolean;
  dragOverGridCellId?: string | null;
  onReorderGridCell?: (sectionId: string, fromIndex: number, toIndex: number) => void;
  onDropGridLayout?: (sectionId: string, columnSpans: number[]) => void;
  onRemoveColumnsBlock?: (blockId: string) => void;
  onAddContainer?: (cellId: string, mode: import('../types').ContainerLayoutMode, columnSpans?: number[]) => void;
  onUpdateContainer?: (id: string, updates: Partial<Pick<import('../types').Container, 'layoutMode' | 'gap' | 'rowGap'>>) => void;
  onAddSubCell?: (containerId: string) => void;
  selectedContainerId?: string | null;
  onSelectContainer?: (id: string) => void;
  pageLayoutWidth?: 'fixed' | 'fluid';
}

// Pure dispatcher — no hooks here, so React hook count never changes between renders.
export function SectionView(props: Props) {
  if (props.section.layoutMode === 'grid') {
    const { section, onSelectGridCell, onUpdateGridCell, onAddGridCell, onDeleteGridCell, onAddElementToCell, onDropGridLayout, onRemoveColumnsBlock, onAddContainer, onUpdateContainer, onAddSubCell, selectedContainerId, onSelectContainer, onAddGridSectionBefore, onAddGridSectionAfter, ...rest } = props;
    return (
      <GridSectionView
        section={section as GridSection}
        onSelectGridCell={onSelectGridCell ?? (() => {})}
        onUpdateGridCell={onUpdateGridCell ?? (() => {})}
        onAddGridCell={onAddGridCell ?? (() => {})}
        onDeleteGridCell={onDeleteGridCell ?? (() => {})}
        onAddElementToCell={onAddElementToCell ?? (() => {})}
        onDropGridLayout={onDropGridLayout}
        onRemoveColumnsBlock={onRemoveColumnsBlock}
        onAddContainer={onAddContainer}
        onUpdateContainer={onUpdateContainer}
        onAddSubCell={onAddSubCell}
        selectedContainerId={selectedContainerId}
        onSelectContainer={onSelectContainer}
        onAddGridSectionBefore={onAddGridSectionBefore}
        onAddGridSectionAfter={onAddGridSectionAfter}
        {...rest}
      />
    );
  }
  return <FreeSectionView {...props} />;
}

function FreeSectionView({
  section, nodes, role, isSelected,
  selectedId, selectedIds, canvasWidth,
  onSelectSection, onSelectElement,
  onUpdateElement,
  onCommit, snapshot, snapEnabled, onContextMenu,
  onDrop, onUpdateSection, onMoveElementToSection,
  onAddSectionBefore, onAddSectionAfter, onDeleteSection, onDuplicateSection, onMoveSectionUp, onMoveSectionDown,
  onPromoteSection,
  onMarqueeSelect, previewMode,
  breakpoint = 'desktop', onUpdateResponsive,
  onDuplicateElement, onDeleteElement,
  isDragOverTarget = false,
  onDropGridLayout,
}: Props) {
  const bgRef = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [guides, setGuides] = useState<GuideLine[]>([]);
  const [marquee, setMarquee] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  const bg = section.style.background;
  const cols = section.style.columns;
  const sectionHeight =
    breakpoint === 'mobile' ? (section.responsive?.mobile?.height ?? section.responsive?.tablet?.height ?? section.layout.height) :
    breakpoint === 'tablet' ? (section.responsive?.tablet?.height ?? section.layout.height) :
    section.layout.height;
  const sectionElements = section.children.map(id => nodes[id] as El | undefined).filter((el): el is El => !!el);

  const [{ isOver }, dropRef] = useDrop<any, void, { isOver: boolean }>({
    accept: [DND_TYPE, GRID_EL_DND_TYPE],
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset();
      if (!offset || !surfaceRef.current) return;
      const rect = surfaceRef.current.getBoundingClientRect();
      const z = canvasDragShared.zoom;

      if ('elementId' in item) {
        onMoveElementToSection?.(item.elementId, section.id, (offset.x - rect.left) / z, (offset.y - rect.top) / z);
        return;
      }

      onDrop(item.type, (offset.x - rect.left) / z, (offset.y - rect.top) / z, section.id);
    },
    collect: m => ({ isOver: m.isOver() }),
  });

  const [{ isLayoutOver }, layoutDropRef] = useDrop<{ columnSpans: number[] }, void, { isLayoutOver: boolean }>({
    accept: LAYOUT_DND_TYPE,
    canDrop: () => true,
    drop: (item, monitor) => {
      if (monitor.didDrop()) return;
      onDropGridLayout?.(section.id, item.columnSpans);
    },
    collect: m => ({ isLayoutOver: m.isOver() }),
  });

  const handleDividerMouseDown = (e: React.MouseEvent, dividerIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!surfaceRef.current) return;
    const rect = surfaceRef.current.getBoundingClientRect();
    const startX = e.clientX;
    const startWidths = [...cols.widths];
    const totalPx = rect.width;

    const onMove = (ev: MouseEvent) => {
      const dx = (ev.clientX - startX) / canvasDragShared.zoom;
      const dPct = (dx / totalPx) * 100;
      const newWidths = [...startWidths];
      const minPct = 5;
      newWidths[dividerIndex] = Math.max(minPct, startWidths[dividerIndex] + dPct);
      newWidths[dividerIndex + 1] = Math.max(minPct, startWidths[dividerIndex + 1] - dPct);
      const sum = newWidths.reduce((a, b) => a + b, 0);
      onUpdateSection(section.id, { style: { ...section.style, columns: { ...cols, widths: newWidths.map(w => (w / sum) * 100) } } });
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startY = e.clientY;
    const startH = sectionHeight;
    const onMove = (ev: MouseEvent) => {
      onUpdateSection(section.id, { layout: { ...section.layout, height: Math.max(80, Math.round(startH + (ev.clientY - startY) / canvasDragShared.zoom)) } });
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const sectionBgStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: sectionHeight,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    boxSizing: 'border-box',
    ...sectionBgProps(bg),
  };

  const sectionContentStyle: React.CSSProperties = {
    position: 'relative',
    width: canvasWidth,
    height: '100%',
    margin: '0 auto',
    boxSizing: 'border-box',
    outline: isSelected ? '2px solid #006e75' : (isOver || isDragOverTarget) ? '2px dashed #0b978e' : undefined,
    outlineOffset: -2,
  };

  const overlayStyle: React.CSSProperties | undefined = bg.overlay > 0 ? {
    position: 'absolute', inset: 0,
    backgroundColor: `rgba(0,0,0,${bg.overlay})`,
    pointerEvents: 'none', zIndex: 0,
  } : undefined;

  const handleSurfaceMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== surfaceRef.current) return;
    e.stopPropagation();
    const rect = surfaceRef.current!.getBoundingClientRect();
    const z = canvasDragShared.zoom;
    const startX = (e.clientX - rect.left) / z;
    const startY = (e.clientY - rect.top) / z;
    let dragging = false;

    const onMove = (ev: MouseEvent) => {
      const ex = (ev.clientX - rect.left) / z;
      const ey = (ev.clientY - rect.top) / z;
      if (!dragging && (Math.abs(ex - startX) > 4 || Math.abs(ey - startY) > 4)) dragging = true;
      if (dragging) {
        setMarquee({
          x: Math.min(startX, ex), y: Math.min(startY, ey),
          w: Math.abs(ex - startX), h: Math.abs(ey - startY),
        });
      }
    };

    const onUp = (ev: MouseEvent) => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      if (dragging) {
        const ex = (ev.clientX - rect.left) / z;
        const ey = (ev.clientY - rect.top) / z;
        const mx = Math.min(startX, ex), my = Math.min(startY, ey);
        const mw = Math.abs(ex - startX), mh = Math.abs(ey - startY);
        const ids = section.children.filter(id => {
          const el = nodes[id] as El | undefined;
          return el && !el.state.hidden
            && el.layout.x < mx + mw && el.layout.x + el.layout.width > mx
            && el.layout.y < my + mh && el.layout.y + el.layout.height > my;
        });
        onMarqueeSelect?.(ids);
      } else {
        onSelectSection();
      }
      setMarquee(null);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const scrollBehavior = section.scrollBehavior ?? 'normal';
  const isSticky = scrollBehavior === 'sticky';
  const isFixed  = scrollBehavior === 'fixed';
  // Fixed renders as sticky in the editor canvas — true position:fixed would escape the canvas DOM.
  // The export emits genuine position:fixed.
  const hasActiveChild = !!(selectedId && section.children.includes(selectedId));
  const outerStyle: React.CSSProperties = (isSticky || isFixed)
    ? { flexShrink: 0, position: 'sticky', top: section.stickyOffset ?? 0, zIndex: 50 }
    : { position: 'relative', flexShrink: 0, zIndex: (hovered || isSelected || hasActiveChild) ? 10 : undefined };

  return (
    <div
      style={outerStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {!previewMode && (hovered || isSelected) && (
        <>
          <button
            className={'pb-section-insert-btn pb-section-insert-btn--above'}
            title="Insert section above"
            onMouseDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); onAddSectionBefore?.(); }}
          >+</button>
          <button
            className={'pb-section-insert-btn pb-section-insert-btn--below'}
            title="Insert section below"
            onMouseDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); onAddSectionAfter?.(); }}
          >+</button>
        </>
      )}
      {/* Full-width section background */}
      <div
        ref={node => {
          (bgRef as { current: HTMLDivElement | null }).current = node;
          (layoutDropRef as unknown as (el: HTMLDivElement | null) => void)(node);
        }}
        className={'pb-section-bg'}
        style={{ ...sectionBgStyle, ...(isLayoutOver ? { boxShadow: 'inset 0 -3px 0 0 #006e75' } : {}) }}
        onMouseDown={e => {
          if (e.target !== bgRef.current) return;
          e.stopPropagation();
          onSelectSection();
        }}
      >
        {overlayStyle && <div style={overlayStyle} />}

        {breakpoint !== 'desktop' && !previewMode && (
          <>
            <div className={"pb-bp-margin-overlay pb-bp-margin-left"} style={{ width: `calc((100% - ${canvasWidth}px) / 2)` }} />
            <div className={"pb-bp-margin-overlay pb-bp-margin-right"} style={{ width: `calc((100% - ${canvasWidth}px) / 2)` }} />
          </>
        )}

        <div
          ref={node => {
            (surfaceRef as React.RefObject<HTMLDivElement | null>).current = node;
            (dropRef as unknown as (el: HTMLDivElement | null) => void)(node);
          }}
          className={['pb-section-surface', isOver && 'pb-drag-over'].filter(Boolean).join(' ')}
          data-section-id={section.id}
          style={sectionContentStyle}
          onMouseDown={handleSurfaceMouseDown}
        >
          {!previewMode && (hovered || isSelected) && (
            <div className={'pb-section-label-badge'}>
              {role === 'header' ? 'Header' : role === 'footer' ? 'Footer' : section.label}
              {isSticky && <span className={'pb-section-label-mode'}> · Sticky</span>}
              {isFixed  && <span className={'pb-section-label-mode'}> · Fixed</span>}
            </div>
          )}

          {!previewMode && isSelected && (
            <div className={'pb-section-action-bar'} onMouseDown={e => e.stopPropagation()}>
              <button className={'pb-section-action-btn'} title="Move up"
                onClick={e => { e.stopPropagation(); onMoveSectionUp?.(); }}>↑</button>
              <button className={'pb-section-action-btn'} title="Move down"
                onClick={e => { e.stopPropagation(); onMoveSectionDown?.(); }}>↓</button>
              <button className={'pb-section-action-btn'} title="Duplicate section"
                onClick={e => { e.stopPropagation(); onDuplicateSection?.(); }}>⧉</button>
              <div className={'pb-section-action-divider'} />
              <button className={"pb-section-action-btn pb-danger"} title="Delete section"
                onClick={e => { e.stopPropagation(); onDeleteSection?.(); }}>✕</button>
            </div>
          )}

          {/* Column background fills */}
          {cols.count > 1 && cols.widths.length > 0 && (
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
              {cols.widths.map((w, i) => {
                const left = cols.widths.slice(0, i).reduce((a, b) => a + b, 0);
                const cs = cols.styles[i];
                if (!cs?.background) return null;
                const csb = cs.background;

                let colBg: string | undefined;
                if (csb.type === 'linear-gradient' && csb.from && csb.to) {
                  colBg = `linear-gradient(${csb.angle ?? 135}deg, ${csb.from}, ${csb.to})`;
                } else if (csb.type === 'radial-gradient' && csb.from && csb.to) {
                  colBg = `radial-gradient(circle, ${csb.from}, ${csb.to})`;
                } else if (csb.image) {
                  colBg = `url(${csb.image})`;
                }

                return (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      left: `${left}%`,
                      width: `${w}%`,
                      height: '100%',
                      backgroundColor: (!csb.type || csb.type === 'solid') ? csb.color : undefined,
                      backgroundImage: colBg,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    {(csb.overlay ?? 0) > 0 && (
                      <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${csb.overlay})` }} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Column guides */}
          {cols.count > 1 && cols.widths.length > 0 && (
            <div className={'pb-column-guides'}>
              {cols.widths.slice(0, -1).map((_, i) => {
                const left = cols.widths.slice(0, i + 1).reduce((a, b) => a + b, 0);
                return (
                  <div
                    key={i}
                    className={'pb-column-divider'}
                    style={{ left: `${left}%` }}
                    onMouseDown={ev => handleDividerMouseDown(ev, i)}
                  />
                );
              })}
            </div>
          )}

          {guides.map((g, i) =>
            g.type === 'v'
              ? <div key={i} className={'pb-guide-v'} style={{ left: g.pos }} />
              : <div key={i} className={'pb-guide-h'} style={{ top: g.pos }} />
          )}

          {marquee && (
            <div className={'pb-marquee-rect'} style={{
              left: marquee.x, top: marquee.y, width: marquee.w, height: marquee.h,
            }} />
          )}

          {section.children.map(id => {
            const rawEl = nodes[id] as El | undefined;
            if (!rawEl) return null;
            const scale = canvasWidth / CANVAS_W;
            const el = applyBreakpoint(rawEl, breakpoint, scale);
            if (el.state.hidden) return null;

            const handleUpdate = (updates: Partial<El>) => {
              if (breakpoint !== 'desktop' && onUpdateResponsive) {
                const respUpdate: Partial<BreakpointOverride> = {};
                if (updates.layout) respUpdate.layout = updates.layout;
                if (updates.style?.typography) respUpdate.style = { typography: updates.style.typography };
                if (updates.state) respUpdate.state = updates.state;
                if (Object.keys(respUpdate).length > 0) {
                  onUpdateResponsive(id, breakpoint, respUpdate);
                } else {
                  onUpdateElement(id, updates);
                }
              } else {
                onUpdateElement(id, updates);
              }
            };

            return (
              <CanvasElement
                key={id}
                element={el}
                sectionId={section.id}
                isSelected={selectedId === id}
                isMultiSelected={selectedIds.includes(id) && selectedId !== id}
                onSelect={shift => onSelectElement(id, shift)}
                onUpdate={handleUpdate}
                onCommit={onCommit}
                snapshot={snapshot}
                snapEnabled={snapEnabled}
                onContextMenu={(x, y) => onContextMenu(id, x, y)}
                sectionElements={sectionElements}
                onGuides={setGuides}
                previewMode={previewMode}
                onDuplicate={onDuplicateElement ? () => onDuplicateElement(id) : undefined}
                onDelete={onDeleteElement ? () => onDeleteElement(id) : undefined}
              />
            );
          })}

          {section.children.length === 0 && !previewMode && (
            <div className={'pb-section-empty'}>
              Drag elements here or click palette items to add
            </div>
          )}
        </div>
      </div>

      {!previewMode && (
        <div className={'pb-section-resize-handle'} onMouseDown={handleResizeMouseDown} title="Drag to resize" />
      )}

    </div>
  );
}

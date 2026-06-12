import { useRef, useState } from 'react';
import type React from 'react';
import { useDrop } from 'react-dnd';
import { CanvasElement, canvasDragShared } from './CanvasElement';
import type { GuideLine, DragInfo } from './CanvasElement';
import { DragGuides } from './DragGuides';
import { GridSectionView } from './GridSectionView';
import { DND_TYPE, LAYOUT_DND_TYPE } from './LeftSidebar';
import { GRID_EL_DND_TYPE } from './GridElementView';
import type { GridSection, FlexSection, Section, CanvasElement as El, BreakpointOverride } from '../types';
import { applyBreakpoint, CANVAS_W } from '../hooks/useBuilderStore';
import { sectionBgProps } from '../utils/sectionStyle';
import { resolveResponsive } from '../utils/responsive';
import { useCanvasContext } from '../contexts/CanvasContext';

// Props that are truly per-section — section-specific data and closures.
// Shared canvas state (nodes, breakpoint, selectedId, etc.) is consumed from CanvasContext.
interface Props {
  section: Section;
  role: 'header' | 'section' | 'footer';
  isSelected: boolean;
  onSelectSection: () => void;
  onAddSectionBefore?: () => void;
  onAddSectionAfter?: () => void;
  onPromoteSection?: (role: 'header' | 'footer') => void;
  onDeleteSection?: () => void;
  onDuplicateSection?: () => void;
  onCopyGridCell?: (id: string) => void;
  onPasteGridCell?: (sectionId: string, afterCellId?: string) => void;
  onPasteIntoGridCell?: (cellId: string) => void;
  hasCellClipboard?: boolean;
  onMoveSectionUp?: () => void;
  onMoveSectionDown?: () => void;
  onMarqueeSelect?: (ids: string[]) => void;
  isDragOverTarget?: boolean;
  pageLayoutWidth?: 'fixed' | 'fluid';
}

// Pure dispatcher — no hooks here, so React hook count never changes between renders.
export function SectionView(props: Props) {
  if (props.section.layoutMode === 'grid' || props.section.layoutMode === 'flex') {
    const { section, ...rest } = props;
    return <GridSectionView section={section as GridSection | FlexSection} {...rest} />;
  }
  return <FreeSectionView {...props} />;
}

function FreeSectionView({
  section, role, isSelected,
  onSelectSection,
  onAddSectionBefore, onAddSectionAfter, onDeleteSection, onDuplicateSection,
  onCopyGridCell: _onCopyGridCell, onPasteGridCell: _onPasteGridCell,
  onPasteIntoGridCell: _onPasteIntoGridCell, hasCellClipboard: _hasCellClipboard,
  onMoveSectionUp, onMoveSectionDown, onPromoteSection: _onPromoteSection,
  onMarqueeSelect, isDragOverTarget = false,
}: Props) {
  const {
    nodes, canvasWidth, snapshot, snapEnabled, onCommit,
    previewMode, breakpoint = 'desktop', onUpdateResponsive,
    selectedId, selectedIds, onSelectElement, onUpdateElement,
    onDrop, onMoveElementToSection, onUpdateSection,
    onDuplicateElement, onDeleteElement, onContextMenu,
    onDropGridLayout,
  } = useCanvasContext();

  const bgRef = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [guides, setGuides] = useState<GuideLine[]>([]);
  const [dragInfo, setDragInfo] = useState<DragInfo | null>(null);
  const [marquee, setMarquee] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  const bg = section.style.background;
  const cols = section.style.columns;
  const basePad = section.style.padding ?? { top: 0, right: 0, bottom: 0, left: 0 };
  const bpPadOverride =
    breakpoint === 'mobile' ? section.responsive?.mobile?.padding
    : breakpoint === 'tablet' ? section.responsive?.tablet?.padding
    : undefined;
  const effPad = { ...basePad, ...bpPadOverride };
  const sectionHeight = resolveResponsive(breakpoint, section.layout.height, section.responsive?.tablet?.height, section.responsive?.mobile?.height);
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

  const secBorder = section.style.border;
  const sectionBgStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: sectionHeight,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    boxSizing: 'border-box',
    ...sectionBgProps(bg),
    ...(secBorder?.radius ? { borderRadius: secBorder.radius } : {}),
    ...(secBorder?.width && secBorder.width > 0 ? { border: `${secBorder.width}px ${secBorder.style ?? 'solid'} ${secBorder.color}` } : {}),
  };

  const scrollBehavior = section.scrollBehavior ?? 'normal';
  const isSticky = scrollBehavior === 'sticky';
  const isFixed  = scrollBehavior === 'fixed';
  const hasActiveChild = !!(selectedId && section.children.includes(selectedId));

  const sectionContentStyle: React.CSSProperties = {
    position: 'relative',
    width: canvasWidth,
    height: '100%',
    margin: '0 auto',
    boxSizing: 'border-box',
    outline: (isSelected && !hasActiveChild) ? '2px solid #006e75' : (isOver || isDragOverTarget) ? '2px dashed #0b978e' : undefined,
    outlineOffset: -2,
    paddingTop: effPad.top || undefined,
    paddingRight: effPad.right || undefined,
    paddingBottom: effPad.bottom || undefined,
    paddingLeft: effPad.left || undefined,
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

  // Hide section at current breakpoint if configured
  const bpHidden =
    breakpoint === 'mobile' ? section.responsive?.mobile?.hidden :
    breakpoint === 'tablet' ? section.responsive?.tablet?.hidden : false;
  if (bpHidden) return null;

  const secMargin = section.style.margin;
  const marginStyle: React.CSSProperties = secMargin
    ? { marginTop: secMargin.top, marginRight: secMargin.right, marginBottom: secMargin.bottom, marginLeft: secMargin.left }
    : {};
  const cssPos = section.cssPosition;
  const outerStyle: React.CSSProperties = (isSticky || isFixed)
    ? { flexShrink: 0, position: 'sticky', top: section.stickyOffset ?? 0, zIndex: 50, ...marginStyle }
    : cssPos && cssPos !== 'relative'
      ? { flexShrink: 0, position: cssPos as React.CSSProperties['position'], zIndex: 50, ...marginStyle }
      : { position: 'relative', flexShrink: 0, zIndex: (hovered || isSelected || hasActiveChild) ? 10 : undefined, ...marginStyle };

  return (
    <div
      style={outerStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {!previewMode && !hasActiveChild && (hovered || isSelected) && (
        <>
          <button
            className={'pb-section-insert-btn pb-flex-center pb-section-insert-btn--above'}
            title="Insert section above"
            onMouseDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); onAddSectionBefore?.(); }}
          >+</button>
          <button
            className={'pb-section-insert-btn pb-flex-center pb-section-insert-btn--below'}
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
          {!previewMode && (!hasActiveChild && (hovered || isSelected)) && (
            <div className={'pb-section-label-badge'}>
              {role === 'header' ? 'Header' : role === 'footer' ? 'Footer' : section.label}
              {isSticky && <span className={'pb-section-label-mode'}> · Sticky</span>}
              {isFixed  && <span className={'pb-section-label-mode'}> · Fixed</span>}
            </div>
          )}

          {isFixed && !previewMode && (
            <div className={'pb-fixed-notice'}>
              Fixed · preview is sticky — export uses position:fixed
            </div>
          )}

          {section.layoutMode === 'free' && breakpoint !== 'desktop' && !previewMode && (
            <div className={'pb-free-mobile-notice'}>
              Free layout · position each element manually for {breakpoint}
            </div>
          )}

          {!previewMode && isSelected && !hasActiveChild && (
            <div className={'pb-section-action-bar'} onMouseDown={e => e.stopPropagation()}>
              <button className={'pb-section-action-btn pb-flex-center'} title="Move up"
                onClick={e => { e.stopPropagation(); onMoveSectionUp?.(); }}>↑</button>
              <button className={'pb-section-action-btn pb-flex-center'} title="Move down"
                onClick={e => { e.stopPropagation(); onMoveSectionDown?.(); }}>↓</button>
              <button className={'pb-section-action-btn pb-flex-center'} title="Duplicate section"
                onClick={e => { e.stopPropagation(); onDuplicateSection?.(); }}>⧉</button>
              <div className={'pb-section-action-divider'} />
              <button className={"pb-section-action-btn pb-flex-center pb-danger"} title="Delete section"
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

          {/* Column guides — editor only */}
          {!previewMode && cols.count > 1 && cols.widths.length > 0 && (
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

          {!previewMode && guides.map((g, i) =>
            g.type === 'v'
              ? <div key={i} className={'pb-guide-v'} style={{ left: g.pos }} />
              : <div key={i} className={'pb-guide-h'} style={{ top: g.pos }} />
          )}

          {dragInfo && (
            <DragGuides
              x={dragInfo.x} y={dragInfo.y}
              width={dragInfo.width} height={dragInfo.height}
              sectionWidth={canvasWidth} sectionHeight={sectionHeight}
            />
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
                onGuides={(gs, di) => { setGuides(gs); setDragInfo(di ?? null); }}
                previewMode={previewMode}
                onDuplicate={onDuplicateElement ? () => onDuplicateElement(id) : undefined}
                onDelete={onDeleteElement ? () => onDeleteElement(id) : undefined}
                breakpoint={breakpoint}
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

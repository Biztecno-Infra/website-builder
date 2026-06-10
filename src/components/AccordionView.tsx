import React, { useRef, useState } from 'react';
import { GridCellView } from './GridCellView';
import { GridElementView } from './GridElementView';
import { canvasDragShared } from './CanvasElement';
import { CANVAS_W } from '../hooks/useBuilderStore';
import type {
  Accordion, AccordionBpOverride, AccordionItem, Breakpoint, BreakpointOverride, BuilderState,
  CanvasElement as El, CellLayoutMode, Container, ContainerLayoutMode, GridCell, NodeMap, ElementType,
} from '../types';

// Width-only resize (height is content-driven): the accordion grows with its items.
const RESIZE_DIRS = ['e', 'w'] as const;
type ResizeDir = (typeof RESIZE_DIRS)[number];
const RESIZE_CURSOR: Record<ResizeDir, string> = { e: 'e-resize', w: 'w-resize' };
function resizeHandlePos(dir: ResizeDir): React.CSSProperties {
  return { top: '50%', left: dir === 'w' ? 0 : '100%' };
}

interface Props {
  accordion: Accordion;
  nodes: NodeMap;
  isSelected: boolean;
  selectedId: string | null;
  selectedGridCellId?: string | null;
  selectedContainerId?: string | null;
  previewMode?: boolean;
  breakpoint?: Breakpoint;
  canvasWidth: number;
  onSelectAccordion: () => void;
  onUpdateAccordion?: (id: string, updates: Partial<Omit<Accordion, 'id' | 'type' | 'parent' | 'children' | 'items'>>) => void;
  onUpdateAccordionResponsive?: (id: string, bp: Breakpoint, updates: AccordionBpOverride) => void;
  onToggleAccordionItem?: (accordionId: string, itemId: string) => void;
  onAddAccordionItem?: (accordionId: string, afterItemId?: string) => void;
  // Header element + content-cell callbacks (reuse the element + grid-cell pipeline)
  onSelectGridCell?: (id: string | null) => void;
  onSelectElement: (id: string, shift: boolean) => void;
  onSelectContainer?: (id: string) => void;
  onUpdateElement: (id: string, updates: Partial<El>) => void;
  onUpdateGridCell?: (id: string, updates: Partial<GridCell>) => void;
  onDeleteGridCell?: (id: string) => void;
  onAddElementToCell?: (type: ElementType, cellId: string, x?: number, y?: number) => void;
  onMoveGridElement?: (elementId: string, sourceCellId: string, targetCellId: string, insertIndex: number, dropPos?: { x: number; y: number }, sourceCellMode?: CellLayoutMode) => void;
  onReorderGridCell?: (parentId: string, fromIndex: number, toIndex: number) => void;
  onRemoveColumnsBlock?: (blockId: string) => void;
  onAddContainer?: (cellId: string, mode: ContainerLayoutMode, columnSpans?: number[]) => void;
  onUpdateContainer?: (id: string, updates: Partial<Pick<Container, 'layoutMode' | 'gap' | 'rowGap'>>) => void;
  onAddSubCell?: (containerId: string) => void;
  onCommit: (prev: BuilderState) => void;
  snapshot: BuilderState;
  onUpdateResponsive?: (id: string, bp: Breakpoint, updates: Partial<BreakpointOverride>) => void;
  onDuplicateElement?: (id: string) => void;
  onDeleteElement?: (id: string) => void;
  dragOverGridCellId?: string | null;
  /** When true the accordion flows inside a grid cell (relative, full-width). */
  inCell?: boolean;
}

function accordionHidden(accordion: Accordion, bp: Breakpoint): boolean {
  const r = accordion.responsive;
  if (bp === 'mobile') return r?.mobile?.hidden ?? false;
  if (bp === 'tablet') return r?.tablet?.hidden ?? false;
  return false;
}

// Effective free-canvas geometry for a breakpoint (x/y/width cascade mobile ?? tablet ?? desktop).
function accordionGeometry(accordion: Accordion, bp: Breakpoint): { x: number; y: number; width: number } {
  const { x, y, width } = accordion.layout;
  if (bp === 'desktop' || bp === 'large-desktop') return { x, y, width };
  const t = accordion.responsive?.tablet;
  const m = accordion.responsive?.mobile;
  if (bp === 'tablet') return { x: t?.x ?? x, y: t?.y ?? y, width: t?.width ?? width };
  return { x: m?.x ?? t?.x ?? x, y: m?.y ?? t?.y ?? y, width: m?.width ?? t?.width ?? width };
}

export function AccordionView({
  accordion, nodes, isSelected,
  selectedId, selectedGridCellId, selectedContainerId,
  previewMode, breakpoint = 'desktop', canvasWidth,
  onSelectAccordion, onUpdateAccordion, onUpdateAccordionResponsive, onToggleAccordionItem, onAddAccordionItem,
  onSelectGridCell, onSelectElement, onSelectContainer,
  onUpdateElement, onUpdateGridCell, onDeleteGridCell, onAddElementToCell,
  onMoveGridElement, onReorderGridCell, onRemoveColumnsBlock,
  onAddContainer, onUpdateContainer, onAddSubCell,
  onCommit, snapshot, onUpdateResponsive, onDuplicateElement, onDeleteElement,
  dragOverGridCellId, inCell = false,
}: Props) {
  const [hovered, setHovered] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const props = accordion.props;
  const lay = accordion.layout;
  const geom = accordionGeometry(accordion, breakpoint);
  const isDesktopBp = breakpoint === 'desktop' || breakpoint === 'large-desktop';
  const openIds = accordion.activeItems ?? [];

  const writeGeometry = (next: { x?: number; y?: number; width?: number }) => {
    if (isDesktopBp) onUpdateAccordion?.(accordion.id, { layout: { ...lay, ...next } });
    else onUpdateAccordionResponsive?.(accordion.id, breakpoint, next);
  };
  const canPersist = isDesktopBp ? !!onUpdateAccordion : !!onUpdateAccordionResponsive;
  const dragScale = (canvasWidth / CANVAS_W) || 1;

  // ── Drag the whole accordion box to reposition (free-canvas only) ──
  const startDrag = (e: React.MouseEvent) => {
    if (inCell) return;
    if (previewMode || !canPersist) return;
    if (e.button !== 0) return;
    e.stopPropagation();
    onSelectAccordion();
    const startX = e.clientX, startY = e.clientY;
    const { x: ox, y: oy } = geom;
    const prev = snapshot;
    let moved = false;
    const onMove = (ev: MouseEvent) => {
      const z = canvasDragShared.zoom;
      const dx = (ev.clientX - startX) / (z * dragScale);
      const dy = (ev.clientY - startY) / (z * dragScale);
      if (!moved && Math.abs(ev.clientX - startX) < 3 && Math.abs(ev.clientY - startY) < 3) return;
      moved = true;
      writeGeometry({ x: Math.round(ox + dx), y: Math.round(oy + dy) });
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      if (moved) onCommit(prev);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const startResize = (dir: ResizeDir) => (e: React.MouseEvent) => {
    if (previewMode || !canPersist || inCell) return;
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const { x: ox, width: ow } = geom;
    const prev = snapshot;
    const onMove = (ev: MouseEvent) => {
      const z = canvasDragShared.zoom;
      const dx = (ev.clientX - startX) / (z * dragScale);
      let x = ox, w = ow;
      const min = 160;
      if (dir === 'e') w = Math.max(min, ow + dx);
      if (dir === 'w') { w = Math.max(min, ow - dx); x = ox + ow - w; }
      writeGeometry({ x: Math.round(x), width: Math.round(w) });
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      onCommit(prev);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  if (accordionHidden(accordion, breakpoint)) return null;

  const scale = canvasWidth / CANVAS_W;
  const wrapperStyle: React.CSSProperties = inCell
    ? {
        position: 'relative',
        width: '100%',
        zIndex: isSelected ? (lay.zIndex ?? 0) + 1000 : (lay.zIndex ?? 0),
        boxSizing: 'border-box',
      }
    : {
        position: 'absolute',
        left: Math.round(geom.x * scale),
        top: Math.round(geom.y * scale),
        width: Math.round(geom.width * scale),
        zIndex: isSelected ? (lay.zIndex ?? 0) + 1000 : (lay.zIndex ?? 0),
        boxSizing: 'border-box',
      };

  // Does the current selection live inside this accordion (any header element or content cell)?
  const ownsId = (id: string | null | undefined): boolean => {
    if (!id) return false;
    return accordion.items.some(it =>
      it.titleElId === id || it.iconElId === id || it.contentCellId === id);
  };
  const hasActiveChild = !previewMode && !!(
    ownsId(selectedGridCellId) || ownsId(selectedId) ||
    (selectedId && (() => {
      const el = nodes[selectedId];
      if (!el || !('parent' in el)) return false;
      const p = (el as { parent: string }).parent;
      if (ownsId(p)) return true;
      const pNode = nodes[p];
      return !!pNode && 'parent' in pNode && ownsId((pNode as { parent: string }).parent);
    })())
  );

  const showChrome = !previewMode && (hovered || isSelected || hasActiveChild);
  const canEdit = !previewMode && canPersist;
  const canMove = canEdit && !inCell;

  // Render one header element (title or icon) reusing GridElementView, but
  // non-draggable — the header is a fixed 2-part row, not a droppable cell.
  const renderHeaderEl = (elId: string, cellMode: CellLayoutMode) => {
    const el = nodes[elId] as El | undefined;
    if (!el) return null;
    return (
      <GridElementView
        element={el}
        cellId={accordion.id}
        childIdx={0}
        cellMode={cellMode}
        isSelected={selectedId === elId}
        onSelect={() => { onSelectAccordion(); onSelectElement(elId, false); }}
        onUpdate={updates => onUpdateElement(elId, updates)}
        onCommit={onCommit}
        snapshot={snapshot}
        previewMode={previewMode}
        disableDrag
        breakpoint={breakpoint}
        onUpdateResponsive={onUpdateResponsive}
        onDuplicate={undefined}
        onDelete={undefined}
        onDragHover={() => {}}
        onDropAtChildIdx={() => {}}
      />
    );
  };

  const iconRotation = props.expandedIconRotation ?? 180;

  return (
    <div
      ref={wrapperRef}
      className={['pb-accordion', isSelected && !hasActiveChild && 'pb-accordion--selected', hasActiveChild && 'pb-accordion--child-selected'].filter(Boolean).join(' ')}
      style={{ ...wrapperStyle, cursor: canMove ? 'move' : undefined, display: 'flex', flexDirection: 'column', gap: props.itemGap }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseDown={startDrag}
      onClick={e => { if (previewMode) return; e.stopPropagation(); onSelectAccordion(); }}
    >
      {showChrome && (
        <div className={'pb-accordion-badge'} onMouseDown={startDrag} onClick={e => { e.stopPropagation(); onSelectAccordion(); }}>
          Accordion · {accordion.items.length} {accordion.items.length === 1 ? 'item' : 'items'}
        </div>
      )}

      {accordion.items.map(item => {
        const open = openIds.includes(item.id);
        const cell = nodes[item.contentCellId] as GridCell | undefined;
        const iconStyle: React.CSSProperties = {
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.2s ease',
          transform: open && !props.expandedIconSvg ? `rotate(${iconRotation}deg)` : undefined,
        };
        const header = (
          <div
            className={'pb-accordion-header'}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              flexDirection: props.iconPosition === 'left' ? 'row-reverse' : 'row',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
            onMouseDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); if (!previewMode) onSelectAccordion(); onToggleAccordionItem?.(accordion.id, item.id); }}
          >
            <div style={{ flex: '1 1 auto', minWidth: 0 }} onClick={e => e.stopPropagation()}>
              {renderHeaderEl(item.titleElId, 'row')}
            </div>
            <div style={{ flex: '0 0 auto', ...iconStyle }} onClick={e => e.stopPropagation()}>
              {renderHeaderEl(item.iconElId, 'row')}
            </div>
          </div>
        );

        return (
          <div key={item.id} className={['pb-accordion-item', open && 'pb-accordion-item--open'].filter(Boolean).join(' ')} style={{ display: 'flex', flexDirection: 'column', gap: props.contentGap ?? 0 }}>
            {header}
            {open && cell && (
              <div className={'pb-accordion-panel'}>
                <GridCellView
                  cell={cell}
                  nodes={nodes}
                  isSelected={selectedGridCellId === cell.id}
                  selectedElementId={selectedId}
                  selectedGridCellId={selectedGridCellId}
                  onSelectCell={() => { onSelectGridCell?.(cell.id); }}
                  onSelectElement={elId => {
                    const el = nodes[elId];
                    const elParent = el && el.type !== 'section' ? (el as { parent: string }).parent : undefined;
                    const parentCellId = elParent && nodes[elParent]?.type === 'grid-cell' ? elParent : cell.id;
                    onSelectGridCell?.(parentCellId);
                    onSelectElement(elId, false);
                  }}
                  onUpdateElement={onUpdateElement}
                  onUpdateCell={updates => onUpdateGridCell?.(cell.id, updates)}
                  onDeleteCell={() => onDeleteGridCell?.(cell.id)}
                  onAddElement={(type, x, y) => onAddElementToCell?.(type, cell.id, x, y)}
                  onMoveGridElement={onMoveGridElement}
                  onCommit={onCommit}
                  snapshot={snapshot}
                  previewMode={previewMode}
                  breakpoint={breakpoint}
                  onUpdateResponsive={onUpdateResponsive}
                  onDuplicateElement={onDuplicateElement}
                  onDeleteElement={onDeleteElement}
                  isDragOverTarget={dragOverGridCellId === cell.id}
                  onUpdateGridCell={onUpdateGridCell}
                  onDeleteGridCell={onDeleteGridCell}
                  onAddElementToCell={onAddElementToCell}
                  onSelectGridCell={onSelectGridCell}
                  onReorderGridCell={onReorderGridCell}
                  onRemoveColumnsBlock={onRemoveColumnsBlock}
                  onAddContainer={onAddContainer}
                  onUpdateContainer={onUpdateContainer}
                  onAddSubCell={onAddSubCell}
                  selectedContainerId={selectedContainerId}
                  onSelectContainer={onSelectContainer}
                />
              </div>
            )}
          </div>
        );
      })}

      {/* Add-item button — edit mode only */}
      {showChrome && (
        <button
          className={'pb-accordion-add'}
          onMouseDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); onAddAccordionItem?.(accordion.id); }}
        >+ Add item</button>
      )}

      {/* Width resize handles — only when the accordion itself is selected (not a child) */}
      {canEdit && isSelected && !hasActiveChild && RESIZE_DIRS.map(dir => (
        <div
          key={dir}
          className={'pb-resize-handle'}
          style={{ ...resizeHandlePos(dir), cursor: RESIZE_CURSOR[dir], position: 'absolute' }}
          onMouseDown={startResize(dir)}
        />
      ))}
    </div>
  );
}

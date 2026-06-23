import React, { useEffect, useRef, useState } from 'react';
import type { Accordion, CanvasElement, Carousel, Container, GridCell, NodeMap, Section } from '../types';
import { Icon } from './Icon';
import { IconButton } from './IconButton';
import { CANVAS_W } from '../hooks/useBuilderStore';

const TYPE_ICON_ID: Record<string, string> = {
  text: 'elText', image: 'elImage', button: 'elButton', box: 'elBox',
  divider: 'elDivider', video: 'elVideo', spacer: 'elSpacer', icon: 'elIcon', form: 'elForm',
};

function elementLabel(el: CanvasElement): string {
  switch (el.type) {
    case 'text':    return el.content.plain?.slice(0, 24) || 'Text';
    case 'button':  return el.content.label || 'Button';
    case 'image':   return el.content.alt || 'Image';
    case 'video':   return 'Video';
    case 'divider': return 'Divider';
    case 'spacer':  return 'Spacer';
    case 'icon':    return el.content.iconName ? `Icon ${el.content.iconName}` : 'Icon';
    default:        return 'Box';
  }
}

function CollapseArrow({ collapsed }: { collapsed: boolean }) {
  return (
    <span className={['pb-layer-arrow pb-flex-center', !collapsed && 'pb-layer-arrow--open'].filter(Boolean).join(' ')}>
      <Icon id="chevronRight" size={10} />
    </span>
  );
}

interface ActiveDrag {
  sectionId: string;
  panelIdx: number;
  elId: string;
}

let _layerDrag: ActiveDrag | null = null;

interface Props {
  header: Section;
  sections: Section[];
  footer: Section | undefined;
  nodes: NodeMap;
  selectedIds: string[];
  selectedSectionId: string | null;
  selectedGridCellId: string | null;
  selectedContainerId?: string | null;
  selectedCarouselId?: string | null;
  selectedAccordionId?: string | null;
  onSelectElement: (id: string) => void;
  onSelectSection: (id: string) => void;
  onSelectGridCell: (id: string) => void;
  onSelectContainer?: (id: string) => void;
  onSelectCarousel?: (id: string) => void;
  onSelectAccordion?: (id: string) => void;
  onScrollToElement?: (id: string) => void;
  onReorderSection: (fromIndex: number, toIndex: number) => void;
  onReorderElement: (id: string, newIndex: number) => void;
  onMoveElementToSection: (id: string, toSectionId: string, atIndex: number) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onDeleteElement?: (id: string) => void;
  onDeleteSection?: (id: string) => void;
  onClose?: () => void;
}

interface SectionGroupProps {
  section: Section;
  nodes: NodeMap;
  role: 'header' | 'section' | 'footer';
  index: number;
  depth: number;
  isSectionSelected: boolean;
  /** True while the most recent selection originated from a click inside the Layers panel. */
  selectionFromPanelRef: React.RefObject<boolean>;
  selectedIds: string[];
  selectedGridCellId: string | null;
  selectedContainerId?: string | null;
  selectedCarouselId?: string | null;
  selectedAccordionId?: string | null;
  isDragOver: boolean;
  isDragging: boolean;
  onSelectElement: (id: string) => void;
  onSelectSection: (id: string) => void;
  onSelectGridCell: (id: string) => void;
  onSelectContainer?: (id: string) => void;
  onSelectCarousel?: (id: string) => void;
  onSelectAccordion?: (id: string) => void;
  onScrollToElement?: (id: string) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onDeleteElement?: (id: string) => void;
  onDeleteSection?: (id: string) => void;
  onReorderElement: (id: string, newIndex: number) => void;
  onMoveElementToSection: (id: string, toSectionId: string, atIndex: number) => void;
  onSectionDragStart: (index: number) => void;
  onSectionDragOver: (index: number) => void;
  onSectionDrop: () => void;
  onSectionDragEnd: () => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onExpandSection: () => void;
}

function SectionGroup({
  section, nodes, role, index, depth, isSectionSelected, selectionFromPanelRef, selectedIds,
  selectedGridCellId, selectedContainerId, selectedCarouselId, selectedAccordionId, isDragOver, isDragging,
  onSelectElement, onSelectSection, onSelectGridCell, onSelectContainer, onSelectCarousel, onSelectAccordion,
  onScrollToElement, onUpdateElement, onDeleteElement, onDeleteSection, onReorderElement, onMoveElementToSection,
  onSectionDragStart, onSectionDragOver, onSectionDrop, onSectionDragEnd,
  collapsed, onToggleCollapsed, onExpandSection,
}: SectionGroupProps) {
  const [dragOverElIdx, setDragOverElIdx] = useState<number | null>(null);
  const [collapsedCellMap, setCollapsedCellMap] = useState<Record<string, boolean>>({});
  const [collapsedContainerMap, setCollapsedContainerMap] = useState<Record<string, boolean>>({});
  const toggleCell = (id: string) => setCollapsedCellMap(p => ({ ...p, [id]: !p[id] }));
  const toggleContainer = (id: string) => setCollapsedContainerMap(p => ({ ...p, [id]: !p[id] }));

  const draggable = role === 'section';
  const isGrid = section.layoutMode === 'grid';
  const indent = depth * 16;

  useEffect(() => {
    if (!selectedIds.length) return;
    // Only auto-expand when the selection came from the canvas. Selecting from
    // within the Layers panel must not expand/collapse or shift the hierarchy.
    if (selectionFromPanelRef.current) return;
    function dfs(nodeId: string): boolean {
      const node = nodes[nodeId];
      if (!node) return false;
      if (node.type === 'grid-cell' || node.type === 'container') {
        return (node as GridCell | Container).children.some(dfs);
      }
      return selectedIds.includes(nodeId);
    }
    if (section.children.some(dfs)) onExpandSection();
  }, [selectedIds]);

  // ── Grid layout rendering ─────────────────────────────────────────────────
  if (isGrid) {
    const cells = section.children
      .map(id => nodes[id] as GridCell | undefined)
      .filter((c): c is GridCell => !!c);

    const renderGridElementRow = (el: CanvasElement, elDepth: number) => {
      const isSelected = selectedIds.includes(el.id);
      const hidden = el.state.hidden;
      const elIndent = elDepth * 16;
      return (
        <div
          key={el.id}
          className={['pb-layer-row pb-flex-row', isSelected && 'pb-selected', hidden && 'pb-layer-hidden'].filter(Boolean).join(' ')}
          style={{ paddingLeft: 8 + elIndent }}
          onClick={() => { onSelectElement(el.id); onScrollToElement?.(el.id); }}
        >
          <span className={'pb-layer-arrow pb-flex-center pb-layer-arrow--leaf'} />
          <span className={'pb-layer-type-icon pb-flex-center'}>
            <Icon id={TYPE_ICON_ID[el.type] ?? 'elBox'} size={14} />
          </span>
          <span className={'pb-layer-name pb-truncate'} title={elementLabel(el)}>{elementLabel(el)}</span>
          {onDeleteElement && (
            <span className={'pb-layer-actions'}>
              <button className={'pb-layer-btn pb-layer-btn--delete'} title="Delete"
                onClick={e => { e.stopPropagation(); onDeleteElement(el.id); }}>
                <Icon id="trash" size={14} />
              </button>
            </span>
          )}
        </div>
      );
    };

    const renderContainerLayerRow = (block: Container, cellIndent: number, subCells: GridCell[]): React.ReactElement => {
      const containerCollapsed = collapsedContainerMap[block.id] ?? false;
      const isContainerSelected = selectedContainerId === block.id;
      const hasChildren = subCells.length > 0;
      return (
        <div key={block.id}>
          <div
            className={['pb-layer-row pb-flex-row pb-layer-row--cell', isContainerSelected && 'pb-selected'].filter(Boolean).join(' ')}
            style={{ paddingLeft: 8 + cellIndent + 16, cursor: 'pointer' }}
            onClick={() => { onSelectSection(section.id); onSelectContainer?.(block.id); if (hasChildren) toggleContainer(block.id); }}
          >
            {hasChildren ? (
              <button className={'pb-layer-collapse-btn'} onClick={e => { e.stopPropagation(); toggleContainer(block.id); }}>
                <CollapseArrow collapsed={containerCollapsed} />
              </button>
            ) : (
              <span className={'pb-layer-arrow pb-flex-center pb-layer-arrow--leaf'} />
            )}
            <span className={'pb-layer-section-icon'}>⊞</span>
            <span className={'pb-layer-name pb-truncate'}>Container</span>
          </div>
          {!containerCollapsed && subCells.map((sub, si) => renderCellLayerRow(sub, si, 3))}
        </div>
      );
    };

    const renderCellLayerRow = (cell: GridCell, cellIdx: number, cellDepth: number): React.ReactElement => {
      const cellCollapsed = collapsedCellMap[cell.id] ?? false;
      const isCellSelected = selectedGridCellId === cell.id;
      const cellIndent = cellDepth * 16;
      const cellChildren = cell.children.map(id => nodes[id]).filter(Boolean);
      const hasChildren = cellChildren.length > 0;
      return (
        <div key={cell.id}>
          <div
            className={['pb-layer-row pb-flex-row pb-layer-row--cell', isCellSelected && 'pb-selected'].filter(Boolean).join(' ')}
            style={{ paddingLeft: 8 + cellIndent }}
            onClick={() => { onSelectGridCell(cell.id); if (hasChildren) toggleCell(cell.id); }}
          >
            {hasChildren ? (
              <button className={'pb-layer-collapse-btn'} onClick={e => { e.stopPropagation(); toggleCell(cell.id); }}>
                <CollapseArrow collapsed={cellCollapsed} />
              </button>
            ) : (
              <span className={'pb-layer-arrow pb-flex-center pb-layer-arrow--leaf'} />
            )}
            <span className={'pb-layer-section-icon'}>⊟</span>
            <span className={'pb-layer-name pb-truncate'}>Col {cellIdx + 1}</span>
          </div>
          {!cellCollapsed && cellChildren.map((child) => {
            if (!child) return null;
            if (child.type === 'container') {
              const block = child as Container;
              const subCells = block.children.map((id: string) => nodes[id] as GridCell | undefined).filter((c: GridCell | undefined): c is GridCell => !!c);
              return renderContainerLayerRow(block, cellIndent, subCells);
            }
            if (child.type === 'carousel') {
              const carousel = child as Carousel;
              const isCarSelected = selectedCarouselId === carousel.id;
              const slides = carousel.children.map(id => nodes[id] as GridCell | undefined).filter((c): c is GridCell => !!c);
              return (
                <div key={carousel.id}>
                  <div
                    className={['pb-layer-row pb-flex-row pb-layer-row--cell', isCarSelected && 'pb-selected'].filter(Boolean).join(' ')}
                    style={{ paddingLeft: 8 + cellIndent + 16, cursor: 'pointer' }}
                    onClick={() => { onSelectSection(section.id); onSelectCarousel?.(carousel.id); }}
                  >
                    <span className={'pb-layer-arrow pb-flex-center pb-layer-arrow--leaf'} />
                    <span className={'pb-layer-section-icon'}>▦</span>
                    <span className={'pb-layer-name pb-truncate'}>Carousel</span>
                  </div>
                  {slides.map((slide, si) => renderCellLayerRow(slide, si, cellDepth + 1))}
                </div>
              );
            }
            if (child.type === 'accordion') {
              const acc = child as Accordion;
              const isAccSelected = selectedAccordionId === acc.id;
              return (
                <div key={acc.id}>
                  <div
                    className={['pb-layer-row pb-flex-row pb-layer-row--cell', isAccSelected && 'pb-selected'].filter(Boolean).join(' ')}
                    style={{ paddingLeft: 8 + cellIndent + 16, cursor: 'pointer' }}
                    onClick={() => { onSelectSection(section.id); onSelectAccordion?.(acc.id); }}
                  >
                    <span className={'pb-layer-arrow pb-flex-center pb-layer-arrow--leaf'} />
                    <span className={'pb-layer-section-icon'}>☰</span>
                    <span className={'pb-layer-name pb-truncate'}>Accordion</span>
                  </div>
                  {acc.items.map((it, ii) => {
                    const accCell = nodes[it.contentCellId] as GridCell | undefined;
                    return accCell ? renderCellLayerRow(accCell, ii, cellDepth + 1) : null;
                  })}
                </div>
              );
            }
            return renderGridElementRow(child as CanvasElement, cellDepth + 1);
          })}
        </div>
      );
    };

    return (
      <div
        className={['pb-layer-section-group', isDragOver && 'pb-drag-over', isDragging && 'pb-dragging'].filter(Boolean).join(' ')}
        onDragOver={e => { e.preventDefault(); if (draggable) onSectionDragOver(index); }}
        onDrop={e => { e.preventDefault(); onSectionDrop(); }}
      >
        <div
          className={['pb-layer-section-header pb-flex-row', isSectionSelected && 'pb-selected'].filter(Boolean).join(' ')}
          style={{ paddingLeft: 8 + indent }}
          draggable={draggable}
          onDragStart={() => draggable && onSectionDragStart(index)}
          onDragEnd={() => draggable && onSectionDragEnd()}
          onClick={() => { onSelectSection(section.id); onToggleCollapsed(); }}
        >
          <span className={'pb-layer-collapse-btn'}>
            <CollapseArrow collapsed={collapsed} />
          </span>
          <span className={'pb-layer-section-icon'}>⊞</span>
          <span className={'pb-layer-section-name pb-truncate'}>{section.label}</span>
          {draggable && onDeleteSection && (
            <button className={'pb-layer-btn pb-layer-btn--delete'} title="Delete section"
              onClick={e => { e.stopPropagation(); onDeleteSection(section.id); }}>
              <Icon id="trash" size={14} />
            </button>
          )}
        </div>

        {!collapsed && (
          <div className={'pb-layer-element-list pb-flex-col'}>
            {cells.length === 0 && <div className={'pb-layer-empty-row'}>No columns yet</div>}
            {cells.map((cell, cellIdx) => renderCellLayerRow(cell, cellIdx, depth + 1))}
          </div>
        )}
      </div>
    );
  }

  // ── Free layout rendering ─────────────────────────────────────────────────
  const elementItems = section.children.slice().reverse()
    .map((id, panelIdx) => {
      const node = nodes[id];
      if (!node || node.type === 'carousel' || node.type === 'accordion') return null;  // carousels/accordions rendered separately below
      return { el: node as CanvasElement, panelIdx };
    })
    .filter((item): item is { el: CanvasElement; panelIdx: number } => !!item);
  const elements = elementItems.map(item => item.el);
  const carousels = section.children
    .map(id => nodes[id])
    .filter((node): node is Carousel => !!node && node.type === 'carousel');
  const accordions = section.children
    .map(id => nodes[id])
    .filter((node): node is Accordion => !!node && node.type === 'accordion');
  const n = section.children.length;

  // Renders the elements inside a carousel slide / accordion-item content cell.
  // Self-contained (the grid-only CellLayerRow component is out of scope here).
  const renderCellContents = (cell: GridCell, cellDepth: number): React.ReactNode => {
    const isCellSelected = selectedGridCellId === cell.id;
    const cellEls = cell.children.map(id => nodes[id]).filter(Boolean) as CanvasElement[];
    return (
      <div key={cell.id}>
        <div
          className={['pb-layer-row pb-flex-row pb-layer-row--cell', isCellSelected && 'pb-selected'].filter(Boolean).join(' ')}
          style={{ paddingLeft: 8 + cellDepth * 16, cursor: 'pointer' }}
          onClick={() => { onSelectSection(section.id); onSelectGridCell(cell.id); }}
        >
          <span className={'pb-layer-arrow pb-flex-center pb-layer-arrow--leaf'} />
          <span className={'pb-layer-section-icon'}>⊟</span>
          <span className={'pb-layer-name pb-truncate'}>Content</span>
        </div>
        {cellEls.map(el => {
          const isSelected = selectedIds.includes(el.id);
          const hidden = el.state?.hidden;
          return (
            <div
              key={el.id}
              className={['pb-layer-row pb-flex-row', isSelected && 'pb-selected', hidden && 'pb-layer-hidden'].filter(Boolean).join(' ')}
              style={{ paddingLeft: 8 + (cellDepth + 1) * 16 }}
              onClick={() => { onSelectGridCell(cell.id); onSelectElement(el.id); onScrollToElement?.(el.id); }}
            >
              <span className={'pb-layer-arrow pb-flex-center pb-layer-arrow--leaf'} />
              <span className={'pb-layer-type-icon pb-flex-center'}>
                <Icon id={TYPE_ICON_ID[el.type] ?? 'elBox'} size={14} />
              </span>
              <span className={'pb-layer-name pb-truncate'} title={elementLabel(el)}>{elementLabel(el)}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderAccordionLayer = (acc: Accordion): React.ReactNode => {
    const isAccSelected = selectedAccordionId === acc.id;
    return (
      <div key={acc.id}>
        <div
          className={['pb-layer-row pb-flex-row pb-layer-row--cell', isAccSelected && 'pb-selected'].filter(Boolean).join(' ')}
          style={{ paddingLeft: 8 + (depth + 1) * 16, cursor: 'pointer' }}
          onClick={() => { onSelectSection(section.id); onSelectAccordion?.(acc.id); }}
        >
          <span className={'pb-layer-arrow pb-flex-center pb-layer-arrow--leaf'} />
          <span className={'pb-layer-section-icon'}>☰</span>
          <span className={'pb-layer-name pb-truncate'}>Accordion</span>
        </div>
        {acc.items.map(it => {
          const cell = nodes[it.contentCellId] as GridCell | undefined;
          return cell ? renderCellContents(cell, depth + 2) : null;
        })}
      </div>
    );
  };

  const renderCarouselLayer = (carousel: Carousel): React.ReactNode => {
    const slides = carousel.children.map(id => nodes[id] as GridCell | undefined).filter((c): c is GridCell => !!c);
    const isCarSelected = selectedCarouselId === carousel.id;
    return (
      <div key={carousel.id}>
        <div
          className={['pb-layer-row pb-flex-row pb-layer-row--cell', isCarSelected && 'pb-selected'].filter(Boolean).join(' ')}
          style={{ paddingLeft: 8 + (depth + 1) * 16, cursor: 'pointer' }}
          onClick={() => { onSelectSection(section.id); onSelectCarousel?.(carousel.id); }}
        >
          <span className={'pb-layer-arrow pb-flex-center pb-layer-arrow--leaf'} />
          <span className={'pb-layer-section-icon'}>▦</span>
          <span className={'pb-layer-name pb-truncate'}>Carousel</span>
        </div>
        {slides.map(slide => renderCellContents(slide, depth + 2))}
      </div>
    );
  };

  const handleElDragStart = (e: React.DragEvent, panelIdx: number, id: string) => {
    e.stopPropagation();
    _layerDrag = { sectionId: section.id, panelIdx, elId: id };
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleElDragOver = (e: React.DragEvent, panelIdx: number) => {
    if (!_layerDrag) return;
    e.preventDefault();
    e.stopPropagation();
    setDragOverElIdx(panelIdx);
  };

  const commitElDrop = (panelIdx: number) => {
    if (!_layerDrag) return;
    const { sectionId, panelIdx: fromPanelIdx, elId } = _layerDrag;
    _layerDrag = null;
    setDragOverElIdx(null);
    const insertIdx = n - 1 - panelIdx;
    if (sectionId === section.id) {
      if (fromPanelIdx !== panelIdx) onReorderElement(elId, insertIdx);
    } else {
      onMoveElementToSection(elId, section.id, insertIdx);
    }
  };

  const handleElDrop = (e: React.DragEvent, panelIdx: number) => {
    if (!_layerDrag) return;
    e.preventDefault();
    e.stopPropagation();
    commitElDrop(panelIdx);
  };

  const handleSectionBodyDrop = (e: React.DragEvent) => {
    if (_layerDrag) {
      e.preventDefault();
      e.stopPropagation();
      const { sectionId, elId } = _layerDrag;
      _layerDrag = null;
      setDragOverElIdx(null);
      if (sectionId !== section.id) onMoveElementToSection(elId, section.id, n);
      return;
    }
    e.preventDefault();
    onSectionDrop();
  };

  const handleElDragEnd = () => {
    _layerDrag = null;
    setDragOverElIdx(null);
  };

  const renderElementRow = (el: CanvasElement, panelIdx: number) => {
    const isSelected = selectedIds.includes(el.id);
    const isDropTarget = dragOverElIdx === panelIdx && _layerDrag !== null && _layerDrag.elId !== el.id;
    const elIndent = (depth + 1) * 16;
    return (
      <div
        key={el.id}
        className={['pb-layer-row pb-flex-row', isSelected && 'pb-selected', isDropTarget && 'pb-el-drop-target'].filter(Boolean).join(' ')}
        style={{ paddingLeft: 8 + elIndent }}
        draggable
        onClick={() => { onSelectElement(el.id); onScrollToElement?.(el.id); }}
        onDragStart={e => handleElDragStart(e, panelIdx, el.id)}
        onDragOver={e => handleElDragOver(e, panelIdx)}
        onDrop={e => handleElDrop(e, panelIdx)}
        onDragEnd={handleElDragEnd}
      >
        <span className={'pb-layer-arrow pb-flex-center pb-layer-arrow--leaf'} />
        <span className={'pb-layer-type-icon pb-flex-center'}>
          <Icon id={TYPE_ICON_ID[el.type] ?? 'elBox'} size={14} />
        </span>
        <span className={'pb-layer-name pb-truncate'} title={elementLabel(el)}>{elementLabel(el)}</span>
        {onDeleteElement && (
          <span className={'pb-layer-actions'}>
            <button className={'pb-layer-btn pb-layer-btn--delete'} title="Delete"
              onClick={e => { e.stopPropagation(); onDeleteElement(el.id); }}>
              <Icon id="trash" size={14} />
            </button>
          </span>
        )}
      </div>
    );
  };

  return (
    <div
      className={['pb-layer-section-group', isDragOver && 'pb-drag-over', isDragging && 'pb-dragging'].filter(Boolean).join(' ')}
      onDragOver={e => {
        e.preventDefault();
        if (!_layerDrag && draggable) onSectionDragOver(index);
      }}
      onDrop={handleSectionBodyDrop}
    >
      <div
        className={['pb-layer-section-header pb-flex-row', isSectionSelected && 'pb-selected'].filter(Boolean).join(' ')}
        style={{ paddingLeft: 8 + indent }}
        draggable={draggable}
        onDragStart={() => draggable && onSectionDragStart(index)}
        onDragEnd={() => draggable && onSectionDragEnd()}
        onClick={() => { onSelectSection(section.id); onToggleCollapsed(); }}
      >
        <span className={'pb-layer-collapse-btn'}>
          <CollapseArrow collapsed={collapsed} />
        </span>
        <span className={'pb-layer-section-icon'}>
          {role === 'header' ? '⬆' : role === 'footer' ? '⬇' : '▭'}
        </span>
        <span className={'pb-layer-section-name pb-truncate'}>
          {role === 'header' ? 'Header' : role === 'footer' ? 'Footer' : section.label}
        </span>
        {draggable && onDeleteSection && (
          <button className={'pb-layer-btn pb-layer-btn--delete'} title="Delete section"
            onClick={e => { e.stopPropagation(); onDeleteSection(section.id); }}>
            <Icon id="trash" size={14} />
          </button>
        )}
      </div>

      {!collapsed && (
        <div
          className={'pb-layer-element-list pb-flex-col'}
          onDragOver={e => { if (_layerDrag) { e.preventDefault(); e.stopPropagation(); } }}
          onDrop={e => {
            if (!_layerDrag) return;
            e.preventDefault();
            e.stopPropagation();
            const { sectionId, elId } = _layerDrag;
            _layerDrag = null;
            setDragOverElIdx(null);
            if (sectionId !== section.id) onMoveElementToSection(elId, section.id, n);
          }}
        >
          {elements.length === 0 && carousels.length === 0 && accordions.length === 0 && (
            <div className={'pb-layer-empty-row'}>Drop element here</div>
          )}

          {elementItems.map(({ el, panelIdx }) => renderElementRow(el, panelIdx))}

          {carousels.map(renderCarouselLayer)}
          {accordions.map(renderAccordionLayer)}
        </div>
      )}
    </div>
  );
}

export function LayerPanel({
  header, sections, footer, nodes,
  selectedIds, selectedSectionId, selectedGridCellId, selectedContainerId, selectedCarouselId, selectedAccordionId,
  onSelectElement, onSelectSection, onSelectGridCell, onSelectContainer, onSelectCarousel, onSelectAccordion, onScrollToElement,
  onReorderSection, onReorderElement,
  onMoveElementToSection, onUpdateElement, onDeleteElement, onDeleteSection, onClose,
}: Props) {
  const sectionDragFromIndex = useRef<number | null>(null);
  const [sectionDragOverIndex, setSectionDragOverIndex] = useState<number | null>(null);
  const [draggingSectionIndex, setDraggingSectionIndex] = useState<number | null>(null);
  const [pageCollapsed, setPageCollapsed] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const toggleSectionCollapsed = (id: string) => setCollapsedSections(p => ({ ...p, [id]: !p[id] }));
  const expandSectionById = (id: string) => setCollapsedSections(p => ({ ...p, [id]: false }));
  const [search, setSearch] = useState('');
  const layerListRef = useRef<HTMLDivElement>(null);
  // True while the most recent selection originated from a click inside this
  // panel. Used to suppress the auto-scroll/auto-expand sync that should only
  // run for canvas-originated selections.
  const selectionFromPanelRef = useRef(false);

  useEffect(() => {
    // Selection came from a click inside the Layers panel — keep the panel's
    // scroll position; only the canvas should react. Reset the flag so the
    // next (canvas-originated) selection scrolls the panel as expected.
    if (selectionFromPanelRef.current) {
      selectionFromPanelRef.current = false;
      return;
    }
    const t = setTimeout(() => {
      const list = layerListRef.current;
      if (!list) return;
      // Prefer the deepest element row (.pb-layer-row) over section headers
      const rows = Array.from(list.querySelectorAll<HTMLElement>('.pb-layer-row.pb-selected'));
      const selected = rows[rows.length - 1] ?? list.querySelector<HTMLElement>('.pb-selected');
      if (!selected) return;
      const listRect = list.getBoundingClientRect();
      const elRect = selected.getBoundingClientRect();
      // Only scroll if the item is outside the visible area
      if (elRect.top >= listRect.top && elRect.bottom <= listRect.bottom) return;
      const relativeTop = elRect.top - listRect.top + list.scrollTop;
      list.scrollTo({ top: relativeTop - list.clientHeight / 2 + selected.offsetHeight / 2 });
    }, 60);
    return () => clearTimeout(t);
  }, [selectedIds, selectedSectionId]);

  const handleSectionDrop = () => {
    if (sectionDragFromIndex.current !== null && sectionDragOverIndex !== null && sectionDragFromIndex.current !== sectionDragOverIndex) {
      onReorderSection(sectionDragFromIndex.current, sectionDragOverIndex);
    }
    sectionDragFromIndex.current = null;
    setSectionDragOverIndex(null);
    setDraggingSectionIndex(null);
  };

  const handleSectionDragEnd = () => {
    sectionDragFromIndex.current = null;
    setSectionDragOverIndex(null);
    setDraggingSectionIndex(null);
  };

  // Flag panel-originated selections so the auto-scroll/auto-expand sync is
  // suppressed for them. The canvas should still scroll into view via
  // onScrollToElement (left untouched below).
  const markPanelSelection = <A extends unknown[]>(fn?: (...args: A) => void) =>
    (...args: A) => { selectionFromPanelRef.current = true; fn?.(...args); };

  const commonSectionProps = {
    nodes,
    selectionFromPanelRef,
    selectedIds,
    selectedGridCellId,
    selectedContainerId,
    selectedCarouselId,
    selectedAccordionId,
    onSelectElement: markPanelSelection(onSelectElement),
    onSelectSection: markPanelSelection(onSelectSection),
    onSelectGridCell: markPanelSelection(onSelectGridCell),
    onSelectContainer: markPanelSelection(onSelectContainer),
    onSelectCarousel: markPanelSelection(onSelectCarousel),
    onSelectAccordion: markPanelSelection(onSelectAccordion),
    onScrollToElement,
    onUpdateElement,
    onDeleteElement,
    onDeleteSection,
    onReorderElement,
    onMoveElementToSection,
    onSectionDragEnd: handleSectionDragEnd,
  };

  return (
    <aside className={'pb-left-sidebar pb-flex-col pb-layer-panel'}>

      <div className={'pb-blocks-header pb-flex-between'}>
        <span className={'pb-blocks-header-title'}>Layers</span>
        <IconButton variant="close" onClick={onClose} title="Close">✕</IconButton>
      </div>

      <div className={'pb-blocks-search'}>
        <div className={'pb-blocks-search-inner pb-flex-row'}>
          <Icon id="search" size={14} className={'pb-blocks-search-icon'} />
          <input
            type="text"
            placeholder="Search layers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className={'pb-layer-list pb-flex-col'} ref={layerListRef}>

        {/* Page virtual root */}
        <div className={'pb-layer-page-row pb-flex-row'} onClick={() => setPageCollapsed(c => !c)}>
          <button className={'pb-layer-collapse-btn'} onClick={e => { e.stopPropagation(); setPageCollapsed(c => !c); }}>
            <CollapseArrow collapsed={pageCollapsed} />
          </button>
          <span className={'pb-layer-section-icon'}>◻</span>
          <span className={'pb-layer-section-name pb-truncate'}>Page</span>
        </div>

        {!pageCollapsed && (
          <>
            <SectionGroup
              {...commonSectionProps}
              section={header} role="header" index={-1} depth={1}
              isSectionSelected={selectedSectionId === header.id}
              isDragOver={false} isDragging={false}
              onSectionDragStart={() => {}} onSectionDragOver={() => {}} onSectionDrop={() => {}}
              collapsed={collapsedSections[header.id] ?? false}
              onToggleCollapsed={() => toggleSectionCollapsed(header.id)}
              onExpandSection={() => expandSectionById(header.id)}
            />

            {sections.map((sec, i) => (
              <SectionGroup
                {...commonSectionProps}
                key={sec.id}
                section={sec} role="section" index={i} depth={1}
                isSectionSelected={selectedSectionId === sec.id}
                isDragOver={sectionDragOverIndex === i}
                isDragging={draggingSectionIndex === i}
                onSectionDragStart={idx => {
                  sectionDragFromIndex.current = idx;
                  setDraggingSectionIndex(idx);
                  setSectionDragOverIndex(null);
                }}
                onSectionDragOver={setSectionDragOverIndex}
                onSectionDrop={handleSectionDrop}
                collapsed={collapsedSections[sec.id] ?? false}
                onToggleCollapsed={() => toggleSectionCollapsed(sec.id)}
                onExpandSection={() => expandSectionById(sec.id)}
              />
            ))}

            {footer && (
              <SectionGroup
                {...commonSectionProps}
                section={footer} role="footer" index={-1} depth={1}
                isSectionSelected={selectedSectionId === footer.id}
                isDragOver={false} isDragging={false}
                onSectionDragStart={() => {}} onSectionDragOver={() => {}} onSectionDrop={() => {}}
                collapsed={collapsedSections[footer.id] ?? false}
                onToggleCollapsed={() => toggleSectionCollapsed(footer.id)}
                onExpandSection={() => expandSectionById(footer.id)}
              />
            )}
          </>
        )}
      </div>
    </aside>
  );
}

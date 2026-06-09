import React, { useEffect, useRef, useState } from 'react';
import type { CanvasElement, Container, GridCell, NodeMap, Section, SectionColumns } from '../types';
import { Icon } from './Icon';

const CANVAS_W = 1280;

function inferColumnIndex(el: CanvasElement, cols: SectionColumns): number {
  if (cols.count <= 1 || !cols.widths.length) return 0;
  const xPct = (el.layout.x / CANVAS_W) * 100;
  let cumulative = 0;
  for (let i = 0; i < cols.widths.length; i++) {
    cumulative += cols.widths[i];
    if (xPct < cumulative) return i;
  }
  return cols.widths.length - 1;
}

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
    <span className={['pb-layer-arrow', !collapsed && 'pb-layer-arrow--open'].filter(Boolean).join(' ')}>
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
  onSelectElement: (id: string) => void;
  onSelectSection: (id: string) => void;
  onSelectGridCell: (id: string) => void;
  onSelectContainer?: (id: string) => void;
  onScrollToElement?: (id: string) => void;
  onReorderSection: (fromIndex: number, toIndex: number) => void;
  onReorderElement: (id: string, newIndex: number) => void;
  onMoveElementToSection: (id: string, toSectionId: string, atIndex: number) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onDeleteElement?: (id: string) => void;
}

interface SectionGroupProps {
  section: Section;
  nodes: NodeMap;
  role: 'header' | 'section' | 'footer';
  index: number;
  depth: number;
  isSectionSelected: boolean;
  selectedIds: string[];
  selectedGridCellId: string | null;
  selectedContainerId?: string | null;
  isDragOver: boolean;
  isDragging: boolean;
  onSelectElement: (id: string) => void;
  onSelectSection: (id: string) => void;
  onSelectGridCell: (id: string) => void;
  onSelectContainer?: (id: string) => void;
  onScrollToElement?: (id: string) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onDeleteElement?: (id: string) => void;
  onReorderElement: (id: string, newIndex: number) => void;
  onMoveElementToSection: (id: string, toSectionId: string, atIndex: number) => void;
  onSectionDragStart: (index: number) => void;
  onSectionDragOver: (index: number) => void;
  onSectionDrop: () => void;
  onSectionDragEnd: () => void;
}

function SectionGroup({
  section, nodes, role, index, depth, isSectionSelected, selectedIds,
  selectedGridCellId, selectedContainerId, isDragOver, isDragging,
  onSelectElement, onSelectSection, onSelectGridCell, onSelectContainer,
  onScrollToElement, onUpdateElement, onDeleteElement, onReorderElement, onMoveElementToSection,
  onSectionDragStart, onSectionDragOver, onSectionDrop, onSectionDragEnd,
}: SectionGroupProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [dragOverElIdx, setDragOverElIdx] = useState<number | null>(null);

  const draggable = role === 'section';
  const isGrid = section.layoutMode === 'grid';
  const indent = depth * 16;

  useEffect(() => {
    if (!selectedIds.length) return;
    function dfs(nodeId: string): boolean {
      const node = nodes[nodeId];
      if (!node) return false;
      if (node.type === 'grid-cell' || node.type === 'container') {
        return (node as GridCell | Container).children.some(dfs);
      }
      return selectedIds.includes(nodeId);
    }
    if (section.children.some(dfs)) setCollapsed(false);
  }, [selectedIds]);

  // ── Grid layout rendering ─────────────────────────────────────────────────
  if (isGrid) {
    const cells = section.children
      .map(id => nodes[id] as GridCell | undefined)
      .filter((c): c is GridCell => !!c);

    function countCellElements(cell: GridCell): number {
      return cell.children.reduce((sum, id) => {
        const child = nodes[id];
        if (!child) return sum;
        if (child.type === 'container') {
          const block = child as Container;
          return sum + block.children.reduce((cs, subId) => {
            const sub = nodes[subId] as GridCell | undefined;
            return cs + (sub ? countCellElements(sub) : 0);
          }, 0);
        }
        return sum + 1;
      }, 0);
    }

    const totalElements = cells.reduce((sum, c) => sum + countCellElements(c), 0);

    const renderGridElementRow = (el: CanvasElement, elDepth: number) => {
      const isSelected = selectedIds.includes(el.id);
      const hidden = el.state.hidden;
      const elIndent = elDepth * 16;
      return (
        <div
          key={el.id}
          className={['pb-layer-row', isSelected && 'pb-selected', hidden && 'pb-layer-hidden'].filter(Boolean).join(' ')}
          style={{ paddingLeft: 8 + elIndent }}
          onClick={() => { onSelectElement(el.id); onScrollToElement?.(el.id); }}
        >
          <span className={'pb-layer-arrow pb-layer-arrow--leaf'} />
          <span className={'pb-layer-type-icon'}>
            <Icon id={TYPE_ICON_ID[el.type] ?? 'elBox'} size={14} />
          </span>
          <span className={'pb-layer-name'} title={elementLabel(el)}>{elementLabel(el)}</span>
          <span className={'pb-layer-actions'}>
            <button
              className={['pb-layer-btn', hidden && 'pb-active'].filter(Boolean).join(' ')}
              title={hidden ? 'Show' : 'Hide'}
              onClick={e => { e.stopPropagation(); onUpdateElement(el.id, { state: { ...el.state, hidden: !hidden } }); }}
            >{hidden ? '🙈' : '👁'}</button>
            {onDeleteElement && (
              <button
                className={'pb-layer-btn pb-layer-btn--delete'}
                title="Delete"
                onClick={e => { e.stopPropagation(); onDeleteElement(el.id); }}
              >
                <Icon id="trash" size={14} />
              </button>
            )}
          </span>
        </div>
      );
    };

    function renderCellLayer(cell: GridCell, cellIdx: number, cellDepth: number): React.ReactNode {
      const isCellSelected = selectedGridCellId === cell.id;
      const cellIndent = cellDepth * 16;
      const cellChildren = cell.children.map(id => nodes[id]).filter(Boolean);

      return (
        <div key={cell.id}>
          <div
            className={['pb-layer-row pb-layer-row--cell', isCellSelected && 'pb-selected'].filter(Boolean).join(' ')}
            style={{ paddingLeft: 8 + cellIndent }}
            onClick={() => { onSelectSection(section.id); onSelectGridCell(cell.id); }}
          >
            <span className={'pb-layer-arrow pb-layer-arrow--leaf'} />
            <span className={'pb-layer-section-icon'}>⊟</span>
            <span className={'pb-layer-name'}>Col {cellIdx + 1}</span>
            <span className={'pb-layer-section-count'}>{cell.children.length}</span>
          </div>
          {cellChildren.map((child) => {
            if (!child) return null;
            if (child.type === 'container') {
              const block = child as Container;
              const subCells = block.children.map((id: string) => nodes[id] as GridCell | undefined).filter((c: GridCell | undefined): c is GridCell => !!c);
              return (
                <div key={block.id}>
                  <div
                    className={['pb-layer-row pb-layer-row--cell', selectedContainerId === block.id && 'pb-selected'].filter(Boolean).join(' ')}
                    style={{ paddingLeft: 8 + cellIndent + 16, cursor: 'pointer' }}
                    onClick={() => { onSelectSection(section.id); onSelectContainer?.(block.id); }}
                  >
                    <span className={'pb-layer-arrow pb-layer-arrow--leaf'} />
                    <span className={'pb-layer-section-icon'}>⊞</span>
                    <span className={'pb-layer-name'}>Container</span>
                  </div>
                  {subCells.map((sub: GridCell, si: number) => renderCellLayer(sub, si, cellDepth + 2))}
                </div>
              );
            }
            return renderGridElementRow(child as CanvasElement, cellDepth + 1);
          })}
        </div>
      );
    }

    return (
      <div
        className={['pb-layer-section-group', isDragOver && 'pb-drag-over', isDragging && 'pb-dragging'].filter(Boolean).join(' ')}
        onDragOver={e => { e.preventDefault(); if (draggable) onSectionDragOver(index); }}
        onDrop={e => { e.preventDefault(); onSectionDrop(); }}
      >
        <div
          className={['pb-layer-section-header', isSectionSelected && 'pb-selected'].filter(Boolean).join(' ')}
          style={{ paddingLeft: 8 + indent }}
          draggable={draggable}
          onDragStart={() => draggable && onSectionDragStart(index)}
          onDragEnd={() => draggable && onSectionDragEnd()}
          onClick={() => onSelectSection(section.id)}
        >
          <button className={'pb-layer-collapse-btn'} onClick={e => { e.stopPropagation(); setCollapsed(c => !c); }}>
            <CollapseArrow collapsed={collapsed} />
          </button>
          <span className={'pb-layer-section-icon'}>⊞</span>
          <span className={'pb-layer-section-name'}>{section.label}</span>
          <span className={'pb-layer-section-count'}>{totalElements}</span>
        </div>

        {!collapsed && (
          <div className={'pb-layer-element-list'}>
            {cells.length === 0 && <div className={'pb-layer-empty-row'}>No columns yet</div>}
            {cells.map((cell, cellIdx) => renderCellLayer(cell, cellIdx, depth + 1))}
          </div>
        )}
      </div>
    );
  }

  // ── Free layout rendering ─────────────────────────────────────────────────
  const elementItems = section.children.slice().reverse()
    .map((id, panelIdx) => {
      const el = nodes[id] as CanvasElement | undefined;
      return el ? { el, panelIdx } : null;
    })
    .filter((item): item is { el: CanvasElement; panelIdx: number } => !!item);
  const elements = elementItems.map(item => item.el);
  const n = section.children.length;

  const cols = section.style.columns;
  const hasColumns = cols.count > 1 && cols.widths.length > 0;

  const columnGroups: Array<Array<{ el: CanvasElement; panelIdx: number }>> = hasColumns
    ? Array.from({ length: cols.count }, () => [])
    : [];

  if (hasColumns) {
    for (const item of elementItems) {
      const colIdx = Math.min(inferColumnIndex(item.el, cols), columnGroups.length - 1);
      columnGroups[colIdx].push(item);
    }
    columnGroups.forEach(group => group.sort((a, b) => a.el.layout.y - b.el.layout.y));
  }

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
    const hidden = el.state.hidden;
    const locked = el.state.locked;
    const elIndent = (depth + 1) * 16;
    return (
      <div
        key={el.id}
        className={['pb-layer-row', isSelected && 'pb-selected', hidden && 'pb-layer-hidden', locked && 'pb-layer-locked', isDropTarget && 'pb-el-drop-target'].filter(Boolean).join(' ')}
        style={{ paddingLeft: 8 + elIndent }}
        draggable
        onClick={() => { onSelectElement(el.id); onScrollToElement?.(el.id); }}
        onDragStart={e => handleElDragStart(e, panelIdx, el.id)}
        onDragOver={e => handleElDragOver(e, panelIdx)}
        onDrop={e => handleElDrop(e, panelIdx)}
        onDragEnd={handleElDragEnd}
      >
        <span className={'pb-layer-arrow pb-layer-arrow--leaf'} />
        <span className={'pb-layer-type-icon'}>
          <Icon id={TYPE_ICON_ID[el.type] ?? 'elBox'} size={14} />
        </span>
        <span className={'pb-layer-name'} title={elementLabel(el)}>{elementLabel(el)}</span>
        <span className={'pb-layer-actions'}>
          <button
            className={['pb-layer-btn', hidden && 'pb-active'].filter(Boolean).join(' ')}
            title={hidden ? 'Show' : 'Hide'}
            onClick={e => { e.stopPropagation(); onUpdateElement(el.id, { state: { ...el.state, hidden: !hidden } }); }}
          >{hidden ? '🙈' : '👁'}</button>
          {onDeleteElement && (
            <button
              className={'pb-layer-btn pb-layer-btn--delete'}
              title="Delete"
              onClick={e => { e.stopPropagation(); onDeleteElement(el.id); }}
            >
              <Icon id="trash" size={14} />
            </button>
          )}
        </span>
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
        className={['pb-layer-section-header', isSectionSelected && 'pb-selected'].filter(Boolean).join(' ')}
        style={{ paddingLeft: 8 + indent }}
        draggable={draggable}
        onDragStart={() => draggable && onSectionDragStart(index)}
        onDragEnd={() => draggable && onSectionDragEnd()}
        onClick={() => onSelectSection(section.id)}
      >
        <button className={'pb-layer-collapse-btn'} onClick={e => { e.stopPropagation(); setCollapsed(c => !c); }}>
          <CollapseArrow collapsed={collapsed} />
        </button>
        <span className={'pb-layer-section-icon'}>
          {role === 'header' ? '⬆' : role === 'footer' ? '⬇' : '▭'}
        </span>
        <span className={'pb-layer-section-name'}>
          {role === 'header' ? 'Header' : role === 'footer' ? 'Footer' : section.label}
        </span>
        <span className={'pb-layer-section-count'}>{section.children.length}</span>
      </div>

      {!collapsed && (
        <div
          className={'pb-layer-element-list'}
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
          {elements.length === 0 && <div className={'pb-layer-empty-row'}>Drop element here</div>}

          {hasColumns ? (
            columnGroups.map((group, colIdx) => (
              <div key={colIdx}>
                <div className={'pb-layer-row pb-layer-row--cell'} style={{ paddingLeft: 8 + (depth + 1) * 16 }}>
                  <span className={'pb-layer-arrow pb-layer-arrow--leaf'} />
                  <span className={'pb-layer-section-icon'}>⊟</span>
                  <span className={'pb-layer-name'}>Column {colIdx + 1}</span>
                  <span className={'pb-layer-section-count'}>{group.length}</span>
                </div>
                {group.length === 0 && <div className={'pb-layer-empty-row'} style={{ paddingLeft: 8 + (depth + 2) * 16 }}>Empty</div>}
                {group.map(({ el, panelIdx }) => renderElementRow(el, panelIdx))}
              </div>
            ))
          ) : (
            elementItems.map(({ el, panelIdx }) => renderElementRow(el, panelIdx))
          )}
        </div>
      )}
    </div>
  );
}

export function LayerPanel({
  header, sections, footer, nodes,
  selectedIds, selectedSectionId, selectedGridCellId, selectedContainerId,
  onSelectElement, onSelectSection, onSelectGridCell, onSelectContainer, onScrollToElement,
  onReorderSection, onReorderElement,
  onMoveElementToSection, onUpdateElement, onDeleteElement,
}: Props) {
  const sectionDragFromIndex = useRef<number | null>(null);
  const [sectionDragOverIndex, setSectionDragOverIndex] = useState<number | null>(null);
  const [draggingSectionIndex, setDraggingSectionIndex] = useState<number | null>(null);
  const [pageCollapsed, setPageCollapsed] = useState(false);
  const [search, setSearch] = useState('');
  const layerListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      const list = layerListRef.current;
      if (!list) return;
      const selected = list.querySelector<HTMLElement>('.pb-selected');
      if (!selected) return;
      const listTop = list.getBoundingClientRect().top;
      const elTop = selected.getBoundingClientRect().top;
      const relativeTop = elTop - listTop + list.scrollTop;
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

  const commonSectionProps = {
    nodes,
    selectedIds,
    selectedGridCellId,
    selectedContainerId,
    onSelectElement,
    onSelectSection,
    onSelectGridCell,
    onSelectContainer,
    onScrollToElement,
    onUpdateElement,
    onDeleteElement,
    onReorderElement,
    onMoveElementToSection,
    onSectionDragEnd: handleSectionDragEnd,
  };

  return (
    <aside className={'pb-left-sidebar pb-layer-panel'}>

      <div className={'pb-blocks-header'}>
        <span className={'pb-blocks-header-title'}>Layers</span>
        <button className={'pb-blocks-close-btn'} title="Close" onClick={() => {}}>✕</button>
      </div>

      <div className={'pb-blocks-search'}>
        <div className={'pb-blocks-search-inner'}>
          <Icon id="search" size={14} className={'pb-blocks-search-icon'} />
          <input
            type="text"
            placeholder="Search layers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className={'pb-layer-list'} ref={layerListRef}>

        {/* Page virtual root */}
        <div className={'pb-layer-page-row'} onClick={() => setPageCollapsed(c => !c)}>
          <button className={'pb-layer-collapse-btn'} onClick={e => { e.stopPropagation(); setPageCollapsed(c => !c); }}>
            <CollapseArrow collapsed={pageCollapsed} />
          </button>
          <span className={'pb-layer-section-icon'}>◻</span>
          <span className={'pb-layer-section-name'}>Page</span>
        </div>

        {!pageCollapsed && (
          <>
            <SectionGroup
              {...commonSectionProps}
              section={header} role="header" index={-1} depth={1}
              isSectionSelected={selectedSectionId === header.id}
              isDragOver={false} isDragging={false}
              onSectionDragStart={() => {}} onSectionDragOver={() => {}} onSectionDrop={() => {}}
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
              />
            ))}

            {footer && (
              <SectionGroup
                {...commonSectionProps}
                section={footer} role="footer" index={-1} depth={1}
                isSectionSelected={selectedSectionId === footer.id}
                isDragOver={false} isDragging={false}
                onSectionDragStart={() => {}} onSectionDragOver={() => {}} onSectionDrop={() => {}}
              />
            )}
          </>
        )}
      </div>
    </aside>
  );
}

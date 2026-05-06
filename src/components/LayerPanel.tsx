import { useRef, useState } from 'react';
import type { CanvasElement, GridCell, NodeMap, Section, SectionColumns } from '../types';

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

interface Props {
  header: Section;
  sections: Section[];
  footer: Section;
  nodes: NodeMap;
  selectedIds: string[];
  selectedSectionId: string | null;
  selectedGridCellId: string | null;
  onSelectElement: (id: string) => void;
  onSelectSection: (id: string) => void;
  onSelectGridCell: (id: string) => void;
  onReorderSection: (fromIndex: number, toIndex: number) => void;
  onReorderElement: (id: string, newIndex: number) => void;
  onMoveElementToSection: (id: string, toSectionId: string, atIndex: number) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
}

const TYPE_ICON: Record<string, string> = {
  text: 'T', image: '🖼', button: '⬛', box: '□',
  divider: '—', video: '▶', spacer: '↕', icon: '★',
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

interface ActiveDrag {
  sectionId: string;
  panelIdx: number;
  elId: string;
}

let _layerDrag: ActiveDrag | null = null;

interface SectionGroupProps {
  section: Section;
  nodes: NodeMap;
  role: 'header' | 'section' | 'footer';
  index: number;
  isSectionSelected: boolean;
  selectedIds: string[];
  selectedGridCellId: string | null;
  isDragOver: boolean;
  isDragging: boolean;
  onSelectElement: (id: string) => void;
  onSelectSection: (id: string) => void;
  onSelectGridCell: (id: string) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onReorderElement: (id: string, newIndex: number) => void;
  onMoveElementToSection: (id: string, toSectionId: string, atIndex: number) => void;
  onSectionDragStart: (index: number) => void;
  onSectionDragOver: (index: number) => void;
  onSectionDrop: () => void;
  onSectionDragEnd: () => void;
}

function SectionGroup({
  section, nodes, role, index, isSectionSelected, selectedIds, selectedGridCellId, isDragOver, isDragging,
  onSelectElement, onSelectSection, onSelectGridCell, onUpdateElement, onReorderElement, onMoveElementToSection,
  onSectionDragStart, onSectionDragOver, onSectionDrop, onSectionDragEnd,
}: SectionGroupProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [dragOverElIdx, setDragOverElIdx] = useState<number | null>(null);

  const draggable = role === 'section';
  const isGrid = section.layoutMode === 'grid';

  // ── Grid layout rendering ─────────────────────────────────────────────────
  if (isGrid) {
    const cells = section.children
      .map(id => nodes[id] as GridCell | undefined)
      .filter((c): c is GridCell => !!c);

    const totalElements = cells.reduce((sum, c) => sum + c.children.length, 0);

    const renderGridElementRow = (el: CanvasElement) => {
      const isSelected = selectedIds.includes(el.id);
      const hidden = el.state.hidden;
      const locked = el.state.locked;
      return (
        <div
          key={el.id}
          className={`layer-row layer-row--grid-el${isSelected ? ' selected' : ''}${hidden ? ' layer-hidden' : ''}`}
          onClick={() => onSelectElement(el.id)}
        >
          <span className="layer-el-drag-handle" style={{ visibility: 'hidden' }}>⠿</span>
          <span className="layer-type-icon">{TYPE_ICON[el.type] ?? '□'}</span>
          <span className="layer-name" title={elementLabel(el)}>{elementLabel(el)}</span>
          <span className="layer-actions">
            <button
              className={`layer-btn${hidden ? ' active' : ''}`}
              title={hidden ? 'Show' : 'Hide'}
              onClick={e => { e.stopPropagation(); onUpdateElement(el.id, { state: { ...el.state, hidden: !hidden } }); }}
            >{hidden ? '🙈' : '👁'}</button>
            <button
              className={`layer-btn${locked ? ' active' : ''}`}
              title={locked ? 'Unlock' : 'Lock'}
              onClick={e => { e.stopPropagation(); onUpdateElement(el.id, { state: { ...el.state, locked: !locked } }); }}
            >{locked ? '🔒' : '🔓'}</button>
          </span>
        </div>
      );
    };

    return (
      <div
        className={`layer-section-group${isDragOver ? ' drag-over' : ''}${isDragging ? ' dragging' : ''}`}
        onDragOver={e => { e.preventDefault(); if (draggable) onSectionDragOver(index); }}
        onDrop={e => { e.preventDefault(); onSectionDrop(); }}
      >
        <div
          className={`layer-section-header${isSectionSelected ? ' selected' : ''}`}
          draggable={draggable}
          onDragStart={() => draggable && onSectionDragStart(index)}
          onDragEnd={() => draggable && onSectionDragEnd()}
          onClick={() => onSelectSection(section.id)}
        >
          {draggable && <span className="layer-drag-handle" title="Drag to reorder">⠿</span>}
          <button
            className="layer-collapse-btn"
            onClick={e => { e.stopPropagation(); setCollapsed(c => !c); }}
          >
            {collapsed ? '▶' : '▼'}
          </button>
          <span className="layer-section-icon">⊞</span>
          <span className="layer-section-name">{section.label}</span>
          <span className="layer-section-count">{totalElements}</span>
        </div>

        {!collapsed && (
          <div className="layer-element-list">
            {cells.length === 0 && (
              <div className="layer-empty-section">No columns yet</div>
            )}
            {cells.map((cell, cellIdx) => {
              const cellElements = cell.children
                .map(id => nodes[id] as CanvasElement | undefined)
                .filter((el): el is CanvasElement => !!el);
              const isCellSelected = selectedGridCellId === cell.id;

              return (
                <div key={cell.id} className="layer-grid-cell-group">
                  <div
                    className={`layer-grid-cell-header${isCellSelected ? ' selected' : ''}`}
                    onClick={() => { onSelectSection(section.id); onSelectGridCell(cell.id); }}
                  >
                    <span className="layer-column-icon">⊟</span>
                    <span className="layer-column-label">Col {cellIdx + 1}</span>
                    <span className="layer-grid-cell-span">span {cell.columnSpan}</span>
                    <span className="layer-section-count">{cellElements.length}</span>
                  </div>
                  {cellElements.length === 0 && (
                    <div className="layer-empty-section" style={{ paddingLeft: 32 }}>Empty</div>
                  )}
                  {cellElements.map(el => renderGridElementRow(el))}
                </div>
              );
            })}
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
    return (
      <div
        key={el.id}
        className={`layer-row${isSelected ? ' selected' : ''}${hidden ? ' layer-hidden' : ''}${locked ? ' layer-locked' : ''}${isDropTarget ? ' el-drop-target' : ''}`}
        draggable
        onClick={() => onSelectElement(el.id)}
        onDragStart={e => handleElDragStart(e, panelIdx, el.id)}
        onDragOver={e => handleElDragOver(e, panelIdx)}
        onDrop={e => handleElDrop(e, panelIdx)}
        onDragEnd={handleElDragEnd}
      >
        <span className="layer-el-drag-handle">⠿</span>
        <span className="layer-type-icon">{TYPE_ICON[el.type] ?? '□'}</span>
        <span className="layer-name" title={elementLabel(el)}>{elementLabel(el)}</span>
        <span className="layer-actions">
          <button
            className={`layer-btn${hidden ? ' active' : ''}`}
            title={hidden ? 'Show' : 'Hide'}
            onClick={e => { e.stopPropagation(); onUpdateElement(el.id, { state: { ...el.state, hidden: !hidden } }); }}
          >{hidden ? '🙈' : '👁'}</button>
          <button
            className={`layer-btn${locked ? ' active' : ''}`}
            title={locked ? 'Unlock' : 'Lock'}
            onClick={e => { e.stopPropagation(); onUpdateElement(el.id, { state: { ...el.state, locked: !locked } }); }}
          >{locked ? '🔒' : '🔓'}</button>
        </span>
      </div>
    );
  };

  return (
    <div
      className={`layer-section-group${isDragOver ? ' drag-over' : ''}${isDragging ? ' dragging' : ''}`}
      onDragOver={e => {
        e.preventDefault();
        if (!_layerDrag && draggable) onSectionDragOver(index);
      }}
      onDrop={handleSectionBodyDrop}
    >
      <div
        className={`layer-section-header${isSectionSelected ? ' selected' : ''}`}
        draggable={draggable}
        onDragStart={() => draggable && onSectionDragStart(index)}
        onDragEnd={() => draggable && onSectionDragEnd()}
        onClick={() => onSelectSection(section.id)}
      >
        {draggable && <span className="layer-drag-handle" title="Drag to reorder">⠿</span>}
        <button
          className="layer-collapse-btn"
          onClick={e => { e.stopPropagation(); setCollapsed(c => !c); }}
        >
          {collapsed ? '▶' : '▼'}
        </button>
        <span className="layer-section-icon">
          {role === 'header' ? '⬆' : role === 'footer' ? '⬇' : '▭'}
        </span>
        <span className="layer-section-name">
          {role === 'header' ? 'Header' : role === 'footer' ? 'Footer' : section.label}
        </span>
        <span className="layer-section-count">{section.children.length}</span>
      </div>

      {!collapsed && (
        <div
          className="layer-element-list"
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
          {elements.length === 0 && (
            <div className="layer-empty-section">Drop element here</div>
          )}

          {hasColumns ? (
            columnGroups.map((group, colIdx) => (
              <div key={colIdx} className="layer-column-group">
                <div className="layer-column-header">
                  <span className="layer-column-icon">⊟</span>
                  <span className="layer-column-label">Column {colIdx + 1}</span>
                  <span className="layer-section-count">{group.length}</span>
                </div>
                {group.length === 0 && (
                  <div className="layer-empty-section">Empty</div>
                )}
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
  selectedIds, selectedSectionId, selectedGridCellId,
  onSelectElement, onSelectSection, onSelectGridCell,
  onReorderSection, onReorderElement,
  onMoveElementToSection, onUpdateElement,
}: Props) {
  const sectionDragFromIndex = useRef<number | null>(null);
  const [sectionDragOverIndex, setSectionDragOverIndex] = useState<number | null>(null);
  const [draggingSectionIndex, setDraggingSectionIndex] = useState<number | null>(null);

  const totalElements = [header, ...sections, footer].reduce((sum, s) => {
    if (s.layoutMode === 'grid') {
      return sum + s.children.reduce((cSum, cellId) => {
        const cell = nodes[cellId] as GridCell | undefined;
        return cSum + (cell?.children.length ?? 0);
      }, 0);
    }
    return sum + s.children.length;
  }, 0);

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
    onSelectElement,
    onSelectSection,
    onSelectGridCell,
    onUpdateElement,
    onReorderElement,
    onMoveElementToSection,
    onSectionDragEnd: handleSectionDragEnd,
  };

  return (
    <aside className="left-sidebar layer-panel">
      <div className="sidebar-section-title">
        Layers <span className="layer-count">({totalElements})</span>
      </div>
      <div className="layer-list">
        <SectionGroup
          {...commonSectionProps}
          section={header} role="header" index={-1}
          isSectionSelected={selectedSectionId === header.id}
          isDragOver={false} isDragging={false}
          onSectionDragStart={() => {}} onSectionDragOver={() => {}} onSectionDrop={() => {}}
        />

        {sections.map((sec, i) => (
          <SectionGroup
            {...commonSectionProps}
            key={sec.id}
            section={sec} role="section" index={i}
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

        <SectionGroup
          {...commonSectionProps}
          section={footer} role="footer" index={-1}
          isSectionSelected={selectedSectionId === footer.id}
          isDragOver={false} isDragging={false}
          onSectionDragStart={() => {}} onSectionDragOver={() => {}} onSectionDrop={() => {}}
        />
      </div>
    </aside>
  );
}

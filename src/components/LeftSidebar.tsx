import { useState } from 'react';
import type React from 'react';
import { useDrag } from 'react-dnd';
import type { CanvasElement, ElementType, NodeMap, Page, Section, SiteTheme } from '../types';
import { LayerPanel } from './LayerPanel';
import { PagePanel } from './PagePanel';
import { ThemePanel } from './ThemePanel';

export const DND_TYPE = 'PALETTE_ITEM';

interface PaletteItemProps {
  type: ElementType;
  icon: string;
  label: string;
  onAdd: (type: ElementType) => void;
}

function PaletteItem({ type, icon, label, onAdd }: PaletteItemProps) {
  const [{ isDragging }, dragRef] = useDrag({
    type: DND_TYPE,
    item: { type },
    collect: monitor => ({ isDragging: monitor.isDragging() }),
  });

  return (
    <button
      ref={dragRef as unknown as React.Ref<HTMLButtonElement>}
      className="palette-item"
      style={{ opacity: isDragging ? 0.4 : 1 }}
      onClick={() => onAdd(type)}
      title={`Add ${label} — drag to place`}
    >
      <span className="palette-icon">{icon}</span>
      <span className="palette-label">{label}</span>
      <span className="palette-drag-icon">⠿</span>
    </button>
  );
}

const PALETTE: Array<{ type: ElementType; icon: string; label: string }> = [
  { type: 'text',    icon: '',  label: 'Text'    },
  { type: 'image',   icon: '',  label: 'Image'   },
  { type: 'button',  icon: '',  label: 'Button'  },
  { type: 'box',     icon: '',  label: 'Box'     },
  { type: 'divider', icon: '',  label: 'Divider' },
  { type: 'video',   icon: '',  label: 'Video'   },
  { type: 'spacer',  icon: '',  label: 'Spacer'  },
  { type: 'icon',    icon: '',  label: 'Icon'    },
];

interface Props {
  onAdd: (type: ElementType) => void;
  onAddFreeSection: () => void;
  onAddGridSection: () => void;
  selectedIds: string[];
  selectedSectionId: string | null;
  selectedGridCellId: string | null;
  onSelect: (id: string) => void;
  onSelectGridCell: (id: string) => void;
  onReorderSection: (fromIndex: number, toIndex: number) => void;
  onReorderElement: (id: string, newIndex: number) => void;
  onMoveElementToSection: (id: string, toSectionId: string, atIndex: number) => void;
  onUpdate: (id: string, updates: Partial<CanvasElement>) => void;
  // Section data for layers panel
  nodes: NodeMap;
  header: Section;
  sections: Section[];
  footer: Section;
  onSelectSection: (id: string) => void;
  // Page props
  pages: Page[];
  activePageId: string;
  onSetActivePage: (id: string) => void;
  onAddPage: () => void;
  onDeletePage: (id: string) => void;
  onRenamePage: (id: string, name: string) => void;
  // Theme props
  theme: SiteTheme;
  onUpdateTheme: (updates: Partial<SiteTheme>) => void;
}

export function LeftSidebar({
  onAdd, onAddFreeSection, onAddGridSection,
  selectedIds, selectedSectionId, selectedGridCellId,
  onSelect, onSelectGridCell,
  onReorderSection, onReorderElement, onMoveElementToSection, onUpdate,
  nodes, header, sections, footer, onSelectSection,
  pages, activePageId, onSetActivePage, onAddPage, onDeletePage, onRenamePage,
  theme, onUpdateTheme,
}: Props) {
  const [activeTab, setActiveTab] = useState<'elements' | 'layers' | 'pages' | 'theme'>('elements');

  return (
    <div className="left-panel">
      <div className="tab-strip">
        <button className={`tab-btn${activeTab === 'elements' ? ' active' : ''}`}
          onClick={() => setActiveTab('elements')} title="Elements">
          <span className="tab-btn-icon">⊞</span>
          <span>Blocks</span>
        </button>
        <button className={`tab-btn${activeTab === 'layers' ? ' active' : ''}`}
          onClick={() => setActiveTab('layers')} title="Layers">
          <span className="tab-btn-icon">⧉</span>
          <span>Layers</span>
        </button>
        <button className={`tab-btn${activeTab === 'pages' ? ' active' : ''}`}
          onClick={() => setActiveTab('pages')} title="Pages">
          <span className="tab-btn-icon">☰</span>
          <span>Pages</span>
        </button>
        <button className={`tab-btn${activeTab === 'theme' ? ' active' : ''}`}
          onClick={() => setActiveTab('theme')} title="Theme">
          <span className="tab-btn-icon">🎨</span>
          <span>Theme</span>
        </button>
      </div>

      {activeTab === 'elements' && (
        <aside className="left-sidebar">
          <div className="sidebar-section-title">Sections</div>
          <div className="section-type-list">
            <button className="section-type-btn" onClick={onAddFreeSection} title="Add a free-layout section">
              <span className="section-type-icon">⬜</span>
              <div className="section-type-info">
                <span className="section-type-label">Free Section</span>
                <span className="section-type-desc">Absolute positioning</span>
              </div>
            </button>
            <button className="section-type-btn" onClick={onAddGridSection} title="Add a 12-column grid section">
              <span className="section-type-icon">⊞</span>
              <div className="section-type-info">
                <span className="section-type-label">Grid Section</span>
                <span className="section-type-desc">12-column flex grid</span>
              </div>
            </button>
          </div>
          <div className="sidebar-section-title" style={{ marginTop: 8 }}>Elements</div>
          <div className="palette-list">
            {PALETTE.map(item => (
              <PaletteItem key={item.type} type={item.type} icon={item.icon} label={item.label} onAdd={onAdd} />
            ))}
          </div>
        </aside>
      )}

      {activeTab === 'layers' && (
        <LayerPanel
          nodes={nodes}
          header={header}
          sections={sections}
          footer={footer}
          selectedIds={selectedIds}
          selectedSectionId={selectedSectionId}
          selectedGridCellId={selectedGridCellId}
          onSelectElement={onSelect}
          onSelectSection={onSelectSection}
          onSelectGridCell={onSelectGridCell}
          onReorderSection={onReorderSection}
          onReorderElement={onReorderElement}
          onMoveElementToSection={onMoveElementToSection}
          onUpdateElement={onUpdate}
        />
      )}

      {activeTab === 'pages' && (
        <PagePanel
          pages={pages}
          activePageId={activePageId}
          onSetActivePage={onSetActivePage}
          onAddPage={onAddPage}
          onDeletePage={onDeletePage}
          onRenamePage={onRenamePage}
        />
      )}

      {activeTab === 'theme' && (
        <ThemePanel theme={theme} onUpdate={onUpdateTheme} />
      )}
    </div>
  );
}

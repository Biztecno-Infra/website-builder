import { useState } from 'react';
import type React from 'react';
import { useDrag } from 'react-dnd';
import type { CanvasElement, ContainerLayoutMode, ElementType, NodeMap, Page, Section, SiteTheme } from '../types';
import type { TemplateIds, TemplateResult } from '../data/sectionTemplates';
import { SECTION_TEMPLATES } from '../data/sectionTemplates';
import { LayerPanel } from './LayerPanel';
import { PagePanel } from './PagePanel';
import { ThemePanel } from './ThemePanel';

export const DND_TYPE = 'PALETTE_ITEM';
export const LAYOUT_DND_TYPE = 'LAYOUT_ITEM';
export const CELL_LAYOUT_DND_TYPE = 'CELL_LAYOUT_ITEM';

interface LayoutDragItem { columnSpans: number[] }
export interface CellLayoutDragItem { mode: ContainerLayoutMode; columnSpans?: number[] }

function ColumnPreviewIcon({ spans }: { spans: number[] }) {
  return (
    <div style={{ display: 'flex', gap: 2, width: 26, height: 16, flexShrink: 0 }}>
      {spans.map((s, i) => (
        <div key={i} style={{ flex: s, background: 'currentColor', borderRadius: 2, opacity: 0.65 }} />
      ))}
    </div>
  );
}

const CELL_LAYOUT_PRESETS: Array<{ label: string; icon: string; mode: ContainerLayoutMode; columnSpans?: number[] }> = [
  { label: '2 Cols',  icon: '⊞', mode: 'grid',     columnSpans: [6, 6]    },
  { label: '3 Cols',  icon: '⊟', mode: 'grid',     columnSpans: [4, 4, 4] },
  { label: 'Stack',   icon: '☰', mode: 'flex-col'                          },
  { label: 'Row',     icon: '⇔', mode: 'flex-row'                          },
];

function CellLayoutItem({ label, icon, mode, columnSpans, disabled, onAdd }: {
  label: string; icon: string; mode: ContainerLayoutMode;
  columnSpans?: number[]; disabled: boolean;
  onAdd: (mode: ContainerLayoutMode, columnSpans?: number[]) => void;
}) {
  const [{ isDragging }, dragRef] = useDrag<CellLayoutDragItem, void, { isDragging: boolean }>({
    type: CELL_LAYOUT_DND_TYPE,
    item: { mode, columnSpans },
    collect: m => ({ isDragging: m.isDragging() }),
  });
  return (
    <button
      ref={dragRef as unknown as React.Ref<HTMLButtonElement>}
      className={['pb-cell-layout-item', disabled ? 'pb-cell-layout-item--disabled' : ''].filter(Boolean).join(' ')}
      style={{ opacity: isDragging ? 0.4 : 1 }}
      title={disabled ? `Drag into a cell, or select a cell to click-add ${label}` : `Add ${label} container — click or drag into cell`}
      onClick={() => !disabled && onAdd(mode, columnSpans)}
    >
      <span className={'pb-cell-layout-icon'}>{icon}</span>
      <span style={{ fontSize: 10, fontWeight: 600 }}>{label}</span>
    </button>
  );
}

const LAYOUT_PRESETS: Array<{ label: string; desc: string; columnSpans: number[] }> = [
  { label: '2 Columns',     desc: '50 / 50',              columnSpans: [6, 6]          },
  { label: '3 Columns',     desc: '33 / 33 / 33',         columnSpans: [4, 4, 4]       },
  { label: '4 Columns',     desc: '25 / 25 / 25 / 25',    columnSpans: [3, 3, 3, 3]    },
  { label: 'Sidebar Left',  desc: '25 / 75',              columnSpans: [3, 9]          },
  { label: 'Sidebar Right', desc: '75 / 25',              columnSpans: [9, 3]          },
];

function LayoutItem({ label, desc, columnSpans, onAdd }: { label: string; desc: string; columnSpans: number[]; onAdd: (spans: number[]) => void }) {
  const [{ isDragging }, dragRef] = useDrag<LayoutDragItem, void, { isDragging: boolean }>({
    type: LAYOUT_DND_TYPE,
    item: { columnSpans },
    collect: monitor => ({ isDragging: monitor.isDragging() }),
  });
  return (
    <button
      ref={dragRef as unknown as React.Ref<HTMLButtonElement>}
      className={'pb-palette-item'}
      style={{ opacity: isDragging ? 0.4 : 1 }}
      title={`${label} (${desc}) — click to add or drag to position`}
      onClick={() => onAdd(columnSpans)}
    >
      <ColumnPreviewIcon spans={columnSpans} />
      <div className={'pb-palette-label'} style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <span style={{ fontWeight: 600, fontSize: 11 }}>{label}</span>
        <span style={{ fontSize: 9, opacity: 0.55, fontWeight: 500 }}>{desc}</span>
      </div>
      <span className={'pb-palette-drag-icon'}>⠿</span>
    </button>
  );
}

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
      className={'pb-palette-item'}
      style={{ opacity: isDragging ? 0.4 : 1 }}
      onClick={() => onAdd(type)}
      title={`Add ${label} — drag to place`}
    >
      <span className={'pb-palette-icon'}>{icon}</span>
      <span className={'pb-palette-label'}>{label}</span>
      <span className={'pb-palette-drag-icon'}>⠿</span>
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
  onAddGridSection: (columnSpans: number[]) => void;
  onAddSectionFromTemplate: (buildFn: (ids: TemplateIds) => TemplateResult) => void;
  onAddContainer?: (mode: ContainerLayoutMode, columnSpans?: number[]) => void;
  selectedIds: string[];
  selectedSectionId: string | null;
  selectedGridCellId: string | null;
  onSelect: (id: string) => void;
  onSelectGridCell: (id: string) => void;
  onSelectContainer?: (id: string) => void;
  onScrollToElement?: (id: string) => void;
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
  onApplyTheme: () => void;
}

export function LeftSidebar({
  onAdd, onAddFreeSection, onAddGridSection, onAddSectionFromTemplate, onAddContainer,
  selectedIds, selectedSectionId, selectedGridCellId,
  onSelect, onSelectGridCell, onSelectContainer, onScrollToElement,
  onReorderSection, onReorderElement, onMoveElementToSection, onUpdate,
  nodes, header, sections, footer, onSelectSection,
  pages, activePageId, onSetActivePage, onAddPage, onDeletePage, onRenamePage,
  theme, onUpdateTheme, onApplyTheme,
}: Props) {
  const [activeTab, setActiveTab] = useState<'elements' | 'layers' | 'pages' | 'theme'>('elements');
  const [templatesOpen, setTemplatesOpen] = useState(true);

  return (
    <div className={'pb-left-panel'}>
      <div className={'pb-tab-strip'}>
        <button className={['pb-tab-btn', activeTab === 'elements' && 'pb-active'].filter(Boolean).join(' ')}
          onClick={() => setActiveTab('elements')} title="Elements">
          <span className={'pb-tab-btn-icon'}>⊞</span>
          <span>Blocks</span>
        </button>
        <button className={['pb-tab-btn', activeTab === 'layers' && 'pb-active'].filter(Boolean).join(' ')}
          onClick={() => setActiveTab('layers')} title="Layers">
          <span className={'pb-tab-btn-icon'}>⧉</span>
          <span>Layers</span>
        </button>
        <button className={['pb-tab-btn', activeTab === 'pages' && 'pb-active'].filter(Boolean).join(' ')}
          onClick={() => setActiveTab('pages')} title="Pages">
          <span className={'pb-tab-btn-icon'}>☰</span>
          <span>Pages</span>
        </button>
        <button className={['pb-tab-btn', activeTab === 'theme' && 'pb-active'].filter(Boolean).join(' ')}
          onClick={() => setActiveTab('theme')} title="Theme">
          <span className={'pb-tab-btn-icon'}>🎨</span>
          <span>Theme</span>
        </button>
      </div>

      {activeTab === 'elements' && (
        <aside className={'pb-left-sidebar'}>
          <div className={'pb-sidebar-section-title'}>Sections</div>
          <div className={'pb-section-type-list'}>
            <button className={'pb-section-type-btn'} onClick={onAddFreeSection} title="Add a free-layout section">
              <span className={'pb-section-type-icon'}>⬜</span>
              <div className={'pb-section-type-info'}>
                <span className={'pb-section-type-label'}>Free Section</span>
                <span className={'pb-section-type-desc'}>Absolute positioning</span>
              </div>
            </button>
          </div>

          <div className={'pb-sidebar-section-title'} style={{ marginTop: 8 }}>Grid Layouts</div>
          <div className={'pb-palette-list'}>
            {LAYOUT_PRESETS.map(preset => (
              <LayoutItem
                key={preset.label}
                label={preset.label}
                desc={preset.desc}
                columnSpans={preset.columnSpans}
                onAdd={onAddGridSection}
              />
            ))}
          </div>

          <div className={'pb-sidebar-section-title'} style={{ marginTop: 8 }}>Cell Layouts</div>
          <div style={{ paddingLeft: 12, paddingBottom: 4, fontSize: 10, color: '#94a3b8' }}>
            {selectedGridCellId ? 'Drop into cell or click to add' : 'Select a grid cell first'}
          </div>
          <div className={'pb-cell-layout-list'}>
            {CELL_LAYOUT_PRESETS.map(preset => (
              <CellLayoutItem
                key={preset.label}
                label={preset.label}
                icon={preset.icon}
                mode={preset.mode}
                columnSpans={preset.columnSpans}
                disabled={!selectedGridCellId}
                onAdd={(mode, spans) => onAddContainer?.(mode, spans)}
              />
            ))}
          </div>

          <button
            className={'pb-sidebar-collapsible-header'}
            onClick={() => setTemplatesOpen(o => !o)}
          >
            <span className={'pb-sidebar-collapsible-icon'}>{templatesOpen ? '▾' : '▸'}</span>
            <span>Templates</span>
            <span className={'pb-sidebar-collapsible-count'}>{SECTION_TEMPLATES.length}</span>
          </button>
          {templatesOpen && (
            <div className={'pb-template-card-list'}>
              {SECTION_TEMPLATES.map(tpl => (
                <button
                  key={tpl.key}
                  className={'pb-template-card'}
                  title={tpl.desc}
                  onClick={() => onAddSectionFromTemplate(tpl.build)}
                >
                  <span className={'pb-template-card-icon'}>{tpl.icon}</span>
                  <div className={'pb-template-card-info'}>
                    <span className={'pb-template-card-label'}>{tpl.label}</span>
                    <span className={'pb-template-card-desc'}>{tpl.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          )}



          <div className={'pb-sidebar-section-title'} style={{ marginTop: 8 }}>Elements</div>
          <div className={'pb-palette-list'}>
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
          onSelectContainer={onSelectContainer}
          onScrollToElement={onScrollToElement}
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
        <ThemePanel theme={theme} onUpdate={onUpdateTheme} onApplyTheme={onApplyTheme} />
      )}
    </div>
  );
}

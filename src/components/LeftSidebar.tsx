import { useCallback, useEffect, useRef, useState } from 'react';
import type React from 'react';
import { useDrag } from 'react-dnd';
import type { CanvasElement, ContainerLayoutMode, ElementType, NodeMap, Page, Section, SiteTheme } from '../types';
import type { SectionTemplate, TemplateIds, TemplateResult } from '../data/sectionTemplates';
import { SECTION_TEMPLATES } from '../data/sectionTemplates';
import { LayerPanel } from './LayerPanel';
import { PagePanel } from './PagePanel';
import { ThemePanel } from './ThemePanel';
import { Icon } from './Icon';

export const DND_TYPE = 'PALETTE_ITEM';
export const LAYOUT_DND_TYPE = 'LAYOUT_ITEM';
export const CELL_LAYOUT_DND_TYPE = 'CELL_LAYOUT_ITEM';
export const TEMPLATE_DND_TYPE = 'TEMPLATE_SECTION';

export interface TemplateDragItem { buildFn: (ids: TemplateIds, theme: SiteTheme) => TemplateResult }

interface LayoutDragItem { columnSpans: number[] }
export interface CellLayoutDragItem { mode: ContainerLayoutMode; columnSpans?: number[] }

function ColumnPreviewIcon({ spans }: { spans: number[] }) {
  return (
    <div className={'pb-col-preview'}>
      {spans.map((s, i) => (
        <div key={i} className={'pb-col-preview-bar'} style={{ flex: s }} />
      ))}
    </div>
  );
}


const LAYOUT_PRESETS: Array<{ label: string; desc: string; columnSpans: number[] }> = [
  { label: '1 Column',      desc: 'Full width',            columnSpans: [12]            },
  { label: '2 Columns',     desc: '50 / 50',              columnSpans: [6, 6]          },
  { label: '3 Columns',     desc: '33 / 33 / 33',         columnSpans: [4, 4, 4]       },
  { label: '4 Columns',     desc: '25 / 25 / 25 / 25',    columnSpans: [3, 3, 3, 3]    },
  { label: 'Sidebar Left',  desc: '25 / 75',              columnSpans: [3, 9]          },
  { label: 'Sidebar Right', desc: '75 / 25',              columnSpans: [9, 3]          },
];

function LayoutItem({ label, columnSpans, onAdd }: { label: string; desc: string; columnSpans: number[]; onAdd: (spans: number[]) => void }) {
  const [{ isDragging }, dragRef] = useDrag<LayoutDragItem, void, { isDragging: boolean }>({
    type: LAYOUT_DND_TYPE,
    item: { columnSpans },
    collect: monitor => ({ isDragging: monitor.isDragging() }),
  });
  return (
    <button
      ref={dragRef as unknown as React.Ref<HTMLButtonElement>}
      className={'pb-layout-item'}
      style={{ opacity: isDragging ? 0.4 : 1 }}
      title={`${label} — click to add or drag to position`}
      onClick={() => onAdd(columnSpans)}
    >
      <ColumnPreviewIcon spans={columnSpans} />
      <span className={'pb-layout-label'}>{label}</span>
    </button>
  );
}

interface PaletteItemProps {
  type: ElementType;
  iconId: string;
  label: string;
  onAdd: (type: ElementType) => void;
}

function PaletteItem({ type, iconId, label, onAdd }: PaletteItemProps) {
  const [{ isDragging }, dragRef] = useDrag({
    type: DND_TYPE,
    item: { type },
    collect: monitor => ({ isDragging: monitor.isDragging() }),
  });

  return (
    <button
      ref={dragRef as unknown as React.Ref<HTMLButtonElement>}
      className={'pb-palette-item pb-flex-col'}
      style={{ opacity: isDragging ? 0.4 : 1 }}
      onClick={() => onAdd(type)}
      title={`Add ${label} — drag to place`}
    >
      <Icon id={iconId} size={20} />
      <span className={'pb-palette-label'}>{label}</span>
    </button>
  );
}

function TemplateCard({ tpl, onAdd }: {
  tpl: SectionTemplate;
  onAdd: (buildFn: (ids: TemplateIds, theme: SiteTheme) => TemplateResult) => void;
}) {
  const [{ isDragging }, dragRef] = useDrag<TemplateDragItem, void, { isDragging: boolean }>({
    type: TEMPLATE_DND_TYPE,
    item: { buildFn: tpl.build },
    collect: m => ({ isDragging: m.isDragging() }),
  });
  return (
    <button
      ref={dragRef as unknown as React.Ref<HTMLButtonElement>}
      className={'pb-template-card'}
      title={`${tpl.desc} — drag to position`}
      style={{ opacity: isDragging ? 0.4 : 1 }}
      onClick={() => onAdd(tpl.build)}
    >
      <span className={'pb-template-card-icon'}>{tpl.icon}</span>
      <div className={'pb-template-card-info'}>
        <span className={'pb-template-card-label'}>{tpl.label}</span>
        <span className={'pb-template-card-desc'}>{tpl.desc}</span>
      </div>
      <span className={'pb-palette-drag-icon'}>⠿</span>
    </button>
  );
}

const PALETTE: Array<{ type: ElementType; iconId: string; label: string }> = [
  { type: 'text',      iconId: 'elText',      label: 'Text'      },
  { type: 'image',     iconId: 'elImage',     label: 'Image'     },
  { type: 'button',    iconId: 'elButton',    label: 'Button'    },
  { type: 'box',       iconId: 'elBox',       label: 'Box'       },
  { type: 'divider',   iconId: 'elDivider',   label: 'Divider'   },
  { type: 'video',     iconId: 'elVideo',     label: 'Video'     },
  { type: 'spacer',    iconId: 'elSpacer',    label: 'Spacer'    },
  { type: 'icon',      iconId: 'elIcon',      label: 'Icon'      },
  { type: 'form',    iconId: 'elForm',    label: 'Form'    },
];

interface Props {
  onAdd: (type: ElementType) => void;
  onAddFreeSection: () => void;
  onAddGridSection: (columnSpans: number[]) => void;
  onAddSectionFromTemplate: (buildFn: (ids: TemplateIds, theme: SiteTheme) => TemplateResult) => void;
  onAddContainer?: (mode: ContainerLayoutMode, columnSpans?: number[]) => void;
  selectedIds: string[];
  selectedSectionId: string | null;
  selectedGridCellId: string | null;
  selectedContainerId?: string | null;
  onSelect: (id: string) => void;
  onSelectGridCell: (id: string) => void;
  onSelectContainer?: (id: string) => void;
  onScrollToElement?: (id: string) => void;
  onReorderSection: (fromIndex: number, toIndex: number) => void;
  onReorderElement: (id: string, newIndex: number) => void;
  onMoveElementToSection: (id: string, toSectionId: string, atIndex: number) => void;
  onUpdate: (id: string, updates: Partial<CanvasElement>) => void;
  onDeleteElement?: (id: string) => void;
  onDeleteSection?: (id: string) => void;
  // Section data for layers panel
  nodes: NodeMap;
  header: Section;
  sections: Section[];
  footer: Section | undefined;
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

const MIN_WIDTH = 220;
const MAX_WIDTH = 520;
const DEFAULT_WIDTH = 268; // 16.8rem

export function LeftSidebar({
  onAdd, onAddFreeSection, onAddGridSection, onAddSectionFromTemplate, onAddContainer,
  selectedIds, selectedSectionId, selectedGridCellId, selectedContainerId,
  onSelect, onSelectGridCell, onSelectContainer, onScrollToElement,
  onReorderSection, onReorderElement, onMoveElementToSection, onUpdate, onDeleteElement, onDeleteSection,
  nodes, header, sections, footer, onSelectSection,
  pages, activePageId, onSetActivePage, onAddPage, onDeletePage, onRenamePage,
  theme, onUpdateTheme, onApplyTheme,
}: Props) {
  const [activeTab, setActiveTab] = useState<'elements' | 'layers' | 'pages' | 'theme' | null>('elements');
  const [isOpen, setIsOpen] = useState(true);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openRafRef = useRef<number | null>(null);
  const [panelWidth, setPanelWidth] = useState(DEFAULT_WIDTH);

  useEffect(() => () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    if (openRafRef.current) cancelAnimationFrame(openRafRef.current);
  }, []);


  const handleClose = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    if (openRafRef.current) { cancelAnimationFrame(openRafRef.current); openRafRef.current = null; }
    setIsOpen(false);
    closeTimerRef.current = setTimeout(() => {
      setActiveTab(null);
      closeTimerRef.current = null;
    }, 260);
  }, []);

  const handleTabClick = useCallback((tab: 'elements' | 'layers' | 'pages' | 'theme') => {
    // same tab while open → toggle close
    if (activeTab === tab && isOpen) {
      handleClose();
      return;
    }
    // panel already open, just switching content — no width animation
    if (isOpen && activeTab !== null) {
      setActiveTab(tab);
      return;
    }
    // panel is closed — slide open
    if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null; }
    if (openRafRef.current) cancelAnimationFrame(openRafRef.current);
    setActiveTab(tab);
    openRafRef.current = requestAnimationFrame(() => {
      openRafRef.current = requestAnimationFrame(() => {
        setIsOpen(true);
        openRafRef.current = null;
      });
    });
  }, [activeTab, isOpen, handleClose]);

  const handleResizerMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = panelWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMouseMove = (ev: MouseEvent) => {
      const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth + ev.clientX - startX));
      setPanelWidth(next);
    };
    const onMouseUp = () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div className={'pb-left-panel'}>
      <div className={'pb-tab-strip pb-flex-col'}>
        <button className={['pb-tab-btn pb-flex-center', activeTab === 'elements' && 'pb-active'].filter(Boolean).join(' ')}
          onClick={() => handleTabClick('elements')} title="Blocks">
          <Icon id="sections" size={20} />
        </button>
        <button className={['pb-tab-btn pb-flex-center', activeTab === 'layers' && 'pb-active'].filter(Boolean).join(' ')}
          onClick={() => handleTabClick('layers')} title="Layers">
          <Icon id="layers" size={20} />
        </button>
        {/* Pages tab — not in design yet
        <button className={['pb-tab-btn pb-flex-center', activeTab === 'pages' && 'pb-active'].filter(Boolean).join(' ')}
          onClick={() => handleTabClick('pages')} title="Pages">
          <span>Pages</span>
        </button>
        */}
        <button className={['pb-tab-btn pb-flex-center', activeTab === 'theme' && 'pb-active'].filter(Boolean).join(' ')}
          onClick={() => handleTabClick('theme')} title="Theme">
          <Icon id="palette" size={20} />
        </button>
      </div>

      <div className={'pb-left-panel-content'} style={{ width: isOpen && activeTab !== null ? panelWidth - 48 : 0 }}>
      {activeTab === 'elements' && (
        <aside className={'pb-left-sidebar pb-flex-col'}>

          <div className={'pb-blocks-header'}>
            <span className={'pb-blocks-header-title'}>Add Elements</span>
            <button className={'pb-blocks-close-btn pb-flex-center'} title="Close" onClick={handleClose}>✕</button>
          </div>

          <div className={'pb-blocks-search'}>
            <div className={'pb-blocks-search-inner'}>
              <Icon id="search" size={14} className={'pb-blocks-search-icon'} />
              <input type="text" placeholder="Search layers..." />
            </div>
          </div>

          <div className={'pb-sidebar-section-title'}>Basic</div>
          <div className={'pb-palette-list'}>
            {PALETTE.map(item => (
              <PaletteItem key={item.type} type={item.type} iconId={item.iconId} label={item.label} onAdd={onAdd} />
            ))}
          </div>

          <div className={'pb-sidebar-section-title'}>Grid Layout</div>
          <div className={'pb-layout-list'}>
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

          <div className={'pb-section-type-list'}>
            <button className={'pb-section-type-btn pb-flex-row'} onClick={onAddFreeSection} title="Add a free-layout section">
              <span className={'pb-section-type-icon-box'}>
                <Icon id="elAccordion" size={14} />
              </span>
              <div className={'pb-section-type-info'}>
                <span className={'pb-section-type-label'}>Free Section</span>
                <span className={'pb-section-type-desc'}>Absolute positioning</span>
              </div>
            </button>
          </div>

          {/* Cell Layouts — not in design yet, kept for future use
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
          */}

          <div className={'pb-sidebar-section-title'}>Template</div>
          <div className={'pb-template-card-list'}>
            {SECTION_TEMPLATES.map(tpl => (
              <TemplateCard key={tpl.key} tpl={tpl} onAdd={onAddSectionFromTemplate} />
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
          selectedContainerId={selectedContainerId}
          onSelectElement={onSelect}
          onSelectSection={onSelectSection}
          onSelectGridCell={onSelectGridCell}
          onSelectContainer={onSelectContainer}
          onScrollToElement={onScrollToElement}
          onReorderSection={onReorderSection}
          onReorderElement={onReorderElement}
          onMoveElementToSection={onMoveElementToSection}
          onUpdateElement={onUpdate}
          onDeleteElement={onDeleteElement}
          onDeleteSection={onDeleteSection}
          onClose={handleClose}
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
        <ThemePanel theme={theme} onUpdate={onUpdateTheme} onApplyTheme={onApplyTheme} onClose={handleClose} />
      )}
      </div>

      <div className={'pb-left-panel-resizer'} onMouseDown={handleResizerMouseDown} />
    </div>
  );
}

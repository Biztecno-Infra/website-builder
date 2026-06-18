import { useState } from 'react';
import { useFocusSnapshot } from '../../hooks/useFocusSnapshot';
import type {
  Breakpoint, BgType, BuilderState, ContentWidthMode,
  Section, GridSection, GridCell,
  NodeMap, SectionUpdate, ColumnStyle, SectionBackground, SiteTheme,
} from '../../types';
import { equalWidths } from '../../hooks/useBuilderStore';

import { CollapsibleSection, usePanelSections } from './CollapsibleSection';
import { LayoutChangeModal, type LayoutChangeChoice } from '../LayoutChangeModal';
import { ColorField, PxInput, ToggleGroup, ShadowEditor, BorderEditor, VisibilityEditor, themeToSwatches } from './PanelFields';
import { PanelHeader } from './PanelHeader';
import { PbSelect } from '../PbSelect';
import { PbInput } from '../PbInput';
import { PbButton } from '../PbButton';
import {
  SCROLL_BEHAVIOR_OPTIONS,
  CONTENT_WIDTH_OPTIONS,
  BG_TYPE_OPTIONS,
  BG_TYPE_WITH_TRANSPARENT_OPTIONS,
  BG_IMAGE_POSITION_OPTIONS,
  COLUMN_COUNT_OPTIONS,
  SECTION_LAYOUT_MODE_OPTIONS,
} from '../../utils/selectOptions';

const SECTION_PANEL_DEFAULTS: Record<string, boolean> = {
  layout: true,
  columns: true,
  background: true,
  border: false,
  shadow: false,
  spacing: true,
  visibility: false,
  columnStyles: false,
};

interface Props {
  section: Section;
  nodes: NodeMap;
  snapshot: BuilderState;
  onUpdateSection: (id: string, updates: SectionUpdate, opts?: { preserveContent?: boolean }) => void;
  onAddGridCell?: (sectionId: string) => void;
  onUpdateGridCell?: (id: string, updates: Partial<GridCell>) => void;
  onPushSnapshot: (snapshot: BuilderState) => void;
  breakpoint?: Breakpoint;
  theme: SiteTheme;
}

export function SectionPanel({
  section, nodes, snapshot,
  onUpdateSection, onAddGridCell, onUpdateGridCell, onPushSnapshot,
  breakpoint = 'desktop', theme,
}: Props) {
  const [selectedColIdx, setSelectedColIdx] = useState(0);
  const [showLayoutModal, setShowLayoutModal] = useState(false);
  const { sec, toggle } = usePanelSections(SECTION_PANEL_DEFAULTS, 'builder-sidebar-sec');
  const { onFocus: onNumberFocus, onBlur: onNumberBlur } = useFocusSnapshot(snapshot, onPushSnapshot);

  const swatches = themeToSwatches(theme);
  const bg = section.style.background;
  const cols = section.style.columns;
  const isGrid = section.layoutMode === 'grid';
  const hasGrid = isGrid;
  const gridCfg = hasGrid ? (section as GridSection).grid : { gap: 24, rowGap: 24 };
  const secPad = section.style.padding ?? { top: 0, right: 0, bottom: 0, left: 0 };
  const secMargin = section.style.margin ?? { top: 0, right: 0, bottom: 0, left: 0 };
  const secBorder = section.style.border ?? { radius: 0, width: 0, color: '#cccccc', style: 'none' as const };
  const secShadow = section.style.shadow ?? { enabled: false, x: 0, y: 0, blur: 0, spread: 0, color: '#000000' };

  const updateBg = (b: Partial<SectionBackground>) =>
    onUpdateSection(section.id, { style: { ...section.style, background: { ...bg, ...b } } });
  const updateCols = (c: Partial<typeof cols>) =>
    onUpdateSection(section.id, { style: { ...section.style, columns: { ...cols, ...c } } });
  const updateSecPad = (p: Partial<typeof secPad>) =>
    onUpdateSection(section.id, { style: { ...section.style, padding: { ...secPad, ...p } } });
  const updateSecMargin = (m: Partial<typeof secMargin>) =>
    onUpdateSection(section.id, { style: { ...section.style, margin: { ...secMargin, ...m } } });

  const sides = ['top', 'right', 'bottom', 'left'] as const;

  return (
    <aside className={'pb-right-sidebar pb-flex-col'}>
      <PanelHeader title="Layout" />

      {/* ── Layout ── */}
      <CollapsibleSection sectionKey="layout" label="Layout" isOpen={sec('layout')} onToggle={toggle}>

        <div className={'pb-prop-row'}>
          <label>Label</label>
          <PbInput type="text" value={section.label}
            onFocus={onNumberFocus} onBlur={onNumberBlur}
            onChange={e => onUpdateSection(section.id, { label: e.target.value })} />
        </div>

        <div className={'pb-prop-row'}>
          <label>Mode</label>
          <ToggleGroup options={SECTION_LAYOUT_MODE_OPTIONS} value={section.layoutMode}
            onChange={m => {
              if (m === section.layoutMode) return;
              if (m === 'free') {
                onPushSnapshot(snapshot);
                onUpdateSection(section.id, { layoutMode: 'free' });
                return;
              }
              // free → grid: if the section already holds elements, ask the user
              // how to handle them before converting (modal handles the change).
              if (section.layoutMode === 'free' && section.children.length > 0) {
                setShowLayoutModal(true);
                return;
              }
              // Empty section (or already grid-config) — convert directly.
              onPushSnapshot(snapshot);
              onUpdateSection(section.id, { layoutMode: 'grid', grid: hasGrid ? gridCfg : { gap: 24, rowGap: 24 } });
            }} />
        </div>

        <div className={'pb-prop-row'}>
          <label>Scroll</label>
          <PbSelect
            value={section.scrollBehavior ?? 'normal'}
            options={SCROLL_BEHAVIOR_OPTIONS}
            onChange={v => {
              onPushSnapshot(snapshot);
              const sv = v as 'normal' | 'sticky' | 'fixed';
              onUpdateSection(section.id, { scrollBehavior: sv, ...(sv === 'normal' ? { stickyOffset: undefined } : {}) });
            }}
          />
        </div>
        {(section.scrollBehavior === 'sticky' || section.scrollBehavior === 'fixed') && (
          <div className={'pb-prop-row'}>
            <label>Offset top</label>
            <PxInput value={section.stickyOffset ?? 0} min={0} onFocus={onNumberFocus} onBlur={onNumberBlur}
              onChange={v => onUpdateSection(section.id, { stickyOffset: Math.max(0, v) })} />
          </div>
        )}
        {section.scrollBehavior === 'fixed' && (
          <div className={'pb-prop-row pb-hint-inline'} style={{ paddingLeft: 4 }}>
            Previewed as sticky; exports as position:fixed
          </div>
        )}

        {/* Width (grid/flex only) */}
        {hasGrid && (
          <>
            <div className={'pb-prop-row'}>
              <label>Width</label>
              <PbSelect
                value={gridCfg.contentWidth ?? 'constrained'}
                options={CONTENT_WIDTH_OPTIONS}
                onChange={v => onUpdateSection(section.id, { grid: { ...gridCfg, contentWidth: v as ContentWidthMode } })}
              />
            </div>
            {(gridCfg.contentWidth ?? 'constrained') === 'constrained' && (
              <div className={'pb-prop-row'}>
                <label>Max Width</label>
                <PxInput value={gridCfg.maxWidth ?? 1280} min={320} max={3840} onFocus={onNumberFocus} onBlur={onNumberBlur}
                  onChange={v => onUpdateSection(section.id, { grid: { ...gridCfg, maxWidth: Math.max(320, v) } })} />
              </div>
            )}
            <div className={'pb-prop-row'}>
              <label>Min Height</label>
              <PxInput value={gridCfg.minHeight ?? ''} placeholder="Auto"
                onFocus={onNumberFocus} onBlur={onNumberBlur}
                onChange={v => onUpdateSection(section.id, { grid: { ...gridCfg, minHeight: v || undefined } })} />
              {gridCfg.minHeight !== undefined && (
                <button className={'pb-resp-clear-btn'} onClick={() => onUpdateSection(section.id, { grid: { ...gridCfg, minHeight: undefined } })}>↺</button>
              )}
            </div>
            <div className={'pb-prop-row'}>
              <label>Row Height</label>
              <PxInput value={gridCfg.rowHeight ?? ''} placeholder="Auto"
                onFocus={onNumberFocus} onBlur={onNumberBlur}
                onChange={v => onUpdateSection(section.id, { grid: { ...gridCfg, rowHeight: v || undefined } })} />
              {gridCfg.rowHeight !== undefined && (
                <button className={'pb-resp-clear-btn'} onClick={() => onUpdateSection(section.id, { grid: { ...gridCfg, rowHeight: undefined } })}>↺</button>
              )}
            </div>
            <div className={['pb-prop-row', breakpoint === 'desktop' && 'pb-resp-row--active'].filter(Boolean).join(' ')}>
              <label>Col Gap</label>
              <PxInput value={gridCfg.gap}
                onFocus={onNumberFocus} onBlur={onNumberBlur}
                onChange={v => onUpdateSection(section.id, { grid: { ...gridCfg, gap: v } })} />
            </div>
            <div className={['pb-prop-row', breakpoint === 'tablet' && 'pb-resp-row--active'].filter(Boolean).join(' ')}>
              <label>↳ Tab Gap</label>
              <PxInput value={section.responsive?.tablet?.gap ?? gridCfg.gap}
                onFocus={onNumberFocus} onBlur={onNumberBlur}
                onChange={v => onUpdateSection(section.id, { responsive: { ...section.responsive, tablet: { ...section.responsive?.tablet, gap: v } } })} />
              {section.responsive?.tablet?.gap !== undefined && (
                <button className={'pb-resp-clear-btn'} onClick={() => {
                  const { gap: _g, ...rest } = section.responsive?.tablet ?? {};
                  onUpdateSection(section.id, { responsive: { ...section.responsive, tablet: Object.keys(rest).length ? rest : undefined } });
                }}>↺</button>
              )}
            </div>
            <div className={['pb-prop-row', breakpoint === 'mobile' && 'pb-resp-row--active'].filter(Boolean).join(' ')}>
              <label>↳ Mob Gap</label>
              <PxInput value={section.responsive?.mobile?.gap ?? section.responsive?.tablet?.gap ?? gridCfg.gap}
                onFocus={onNumberFocus} onBlur={onNumberBlur}
                onChange={v => onUpdateSection(section.id, { responsive: { ...section.responsive, mobile: { ...section.responsive?.mobile, gap: v } } })} />
              {section.responsive?.mobile?.gap !== undefined && (
                <button className={'pb-resp-clear-btn'} onClick={() => {
                  const { gap: _g, ...rest } = section.responsive?.mobile ?? {};
                  onUpdateSection(section.id, { responsive: { ...section.responsive, mobile: Object.keys(rest).length ? rest : undefined } });
                }}>↺</button>
              )}
            </div>
            <div className={['pb-prop-row', breakpoint === 'desktop' && 'pb-resp-row--active'].filter(Boolean).join(' ')}>
              <label>Row Gap</label>
              <PxInput value={gridCfg.rowGap}
                onFocus={onNumberFocus} onBlur={onNumberBlur}
                onChange={v => onUpdateSection(section.id, { grid: { ...gridCfg, rowGap: v } })} />
            </div>
            <div className={['pb-prop-row', breakpoint === 'tablet' && 'pb-resp-row--active'].filter(Boolean).join(' ')}>
              <label>↳ Tab RGap</label>
              <PxInput value={section.responsive?.tablet?.rowGap ?? gridCfg.rowGap}
                onFocus={onNumberFocus} onBlur={onNumberBlur}
                onChange={v => onUpdateSection(section.id, { responsive: { ...section.responsive, tablet: { ...section.responsive?.tablet, rowGap: v } } })} />
              {section.responsive?.tablet?.rowGap !== undefined && (
                <button className={'pb-resp-clear-btn'} onClick={() => {
                  const { rowGap: _r, ...rest } = section.responsive?.tablet ?? {};
                  onUpdateSection(section.id, { responsive: { ...section.responsive, tablet: Object.keys(rest).length ? rest : undefined } });
                }}>↺</button>
              )}
            </div>
            <div className={['pb-prop-row', breakpoint === 'mobile' && 'pb-resp-row--active'].filter(Boolean).join(' ')}>
              <label>↳ Mob RGap</label>
              <PxInput value={section.responsive?.mobile?.rowGap ?? section.responsive?.tablet?.rowGap ?? gridCfg.rowGap}
                onFocus={onNumberFocus} onBlur={onNumberBlur}
                onChange={v => onUpdateSection(section.id, { responsive: { ...section.responsive, mobile: { ...section.responsive?.mobile, rowGap: v } } })} />
              {section.responsive?.mobile?.rowGap !== undefined && (
                <button className={'pb-resp-clear-btn'} onClick={() => {
                  const { rowGap: _r, ...rest } = section.responsive?.mobile ?? {};
                  onUpdateSection(section.id, { responsive: { ...section.responsive, mobile: Object.keys(rest).length ? rest : undefined } });
                }}>↺</button>
              )}
            </div>
          </>
        )}

        {/* Height (free sections only) */}
        {!hasGrid && (
          <>
            <div className={['pb-prop-row', breakpoint === 'desktop' && 'pb-resp-row--active'].filter(Boolean).join(' ')}>
              <label>Height</label>
              <PxInput value={section.layout.height}
                onFocus={onNumberFocus} onBlur={onNumberBlur}
                onChange={v => onUpdateSection(section.id, { layout: { ...section.layout, height: Math.max(80, v) } })} />
            </div>
            <div className={['pb-prop-row', breakpoint === 'tablet' && 'pb-resp-row--active'].filter(Boolean).join(' ')}>
              <label>↳ Tablet H</label>
              <PxInput value={section.responsive?.tablet?.height ?? section.layout.height}
                onFocus={onNumberFocus} onBlur={onNumberBlur}
                onChange={v => onUpdateSection(section.id, { responsive: { ...section.responsive, tablet: { ...section.responsive?.tablet, height: Math.max(80, v) } } })} />
              {section.responsive?.tablet?.height !== undefined && (
                <button className={'pb-resp-clear-btn'} onClick={() => {
                  const { height: _h, ...rest } = section.responsive?.tablet ?? {};
                  onUpdateSection(section.id, { responsive: { ...section.responsive, tablet: Object.keys(rest).length ? rest : undefined } });
                }}>↺</button>
              )}
            </div>
            <div className={['pb-prop-row', breakpoint === 'mobile' && 'pb-resp-row--active'].filter(Boolean).join(' ')}>
              <label>↳ Mobile H</label>
              <PxInput value={section.responsive?.mobile?.height ?? section.responsive?.tablet?.height ?? section.layout.height}
                onFocus={onNumberFocus} onBlur={onNumberBlur}
                onChange={v => onUpdateSection(section.id, { responsive: { ...section.responsive, mobile: { ...section.responsive?.mobile, height: Math.max(80, v) } } })} />
              {section.responsive?.mobile?.height !== undefined && (
                <button className={'pb-resp-clear-btn'} onClick={() => {
                  const { height: _h, ...rest } = section.responsive?.mobile ?? {};
                  onUpdateSection(section.id, { responsive: { ...section.responsive, mobile: Object.keys(rest).length ? rest : undefined } });
                }}>↺</button>
              )}
            </div>
            <div className={'pb-prop-row'}>
              <label>Columns</label>
              <PbSelect value={String(cols.count)}
                options={COLUMN_COUNT_OPTIONS}
                onChange={v => {
                  onPushSnapshot(snapshot);
                  const n = Number(v);
                  const newStyles: Record<string, ColumnStyle> = {};
                  Object.entries(cols.styles).forEach(([idx, style]) => {
                    if (Number(idx) < n) newStyles[idx] = style;
                  });
                  updateCols({ count: n, widths: n > 1 ? equalWidths(n) : [], styles: newStyles });
                }} />
            </div>
          </>
        )}

      </CollapsibleSection>

      {/* ── Columns (grid/flex only) ── */}
      {hasGrid && (
        <CollapsibleSection sectionKey="columns" label="Columns" isOpen={sec('columns')} onToggle={toggle}>
          <div className={'pb-grid-col-manager-list pb-flex-col'}>
            {section.children.map((cellId, idx) => {
              const cell = nodes[cellId] as GridCell | undefined;
              if (!cell) return null;
              return (
                <div key={cellId} className={'pb-grid-col-manager-row'}>
                  <span className={'pb-grid-col-manager-num'}>Col {idx + 1}</span>
                  <div className={'pb-grid-col-manager-bar'}>
                    <div className={'pb-grid-col-manager-fill'}
                      style={{ width: `${(cell.columnSpan / 12) * 100}%` }} />
                  </div>
                  <span className={'pb-grid-col-manager-span'}>{cell.columnSpan}/12</span>
                </div>
              );
            })}
          </div>
          <div className={'pb-layout-btn-row'}>
            {onAddGridCell && (
              <PbButton variant="primary" onClick={() => onAddGridCell(section.id)}>
                Add col
              </PbButton>
            )}
            {onUpdateGridCell && section.children.length > 1 && (
              <PbButton variant="outline" onClick={() => {
                onPushSnapshot(snapshot);
                const n = section.children.length;
                const base = Math.floor(12 / n);
                const rem = 12 - base * n;
                section.children.forEach((cellId, i) => {
                  onUpdateGridCell(cellId, { columnSpan: base + (i < rem ? 1 : 0) });
                });
              }}>Equal</PbButton>
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* ── Background ── */}
      <CollapsibleSection sectionKey="background" label="Background" isOpen={sec('background')} onToggle={toggle}>
        <div className={'pb-prop-row'}>
          <label>Type</label>
          <PbSelect value={bg.type}
            options={BG_TYPE_WITH_TRANSPARENT_OPTIONS}
            onChange={v => { onPushSnapshot(snapshot); updateBg({ type: v as BgType }); }} />
        </div>
        {bg.type === 'solid' && bg.color !== 'transparent' && (
          <>
            <div className={'pb-prop-row'}>
              <label>Color</label>
              <ColorField
                value={bg.color.startsWith('#') ? bg.color : '#ffffff'}
                onChange={v => updateBg({ color: v })}
                onFocus={onNumberFocus} onBlur={onNumberBlur}
                swatches={swatches} />
            </div>
          </>
        )}
        {(bg.type === 'linear-gradient' || bg.type === 'radial-gradient') && (
          <>
            <div className={'pb-prop-row'}>
              <label>From</label>
              <ColorField value={bg.from || '#006e75'} onChange={v => updateBg({ from: v })} onFocus={onNumberFocus} onBlur={onNumberBlur} swatches={swatches} />
            </div>
            <div className={'pb-prop-row'}>
              <label>To</label>
              <ColorField value={bg.to || '#0b978e'} onChange={v => updateBg({ to: v })} onFocus={onNumberFocus} onBlur={onNumberBlur} swatches={swatches} />
            </div>
            {bg.type === 'linear-gradient' && (
              <div className={'pb-prop-row'}>
                <label>Angle</label>
                <PxInput value={bg.angle ?? 135} unit="°"
                  onFocus={onNumberFocus} onBlur={onNumberBlur}
                  onChange={v => updateBg({ angle: v })} />
              </div>
            )}
          </>
        )}
        <div className={'pb-prop-row pb-full'}>
          <label>Image URL</label>
          <PbInput type="text" value={bg.image} placeholder="https://..."
            onFocus={onNumberFocus} onBlur={onNumberBlur}
            onChange={e => updateBg({ image: e.target.value })} />
        </div>
        {bg.image && (
          <div className={'pb-prop-row'}>
            <label>Image Position</label>
            <PbSelect value={bg.position || 'center'}
              options={BG_IMAGE_POSITION_OPTIONS}
              onChange={v => updateBg({ position: v })} />
          </div>
        )}
        <div className={'pb-prop-row'}>
          <label>Overlay</label>
          <PbInput type="number" value={bg.overlay} min={0} max={1} step={0.05}
            onFocus={onNumberFocus} onBlur={onNumberBlur}
            onChange={e => updateBg({ overlay: Math.max(0, Math.min(1, Number(e.target.value))) })} />
        </div>
      </CollapsibleSection>

      {/* ── Border ── */}
      <CollapsibleSection sectionKey="border" label="Border" isOpen={sec('border')} onToggle={toggle}>
        <BorderEditor
          border={secBorder}
          onChange={updates => onUpdateSection(section.id, { style: { ...section.style, border: { ...secBorder, ...updates } } })}
          onFocus={onNumberFocus}
          onBlur={onNumberBlur}
          swatches={swatches}
        />
      </CollapsibleSection>

      {/* ── Shadow ── */}
      <CollapsibleSection sectionKey="shadow" label="Shadow" isOpen={sec('shadow')} onToggle={toggle}>
        <ShadowEditor
          shadow={secShadow}
          onChange={updates => onUpdateSection(section.id, { style: { ...section.style, shadow: { ...secShadow, ...updates } } })}
          onFocus={onNumberFocus}
          onBlur={onNumberBlur}
          swatches={swatches}
        />
      </CollapsibleSection>

      {/* ── Spacing ── */}
      <CollapsibleSection sectionKey="spacing" label="Spacing" isOpen={sec('spacing')} onToggle={toggle}>
        <div className={'pb-trbl-col-labels'}>
          {(['Top', 'Right', 'Bottom', 'Left'] as const).map(s => <span key={s}>{s}</span>)}
          <span className={'pb-trbl-px-spacer'} />
        </div>
        <div className={'pb-trbl-row-label'}>Margin</div>
        <div className={'pb-trbl-inputs'}>
          {sides.map(s => (
            <PbInput key={s} type="number" className={'pb-trbl-input'} value={secMargin[s]}
              onFocus={onNumberFocus} onBlur={onNumberBlur}
              onChange={e => updateSecMargin({ [s]: Number(e.target.value) })} />
          ))}
          <span className={'pb-trbl-px-cell'}>px</span>
        </div>
        {(() => {
          const bpPadOverride =
            breakpoint === 'mobile' ? section.responsive?.mobile?.padding
            : breakpoint === 'tablet' ? section.responsive?.tablet?.padding
            : undefined;
          const effPad = { ...secPad, ...bpPadOverride };

          const updateBpPad = (key: keyof typeof secPad, val: number) => {
            if (breakpoint === 'desktop') {
              updateSecPad({ [key]: val });
            } else if (breakpoint === 'tablet') {
              onUpdateSection(section.id, { responsive: { ...section.responsive, tablet: { ...section.responsive?.tablet, padding: { ...section.responsive?.tablet?.padding, [key]: val } } } });
            } else {
              onUpdateSection(section.id, { responsive: { ...section.responsive, mobile: { ...section.responsive?.mobile, padding: { ...section.responsive?.mobile?.padding, [key]: val } } } });
            }
          };

          return (
            <>
              <div className={'pb-trbl-row-label'}>Padding</div>
              <div className={'pb-trbl-inputs'}>
                {sides.map(s => (
                  <PbInput key={s} type="number" className={'pb-trbl-input'} value={effPad[s]}
                    onFocus={onNumberFocus} onBlur={onNumberBlur}
                    onChange={e => updateBpPad(s, Number(e.target.value))} />
                ))}
                <span className={'pb-trbl-px-cell'}>px</span>
              </div>
            </>
          );
        })()}
      </CollapsibleSection>

      {/* ── Visibility ── */}
      <CollapsibleSection sectionKey="visibility" label="Visibility" isOpen={sec('visibility')} onToggle={toggle}>
        <VisibilityEditor
          hideOnTablet={!!section.responsive?.tablet?.hidden}
          hideOnMobile={!!section.responsive?.mobile?.hidden}
          onTabletChange={checked => {
            const { hidden: _h, ...restTablet } = section.responsive?.tablet ?? {};
            onUpdateSection(section.id, {
              responsive: { ...section.responsive, tablet: checked ? { ...section.responsive?.tablet, hidden: true } : (Object.keys(restTablet).length ? restTablet : undefined) }
            });
          }}
          onMobileChange={checked => {
            const { hidden: _h, ...restMobile } = section.responsive?.mobile ?? {};
            onUpdateSection(section.id, {
              responsive: { ...section.responsive, mobile: checked ? { ...section.responsive?.mobile, hidden: true } : (Object.keys(restMobile).length ? restMobile : undefined) }
            });
          }}
        />
        <div className={'pb-note-text'} style={{ paddingTop: 4 }}>
          Use this to show a desktop navbar and a separate mobile navbar.
        </div>
      </CollapsibleSection>

      {/* ── Column Styles (free sections with > 1 column) ── */}
      {!isGrid && cols.count > 1 && (() => {
        const colIdx = Math.min(selectedColIdx, cols.count - 1);
        const cs: ColumnStyle = cols.styles[colIdx] ?? {};
        const csb = cs.background ?? {};
        const updateCol = (bgUpdates: Partial<SectionBackground>) =>
          updateCols({
            styles: { ...cols.styles, [colIdx]: { background: { ...csb, ...bgUpdates } as SectionBackground } },
          });
        const colBg = (csb.color || '#ffffff');

        return (
          <CollapsibleSection sectionKey="columnStyles" label="Column Styles" isOpen={sec('columnStyles')} onToggle={toggle}>
            <div className={'pb-col-tabs'}>
              {Array.from({ length: cols.count }, (_, i) => (
                <button key={i} className={['pb-col-tab', colIdx === i && 'pb-active'].filter(Boolean).join(' ')}
                  onClick={() => setSelectedColIdx(i)}>
                  Col {i + 1}
                </button>
              ))}
            </div>
            <div className={'pb-prop-row'}>
              <label>Type</label>
              <PbSelect value={csb.type || 'solid'}
                options={BG_TYPE_OPTIONS}
                onChange={v => { onPushSnapshot(snapshot); updateCol({ type: v as BgType }); }} />
            </div>
            {(!csb.type || csb.type === 'solid') && (
              <div className={'pb-prop-row'}>
                <label>Color</label>
                <ColorField value={colBg.startsWith('#') ? colBg : '#ffffff'}
                  onChange={v => updateCol({ color: v, type: 'solid' })}
                  onFocus={onNumberFocus} onBlur={onNumberBlur} swatches={swatches} />
              </div>
            )}
            {(csb.type === 'linear-gradient' || csb.type === 'radial-gradient') && (
              <>
                <div className={'pb-prop-row'}>
                  <label>From</label>
                  <ColorField value={csb.from || '#006e75'} onChange={v => updateCol({ from: v })} onFocus={onNumberFocus} onBlur={onNumberBlur} swatches={swatches} />
                </div>
                <div className={'pb-prop-row'}>
                  <label>To</label>
                  <ColorField value={csb.to || '#0b978e'} onChange={v => updateCol({ to: v })} onFocus={onNumberFocus} onBlur={onNumberBlur} swatches={swatches} />
                </div>
                {csb.type === 'linear-gradient' && (
                  <div className={'pb-prop-row'}>
                    <label>Angle</label>
                    <PxInput value={csb.angle ?? 135} unit="°"
                      onFocus={onNumberFocus} onBlur={onNumberBlur}
                      onChange={v => updateCol({ angle: v })} />
                  </div>
                )}
              </>
            )}
            <div className={'pb-prop-row pb-full'}>
              <label>Image URL</label>
              <PbInput type="text" value={csb.image || ''} placeholder="https://..."
                onFocus={onNumberFocus} onBlur={onNumberBlur}
                onChange={e => updateCol({ image: e.target.value })} />
            </div>
            <div className={'pb-prop-row'}>
              <label>Overlay</label>
              <PbInput type="number" value={csb.overlay ?? 0} min={0} max={1} step={0.05}
                onFocus={onNumberFocus} onBlur={onNumberBlur}
                onChange={e => updateCol({ overlay: Math.max(0, Math.min(1, Number(e.target.value))) })} />
            </div>
          </CollapsibleSection>
        );
      })()}

      {showLayoutModal && (
        <LayoutChangeModal
          onCancel={() => setShowLayoutModal(false)}
          onConfirm={(choice: LayoutChangeChoice) => {
            setShowLayoutModal(false);
            onPushSnapshot(snapshot);
            onUpdateSection(
              section.id,
              { layoutMode: 'grid', grid: hasGrid ? gridCfg : { gap: 24, rowGap: 24 } },
              { preserveContent: choice === 'preserve' },
            );
          }}
        />
      )}
    </aside>
  );
}

import { useRef, useState } from 'react';
import type {
  Breakpoint, BgType, BuilderState, ContentWidthMode, FlexAlign, FlexConfig,
  FlexJustify, FlexSection, Section, GridSection, GridCell,
  NodeMap, SectionUpdate, ColumnStyle, SectionBackground, SiteTheme, SectionCssPosition,
} from '../../types';
import { equalWidths } from '../../hooks/useBuilderStore';
import { DEFAULT_FLEX_CONFIG } from '../../utils/builderDefaults';
import { ThemeSwatches } from './ThemeSwatches';
import { CollapsibleSection, usePanelSections } from './CollapsibleSection';
import { ColorField, PxInput, ToggleGroup, ShadowEditor, BorderEditor, VisibilityEditor } from './PanelFields';

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

const MODE_OPTIONS = [
  { value: 'free', label: 'Free' },
  { value: 'flex', label: 'Flex' },
  { value: 'grid', label: 'Grid' },
];

interface Props {
  section: Section;
  nodes: NodeMap;
  snapshot: BuilderState;
  onUpdateSection: (id: string, updates: SectionUpdate) => void;
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
  const { sec, toggle } = usePanelSections(SECTION_PANEL_DEFAULTS, 'builder-sidebar-sec');
  const focusSnapshot = useRef<BuilderState | null>(null);
  const onNumberFocus = () => { focusSnapshot.current = snapshot; };
  const onNumberBlur  = () => { if (focusSnapshot.current) { onPushSnapshot(focusSnapshot.current); focusSnapshot.current = null; } };

  const bg = section.style.background;
  const cols = section.style.columns;
  const isGrid = section.layoutMode === 'grid';
  const isFlex = section.layoutMode === 'flex';
  const hasGrid = isGrid || isFlex;
  const gridCfg = hasGrid ? (section as GridSection | FlexSection).grid : { gap: 24, rowGap: 24 };
  const flexCfg: FlexConfig = isFlex ? (section as FlexSection).flex ?? DEFAULT_FLEX_CONFIG : DEFAULT_FLEX_CONFIG;
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
    <aside className={'pb-right-sidebar'}>
      <div className={'pb-panel-header'}>
        <span className={'pb-panel-header-title'}>Layout</span>
      </div>

      {/* ── Layout ── */}
      <CollapsibleSection sectionKey="layout" label="Layout" isOpen={sec('layout')} onToggle={toggle}>

        <div className={'pb-prop-row'}>
          <label>Label</label>
          <input type="text" value={section.label}
            onFocus={onNumberFocus} onBlur={onNumberBlur}
            onChange={e => onUpdateSection(section.id, { label: e.target.value })} />
        </div>

        <div className={'pb-prop-row'}>
          <label>Mode</label>
          <ToggleGroup options={MODE_OPTIONS} value={section.layoutMode}
            onChange={m => {
              onPushSnapshot(snapshot);
              if (m === 'free') {
                onUpdateSection(section.id, { layoutMode: 'free' });
              } else if (m === 'grid') {
                onUpdateSection(section.id, { layoutMode: 'grid', grid: hasGrid ? gridCfg : { gap: 24, rowGap: 24 } });
              } else {
                onUpdateSection(section.id, { layoutMode: 'flex', grid: hasGrid ? gridCfg : { gap: 24, rowGap: 24 }, flex: isFlex ? flexCfg : DEFAULT_FLEX_CONFIG });
              }
            }} />
        </div>

        {/* Flex controls */}
        {isFlex && (
          <>
            <div className={'pb-prop-row'}>
              <label>Direction</label>
              <ToggleGroup
                options={[{ value: 'row', label: 'Row' }, { value: 'column', label: 'Col' }]}
                value={flexCfg.direction.startsWith('row') ? 'row' : 'column'}
                onChange={d => onUpdateSection(section.id, { flex: { ...flexCfg, direction: d as FlexConfig['direction'] } })}
              />
            </div>
            <div className={'pb-prop-row'}>
              <label>Justify</label>
              <select value={flexCfg.justify}
                onChange={e => onUpdateSection(section.id, { flex: { ...flexCfg, justify: e.target.value as FlexJustify } })}>
                <option value="flex-start">Start</option>
                <option value="center">Center</option>
                <option value="flex-end">End</option>
                <option value="space-between">Space Between</option>
                <option value="space-around">Space Around</option>
              </select>
            </div>
            <div className={'pb-prop-row'}>
              <label>Align</label>
              <select value={flexCfg.align}
                onChange={e => onUpdateSection(section.id, { flex: { ...flexCfg, align: e.target.value as FlexAlign } })}>
                <option value="flex-start">Start</option>
                <option value="center">Center</option>
                <option value="flex-end">End</option>
                <option value="stretch">Stretch</option>
              </select>
            </div>
            <div className={'pb-prop-row pb-vis-row'}>
              <label>Wrap</label>
              <input type="checkbox" checked={flexCfg.wrap}
                onChange={e => onUpdateSection(section.id, { flex: { ...flexCfg, wrap: e.target.checked } })} />
            </div>
          </>
        )}

        <div className={'pb-prop-row'}>
          <label>Scroll</label>
          <select
            value={section.scrollBehavior ?? 'normal'}
            onChange={e => {
              onPushSnapshot(snapshot);
              const v = e.target.value as 'normal' | 'sticky' | 'fixed';
              onUpdateSection(section.id, { scrollBehavior: v, ...(v === 'normal' ? { stickyOffset: undefined } : {}) });
            }}
          >
            <option value="normal">Normal</option>
            <option value="sticky">Sticky</option>
            <option value="fixed">Fixed</option>
          </select>
        </div>
        {(section.scrollBehavior === 'sticky' || section.scrollBehavior === 'fixed') && (
          <div className={'pb-prop-row'}>
            <label>Offset top</label>
            <PxInput value={section.stickyOffset ?? 0} min={0} onFocus={onNumberFocus} onBlur={onNumberBlur}
              onChange={v => onUpdateSection(section.id, { stickyOffset: Math.max(0, v) })} />
          </div>
        )}
        {section.scrollBehavior === 'fixed' && (
          <div className={'pb-prop-row'} style={{ fontSize: 11, color: '#888', paddingLeft: 4 }}>
            Previewed as sticky; exports as position:fixed
          </div>
        )}

        {/* Width (grid/flex only) */}
        {hasGrid && (
          <>
            <div className={'pb-prop-row'}>
              <label>Width</label>
              <select
                value={gridCfg.contentWidth ?? 'constrained'}
                onChange={e => onUpdateSection(section.id, { grid: { ...gridCfg, contentWidth: e.target.value as ContentWidthMode } })}
              >
                <option value="constrained">Fixed</option>
                <option value="full">Full</option>
                <option value="fluid">Fluid</option>
              </select>
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
              <input type="number" value={gridCfg.minHeight ?? ''} min={0} placeholder="Auto"
                onFocus={onNumberFocus} onBlur={onNumberBlur}
                onChange={e => {
                  const val = e.target.value === '' ? undefined : Math.max(0, Number(e.target.value));
                  onUpdateSection(section.id, { grid: { ...gridCfg, minHeight: val } });
                }} />
              <span style={{ fontSize: 11, color: '#888' }}>px</span>
              {gridCfg.minHeight !== undefined && (
                <button className={'pb-resp-clear-btn'} onClick={() => onUpdateSection(section.id, { grid: { ...gridCfg, minHeight: undefined } })}>↺</button>
              )}
            </div>
            <div className={'pb-prop-row'}>
              <label>Row Height</label>
              <input type="number" value={gridCfg.rowHeight ?? ''} min={0} placeholder="Auto"
                onFocus={onNumberFocus} onBlur={onNumberBlur}
                onChange={e => {
                  const val = e.target.value === '' ? undefined : Math.max(0, Number(e.target.value));
                  onUpdateSection(section.id, { grid: { ...gridCfg, rowHeight: val } });
                }} />
              <span style={{ fontSize: 11, color: '#888' }}>px</span>
              {gridCfg.rowHeight !== undefined && (
                <button className={'pb-resp-clear-btn'} onClick={() => onUpdateSection(section.id, { grid: { ...gridCfg, rowHeight: undefined } })}>↺</button>
              )}
            </div>
            <div className={['pb-prop-row', breakpoint === 'desktop' && 'pb-resp-row--active'].filter(Boolean).join(' ')}>
              <label>Col Gap</label>
              <input type="number" value={gridCfg.gap} min={0}
                onFocus={onNumberFocus} onBlur={onNumberBlur}
                onChange={e => onUpdateSection(section.id, { grid: { ...gridCfg, gap: Number(e.target.value) } })} />
              <span style={{ fontSize: 11, color: '#888' }}>px</span>
            </div>
            <div className={['pb-prop-row', breakpoint === 'tablet' && 'pb-resp-row--active'].filter(Boolean).join(' ')}>
              <label>↳ Tab Gap</label>
              <input type="number" value={section.responsive?.tablet?.gap ?? gridCfg.gap} min={0}
                onFocus={onNumberFocus} onBlur={onNumberBlur}
                onChange={e => onUpdateSection(section.id, { responsive: { ...section.responsive, tablet: { ...section.responsive?.tablet, gap: Number(e.target.value) } } })} />
              <span style={{ fontSize: 11, color: '#888' }}>px</span>
              {section.responsive?.tablet?.gap !== undefined && (
                <button className={'pb-resp-clear-btn'} onClick={() => {
                  const { gap: _g, ...rest } = section.responsive?.tablet ?? {};
                  onUpdateSection(section.id, { responsive: { ...section.responsive, tablet: Object.keys(rest).length ? rest : undefined } });
                }}>↺</button>
              )}
            </div>
            <div className={['pb-prop-row', breakpoint === 'mobile' && 'pb-resp-row--active'].filter(Boolean).join(' ')}>
              <label>↳ Mob Gap</label>
              <input type="number" value={section.responsive?.mobile?.gap ?? section.responsive?.tablet?.gap ?? gridCfg.gap} min={0}
                onFocus={onNumberFocus} onBlur={onNumberBlur}
                onChange={e => onUpdateSection(section.id, { responsive: { ...section.responsive, mobile: { ...section.responsive?.mobile, gap: Number(e.target.value) } } })} />
              <span style={{ fontSize: 11, color: '#888' }}>px</span>
              {section.responsive?.mobile?.gap !== undefined && (
                <button className={'pb-resp-clear-btn'} onClick={() => {
                  const { gap: _g, ...rest } = section.responsive?.mobile ?? {};
                  onUpdateSection(section.id, { responsive: { ...section.responsive, mobile: Object.keys(rest).length ? rest : undefined } });
                }}>↺</button>
              )}
            </div>
            <div className={['pb-prop-row', breakpoint === 'desktop' && 'pb-resp-row--active'].filter(Boolean).join(' ')}>
              <label>Row Gap</label>
              <input type="number" value={gridCfg.rowGap} min={0}
                onFocus={onNumberFocus} onBlur={onNumberBlur}
                onChange={e => onUpdateSection(section.id, { grid: { ...gridCfg, rowGap: Number(e.target.value) } })} />
              <span style={{ fontSize: 11, color: '#888' }}>px</span>
            </div>
            <div className={['pb-prop-row', breakpoint === 'tablet' && 'pb-resp-row--active'].filter(Boolean).join(' ')}>
              <label>↳ Tab RGap</label>
              <input type="number" value={section.responsive?.tablet?.rowGap ?? gridCfg.rowGap} min={0}
                onFocus={onNumberFocus} onBlur={onNumberBlur}
                onChange={e => onUpdateSection(section.id, { responsive: { ...section.responsive, tablet: { ...section.responsive?.tablet, rowGap: Number(e.target.value) } } })} />
              <span style={{ fontSize: 11, color: '#888' }}>px</span>
              {section.responsive?.tablet?.rowGap !== undefined && (
                <button className={'pb-resp-clear-btn'} onClick={() => {
                  const { rowGap: _r, ...rest } = section.responsive?.tablet ?? {};
                  onUpdateSection(section.id, { responsive: { ...section.responsive, tablet: Object.keys(rest).length ? rest : undefined } });
                }}>↺</button>
              )}
            </div>
            <div className={['pb-prop-row', breakpoint === 'mobile' && 'pb-resp-row--active'].filter(Boolean).join(' ')}>
              <label>↳ Mob RGap</label>
              <input type="number" value={section.responsive?.mobile?.rowGap ?? section.responsive?.tablet?.rowGap ?? gridCfg.rowGap} min={0}
                onFocus={onNumberFocus} onBlur={onNumberBlur}
                onChange={e => onUpdateSection(section.id, { responsive: { ...section.responsive, mobile: { ...section.responsive?.mobile, rowGap: Number(e.target.value) } } })} />
              <span style={{ fontSize: 11, color: '#888' }}>px</span>
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
              <input type="number" value={section.layout.height} min={80}
                onFocus={onNumberFocus} onBlur={onNumberBlur}
                onChange={e => onUpdateSection(section.id, { layout: { ...section.layout, height: Math.max(80, Number(e.target.value)) } })} />
              <span style={{ fontSize: 11, color: '#888' }}>px</span>
            </div>
            <div className={['pb-prop-row', breakpoint === 'tablet' && 'pb-resp-row--active'].filter(Boolean).join(' ')}>
              <label>↳ Tablet H</label>
              <input type="number" value={section.responsive?.tablet?.height ?? section.layout.height} min={80}
                onFocus={onNumberFocus} onBlur={onNumberBlur}
                onChange={e => onUpdateSection(section.id, { responsive: { ...section.responsive, tablet: { ...section.responsive?.tablet, height: Math.max(80, Number(e.target.value)) } } })} />
              <span style={{ fontSize: 11, color: '#888' }}>px</span>
              {section.responsive?.tablet?.height !== undefined && (
                <button className={'pb-resp-clear-btn'} onClick={() => {
                  const { height: _h, ...rest } = section.responsive?.tablet ?? {};
                  onUpdateSection(section.id, { responsive: { ...section.responsive, tablet: Object.keys(rest).length ? rest : undefined } });
                }}>↺</button>
              )}
            </div>
            <div className={['pb-prop-row', breakpoint === 'mobile' && 'pb-resp-row--active'].filter(Boolean).join(' ')}>
              <label>↳ Mobile H</label>
              <input type="number" value={section.responsive?.mobile?.height ?? section.responsive?.tablet?.height ?? section.layout.height} min={80}
                onFocus={onNumberFocus} onBlur={onNumberBlur}
                onChange={e => onUpdateSection(section.id, { responsive: { ...section.responsive, mobile: { ...section.responsive?.mobile, height: Math.max(80, Number(e.target.value)) } } })} />
              <span style={{ fontSize: 11, color: '#888' }}>px</span>
              {section.responsive?.mobile?.height !== undefined && (
                <button className={'pb-resp-clear-btn'} onClick={() => {
                  const { height: _h, ...rest } = section.responsive?.mobile ?? {};
                  onUpdateSection(section.id, { responsive: { ...section.responsive, mobile: Object.keys(rest).length ? rest : undefined } });
                }}>↺</button>
              )}
            </div>
            <div className={'pb-prop-row'}>
              <label>Columns</label>
              <select value={cols.count} onChange={e => {
                onPushSnapshot(snapshot);
                const n = Number(e.target.value);
                const newStyles: Record<string, ColumnStyle> = {};
                Object.entries(cols.styles).forEach(([idx, style]) => {
                  if (Number(idx) < n) newStyles[idx] = style;
                });
                updateCols({ count: n, widths: n > 1 ? equalWidths(n) : [], styles: newStyles });
              }}>
                <option value={1}>None</option>
                <option value={2}>2 Columns</option>
                <option value={3}>3 Columns</option>
                <option value={4}>4 Columns</option>
                <option value={5}>5 Columns</option>
                <option value={6}>6 Columns</option>
              </select>
            </div>
          </>
        )}

        <div className={'pb-prop-row'}>
          <label>Position</label>
          <select
            value={section.cssPosition ?? 'relative'}
            onChange={e => { onPushSnapshot(snapshot); onUpdateSection(section.id, { cssPosition: e.target.value as SectionCssPosition }); }}
          >
            <option value="relative">Relative</option>
            <option value="absolute">Absolute</option>
            <option value="fixed">Fixed</option>
            <option value="sticky">Sticky</option>
          </select>
        </div>

      </CollapsibleSection>

      {/* ── Columns (grid/flex only) ── */}
      {hasGrid && (
        <CollapsibleSection sectionKey="columns" label="Columns" isOpen={sec('columns')} onToggle={toggle}>
          <div className={'pb-grid-col-manager-list'}>
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
          <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
            {onAddGridCell && (
              <button className={'pb-grid-col-add-btn'} style={{ flex: 1 }} onClick={() => onAddGridCell(section.id)}>
                <span>+</span> Add col
              </button>
            )}
            {onUpdateGridCell && section.children.length > 1 && (
              <button className={'pb-grid-col-add-btn'} onClick={() => {
                onPushSnapshot(snapshot);
                const n = section.children.length;
                const base = Math.floor(12 / n);
                const rem = 12 - base * n;
                section.children.forEach((cellId, i) => {
                  onUpdateGridCell(cellId, { columnSpan: base + (i < rem ? 1 : 0) });
                });
              }}>Equal</button>
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* ── Background ── */}
      <CollapsibleSection sectionKey="background" label="Background" isOpen={sec('background')} onToggle={toggle}>
        <div className={'pb-prop-row'}>
          <label>Type</label>
          <select value={bg.type}
            onChange={e => { onPushSnapshot(snapshot); updateBg({ type: e.target.value as BgType }); }}>
            <option value="solid">Solid</option>
            <option value="linear-gradient">Linear Gradient</option>
            <option value="radial-gradient">Radial Gradient</option>
            <option value="transparent">Transparent</option>
          </select>
        </div>
        {bg.type === 'solid' && bg.color !== 'transparent' && (
          <>
            <div className={'pb-prop-row'}>
              <label>Color</label>
              <ColorField
                value={bg.color.startsWith('#') ? bg.color : '#ffffff'}
                onChange={v => updateBg({ color: v })}
                onFocus={onNumberFocus} onBlur={onNumberBlur} />
            </div>
            <ThemeSwatches colors={theme.colors} onPick={c => { onPushSnapshot(snapshot); updateBg({ color: c }); }} />
          </>
        )}
        {(bg.type === 'linear-gradient' || bg.type === 'radial-gradient') && (
          <>
            <div className={'pb-prop-row'}>
              <label>From</label>
              <ColorField value={bg.from || '#006e75'} onChange={v => updateBg({ from: v })} onFocus={onNumberFocus} onBlur={onNumberBlur} />
            </div>
            <ThemeSwatches colors={theme.colors} onPick={c => { onPushSnapshot(snapshot); updateBg({ from: c }); }} />
            <div className={'pb-prop-row'}>
              <label>To</label>
              <ColorField value={bg.to || '#0b978e'} onChange={v => updateBg({ to: v })} onFocus={onNumberFocus} onBlur={onNumberBlur} />
            </div>
            <ThemeSwatches colors={theme.colors} onPick={c => { onPushSnapshot(snapshot); updateBg({ to: c }); }} />
            {bg.type === 'linear-gradient' && (
              <div className={'pb-prop-row'}>
                <label>Angle</label>
                <input type="number" value={bg.angle ?? 135} min={0} max={360}
                  onFocus={onNumberFocus} onBlur={onNumberBlur}
                  onChange={e => updateBg({ angle: Number(e.target.value) })} />
                <span style={{ fontSize: 11, color: '#888' }}>°</span>
              </div>
            )}
          </>
        )}
        <div className={'pb-prop-row pb-full'}>
          <label>Image URL</label>
          <input type="text" value={bg.image} placeholder="https://..."
            onFocus={onNumberFocus} onBlur={onNumberBlur}
            onChange={e => updateBg({ image: e.target.value })} />
        </div>
        {bg.image && (
          <div className={'pb-prop-row'}>
            <label>Image Position</label>
            <select value={bg.position || 'center'} onChange={e => updateBg({ position: e.target.value })}>
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="center">Center</option>
            </select>
          </div>
        )}
        <div className={'pb-prop-row'}>
          <label>Overlay</label>
          <input type="number" value={bg.overlay} min={0} max={1} step={0.05}
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
        />
      </CollapsibleSection>

      {/* ── Shadow ── */}
      <CollapsibleSection sectionKey="shadow" label="Shadow" isOpen={sec('shadow')} onToggle={toggle}>
        <ShadowEditor
          shadow={secShadow}
          onChange={updates => onUpdateSection(section.id, { style: { ...section.style, shadow: { ...secShadow, ...updates } } })}
          onFocus={onNumberFocus}
          onBlur={onNumberBlur}
        />
      </CollapsibleSection>

      {/* ── Spacing ── */}
      <CollapsibleSection sectionKey="spacing" label="Spacing" isOpen={sec('spacing')} onToggle={toggle}>
        <div className={'pb-trbl-header'}>
          <span />
          <span>Top</span><span>Right</span><span>Bottom</span><span>Left</span>
          <span />
        </div>
        <div className={'pb-trbl-row'}>
          <span className={'pb-trbl-label'}>Margin</span>
          {sides.map(s => (
            <input key={s} type="number" className={'pb-trbl-input'} value={secMargin[s]}
              onFocus={onNumberFocus} onBlur={onNumberBlur}
              onChange={e => updateSecMargin({ [s]: Number(e.target.value) })} />
          ))}
          <span className={'pb-trbl-unit'}>px</span>
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
              onUpdateSection(section.id, { responsive: { ...section.responsive, tablet: { ...section.responsive?.tablet, padding: { ...secPad, ...section.responsive?.tablet?.padding, [key]: val } } } });
            } else {
              onUpdateSection(section.id, { responsive: { ...section.responsive, mobile: { ...section.responsive?.mobile, padding: { ...secPad, ...section.responsive?.tablet?.padding, ...section.responsive?.mobile?.padding, [key]: val } } } });
            }
          };

          return (
            <div className={'pb-trbl-row'}>
              <span className={'pb-trbl-label'}>Padding</span>
              {sides.map(s => (
                <input key={s} type="number" className={'pb-trbl-input'} value={effPad[s]}
                  onFocus={onNumberFocus} onBlur={onNumberBlur}
                  onChange={e => updateBpPad(s, Number(e.target.value))} />
              ))}
              <span className={'pb-trbl-unit'}>px</span>
            </div>
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
        <div style={{ fontSize: 10, color: '#94a3b8', lineHeight: 1.5, paddingTop: 4 }}>
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
              <select value={csb.type || 'solid'}
                onChange={e => { onPushSnapshot(snapshot); updateCol({ type: e.target.value as BgType }); }}>
                <option value="solid">Solid</option>
                <option value="linear-gradient">Linear Gradient</option>
                <option value="radial-gradient">Radial Gradient</option>
              </select>
            </div>
            {(!csb.type || csb.type === 'solid') && (
              <div className={'pb-prop-row'}>
                <label>Color</label>
                <ColorField value={colBg.startsWith('#') ? colBg : '#ffffff'}
                  onChange={v => updateCol({ color: v, type: 'solid' })}
                  onFocus={onNumberFocus} onBlur={onNumberBlur} />
              </div>
            )}
            {(csb.type === 'linear-gradient' || csb.type === 'radial-gradient') && (
              <>
                <div className={'pb-prop-row'}>
                  <label>From</label>
                  <ColorField value={csb.from || '#006e75'} onChange={v => updateCol({ from: v })} onFocus={onNumberFocus} onBlur={onNumberBlur} />
                </div>
                <div className={'pb-prop-row'}>
                  <label>To</label>
                  <ColorField value={csb.to || '#0b978e'} onChange={v => updateCol({ to: v })} onFocus={onNumberFocus} onBlur={onNumberBlur} />
                </div>
                {csb.type === 'linear-gradient' && (
                  <div className={'pb-prop-row'}>
                    <label>Angle</label>
                    <input type="number" value={csb.angle ?? 135} min={0} max={360}
                      onFocus={onNumberFocus} onBlur={onNumberBlur}
                      onChange={e => updateCol({ angle: Number(e.target.value) })} />
                    <span style={{ fontSize: 11, color: '#888' }}>°</span>
                  </div>
                )}
              </>
            )}
            <div className={'pb-prop-row pb-full'}>
              <label>Image URL</label>
              <input type="text" value={csb.image || ''} placeholder="https://..."
                onFocus={onNumberFocus} onBlur={onNumberBlur}
                onChange={e => updateCol({ image: e.target.value })} />
            </div>
            <div className={'pb-prop-row'}>
              <label>Overlay</label>
              <input type="number" value={csb.overlay ?? 0} min={0} max={1} step={0.05}
                onFocus={onNumberFocus} onBlur={onNumberBlur}
                onChange={e => updateCol({ overlay: Math.max(0, Math.min(1, Number(e.target.value))) })} />
            </div>
          </CollapsibleSection>
        );
      })()}
    </aside>
  );
}

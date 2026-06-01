import { useRef, useState } from 'react';
import type {
  Breakpoint, BgType, BuilderState, ContentWidthMode, Section, GridSection, GridCell,
  NodeMap, SectionUpdate, ColumnStyle, SectionBackground, SiteTheme,
} from '../../types';
import { equalWidths } from '../../hooks/useBuilderStore';
import { ThemeSwatches } from './ThemeSwatches';
import { CollapsibleSection, usePanelSections } from './CollapsibleSection';

const SECTION_PANEL_DEFAULTS: Record<string, boolean> = {
  layout: true,
  background: true,
  columnStyles: false,
};

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
  const secBgColor = bg.color.startsWith('#') ? bg.color : '#ffffff';
  const isGrid = section.layoutMode === 'grid';
  const gridCfg = isGrid ? (section as GridSection).grid : { gap: 24, rowGap: 24 };
  const secPad = section.style.padding ?? { top: 0, right: 0, bottom: 0, left: 0 };

  const updateBg = (b: Partial<SectionBackground>) =>
    onUpdateSection(section.id, { style: { ...section.style, background: { ...bg, ...b } } });
  const updateCols = (c: Partial<typeof cols>) =>
    onUpdateSection(section.id, { style: { ...section.style, columns: { ...cols, ...c } } });
  const updateSecPad = (p: Partial<typeof secPad>) =>
    onUpdateSection(section.id, { style: { ...section.style, padding: { ...secPad, ...p } } });

  return (
    <aside className={'pb-right-sidebar'}>
      <div className={'pb-panel-header'}>
        <span className={'pb-panel-header-title'}>Section</span>
      </div>

      {/* ── Layout ── */}
      <CollapsibleSection sectionKey="layout" label="Layout" isOpen={sec('layout')} onToggle={toggle}>
        <div className={'pb-prop-row'}>
          <label>Mode</label>
          <div className={'pb-layout-mode-toggle'}>
            <button
              className={['pb-layout-mode-btn', !isGrid && 'pb-active'].filter(Boolean).join(' ')}
              onClick={() => { onPushSnapshot(snapshot); onUpdateSection(section.id, { layoutMode: 'free' }); }}
            >Free</button>
            <button
              className={['pb-layout-mode-btn', isGrid && 'pb-active'].filter(Boolean).join(' ')}
              onClick={() => { onPushSnapshot(snapshot); onUpdateSection(section.id, { layoutMode: 'grid', grid: isGrid ? (section as GridSection).grid : { gap: 24, rowGap: 24 } }); }}
            >Grid</button>
          </div>
        </div>
        <div className={'pb-prop-row'}>
          <label>Label</label>
          <input type="text" value={section.label}
            onFocus={onNumberFocus} onBlur={onNumberBlur}
            onChange={e => onUpdateSection(section.id, { label: e.target.value })} />
        </div>
        <div className={'pb-prop-row'}>
          <label>Scroll</label>
          <div className={'pb-layout-mode-toggle'}>
            <button
              className={['pb-layout-mode-btn', (!section.scrollBehavior || section.scrollBehavior === 'normal') && 'pb-active'].filter(Boolean).join(' ')}
              onClick={() => { onPushSnapshot(snapshot); onUpdateSection(section.id, { scrollBehavior: 'normal', stickyOffset: undefined }); }}
            >Normal</button>
            <button
              className={['pb-layout-mode-btn', section.scrollBehavior === 'sticky' && 'pb-active'].filter(Boolean).join(' ')}
              onClick={() => { onPushSnapshot(snapshot); onUpdateSection(section.id, { scrollBehavior: 'sticky' }); }}
            >Sticky</button>
            <button
              className={['pb-layout-mode-btn', section.scrollBehavior === 'fixed' && 'pb-active'].filter(Boolean).join(' ')}
              onClick={() => { onPushSnapshot(snapshot); onUpdateSection(section.id, { scrollBehavior: 'fixed' }); }}
            >Fixed</button>
          </div>
        </div>
        {(section.scrollBehavior === 'sticky' || section.scrollBehavior === 'fixed') && (
          <div className={'pb-prop-row'}>
            <label>Offset top</label>
            <input type="number" value={section.stickyOffset ?? 0} min={0}
              onFocus={onNumberFocus} onBlur={onNumberBlur}
              onChange={e => onUpdateSection(section.id, { stickyOffset: Math.max(0, Number(e.target.value)) })} />
            <span style={{ fontSize: 11, color: '#888' }}>px</span>
          </div>
        )}
        {section.scrollBehavior === 'fixed' && (
          <div className={'pb-prop-row'} style={{ fontSize: 11, color: '#888', paddingLeft: 4 }}>
            ⚓ Previewed as sticky in editor
          </div>
        )}
        {!isGrid && (
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
                <button className={'pb-resp-clear-btn'} title="Reset to desktop" onClick={() => {
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
                <button className={'pb-resp-clear-btn'} title="Reset" onClick={() => {
                  const { height: _h, ...rest } = section.responsive?.mobile ?? {};
                  onUpdateSection(section.id, { responsive: { ...section.responsive, mobile: Object.keys(rest).length ? rest : undefined } });
                }}>↺</button>
              )}
            </div>
            {/* Section padding — responsive: reads/writes breakpoint override when not on desktop */}
            {(() => {
              const bpPadOverride =
                breakpoint === 'mobile' ? section.responsive?.mobile?.padding
                : breakpoint === 'tablet' ? section.responsive?.tablet?.padding
                : undefined;
              const effPad = { ...secPad, ...bpPadOverride };
              const padOverridden = breakpoint !== 'desktop' && bpPadOverride !== undefined;

              const updateBpPad = (key: keyof typeof secPad, val: number) => {
                if (breakpoint === 'desktop') {
                  updateSecPad({ [key]: val });
                } else if (breakpoint === 'tablet') {
                  onUpdateSection(section.id, { responsive: { ...section.responsive, tablet: { ...section.responsive?.tablet, padding: { ...secPad, ...section.responsive?.tablet?.padding, [key]: val } } } });
                } else {
                  onUpdateSection(section.id, { responsive: { ...section.responsive, mobile: { ...section.responsive?.mobile, padding: { ...secPad, ...section.responsive?.tablet?.padding, ...section.responsive?.mobile?.padding, [key]: val } } } });
                }
              };

              const clearPadBp = () => {
                if (breakpoint === 'tablet') {
                  const { padding: _p, ...rest } = section.responsive?.tablet ?? {};
                  onUpdateSection(section.id, { responsive: { ...section.responsive, tablet: Object.keys(rest).length ? rest : undefined } });
                } else {
                  const { padding: _p, ...rest } = section.responsive?.mobile ?? {};
                  onUpdateSection(section.id, { responsive: { ...section.responsive, mobile: Object.keys(rest).length ? rest : undefined } });
                }
              };

              return (
                <>
                  {(['top','right','bottom','left'] as const).map(side => (
                    <div key={side} className={['pb-prop-row', padOverridden && 'pb-resp-row--active'].filter(Boolean).join(' ')}>
                      <label>Pad {side.charAt(0).toUpperCase() + side.slice(1)}</label>
                      <input type="number" value={effPad[side]} min={0}
                        onFocus={onNumberFocus} onBlur={onNumberBlur}
                        onChange={e => updateBpPad(side, Number(e.target.value))} />
                    </div>
                  ))}
                  {breakpoint !== 'desktop' && padOverridden && (
                    <div className={'pb-resp-ref-row'}>
                      <span className={'pb-resp-ref-label'}>🖥 Desktop: {secPad.top}/{secPad.right}/{secPad.bottom}/{secPad.left}</span>
                      <button className={'pb-resp-clear-btn'} onClick={clearPadBp}>↺ Reset</button>
                    </div>
                  )}
                </>
              );
            })()}
            <div className={'pb-prop-row'}>
              <label>Columns</label>
              <select
                value={cols.count}
                onChange={e => { onPushSnapshot(snapshot);
                  const n = Number(e.target.value);
                  const newStyles: Record<string, ColumnStyle> = {};
                  Object.entries(cols.styles).forEach(([idx, style]) => {
                    if (Number(idx) < n) newStyles[idx] = style;
                  });
                  updateCols({ count: n, widths: n > 1 ? equalWidths(n) : [], styles: newStyles });
                }}
              >
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
        {isGrid && (
          <>
            <div className={'pb-prop-row'}>
              <label>Width</label>
              <div className={'pb-layout-mode-toggle'}>
                {(['constrained', 'full', 'fluid'] as ContentWidthMode[]).map(m => (
                  <button key={m}
                    className={['pb-layout-mode-btn', gridCfg.contentWidth === m && 'pb-active'].filter(Boolean).join(' ')}
                    title={{ constrained: 'Max-width centered content', full: 'Full viewport width', fluid: 'Full width with padding' }[m]}
                    onClick={() => onUpdateSection(section.id, { grid: { ...gridCfg, contentWidth: m } })}
                  >{{ constrained: 'Fixed', full: 'Full', fluid: 'Fluid' }[m]}</button>
                ))}
              </div>
            </div>
            {(gridCfg.contentWidth ?? 'constrained') === 'constrained' && (
              <div className={'pb-prop-row'}>
                <label>Max W</label>
                <input type="number" value={gridCfg.maxWidth ?? 1280} min={320} max={3840}
                  onFocus={onNumberFocus} onBlur={onNumberBlur}
                  onChange={e => onUpdateSection(section.id, { grid: { ...gridCfg, maxWidth: Math.max(320, Number(e.target.value)) } })} />
                <span style={{ fontSize: 11, color: '#888' }}>px</span>
              </div>
            )}
            <div className={['pb-prop-row', breakpoint === 'desktop' && 'pb-resp-row--active'].filter(Boolean).join(' ')}>
              <label>Col. Gap</label>
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
                <button className={'pb-resp-clear-btn'} title="Reset to desktop" onClick={() => {
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
                <button className={'pb-resp-clear-btn'} title="Reset" onClick={() => {
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
                <button className={'pb-resp-clear-btn'} title="Reset to desktop" onClick={() => {
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
                <button className={'pb-resp-clear-btn'} title="Reset" onClick={() => {
                  const { rowGap: _r, ...rest } = section.responsive?.mobile ?? {};
                  onUpdateSection(section.id, { responsive: { ...section.responsive, mobile: Object.keys(rest).length ? rest : undefined } });
                }}>↺</button>
              )}
            </div>
            <div className={'pb-prop-row'}>
              <label>Min Height</label>
              <input type="number" value={gridCfg.minHeight ?? ''} min={0} placeholder="auto"
                onFocus={onNumberFocus} onBlur={onNumberBlur}
                onChange={e => {
                  const val = e.target.value === '' ? undefined : Math.max(0, Number(e.target.value));
                  onUpdateSection(section.id, { grid: { ...gridCfg, minHeight: val } });
                }} />
              <span style={{ fontSize: 11, color: '#888' }}>px</span>
              {gridCfg.minHeight !== undefined && (
                <button className={'pb-resp-clear-btn'} title="Remove min height" onClick={() =>
                  onUpdateSection(section.id, { grid: { ...gridCfg, minHeight: undefined } })
                }>↺</button>
              )}
            </div>
            <div className={'pb-prop-row'}>
              <label>Row Height</label>
              <input type="number" value={gridCfg.rowHeight ?? ''} min={0} placeholder="auto"
                onFocus={onNumberFocus} onBlur={onNumberBlur}
                onChange={e => {
                  const val = e.target.value === '' ? undefined : Math.max(0, Number(e.target.value));
                  onUpdateSection(section.id, { grid: { ...gridCfg, rowHeight: val } });
                }} />
              <span style={{ fontSize: 11, color: '#888' }}>px</span>
              {gridCfg.rowHeight !== undefined && (
                <button className={'pb-resp-clear-btn'} title="Remove fixed row height" onClick={() =>
                  onUpdateSection(section.id, { grid: { ...gridCfg, rowHeight: undefined } })
                }>↺</button>
              )}
            </div>
            {/* Section padding — responsive: reads/writes breakpoint override when not on desktop */}
            {(() => {
              const bpPadOverride =
                breakpoint === 'mobile' ? section.responsive?.mobile?.padding
                : breakpoint === 'tablet' ? section.responsive?.tablet?.padding
                : undefined;
              const effPad = { ...secPad, ...bpPadOverride };
              const padOverridden = breakpoint !== 'desktop' && bpPadOverride !== undefined;

              const updateBpPad = (key: keyof typeof secPad, val: number) => {
                if (breakpoint === 'desktop') {
                  updateSecPad({ [key]: val });
                } else if (breakpoint === 'tablet') {
                  onUpdateSection(section.id, { responsive: { ...section.responsive, tablet: { ...section.responsive?.tablet, padding: { ...secPad, ...section.responsive?.tablet?.padding, [key]: val } } } });
                } else {
                  onUpdateSection(section.id, { responsive: { ...section.responsive, mobile: { ...section.responsive?.mobile, padding: { ...secPad, ...section.responsive?.tablet?.padding, ...section.responsive?.mobile?.padding, [key]: val } } } });
                }
              };

              const clearPadBp = () => {
                if (breakpoint === 'tablet') {
                  const { padding: _p, ...rest } = section.responsive?.tablet ?? {};
                  onUpdateSection(section.id, { responsive: { ...section.responsive, tablet: Object.keys(rest).length ? rest : undefined } });
                } else {
                  const { padding: _p, ...rest } = section.responsive?.mobile ?? {};
                  onUpdateSection(section.id, { responsive: { ...section.responsive, mobile: Object.keys(rest).length ? rest : undefined } });
                }
              };

              return (
                <>
                  {(['top','right','bottom','left'] as const).map(side => (
                    <div key={side} className={['pb-prop-row', padOverridden && 'pb-resp-row--active'].filter(Boolean).join(' ')}>
                      <label>Pad {side.charAt(0).toUpperCase() + side.slice(1)}</label>
                      <input type="number" value={effPad[side]} min={0}
                        onFocus={onNumberFocus} onBlur={onNumberBlur}
                        onChange={e => updateBpPad(side, Number(e.target.value))} />
                    </div>
                  ))}
                  {breakpoint !== 'desktop' && padOverridden && (
                    <div className={'pb-resp-ref-row'}>
                      <span className={'pb-resp-ref-label'}>🖥 Desktop: {secPad.top}/{secPad.right}/{secPad.bottom}/{secPad.left}</span>
                      <button className={'pb-resp-clear-btn'} onClick={clearPadBp}>↺ Reset</button>
                    </div>
                  )}
                </>
              );
            })()}
            <div className={'pb-grid-col-manager'}>
              <div className={'pb-grid-col-manager-label'}>
                Columns
                <span className={'pb-grid-col-manager-count'}>{section.children.length}</span>
              </div>
              <div className={'pb-grid-col-manager-list'}>
                {section.children.map((cellId, idx) => {
                  const cell = nodes[cellId] as GridCell | undefined;
                  if (!cell) return null;
                  const totalUsed = section.children.reduce((sum, cid) => {
                    const c = nodes[cid] as GridCell | undefined;
                    return sum + (c?.columnSpan ?? 4);
                  }, 0);
                  return (
                    <div key={cellId} className={'pb-grid-col-manager-row'}>
                      <span className={'pb-grid-col-manager-num'}>Col {idx + 1}</span>
                      <div className={'pb-grid-col-manager-bar'}>
                        <div className={'pb-grid-col-manager-fill'}
                          style={{ width: `${(cell.columnSpan / 12) * 100}%` }} />
                      </div>
                      <span className={['pb-grid-col-manager-span', totalUsed > 12 && 'pb-over'].filter(Boolean).join(' ')}>
                        {cell.columnSpan}/12
                      </span>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {onAddGridCell && (
                  <button className={'pb-grid-col-add-btn'} style={{ flex: 1 }} onClick={() => onAddGridCell(section.id)}>
                    <span>+</span> Add Column
                  </button>
                )}
                {onUpdateGridCell && section.children.length > 1 && (
                  <button
                    className={'pb-grid-col-add-btn'}
                    title="Distribute all columns to equal widths"
                    onClick={() => {
                      onPushSnapshot(snapshot);
                      const n = section.children.length;
                      const base = Math.floor(12 / n);
                      const rem = 12 - base * n;
                      section.children.forEach((cellId, i) => {
                        onUpdateGridCell(cellId, { columnSpan: base + (i < rem ? 1 : 0) });
                      });
                    }}
                  >= Equal</button>
                )}
              </div>
            </div>
          </>
        )}
      </CollapsibleSection>

      {/* ── Background ── */}
      <CollapsibleSection sectionKey="background" label="Background" isOpen={sec('background')} onToggle={toggle}>
        <div className={'pb-prop-row'}>
          <label>Type</label>
          <select value={bg.type}
            onChange={e => { onPushSnapshot(snapshot); updateBg({ type: e.target.value as BgType }); }}>
            <option value="solid">Solid</option>
            <option value="linear-gradient">Linear Gradient</option>
            <option value="radial-gradient">Radial Gradient</option>
          </select>
        </div>
        {bg.type === 'solid' && (
          <>
            <div className={'pb-prop-row'}>
              <label>Color</label>
              <input type="color" value={secBgColor} disabled={bg.color === 'transparent'}
                onFocus={onNumberFocus} onBlur={onNumberBlur}
                onChange={e => updateBg({ color: e.target.value })} />
              <label className={'pb-transparent-label'}>
                <input type="checkbox" checked={bg.color === 'transparent'}
                  onChange={e => { onPushSnapshot(snapshot); updateBg({ color: e.target.checked ? 'transparent' : '#ffffff' }); }} />
                {' '}Transparent
              </label>
            </div>
            {bg.color !== 'transparent' && (
              <ThemeSwatches colors={theme.colors} onPick={c => { onPushSnapshot(snapshot); updateBg({ color: c }); }} />
            )}
          </>
        )}
        {(bg.type === 'linear-gradient' || bg.type === 'radial-gradient') && (
          <>
            <div className={'pb-prop-row'}>
              <label>From</label>
              <input type="color" value={bg.from || '#006e75'}
                onFocus={onNumberFocus} onBlur={onNumberBlur}
                onChange={e => updateBg({ from: e.target.value })} />
            </div>
            <ThemeSwatches colors={theme.colors} onPick={c => { onPushSnapshot(snapshot); updateBg({ from: c }); }} />
            <div className={'pb-prop-row'}>
              <label>To</label>
              <input type="color" value={bg.to || '#0b978e'}
                onFocus={onNumberFocus} onBlur={onNumberBlur}
                onChange={e => updateBg({ to: e.target.value })} />
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
        <div className={"pb-prop-row pb-full"}>
          <label>Image URL</label>
          <input type="text" value={bg.image} placeholder="https://..."
            onFocus={onNumberFocus} onBlur={onNumberBlur}
            onChange={e => updateBg({ image: e.target.value })} />
        </div>
        <div className={'pb-prop-row'}>
          <label>Overlay</label>
          <input type="number" value={bg.overlay} min={0} max={1} step={0.05}
            onFocus={onNumberFocus} onBlur={onNumberBlur}
            onChange={e => updateBg({ overlay: Math.max(0, Math.min(1, Number(e.target.value))) })} />
        </div>
      </CollapsibleSection>

      {/* ── Column Styles (free sections only, when > 1 column) ── */}
      {!isGrid && cols.count > 1 && (() => {
        const colIdx = Math.min(selectedColIdx, cols.count - 1);
        const cs: ColumnStyle = cols.styles[colIdx] ?? {};
        const csb = cs.background ?? {};
        const updateCol = (bgUpdates: Partial<SectionBackground>) =>
          updateCols({
            styles: { ...cols.styles, [colIdx]: { background: { ...csb, ...bgUpdates } as SectionBackground } },
          });
        const colBg = csb.color || '#ffffff';

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
                <input type="color" value={colBg}
                  onFocus={onNumberFocus} onBlur={onNumberBlur}
                  onChange={e => updateCol({ color: e.target.value, type: 'solid' })} />
              </div>
            )}
            {(csb.type === 'linear-gradient' || csb.type === 'radial-gradient') && (
              <>
                <div className={'pb-prop-row'}>
                  <label>From</label>
                  <input type="color" value={csb.from || '#006e75'}
                    onFocus={onNumberFocus} onBlur={onNumberBlur}
                    onChange={e => updateCol({ from: e.target.value })} />
                </div>
                <div className={'pb-prop-row'}>
                  <label>To</label>
                  <input type="color" value={csb.to || '#0b978e'}
                    onFocus={onNumberFocus} onBlur={onNumberBlur}
                    onChange={e => updateCol({ to: e.target.value })} />
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
            <div className={"pb-prop-row pb-full"}>
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

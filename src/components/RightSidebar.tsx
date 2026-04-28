import { useRef, useState } from 'react';
import type {
  Breakpoint, BorderStyle, BgType, AnimationType, AnimationTrigger,
  CanvasElement, BuilderState, TextAlign, ObjectFit, Section,
  BreakpointOverride, ElementBackground, ElementLayout, ElementContent,
  ElementAnimation, Border, Padding, Shadow, Typography, ColumnStyle, SectionBackground,
} from '../types';
import { equalWidths, applyBreakpoint, CANVAS_W } from '../hooks/useBuilderStore';
import { injectGoogleFont } from '../utils/fonts';

interface Props {
  element: CanvasElement | null;
  section: Section | null;
  snapshot: BuilderState;
  onUpdate: (id: string, updates: Partial<CanvasElement>) => void;
  onUpdateSection: (id: string, updates: Partial<Section>) => void;
  onPushSnapshot: (snapshot: BuilderState) => void;
  onDelete: (id: string) => void;
  breakpoint?: Breakpoint;
  onUpdateResponsive?: (id: string, bp: Breakpoint, updates: Partial<BreakpointOverride>) => void;
}

export function RightSidebar({ element, section, snapshot, onUpdate, onUpdateSection, onPushSnapshot, onDelete, breakpoint = 'desktop', onUpdateResponsive }: Props) {
  const focusSnapshot = useRef<BuilderState | null>(null);
  const [selectedColIdx, setSelectedColIdx] = useState(0);

  // ── Section panel ─────────────────────────────────────────────────────────
  if (!element && section) {
    const bg = section.style.background;
    const cols = section.style.columns;
    const secBgColor = bg.color.startsWith('#') ? bg.color : '#ffffff';

    const updateBg = (b: Partial<SectionBackground>) =>
      onUpdateSection(section.id, { style: { ...section.style, background: { ...bg, ...b } } });
    const updateCols = (c: Partial<typeof cols>) =>
      onUpdateSection(section.id, { style: { ...section.style, columns: { ...cols, ...c } } });

    return (
      <aside className="right-sidebar">
        <div className="panel-header">
          <span className="panel-header-title">Section</span>
        </div>
        <div className="prop-section">
          <div className="section-header">Layout</div>
          <div className="prop-row">
            <label>Label</label>
            <input type="text" value={section.label}
              onChange={e => onUpdateSection(section.id, { label: e.target.value })} />
          </div>
          <div className="prop-row">
            <label>Height</label>
            <input type="number" value={section.layout.height} min={80}
              onChange={e => onUpdateSection(section.id, { layout: { ...section.layout, height: Math.max(80, Number(e.target.value)) } })} />
            <span style={{ fontSize: 11, color: '#888' }}>px</span>
          </div>
          <div className="prop-row">
            <label>Columns</label>
            <select
              value={cols.count}
              onChange={e => {
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
        </div>
        <div className="prop-section">
          <div className="section-header">Background</div>
          <div className="prop-row">
            <label>Type</label>
            <select value={bg.type}
              onChange={e => updateBg({ type: e.target.value as BgType })}>
              <option value="solid">Solid</option>
              <option value="linear-gradient">Linear Gradient</option>
              <option value="radial-gradient">Radial Gradient</option>
            </select>
          </div>
          {bg.type === 'solid' && (
            <div className="prop-row">
              <label>Color</label>
              <input type="color" value={secBgColor}
                onChange={e => updateBg({ color: e.target.value })} />
            </div>
          )}
          {(bg.type === 'linear-gradient' || bg.type === 'radial-gradient') && (
            <>
              <div className="prop-row">
                <label>From</label>
                <input type="color" value={bg.from || '#006e75'}
                  onChange={e => updateBg({ from: e.target.value })} />
              </div>
              <div className="prop-row">
                <label>To</label>
                <input type="color" value={bg.to || '#0b978e'}
                  onChange={e => updateBg({ to: e.target.value })} />
              </div>
              {bg.type === 'linear-gradient' && (
                <div className="prop-row">
                  <label>Angle</label>
                  <input type="number" value={bg.angle ?? 135} min={0} max={360}
                    onChange={e => updateBg({ angle: Number(e.target.value) })} />
                  <span style={{ fontSize: 11, color: '#888' }}>°</span>
                </div>
              )}
            </>
          )}
          <div className="prop-row full">
            <label>Image URL</label>
            <input type="text" value={bg.image} placeholder="https://..."
              onChange={e => updateBg({ image: e.target.value })} />
          </div>
          <div className="prop-row">
            <label>Overlay</label>
            <input type="number" value={bg.overlay} min={0} max={1} step={0.05}
              onChange={e => updateBg({ overlay: Math.max(0, Math.min(1, Number(e.target.value))) })} />
          </div>
        </div>

        {/* ── Column Styles ── */}
        {cols.count > 1 && (() => {
          const colIdx = Math.min(selectedColIdx, cols.count - 1);
          const cs: ColumnStyle = cols.styles[colIdx] ?? {};
          const csb = cs.background ?? {};
          const updateCol = (bgUpdates: Partial<SectionBackground>) =>
            updateCols({
              styles: { ...cols.styles, [colIdx]: { background: { ...csb, ...bgUpdates } as SectionBackground } },
            });
          const colBg = csb.color || '#ffffff';

          return (
            <div className="prop-section">
              <div className="section-header">Column Styles</div>
              <div className="col-tabs">
                {Array.from({ length: cols.count }, (_, i) => (
                  <button
                    key={i}
                    className={`col-tab${colIdx === i ? ' active' : ''}`}
                    onClick={() => setSelectedColIdx(i)}
                  >
                    Col {i + 1}
                  </button>
                ))}
              </div>
              <div className="prop-row">
                <label>Type</label>
                <select value={csb.type || 'solid'}
                  onChange={e => updateCol({ type: e.target.value as BgType })}>
                  <option value="solid">Solid</option>
                  <option value="linear-gradient">Linear Gradient</option>
                  <option value="radial-gradient">Radial Gradient</option>
                </select>
              </div>
              {(!csb.type || csb.type === 'solid') && (
                <div className="prop-row">
                  <label>Color</label>
                  <input type="color" value={colBg}
                    onChange={e => updateCol({ color: e.target.value, type: 'solid' })} />
                </div>
              )}
              {(csb.type === 'linear-gradient' || csb.type === 'radial-gradient') && (
                <>
                  <div className="prop-row">
                    <label>From</label>
                    <input type="color" value={csb.from || '#006e75'}
                      onChange={e => updateCol({ from: e.target.value })} />
                  </div>
                  <div className="prop-row">
                    <label>To</label>
                    <input type="color" value={csb.to || '#0b978e'}
                      onChange={e => updateCol({ to: e.target.value })} />
                  </div>
                  {csb.type === 'linear-gradient' && (
                    <div className="prop-row">
                      <label>Angle</label>
                      <input type="number" value={csb.angle ?? 135} min={0} max={360}
                        onChange={e => updateCol({ angle: Number(e.target.value) })} />
                      <span style={{ fontSize: 11, color: '#888' }}>°</span>
                    </div>
                  )}
                </>
              )}
              <div className="prop-row full">
                <label>Image URL</label>
                <input type="text" value={csb.image || ''} placeholder="https://..."
                  onChange={e => updateCol({ image: e.target.value })} />
              </div>
              <div className="prop-row">
                <label>Overlay</label>
                <input type="number" value={csb.overlay ?? 0} min={0} max={1} step={0.05}
                  onChange={e => updateCol({ overlay: Math.max(0, Math.min(1, Number(e.target.value))) })} />
              </div>
            </div>
          );
        })()}
      </aside>
    );
  }

  if (!element) {
    return (
      <aside className="right-sidebar">
        <div className="panel-header">
          <span className="panel-header-title">Properties</span>
        </div>
        <div className="no-selection">Select an element or section<br />to edit its properties</div>
      </aside>
    );
  }

  const id = element.id;

  // ── Nested update helpers ─────────────────────────────────────────────
  const change = (updates: Partial<CanvasElement>) => onUpdate(id, updates);
  const changeBg   = (b: Partial<ElementBackground>) => change({ style: { ...element.style, background: { ...element.style.background, ...b } } });
  const changeBorder = (b: Partial<Border>) => change({ style: { ...element.style, border: { ...element.style.border, ...b } } });
  const changePad  = (p: Partial<Padding>) => change({ style: { ...element.style, padding: { ...element.style.padding, ...p } } });
  const changeShadow = (s: Partial<Shadow>) => change({ style: { ...element.style, shadow: { ...element.style.shadow, ...s } } });
  const changeTypo = (t: Partial<Typography>) => change({ style: { ...element.style, typography: { ...element.style.typography, ...t } } });
  const changeLayout = (l: Partial<ElementLayout>) => change({ layout: { ...element.layout, ...l } });
  const changeContent = (c: Partial<ElementContent>) => change({ content: { ...element.content, ...c } });
  const changeAnim = (a: Partial<ElementAnimation>) => change({ animation: { ...element.animation, ...a } });

  // Route position/size/typography edits through responsive overrides when not on desktop
  const changeResp = (updates: Partial<BreakpointOverride>) => {
    if (breakpoint !== 'desktop' && onUpdateResponsive) {
      onUpdateResponsive(id, breakpoint, updates);
    } else {
      if (updates.layout) change({ layout: { ...element.layout, ...updates.layout } });
      if (updates.style?.typography) changeTypo(updates.style.typography);
    }
  };

  const respOverrides = breakpoint === 'tablet' ? element.responsive.tablet
    : breakpoint === 'mobile' ? element.responsive.mobile : undefined;

  const bpWidths: Record<string, number> = { desktop: CANVAS_W, tablet: 768, mobile: 375 };
  const bpScale = bpWidths[breakpoint] / CANVAS_W;
  const eff = applyBreakpoint(element, breakpoint, bpScale);

  const onFocus = () => {
    if (!focusSnapshot.current) focusSnapshot.current = snapshot;
  };

  const onBlur = () => {
    if (focusSnapshot.current) {
      onPushSnapshot(focusSnapshot.current);
      focusSnapshot.current = null;
    }
  };

  const commitChange = (updates: Partial<CanvasElement>) => {
    onPushSnapshot(snapshot);
    change(updates);
  };

  const commitResp = (updates: Partial<BreakpointOverride>) => {
    onPushSnapshot(snapshot);
    changeResp(updates);
  };

  const bgColor = element.style.background.color.startsWith('#')
    ? element.style.background.color
    : '#ffffff';
  const elBg = element.style.background;

  return (
    <aside className="right-sidebar">
      <div className="panel-header">
        <span className="panel-header-title">Properties</span>
        <button className="delete-btn" onClick={() => onDelete(id)} title="Delete (Del)">
          ✕
        </button>
      </div>

      {breakpoint !== 'desktop' && (
        <div className={`bp-banner bp-banner-${breakpoint}`}>
          {breakpoint === 'tablet' ? '⬛ Tablet overrides (768px)' : '📱 Mobile overrides (375px)'}
        </div>
      )}

      {/* ─── Visibility (responsive hide) ─── */}
      {onUpdateResponsive && (
        <div className="prop-section">
          <div className="section-header">Visibility</div>
          <div className="prop-row">
            <label>Hide on Tablet</label>
            <input type="checkbox"
              checked={!!(element.responsive.tablet?.state?.hidden)}
              onChange={e => { onPushSnapshot(snapshot); onUpdateResponsive(id, 'tablet', { state: { hidden: e.target.checked } }); }} />
          </div>
          <div className="prop-row">
            <label>Hide on Mobile</label>
            <input type="checkbox"
              checked={!!(element.responsive.mobile?.state?.hidden)}
              onChange={e => { onPushSnapshot(snapshot); onUpdateResponsive(id, 'mobile', { state: { hidden: e.target.checked } }); }} />
          </div>
        </div>
      )}

      {/* ─── Position & Size ─── */}
      <div className="prop-section">
        <div className="section-header">
          Position &amp; Size
          {respOverrides && (respOverrides.layout?.x !== undefined || respOverrides.layout?.y !== undefined ||
            respOverrides.layout?.width !== undefined || respOverrides.layout?.height !== undefined) && (
            <span className="resp-badge">overridden</span>
          )}
        </div>
        <div className="prop-row">
          <label>X</label>
          <input type="number" value={eff.layout.x} onFocus={onFocus} onBlur={onBlur}
            onChange={e => changeResp({ layout: { x: Number(e.target.value) } })} />
        </div>
        <div className="prop-row">
          <label>Y</label>
          <input type="number" value={eff.layout.y} onFocus={onFocus} onBlur={onBlur}
            onChange={e => changeResp({ layout: { y: Number(e.target.value) } })} />
        </div>
        <div className="prop-row">
          <label>W</label>
          <input type="number" value={eff.layout.width} min={20} onFocus={onFocus} onBlur={onBlur}
            onChange={e => changeResp({ layout: { width: Math.max(20, Number(e.target.value)) } })} />
        </div>
        <div className="prop-row">
          <label>H</label>
          <input type="number" value={eff.layout.height} min={20} onFocus={onFocus} onBlur={onBlur}
            onChange={e => changeResp({ layout: { height: Math.max(20, Number(e.target.value)) } })} />
        </div>
        <div className="prop-row">
          <label>Opacity</label>
          <input type="number" value={element.style.opacity} min={0} max={1} step={0.05}
            onFocus={onFocus} onBlur={onBlur}
            onChange={e => change({ style: { ...element.style, opacity: Math.max(0, Math.min(1, Number(e.target.value))) } })} />
        </div>
      </div>

      {/* ─── Appearance ─── */}
      <div className="prop-section">
        <div className="section-header">Appearance</div>
        <div className="prop-row">
          <label>BG Type</label>
          <select value={elBg.type}
            onChange={e => commitChange({ style: { ...element.style, background: { ...elBg, type: e.target.value as BgType } } })}>
            <option value="solid">Solid</option>
            <option value="linear-gradient">Linear Gradient</option>
            <option value="radial-gradient">Radial Gradient</option>
          </select>
        </div>
        {elBg.type === 'solid' && (
          <div className="prop-row">
            <label>BG Color</label>
            <input type="color" value={bgColor} onFocus={onFocus} onBlur={onBlur}
              onChange={e => changeBg({ color: e.target.value })} />
            <label className="transparent-label">
              <input type="checkbox" checked={elBg.color === 'transparent'}
                onChange={e => commitChange({ style: { ...element.style, background: { ...elBg, color: e.target.checked ? 'transparent' : '#ffffff' } } })} />
              {' '}None
            </label>
          </div>
        )}
        {(elBg.type === 'linear-gradient' || elBg.type === 'radial-gradient') && (
          <>
            <div className="prop-row">
              <label>From</label>
              <input type="color" value={elBg.from || '#006e75'} onFocus={onFocus} onBlur={onBlur}
                onChange={e => changeBg({ from: e.target.value })} />
            </div>
            <div className="prop-row">
              <label>To</label>
              <input type="color" value={elBg.to || '#0b978e'} onFocus={onFocus} onBlur={onBlur}
                onChange={e => changeBg({ to: e.target.value })} />
            </div>
            {elBg.type === 'linear-gradient' && (
              <div className="prop-row">
                <label>Angle</label>
                <input type="number" value={elBg.angle ?? 135} min={0} max={360}
                  onFocus={onFocus} onBlur={onBlur}
                  onChange={e => changeBg({ angle: Number(e.target.value) })} />
                <span style={{ fontSize: 11, color: '#888' }}>°</span>
              </div>
            )}
          </>
        )}
        <div className="prop-row full">
          <label>BG Image</label>
          <input type="text" value={elBg.image} placeholder="https://..."
            onFocus={onFocus} onBlur={onBlur}
            onChange={e => changeBg({ image: e.target.value })} />
        </div>
        {elBg.image && (
          <div className="prop-row">
            <label>BG Position</label>
            <select value={elBg.position}
              onChange={e => commitChange({ style: { ...element.style, background: { ...elBg, position: e.target.value } } })}>
              <option value="center">Center</option>
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="top left">Top Left</option>
              <option value="top right">Top Right</option>
            </select>
          </div>
        )}
        <div className="prop-row">
          <label>Radius</label>
          <input type="number" value={element.style.border.radius} min={0}
            onFocus={onFocus} onBlur={onBlur}
            onChange={e => changeBorder({ radius: Number(e.target.value) })} />
        </div>
        <div className="prop-row">
          <label>Border W</label>
          <input type="number" value={element.style.border.width} min={0}
            onFocus={onFocus} onBlur={onBlur}
            onChange={e => changeBorder({ width: Number(e.target.value) })} />
        </div>
        {element.style.border.width > 0 && (
          <>
            <div className="prop-row">
              <label>Border Color</label>
              <input type="color"
                value={element.style.border.color.startsWith('#') ? element.style.border.color : '#cccccc'}
                onFocus={onFocus} onBlur={onBlur}
                onChange={e => changeBorder({ color: e.target.value })} />
            </div>
            <div className="prop-row">
              <label>Border Style</label>
              <select value={element.style.border.style}
                onChange={e => commitChange({ style: { ...element.style, border: { ...element.style.border, style: e.target.value as BorderStyle } } })}>
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
              </select>
            </div>
          </>
        )}
      </div>

      {/* ─── Typography (Text + Button) ─── */}
      {(element.type === 'text' || element.type === 'button') && (
        <div className="prop-section">
          <div className="section-header">Typography</div>
          {element.type === 'text' && (
            <div className="prop-row full">
              <label>Text</label>
              <textarea value={element.content.plain} rows={3}
                onFocus={onFocus} onBlur={onBlur}
                onChange={e => changeContent({ plain: e.target.value })} />
            </div>
          )}
          {element.type === 'button' && (
            <div className="prop-row">
              <label>Label</label>
              <input type="text" value={element.content.label}
                onFocus={onFocus} onBlur={onBlur}
                onChange={e => changeContent({ label: e.target.value })} />
            </div>
          )}
          <div className="prop-row">
            <label>Size</label>
            <input type="number" value={eff.style.typography.size} min={8} max={200}
              onFocus={onFocus} onBlur={onBlur}
              onChange={e => changeResp({ style: { typography: { size: Number(e.target.value) } } })} />
          </div>
          <div className="prop-row">
            <label>Weight</label>
            <select value={eff.style.typography.weight}
              onChange={e => commitResp({ style: { typography: { weight: e.target.value } } })}>
              <option value="100">Thin (100)</option>
              <option value="200">ExtraLight (200)</option>
              <option value="300">Light (300)</option>
              <option value="normal">Regular (400)</option>
              <option value="500">Medium (500)</option>
              <option value="600">SemiBold (600)</option>
              <option value="bold">Bold (700)</option>
              <option value="800">ExtraBold (800)</option>
              <option value="900">Heavy (900)</option>
            </select>
          </div>
          <div className="prop-row">
            <label>Font</label>
            <select value={element.style.typography.family}
              onChange={e => { injectGoogleFont(e.target.value); commitChange({ style: { ...element.style, typography: { ...element.style.typography, family: e.target.value } } }); }}>
              <optgroup label="Sans-serif">
                <option value="Inter, sans-serif">Inter</option>
                <option value="Arial, sans-serif">Arial</option>
                <option value="Helvetica, Arial, sans-serif">Helvetica</option>
                <option value="Verdana, sans-serif">Verdana</option>
                <option value="Tahoma, sans-serif">Tahoma</option>
                <option value="'Segoe UI', sans-serif">Segoe UI</option>
                <option value="Roboto, sans-serif">Roboto</option>
                <option value="'Open Sans', sans-serif">Open Sans</option>
                <option value="Lato, sans-serif">Lato</option>
                <option value="Montserrat, sans-serif">Montserrat</option>
                <option value="Poppins, sans-serif">Poppins</option>
                <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
                <option value="'Lucida Sans', sans-serif">Lucida Sans</option>
                <option value="sans-serif">System Sans-serif</option>
              </optgroup>
              <optgroup label="Serif">
                <option value="Georgia, serif">Georgia</option>
                <option value="'Times New Roman', serif">Times New Roman</option>
                <option value="Merriweather, serif">Merriweather</option>
                <option value="'Palatino Linotype', Palatino, serif">Palatino</option>
              </optgroup>
              <optgroup label="Monospace">
                <option value="'Courier New', monospace">Courier New</option>
              </optgroup>
              <optgroup label="Display">
                <option value="'Comic Sans MS', cursive, sans-serif">Comic Sans MS</option>
              </optgroup>
            </select>
          </div>
          <div className="prop-row">
            <label>Color</label>
            <input type="color"
              value={element.style.typography.color.startsWith('#') ? element.style.typography.color : '#333333'}
              onFocus={onFocus} onBlur={onBlur}
              onChange={e => changeTypo({ color: e.target.value })} />
          </div>
          <div className="prop-row">
            <label>Align</label>
            <div className="btn-group">
              {(['left', 'center', 'right'] as TextAlign[]).map(a => (
                <button key={a}
                  className={eff.style.typography.align === a ? 'active' : ''}
                  onClick={() => commitResp({ style: { typography: { align: a } } })}
                  title={a}>
                  {a === 'left' ? '⬅' : a === 'center' ? '⬛' : '➡'}
                </button>
              ))}
            </div>
          </div>
          <div className="prop-row">
            <label>Line H</label>
            <input type="number" value={element.style.typography.lineHeight} min={0.5} max={5} step={0.1}
              onFocus={onFocus} onBlur={onBlur}
              onChange={e => changeTypo({ lineHeight: Number(e.target.value) })} />
          </div>
        </div>
      )}

      {/* ─── Image ─── */}
      {element.type === 'image' && (
        <div className="prop-section">
          <div className="section-header">Image</div>
          <div className="prop-row full">
            <label>URL</label>
            <input type="text" value={element.content.src} placeholder="https://..."
              onFocus={onFocus} onBlur={onBlur}
              onChange={e => changeContent({ src: e.target.value })} />
          </div>
          <div className="prop-row">
            <label>Alt</label>
            <input type="text" value={element.content.alt}
              onFocus={onFocus} onBlur={onBlur}
              onChange={e => changeContent({ alt: e.target.value })} />
          </div>
          <div className="prop-row">
            <label>Fit</label>
            <select value={element.content.objectFit}
              onChange={e => commitChange({ content: { ...element.content, objectFit: e.target.value as ObjectFit } })}>
              <option value="cover">Cover</option>
              <option value="contain">Contain</option>
              <option value="fill">Fill</option>
            </select>
          </div>
        </div>
      )}

      {/* ─── Video ─── */}
      {element.type === 'video' && (
        <div className="prop-section">
          <div className="section-header">Video</div>
          <div className="prop-row full">
            <label>YouTube / Video URL</label>
            <input type="text" value={element.content.videoUrl} placeholder="https://youtube.com/watch?v=..."
              onFocus={onFocus} onBlur={onBlur}
              onChange={e => changeContent({ videoUrl: e.target.value })} />
          </div>
        </div>
      )}

      {/* ─── Icon ─── */}
      {element.type === 'icon' && (
        <div className="prop-section">
          <div className="section-header">Icon</div>
          <div className="prop-row">
            <label>Symbol</label>
            <input type="text" value={element.content.iconName}
              onFocus={onFocus} onBlur={onBlur}
              onChange={e => changeContent({ iconName: e.target.value })} />
          </div>
          <div className="prop-row">
            <label>Size</label>
            <input type="number" value={element.content.iconSize} min={8} max={200}
              onFocus={onFocus} onBlur={onBlur}
              onChange={e => changeContent({ iconSize: Number(e.target.value) })} />
          </div>
          <div className="prop-row">
            <label>Color</label>
            <input type="color"
              value={element.style.typography.color.startsWith('#') ? element.style.typography.color : '#333333'}
              onFocus={onFocus} onBlur={onBlur}
              onChange={e => changeTypo({ color: e.target.value })} />
          </div>
        </div>
      )}

      {/* ─── Spacing (Padding) ─── */}
      <div className="prop-section">
        <div className="section-header">Spacing</div>
        <div className="prop-row">
          <label>Pad Top</label>
          <input type="number" value={element.style.padding.top} min={0}
            onFocus={onFocus} onBlur={onBlur}
            onChange={e => changePad({ top: Number(e.target.value) })} />
        </div>
        <div className="prop-row">
          <label>Pad Right</label>
          <input type="number" value={element.style.padding.right} min={0}
            onFocus={onFocus} onBlur={onBlur}
            onChange={e => changePad({ right: Number(e.target.value) })} />
        </div>
        <div className="prop-row">
          <label>Pad Bottom</label>
          <input type="number" value={element.style.padding.bottom} min={0}
            onFocus={onFocus} onBlur={onBlur}
            onChange={e => changePad({ bottom: Number(e.target.value) })} />
        </div>
        <div className="prop-row">
          <label>Pad Left</label>
          <input type="number" value={element.style.padding.left} min={0}
            onFocus={onFocus} onBlur={onBlur}
            onChange={e => changePad({ left: Number(e.target.value) })} />
        </div>
      </div>

      {/* ─── Shadow ─── */}
      <div className="prop-section">
        <div className="section-header">
          Shadow
          <label className="transparent-label" style={{ marginLeft: 8 }}>
            <input type="checkbox" checked={element.style.shadow.enabled}
              onChange={e => commitChange({ style: { ...element.style, shadow: { ...element.style.shadow, enabled: e.target.checked } } })} />
            {' '}On
          </label>
        </div>
        {element.style.shadow.enabled && (
          <>
            <div className="prop-row">
              <label>X</label>
              <input type="number" value={element.style.shadow.x}
                onFocus={onFocus} onBlur={onBlur}
                onChange={e => changeShadow({ x: Number(e.target.value) })} />
            </div>
            <div className="prop-row">
              <label>Y</label>
              <input type="number" value={element.style.shadow.y}
                onFocus={onFocus} onBlur={onBlur}
                onChange={e => changeShadow({ y: Number(e.target.value) })} />
            </div>
            <div className="prop-row">
              <label>Blur</label>
              <input type="number" value={element.style.shadow.blur} min={0}
                onFocus={onFocus} onBlur={onBlur}
                onChange={e => changeShadow({ blur: Number(e.target.value) })} />
            </div>
            <div className="prop-row">
              <label>Spread</label>
              <input type="number" value={element.style.shadow.spread}
                onFocus={onFocus} onBlur={onBlur}
                onChange={e => changeShadow({ spread: Number(e.target.value) })} />
            </div>
            <div className="prop-row">
              <label>Color</label>
              <input type="color"
                value={element.style.shadow.color.startsWith('#') ? element.style.shadow.color : '#000000'}
                onFocus={onFocus} onBlur={onBlur}
                onChange={e => changeShadow({ color: e.target.value })} />
            </div>
          </>
        )}
      </div>

      {/* ─── Transform ─── */}
      <div className="prop-section">
        <div className="section-header">Transform</div>
        <div className="prop-row">
          <label>Rotation</label>
          <input type="number" value={element.layout.rotation} min={-360} max={360}
            onFocus={onFocus} onBlur={onBlur}
            onChange={e => changeLayout({ rotation: Number(e.target.value) })} />
          <span style={{ fontSize: 11, color: '#888' }}>°</span>
        </div>
      </div>

      {/* ─── Animation ─── */}
      <div className="prop-section">
        <div className="section-header">Animation</div>
        <div className="prop-row">
          <label>Effect</label>
          <select value={element.animation.type}
            onChange={e => commitChange({ animation: { ...element.animation, type: e.target.value as AnimationType } })}>
            <option value="none">None</option>
            <option value="fade-in">Fade In</option>
            <option value="slide-up">Slide Up</option>
            <option value="slide-left">Slide Left</option>
            <option value="zoom-in">Zoom In</option>
          </select>
        </div>
        {element.animation.type !== 'none' && (
          <>
            <div className="prop-row">
              <label>Trigger</label>
              <select value={element.animation.trigger}
                onChange={e => commitChange({ animation: { ...element.animation, trigger: e.target.value as AnimationTrigger } })}>
                <option value="load">On Load</option>
                <option value="scroll">On Scroll</option>
              </select>
            </div>
            <div className="prop-row">
              <label>Duration</label>
              <input type="number" value={element.animation.duration} min={100} max={3000} step={100}
                onFocus={onFocus} onBlur={onBlur}
                onChange={e => changeAnim({ duration: Number(e.target.value) })} />
              <span style={{ fontSize: 11, color: '#888' }}>ms</span>
            </div>
            <div className="prop-row">
              <label>Delay</label>
              <input type="number" value={element.animation.delay} min={0} max={3000} step={100}
                onFocus={onFocus} onBlur={onBlur}
                onChange={e => changeAnim({ delay: Number(e.target.value) })} />
              <span style={{ fontSize: 11, color: '#888' }}>ms</span>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

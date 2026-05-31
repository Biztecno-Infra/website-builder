import { useEffect, useRef, useState } from 'react';
import type {
  Breakpoint, BorderStyle, BgType, AnimationType, AnimationTrigger,
  CanvasElement, BuilderState, TextAlign, ObjectFit,
  BreakpointOverride, ElementBackground, ElementLayout, ElementContent,
  ElementAnimation, Border, Padding, Shadow, Typography,
  FlexWidthMode, NodeMap, TextTransform, SiteTheme,
  InteractionType, ElementInteraction, Section,
} from '../../types';
import { applyBreakpoint, CANVAS_W } from '../../hooks/useBuilderStore';
import { richTextState } from '../../utils/richTextState';
import { injectGoogleFont } from '../../utils/fonts';
import { ThemeSwatches } from './ThemeSwatches';
import { CollapsibleSection, usePanelSections } from './CollapsibleSection';

const ELEMENT_SECTION_DEFAULTS: Record<string, boolean> = {
  layout: true, sizing: true,
  typography: true, image: true, video: true, icon: true,
  background: true, border: true, spacing: true,
  shadow: false, interactions: false, animation: false,
  advanced: false, responsive: false,
};

// ── ElementPanel ──────────────────────────────────────────────────────────────

interface Props {
  element: CanvasElement;
  isInGridCell?: boolean;
  nodes: NodeMap;
  snapshot: BuilderState;
  onUpdate: (id: string, updates: Partial<CanvasElement>) => void;
  onPushSnapshot: (snapshot: BuilderState) => void;
  onDelete: (id: string) => void;
  breakpoint?: Breakpoint;
  onUpdateResponsive?: (id: string, bp: Breakpoint, updates: Partial<BreakpointOverride>) => void;
  theme: SiteTheme;
}

export function ElementPanel({
  element, isInGridCell = false, nodes, snapshot,
  onUpdate, onPushSnapshot, onDelete,
  breakpoint = 'desktop', onUpdateResponsive, theme,
}: Props) {
  const focusSnapshot = useRef<BuilderState | null>(null);
  const [flexAdvanced, setFlexAdvanced] = useState(false);
  const sidebarEditRef = useRef<HTMLDivElement>(null);
  const { sec, toggle: toggleSection } = usePanelSections(ELEMENT_SECTION_DEFAULTS, 'builder-sidebar-el');

  // Sync sidebar rich text div when element changes (e.g. different element selected)
  useEffect(() => {
    const div = sidebarEditRef.current;
    if (!div) return;
    const current = div.innerHTML;
    const target = element.content.rich || element.content.plain || '';
    if (current !== target) div.innerHTML = target;
  }, [element.id, element.content.rich, element.content.plain]);

  // Save selection into richTextState on every selectionchange inside a contentEditable
  useEffect(() => {
    const onSelChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
      const range = sel.getRangeAt(0);
      const node = range.commonAncestorContainer as Element;
      const editable = (node.nodeType === 1 ? node : node.parentElement)?.closest('[contenteditable]');
      if (editable) richTextState.savedRange = range.cloneRange();
    };
    document.addEventListener('selectionchange', onSelChange);
    return () => document.removeEventListener('selectionchange', onSelChange);
  }, []);

  const applyInlineFormat = (cmd: string, value?: string) => {
    const range = richTextState.savedRange;
    if (!range) return;
    const sel = window.getSelection();
    if (sel) { sel.removeAllRanges(); sel.addRange(range); }
    document.execCommand(cmd, false, value);
    richTextState.applyingFormat = false;
  };

  const id = element.id;

  // ── Update helpers ────────────────────────────────────────────────────
  const change = (updates: Partial<CanvasElement>) => onUpdate(id, updates);
  const changeBg     = (b: Partial<ElementBackground>) => change({ style: { ...element.style, background: { ...element.style.background, ...b } } });
  const changeBorder = (b: Partial<Border>) => change({ style: { ...element.style, border: { ...element.style.border, ...b } } });
  const changePad    = (p: Partial<Padding>) => change({ style: { ...element.style, padding: { ...element.style.padding, ...p } } });
  const changeShadow = (s: Partial<Shadow>) => change({ style: { ...element.style, shadow: { ...element.style.shadow, ...s } } });
  const changeTypo   = (t: Partial<Typography>) => change({ style: { ...element.style, typography: { ...element.style.typography, ...t } } });
  const changeLayout = (l: Partial<ElementLayout>) => change({ layout: { ...element.layout, ...l } });
  const changeContent = (c: Partial<ElementContent>) => change({ content: { ...element.content, ...c } });
  const changeAnim   = (a: Partial<ElementAnimation>) => change({ animation: { ...element.animation, ...a } });

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

  const onFocus = () => { if (!focusSnapshot.current) focusSnapshot.current = snapshot; };
  const onBlur  = () => {
    if (focusSnapshot.current) { onPushSnapshot(focusSnapshot.current); focusSnapshot.current = null; }
  };

  const commitChange = (updates: Partial<CanvasElement>) => { onPushSnapshot(snapshot); change(updates); };
  const commitResp   = (updates: Partial<BreakpointOverride>) => { onPushSnapshot(snapshot); changeResp(updates); };

  const bgColor = element.style.background.color.startsWith('#') ? element.style.background.color : '#ffffff';
  const elBg = element.style.background;

  const allBpBadge = breakpoint !== 'desktop'
    ? <span className={'pb-desktop-only-badge'} style={{ marginLeft: 6 }}>all bp</span>
    : null;

  const ELEMENT_TYPE_LABELS: Record<string, string> = {
    text: 'Text', image: 'Image', button: 'Button', box: 'Box',
    divider: 'Divider', video: 'Video', spacer: 'Spacer', icon: 'Icon',
  };
  const elementLabel = ELEMENT_TYPE_LABELS[element.type] ?? element.type;

  return (
    <aside className={'pb-right-sidebar'}>
      {/* ── Panel header ── */}
      <div className={'pb-panel-header'}>
        <span className={'pb-panel-header-title'}>{elementLabel}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <button className={'pb-delete-btn'} onClick={() => onDelete(id)} title="Delete (Del)">✕</button>
        </div>
      </div>

      {breakpoint !== 'desktop' && (
        <div className={`pb-bp-banner pb-bp-banner-${breakpoint}`}>
          {breakpoint === 'tablet' ? '⬛ Tablet overrides (768px)' : '📱 Mobile overrides (375px)'}
        </div>
      )}

      {/* ── Layout ── */}
      <CollapsibleSection
        sectionKey="layout"
        label={<>
          {isInGridCell ? 'Layout' : 'Position & Size'}
          {!isInGridCell && respOverrides &&
            (respOverrides.layout?.x !== undefined || respOverrides.layout?.y !== undefined ||
             respOverrides.layout?.width !== undefined || respOverrides.layout?.height !== undefined) &&
            <span className={'pb-resp-badge'} style={{ marginLeft: 6 }}>overridden</span>}
        </>}
        isOpen={sec('layout')} onToggle={toggleSection}
      >
        {!isInGridCell && (
          <>
            <div className={'pb-prop-row'}>
              <label>X</label>
              <input type="number" value={eff.layout.x} onFocus={onFocus} onBlur={onBlur}
                onChange={e => changeResp({ layout: { x: Number(e.target.value) } })} />
            </div>
            <div className={'pb-prop-row'}>
              <label>Y</label>
              <input type="number" value={eff.layout.y} onFocus={onFocus} onBlur={onBlur}
                onChange={e => changeResp({ layout: { y: Number(e.target.value) } })} />
            </div>
            <div className={'pb-prop-row'}>
              <label>W</label>
              <input type="number" value={eff.layout.width} min={20} onFocus={onFocus} onBlur={onBlur}
                onChange={e => changeResp({ layout: { width: Math.max(20, Number(e.target.value)) } })} />
            </div>
          </>
        )}
        {isInGridCell && (
          <div className={'pb-prop-row'}>
            <label>Overlay</label>
            <input type="checkbox" checked={!!element.overlayInCell}
              onChange={e => {
                if (e.target.checked) {
                  commitChange({ overlayInCell: true, layout: { ...element.layout, x: 0, y: 0 } });
                } else {
                  commitChange({ overlayInCell: undefined });
                }
              }} />
            <span style={{ fontSize: 11, color: '#888' }}>Absolute in cell</span>
          </div>
        )}
        {isInGridCell && !!element.overlayInCell && (
          <>
            <div className={'pb-prop-row'}>
              <label>X</label>
              <input type="number" value={element.layout.x} onFocus={onFocus} onBlur={onBlur}
                onChange={e => changeLayout({ x: Number(e.target.value) })} />
            </div>
            <div className={'pb-prop-row'}>
              <label>Y</label>
              <input type="number" value={element.layout.y} onFocus={onFocus} onBlur={onBlur}
                onChange={e => changeLayout({ y: Number(e.target.value) })} />
            </div>
            <div className={'pb-prop-row'}>
              <label>W</label>
              <input type="number" value={element.layout.width} min={20} onFocus={onFocus} onBlur={onBlur}
                onChange={e => changeLayout({ width: Math.max(20, Number(e.target.value)) })} />
            </div>
          </>
        )}
        <div className={'pb-prop-row'}>
          <label>{!isInGridCell ? 'H' : (element.type === 'image' || element.type === 'video') ? 'H' : 'Min H'}</label>
          <input type="number" value={eff.layout.height} min={20} onFocus={onFocus} onBlur={onBlur}
            onChange={e => changeResp({ layout: { height: Math.max(20, Number(e.target.value)) } })} />
        </div>
        <div className={'pb-prop-row'}>
          <label>Opacity</label>
          <input type="number" value={element.style.opacity} min={0} max={1} step={0.05}
            onFocus={onFocus} onBlur={onBlur}
            onChange={e => change({ style: { ...element.style, opacity: Math.max(0, Math.min(1, Number(e.target.value))) } })} />
        </div>
      </CollapsibleSection>

      {/* ── Sizing (grid elements only, not overlay) ── */}
      {isInGridCell && !element.overlayInCell && (() => {
        type Preset = { label: string; widthMode: FlexWidthMode; flexGrow: number; alignSelf: typeof element.flexLayout.alignSelf };
        const presets: Preset[] = [
          { label: 'Natural', widthMode: 'auto',    flexGrow: 0, alignSelf: 'auto' },
          { label: 'Fill',    widthMode: 'fill',    flexGrow: 0, alignSelf: 'auto' },
          { label: 'Expand',  widthMode: 'fill',    flexGrow: 1, alignSelf: 'stretch' },
          { label: 'Fixed',   widthMode: 'fixed',   flexGrow: 0, alignSelf: 'auto' },
          { label: '%',       widthMode: 'percent', flexGrow: 0, alignSelf: 'auto' },
        ];
        const { widthMode, flexGrow, alignSelf, widthValue } = element.flexLayout;
        const activePreset = presets.findIndex(p =>
          p.widthMode === widthMode && p.flexGrow === flexGrow && p.alignSelf === alignSelf
        );
        const applyPreset = (p: Preset) => {
          onPushSnapshot(snapshot);
          change({ flexLayout: { ...element.flexLayout, widthMode: p.widthMode, flexGrow: p.flexGrow, alignSelf: p.alignSelf } });
        };
        return (
          <CollapsibleSection
            sectionKey="sizing"
            label={<>
              Sizing
              <button className={'pb-resp-clear-btn'} style={{ marginLeft: 'auto', fontSize: 10 }}
                onClick={e => { e.stopPropagation(); setFlexAdvanced(v => !v); }}
                title="Toggle advanced controls"
              >{flexAdvanced ? 'Simple' : 'Advanced'}</button>
            </>}
            isOpen={sec('sizing')} onToggle={toggleSection}
          >
            <div className={'pb-flex-preset-grid'}>
              {presets.map((p, i) => (
                <button key={p.label}
                  className={['pb-flex-preset-btn', activePreset === i && 'pb-active'].filter(Boolean).join(' ')}
                  title={`${p.label}: widthMode=${p.widthMode}, grow=${p.flexGrow}, alignSelf=${p.alignSelf}`}
                  onClick={() => applyPreset(p)}
                >{p.label}</button>
              ))}
            </div>
            {(widthMode === 'fixed' || widthMode === 'percent') && (
              <div className={'pb-prop-row'}>
                <label>{widthMode === 'fixed' ? 'px' : '%'}</label>
                <input type="number" value={widthValue} min={0}
                  max={widthMode === 'percent' ? 100 : undefined}
                  onFocus={onFocus} onBlur={onBlur}
                  onChange={e => change({ flexLayout: { ...element.flexLayout, widthValue: Number(e.target.value) } })} />
              </div>
            )}
            {flexAdvanced && (
              <>
                <div className={'pb-prop-row'}>
                  <label>Width</label>
                  <select value={widthMode}
                    onChange={e => { onPushSnapshot(snapshot); change({ flexLayout: { ...element.flexLayout, widthMode: e.target.value as FlexWidthMode } }); }}>
                    <option value="fill">Fill</option>
                    <option value="auto">Auto</option>
                    <option value="fixed">Fixed px</option>
                    <option value="percent">Percent %</option>
                  </select>
                </div>
                <div className={'pb-prop-row'}>
                  <label>Grow</label>
                  <input type="checkbox" checked={flexGrow === 1}
                    onChange={e => { onPushSnapshot(snapshot); change({ flexLayout: { ...element.flexLayout, flexGrow: e.target.checked ? 1 : 0 } }); }} />
                </div>
                <div className={'pb-prop-row'}>
                  <label>Align Self</label>
                  <select value={alignSelf}
                    onChange={e => { onPushSnapshot(snapshot); change({ flexLayout: { ...element.flexLayout, alignSelf: e.target.value as typeof element.flexLayout.alignSelf } }); }}>
                    <option value="auto">Auto</option>
                    <option value="flex-start">Start</option>
                    <option value="center">Center</option>
                    <option value="flex-end">End</option>
                    <option value="stretch">Stretch</option>
                  </select>
                </div>
              </>
            )}
            {breakpoint !== 'desktop' && onUpdateResponsive && (
              <>
                <div style={{ fontSize: 10, color: '#888', padding: '4px 0 2px' }}>
                  {breakpoint === 'tablet' ? 'Tablet override' : 'Mobile override'}
                </div>
                <div className={'pb-prop-row'}>
                  <label>Width</label>
                  <select
                    value={respOverrides?.flexLayout?.widthMode ?? ''}
                    onChange={e => { onPushSnapshot(snapshot); onUpdateResponsive!(id, breakpoint, { flexLayout: { widthMode: (e.target.value || undefined) as FlexWidthMode | undefined } }); }}>
                    <option value="">Same</option>
                    <option value="fill">Fill</option>
                    <option value="auto">Auto</option>
                    <option value="fixed">Fixed px</option>
                    <option value="percent">Percent %</option>
                  </select>
                </div>
                {(respOverrides?.flexLayout?.widthMode === 'fixed' || respOverrides?.flexLayout?.widthMode === 'percent') && (
                  <div className={'pb-prop-row'}>
                    <label>{respOverrides.flexLayout.widthMode === 'fixed' ? 'px' : '%'}</label>
                    <input type="number" value={respOverrides.flexLayout.widthValue ?? 0} min={0}
                      onFocus={onFocus} onBlur={onBlur}
                      onChange={e => onUpdateResponsive!(id, breakpoint, { flexLayout: { ...respOverrides?.flexLayout, widthValue: Number(e.target.value) } })} />
                  </div>
                )}
              </>
            )}
          </CollapsibleSection>
        );
      })()}

      {/* ── Typography (Text + Button) ── */}
      {(element.type === 'text' || element.type === 'button') && (
        <CollapsibleSection sectionKey="typography" label="Typography" isOpen={sec('typography')} onToggle={toggleSection}>

          {/* Inline formatting — double-click text on canvas, select text, then click below.
              Selection is tracked automatically via selectionchange and restored before execCommand. */}
          {element.type === 'text' && (
            <div style={{ padding: '4px 0 10px', borderBottom: '1px solid #eee' }}>
              <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 6, lineHeight: 1.4 }}>
                Double-click text on canvas → select → apply:
              </div>
              <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                {([
                  { label: 'B', tag: 'b', cmd: 'bold',          title: 'Bold' },
                  { label: 'I', tag: 'i', cmd: 'italic',        title: 'Italic' },
                  { label: 'U', tag: 'u', cmd: 'underline',     title: 'Underline' },
                  { label: 'S', tag: 's', cmd: 'strikeThrough', title: 'Strikethrough' },
                ] as const).map(({ label, tag: Tag, cmd: c, title }) => (
                  <button key={c}
                    title={title}
                    onMouseDown={() => { richTextState.applyingFormat = true; }}
                    onClick={() => applyInlineFormat(c)}
                    style={{ width: 28, height: 26, border: '1px solid #e2e8f0', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  ><Tag style={{ pointerEvents: 'none' }}>{label}</Tag></button>
                ))}
                {/* Color picker */}
                <label
                  title="Text color"
                  style={{ width: 28, height: 26, border: '1px solid #e2e8f0', borderRadius: 4, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, position: 'relative', flexShrink: 0 }}
                  onMouseDown={() => { richTextState.applyingFormat = true; }}
                >
                  <span style={{ borderBottom: '3px solid #006e75', lineHeight: 1, paddingBottom: 1 }}>A</span>
                  <input
                    type="color"
                    style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
                    tabIndex={-1}
                    onChange={e => applyInlineFormat('foreColor', e.target.value)}
                    onClick={e => e.stopPropagation()}
                  />
                </label>
                <button
                  title="Clear all inline formatting"
                  onMouseDown={() => { richTextState.applyingFormat = true; }}
                  onClick={() => applyInlineFormat('removeFormat')}
                  style={{ padding: '0 8px', height: 26, border: '1px solid #e2e8f0', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 10, color: '#64748b' }}
                >Clear</button>
                <button
                  title="Wrap selection in a link"
                  onMouseDown={() => { richTextState.applyingFormat = true; }}
                  onClick={() => { const url = prompt('URL (include https://)'); if (url) applyInlineFormat('createLink', url); else richTextState.applyingFormat = false; }}
                  style={{ padding: '0 8px', height: 26, border: '1px solid #e2e8f0', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 10, color: '#64748b' }}
                >Link</button>
                <button
                  title="Remove link"
                  onMouseDown={() => { richTextState.applyingFormat = true; }}
                  onClick={() => applyInlineFormat('unlink')}
                  style={{ padding: '0 8px', height: 26, border: '1px solid #e2e8f0', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 10, color: '#64748b' }}
                >Unlink</button>
              </div>
            </div>
          )}

          {element.type === 'text' && (
            <div className={"pb-prop-row pb-full"}>
              <label>Text</label>
              <div
                ref={sidebarEditRef}
                contentEditable
                suppressContentEditableWarning
                style={{ minHeight: 64, padding: '6px 8px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, lineHeight: 1.5, background: '#fff', outline: 'none', wordBreak: 'break-word', cursor: 'text' }}
                onFocus={onFocus}
                onBlur={() => {
                  if (richTextState.applyingFormat) return;
                  onBlur();
                  const div = sidebarEditRef.current;
                  if (div) changeContent({ rich: div.innerHTML, plain: div.innerText });
                }}
                onInput={() => {
                  const div = sidebarEditRef.current;
                  if (div) changeContent({ rich: div.innerHTML, plain: div.innerText });
                }}
              />
            </div>
          )}
          {element.type === 'button' && (
            <>
              <div className={'pb-prop-row'}>
                <label>Label</label>
                <input type="text" value={element.content.label}
                  onFocus={onFocus} onBlur={onBlur}
                  onChange={e => changeContent({ label: e.target.value })} />
              </div>
              <div className={'pb-prop-row'}>
                <label>Style</label>
                <div className={'pb-btn-group'}>
                  <button
                    className={element.style.background.color !== 'transparent' ? 'active' : ''}
                    title="Filled button"
                    onClick={() => { onPushSnapshot(snapshot); onUpdate(id, { style: { ...element.style, background: { ...element.style.background, color: '#0B978E' }, border: { ...element.style.border, width: 0 } } }); }}
                  >Filled</button>
                  <button
                    className={element.style.background.color === 'transparent' ? 'active' : ''}
                    title="Outline button"
                    onClick={() => { onPushSnapshot(snapshot); onUpdate(id, { style: { ...element.style, background: { ...element.style.background, color: 'transparent' }, border: { ...element.style.border, width: 2, color: element.style.typography.color, style: 'solid' } } }); }}
                  >Outline</button>
                </div>
              </div>
            </>
          )}
          <div className={'pb-prop-row'}>
            <label>Size</label>
            <input type="number" value={eff.style.typography.size} min={8} max={200}
              onFocus={onFocus} onBlur={onBlur}
              onChange={e => changeResp({ style: { typography: { size: Number(e.target.value) } } })} />
          </div>
          <div className={'pb-prop-row'}>
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
          <div className={'pb-prop-row'}>
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
          <div className={'pb-prop-row'}>
            <label>Color</label>
            <input type="color"
              value={element.style.typography.color.startsWith('#') ? element.style.typography.color : '#333333'}
              onFocus={onFocus} onBlur={onBlur}
              onChange={e => changeTypo({ color: e.target.value })} />
          </div>
          <ThemeSwatches colors={theme.colors} onPick={c => { onPushSnapshot(snapshot); changeTypo({ color: c }); }} />
          <div className={'pb-prop-row'}>
            <label>Align</label>
            <div className={'pb-btn-group'}>
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
          <div className={'pb-prop-row'}>
            <label>Line H</label>
            <input type="number" value={element.style.typography.lineHeight} min={0.5} max={5} step={0.1}
              onFocus={onFocus} onBlur={onBlur}
              onChange={e => changeTypo({ lineHeight: Number(e.target.value) })} />
          </div>
          <div className={'pb-prop-row'}>
            <label>Spacing</label>
            <input type="number" value={element.style.typography.letterSpacing ?? 0} min={-10} max={50} step={0.5}
              onFocus={onFocus} onBlur={onBlur}
              onChange={e => changeTypo({ letterSpacing: Number(e.target.value) })} />
            <span style={{ fontSize: 11, color: '#888' }}>px</span>
          </div>
          <div className={'pb-prop-row'}>
            <label>Transform</label>
            <select value={element.style.typography.textTransform ?? 'none'}
              onChange={e => commitChange({ style: { ...element.style, typography: { ...element.style.typography, textTransform: e.target.value as TextTransform } } })}>
              <option value="none">None</option>
              <option value="uppercase">UPPERCASE</option>
              <option value="lowercase">lowercase</option>
              <option value="capitalize">Capitalize</option>
            </select>
          </div>
        </CollapsibleSection>
      )}

      {/* ── Image ── */}
      {element.type === 'image' && (
        <CollapsibleSection sectionKey="image" label="Image" isOpen={sec('image')} onToggle={toggleSection}>
          <div className={"pb-prop-row pb-full"}>
            <label>URL</label>
            <input type="text" value={element.content.src} placeholder="https://..."
              onFocus={onFocus} onBlur={onBlur}
              onChange={e => changeContent({ src: e.target.value })} />
          </div>
          <div className={'pb-prop-row'}>
            <label>Alt</label>
            <input type="text" value={element.content.alt}
              onFocus={onFocus} onBlur={onBlur}
              onChange={e => changeContent({ alt: e.target.value })} />
          </div>
          <div className={'pb-prop-row'}>
            <label>Fit</label>
            <select value={element.content.objectFit}
              onChange={e => commitChange({ content: { ...element.content, objectFit: e.target.value as ObjectFit } })}>
              <option value="cover">Cover</option>
              <option value="contain">Contain</option>
              <option value="fill">Fill</option>
            </select>
          </div>
        </CollapsibleSection>
      )}

      {/* ── Video ── */}
      {element.type === 'video' && (
        <CollapsibleSection sectionKey="video" label="Video" isOpen={sec('video')} onToggle={toggleSection}>
          <div className={"pb-prop-row pb-full"}>
            <label>YouTube / Video URL</label>
            <input type="text" value={element.content.videoUrl} placeholder="https://youtube.com/watch?v=..."
              onFocus={onFocus} onBlur={onBlur}
              onChange={e => changeContent({ videoUrl: e.target.value })} />
          </div>
        </CollapsibleSection>
      )}

      {/* ── Icon ── */}
      {element.type === 'icon' && (
        <CollapsibleSection sectionKey="icon" label="Icon" isOpen={sec('icon')} onToggle={toggleSection}>
          <div className={'pb-prop-row'}>
            <label>Size</label>
            <input type="number" value={element.content.iconSize ?? 40} min={8} max={200}
              onFocus={onFocus} onBlur={onBlur}
              onChange={e => changeContent({ iconSize: Number(e.target.value) })} />
            <span style={{ fontSize: 11, color: '#888' }}>px</span>
          </div>
          <div className={'pb-prop-row'}>
            <label>Color</label>
            <input type="color"
              value={element.style.typography.color.startsWith('#') ? element.style.typography.color : '#333333'}
              onFocus={onFocus} onBlur={onBlur}
              onChange={e => changeTypo({ color: e.target.value })} />
            <span style={{ fontSize: 10, color: '#888' }}>applies to SVG + symbol</span>
          </div>

          {/* SVG paste area */}
          <div style={{ padding: '8px 0 4px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 6 }}>
              Paste SVG code
            </div>
            <textarea
              rows={5}
              placeholder={'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">\n  <path d="M12 2..."/>\n</svg>'}
              value={element.content.iconSvg ?? ''}
              style={{ width: '100%', fontSize: 11, fontFamily: 'monospace', resize: 'vertical', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: 4, padding: '6px 8px', color: '#334155', background: '#f8fafc', lineHeight: 1.5 }}
              onChange={e => {
                onPushSnapshot(snapshot);
                const raw = e.target.value.trim();
                if (!raw) { changeContent({ iconSvg: undefined }); return; }
                // Sanitize: strip scripts and event handlers
                let clean = raw
                  .replace(/<script[\s\S]*?<\/script>/gi, '')
                  .replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, '')
                  .replace(/javascript:/gi, '');
                // Make color-controllable: set fill="currentColor" on the <svg> root
                // so the element's Color picker works
                clean = clean.replace(/(<svg\b[^>]*)\sfill\s*=\s*["'][^"']*["']/i, '$1')
                              .replace(/(<svg\b)([^>]*>)/, '$1 fill="currentColor"$2');
                changeContent({ iconSvg: clean });
              }}
            />
            {element.content.iconSvg && (
              <button
                style={{ marginTop: 4, fontSize: 11, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                onClick={() => { onPushSnapshot(snapshot); changeContent({ iconSvg: undefined }); }}
              >✕ Clear SVG</button>
            )}
          </div>

          {/* Fallback: emoji / text symbol when no SVG pasted */}
          {!element.content.iconSvg && (
            <div className={'pb-prop-row'}>
              <label>Symbol</label>
              <input type="text" value={element.content.iconName ?? '★'}
                placeholder="★ or any emoji"
                onFocus={onFocus} onBlur={onBlur}
                onChange={e => changeContent({ iconName: e.target.value })} />
            </div>
          )}

          <div style={{ fontSize: 10, color: '#94a3b8', lineHeight: 1.5, paddingTop: 6 }}>
            Get SVGs free from heroicons.com, tabler.io/icons, or icons.getbootstrap.com
          </div>
        </CollapsibleSection>
      )}

      {/* ── Divider ── */}
      {element.type === 'divider' && (
        <CollapsibleSection sectionKey="divider" label="Divider" isOpen={sec('divider')} onToggle={toggleSection}>
          <div className={'pb-prop-row'}>
            <label>Orientation</label>
            <select value={element.content.orientation ?? 'horizontal'}
              onChange={e => {
                const newOrientation = e.target.value as 'horizontal' | 'vertical';
                const isChanging = newOrientation !== (element.content.orientation ?? 'horizontal');
                commitChange({
                  content: { ...element.content, orientation: newOrientation },
                  ...(isChanging ? { layout: { ...element.layout, width: element.layout.height, height: element.layout.width } } : {}),
                });
              }}>
              <option value="horizontal">Horizontal</option>
              <option value="vertical">Vertical</option>
            </select>
          </div>
        </CollapsibleSection>
      )}

      {/* ── Background ── */}
      <CollapsibleSection sectionKey="background" label={<>Background {allBpBadge}</>}
        isOpen={sec('background')} onToggle={toggleSection}>
        <div className={'pb-prop-row'}>
          <label>Type</label>
          <select value={elBg.type}
            onChange={e => commitChange({ style: { ...element.style, background: { ...elBg, type: e.target.value as BgType } } })}>
            <option value="solid">Solid</option>
            <option value="linear-gradient">Linear Gradient</option>
            <option value="radial-gradient">Radial Gradient</option>
          </select>
        </div>
        {elBg.type === 'solid' && (
          <>
            <div className={'pb-prop-row'}>
              <label>Color</label>
              <input type="color" value={bgColor} onFocus={onFocus} onBlur={onBlur}
                onChange={e => changeBg({ color: e.target.value })} />
              <label className={'pb-transparent-label'}>
                <input type="checkbox" checked={elBg.color === 'transparent'}
                  onChange={e => commitChange({ style: { ...element.style, background: { ...elBg, color: e.target.checked ? 'transparent' : '#ffffff' } } })} />
                {' '}None
              </label>
            </div>
            <ThemeSwatches colors={theme.colors} onPick={c => { onPushSnapshot(snapshot); changeBg({ color: c }); }} />
          </>
        )}
        {(elBg.type === 'linear-gradient' || elBg.type === 'radial-gradient') && (
          <>
            <div className={'pb-prop-row'}>
              <label>From</label>
              <input type="color" value={elBg.from || '#006e75'} onFocus={onFocus} onBlur={onBlur}
                onChange={e => changeBg({ from: e.target.value })} />
            </div>
            <ThemeSwatches colors={theme.colors} onPick={c => { onPushSnapshot(snapshot); changeBg({ from: c }); }} />
            <div className={'pb-prop-row'}>
              <label>To</label>
              <input type="color" value={elBg.to || '#0b978e'} onFocus={onFocus} onBlur={onBlur}
                onChange={e => changeBg({ to: e.target.value })} />
            </div>
            <ThemeSwatches colors={theme.colors} onPick={c => { onPushSnapshot(snapshot); changeBg({ to: c }); }} />
            {elBg.type === 'linear-gradient' && (
              <div className={'pb-prop-row'}>
                <label>Angle</label>
                <input type="number" value={elBg.angle ?? 135} min={0} max={360}
                  onFocus={onFocus} onBlur={onBlur}
                  onChange={e => changeBg({ angle: Number(e.target.value) })} />
                <span style={{ fontSize: 11, color: '#888' }}>°</span>
              </div>
            )}
          </>
        )}
        <div className={"pb-prop-row pb-full"}>
          <label>Image</label>
          <input type="text" value={elBg.image} placeholder="https://..."
            onFocus={onFocus} onBlur={onBlur}
            onChange={e => changeBg({ image: e.target.value })} />
        </div>
        {elBg.image && (
          <div className={'pb-prop-row'}>
            <label>Position</label>
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
      </CollapsibleSection>

      {/* ── Border ── */}
      <CollapsibleSection sectionKey="border" label={<>Border {allBpBadge}</>}
        isOpen={sec('border')} onToggle={toggleSection}>
        <div className={'pb-prop-row'}>
          <label>Radius</label>
          <input type="number" value={element.style.border.radius} min={0}
            onFocus={onFocus} onBlur={onBlur}
            onChange={e => changeBorder({ radius: Number(e.target.value) })} />
        </div>
        <div className={'pb-prop-row'}>
          <label>Width</label>
          <input type="number" value={element.style.border.width} min={0}
            onFocus={onFocus} onBlur={onBlur}
            onChange={e => changeBorder({ width: Number(e.target.value) })} />
        </div>
        {element.style.border.width > 0 && (
          <>
            <div className={'pb-prop-row'}>
              <label>Color</label>
              <input type="color"
                value={element.style.border.color.startsWith('#') ? element.style.border.color : '#cccccc'}
                onFocus={onFocus} onBlur={onBlur}
                onChange={e => changeBorder({ color: e.target.value })} />
            </div>
            <div className={'pb-prop-row'}>
              <label>Style</label>
              <select value={element.style.border.style}
                onChange={e => commitChange({ style: { ...element.style, border: { ...element.style.border, style: e.target.value as BorderStyle } } })}>
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
              </select>
            </div>
          </>
        )}
      </CollapsibleSection>

      {/* ── Spacing ── */}
      <CollapsibleSection sectionKey="spacing" label={<>Spacing {allBpBadge}</>}
        isOpen={sec('spacing')} onToggle={toggleSection}>
        <div className={'pb-prop-row'}>
          <label>Top</label>
          <input type="number" value={element.style.padding.top} min={0}
            onFocus={onFocus} onBlur={onBlur}
            onChange={e => changePad({ top: Number(e.target.value) })} />
        </div>
        <div className={'pb-prop-row'}>
          <label>Right</label>
          <input type="number" value={element.style.padding.right} min={0}
            onFocus={onFocus} onBlur={onBlur}
            onChange={e => changePad({ right: Number(e.target.value) })} />
        </div>
        <div className={'pb-prop-row'}>
          <label>Bottom</label>
          <input type="number" value={element.style.padding.bottom} min={0}
            onFocus={onFocus} onBlur={onBlur}
            onChange={e => changePad({ bottom: Number(e.target.value) })} />
        </div>
        <div className={'pb-prop-row'}>
          <label>Left</label>
          <input type="number" value={element.style.padding.left} min={0}
            onFocus={onFocus} onBlur={onBlur}
            onChange={e => changePad({ left: Number(e.target.value) })} />
        </div>
      </CollapsibleSection>

      {/* ── Shadow ── */}
      <CollapsibleSection
        sectionKey="shadow"
        label={<>
          Shadow {allBpBadge}
          <label className={'pb-transparent-label'} style={{ marginLeft: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <input type="checkbox" checked={element.style.shadow.enabled}
              onChange={e => commitChange({ style: { ...element.style, shadow: { ...element.style.shadow, enabled: e.target.checked } } })} />
            {' '}On
          </label>
        </>}
        isOpen={sec('shadow')} onToggle={toggleSection}
      >
        {element.style.shadow.enabled && (
          <>
            <div className={'pb-prop-row'}>
              <label>X</label>
              <input type="number" value={element.style.shadow.x}
                onFocus={onFocus} onBlur={onBlur}
                onChange={e => changeShadow({ x: Number(e.target.value) })} />
            </div>
            <div className={'pb-prop-row'}>
              <label>Y</label>
              <input type="number" value={element.style.shadow.y}
                onFocus={onFocus} onBlur={onBlur}
                onChange={e => changeShadow({ y: Number(e.target.value) })} />
            </div>
            <div className={'pb-prop-row'}>
              <label>Blur</label>
              <input type="number" value={element.style.shadow.blur} min={0}
                onFocus={onFocus} onBlur={onBlur}
                onChange={e => changeShadow({ blur: Number(e.target.value) })} />
            </div>
            <div className={'pb-prop-row'}>
              <label>Spread</label>
              <input type="number" value={element.style.shadow.spread}
                onFocus={onFocus} onBlur={onBlur}
                onChange={e => changeShadow({ spread: Number(e.target.value) })} />
            </div>
            <div className={'pb-prop-row'}>
              <label>Color</label>
              <input type="color"
                value={element.style.shadow.color.startsWith('#') ? element.style.shadow.color : '#000000'}
                onFocus={onFocus} onBlur={onBlur}
                onChange={e => changeShadow({ color: e.target.value })} />
            </div>
          </>
        )}
        {!element.style.shadow.enabled && (
          <div style={{ fontSize: 11, color: '#aaa', padding: '2px 0 4px' }}>Enable via the On toggle above</div>
        )}
      </CollapsibleSection>

      {/* ── Interactions ── */}
      <CollapsibleSection sectionKey="interactions" label="Interactions" isOpen={sec('interactions')} onToggle={toggleSection}>
        {(() => {
          const iType: InteractionType = element.interaction?.type ?? 'link';
          const changeInteraction = (updates: Partial<ElementInteraction>) =>
            commitChange({ interaction: { ...element.interaction, ...updates } as ElementInteraction });
          const allSections = Object.values(nodes)
            .filter((n): n is Section => n.type === 'section')
            .sort((a, b) => a.label.localeCompare(b.label));
          return (
            <>
              <div className={'pb-prop-row'}>
                <label>Type</label>
                <div className={'pb-layout-mode-toggle'}>
                  <button className={['pb-layout-mode-btn', iType === 'link' && 'pb-active'].filter(Boolean).join(' ')}
                    onClick={() => changeInteraction({ type: 'link' })}>Link</button>
                  <button className={['pb-layout-mode-btn', iType === 'scroll-to-section' && 'pb-active'].filter(Boolean).join(' ')}
                    onClick={() => changeInteraction({ type: 'scroll-to-section' })}>↓ Section</button>
                  <button className={['pb-layout-mode-btn', iType === 'scroll-to-top' && 'pb-active'].filter(Boolean).join(' ')}
                    onClick={() => changeInteraction({ type: 'scroll-to-top' })}>↑ Top</button>
                </div>
              </div>
              {iType === 'link' && (
                <>
                  <div className={"pb-prop-row pb-full"}>
                    <label>URL</label>
                    <input type="text" value={element.interaction?.linkUrl ?? ''} placeholder="https://..."
                      onFocus={onFocus} onBlur={onBlur}
                      onChange={e => change({ interaction: { ...element.interaction, linkUrl: e.target.value } as ElementInteraction })} />
                  </div>
                  <div className={'pb-prop-row'}>
                    <label>Target</label>
                    <select value={element.interaction?.linkTarget ?? '_self'}
                      onChange={e => commitChange({ interaction: { ...element.interaction, linkTarget: e.target.value as '_self' | '_blank' } as ElementInteraction })}>
                      <option value="_self">Same tab</option>
                      <option value="_blank">New tab</option>
                    </select>
                  </div>
                </>
              )}
              {iType === 'scroll-to-section' && (
                <>
                  <div className={'pb-prop-row'}>
                    <label>Section</label>
                    <select value={element.interaction?.targetSectionId ?? ''}
                      onChange={e => changeInteraction({ targetSectionId: e.target.value })}>
                      <option value="">— pick section —</option>
                      {allSections.map(s => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className={'pb-prop-row'}>
                    <label>Smooth</label>
                    <input type="checkbox" checked={!!(element.interaction?.smoothScroll)}
                      onChange={e => changeInteraction({ smoothScroll: e.target.checked })} />
                  </div>
                </>
              )}
              {iType === 'scroll-to-top' && (
                <div className={'pb-prop-row'}>
                  <label>Smooth</label>
                  <input type="checkbox" checked={!!(element.interaction?.smoothScroll)}
                    onChange={e => changeInteraction({ smoothScroll: e.target.checked })} />
                </div>
              )}
            </>
          );
        })()}
      </CollapsibleSection>

      {/* Animation panel hidden during stabilization — data + export still intact */}

      {/* ── Advanced ── */}
      <CollapsibleSection sectionKey="advanced" label={<>Advanced {allBpBadge}</>}
        isOpen={sec('advanced')} onToggle={toggleSection}>
        <div className={'pb-prop-row'}>
          <label>Rotation</label>
          <input type="number" value={element.layout.rotation} min={-360} max={360}
            onFocus={onFocus} onBlur={onBlur}
            onChange={e => changeLayout({ rotation: Number(e.target.value) })} />
          <span style={{ fontSize: 11, color: '#888' }}>°</span>
        </div>
        <div className={'pb-prop-row'}>
          <label>Lock</label>
          <button
            className={['pb-toolbar-btn', element.state.locked && 'pb-active'].filter(Boolean).join(' ')}
            style={{ fontSize: 11, padding: '2px 8px', height: 24 }}
            title={element.state.locked ? 'Unlock element — allow drag/resize' : 'Lock element — prevent drag/resize'}
            onClick={() => { onPushSnapshot(snapshot); onUpdate(id, { state: { ...element.state, locked: !element.state.locked } }); }}
          >{element.state.locked ? '🔒 Locked' : '🔓 Unlocked'}</button>
        </div>
      </CollapsibleSection>

      {/* ── Responsive ── */}
      {onUpdateResponsive && (
        <CollapsibleSection sectionKey="responsive" label="Responsive" isOpen={sec('responsive')} onToggle={toggleSection}>
          <div className={'pb-prop-row'}>
            <label>Hide Tablet</label>
            <input type="checkbox"
              checked={!!(element.responsive.tablet?.state?.hidden)}
              onChange={e => { onPushSnapshot(snapshot); onUpdateResponsive(id, 'tablet', { state: { hidden: e.target.checked } }); }} />
          </div>
          <div className={'pb-prop-row'}>
            <label>Hide Mobile</label>
            <input type="checkbox"
              checked={!!(element.responsive.mobile?.state?.hidden)}
              onChange={e => { onPushSnapshot(snapshot); onUpdateResponsive(id, 'mobile', { state: { hidden: e.target.checked } }); }} />
          </div>
        </CollapsibleSection>
      )}
    </aside>
  );
}

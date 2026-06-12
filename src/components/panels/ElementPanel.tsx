import { useEffect, useRef, useState } from 'react';
import { useFocusSnapshot } from '../../hooks/useFocusSnapshot';
import { BREAKPOINT_WIDTHS } from '../Canvas';
import type {
  Breakpoint, BgType, AnimationType, AnimationTrigger,
  CanvasElement, BuilderState, TextAlign, ObjectFit,
  BreakpointOverride, ElementBackground, ElementLayout, ElementContent,
  ElementAnimation, Border, Padding, Shadow, Typography,
  FlexWidthMode, NodeMap, TextTransform, SiteTheme,
  ElementAction, FormField, Page,
} from '../../types';
import { applyBreakpoint, CANVAS_W } from '../../hooks/useBuilderStore';
import { DEFAULT_ACTION } from '../../utils/builderDefaults';
import { richTextState } from '../../utils/richTextState';
import { createCleanPasteHandler } from '../../utils/cleanPaste';
import { injectGoogleFont } from '../../utils/fonts';

import { Icon } from '../Icon';
import { CollapsibleSection, usePanelSections } from './CollapsibleSection';
import { PanelHeader } from './PanelHeader';
import { ColorField, PxInput, ToggleGroup, BorderEditor, ShadowEditor, SpacingEditor, VisibilityEditor, themeToSwatches } from './PanelFields';
import { ActionEditor } from './ActionEditor';
import { FormFieldsEditor } from './FormFieldsEditor';
import { PbSelect } from '../PbSelect';
import { PbInput } from '../PbInput';
import { PbTextarea } from '../PbTextarea';
import {
  CSS_POSITION_OPTIONS,
  FONT_WEIGHT_OPTIONS,
  FONT_FAMILY_OPTIONS,
  TEXT_TRANSFORM_OPTIONS,
  FLEX_WIDTH_MODE_WITH_SAME_OPTIONS,
  ALIGN_SELF_OPTIONS,
  BG_TYPE_OPTIONS,
  IMAGE_POSITION_OPTIONS,
  OBJECT_FIT_OPTIONS,
  OBJECT_POSITION_OPTIONS,
  DIVIDER_ORIENTATION_OPTIONS,
} from '../../utils/selectOptions';

const ELEMENT_SECTION_DEFAULTS: Record<string, boolean> = {
  layout: true, sizing: true,
  typography: true, image: true, video: true, icon: true,
  form: true, action: true,
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
  pages: Page[];
}

export function ElementPanel({
  element, isInGridCell = false, nodes, snapshot,
  onUpdate, onPushSnapshot, onDelete,
  breakpoint = 'desktop', onUpdateResponsive, theme, pages,
}: Props) {
  const swatches = themeToSwatches(theme);
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

  const currentAction: ElementAction = element.action ?? DEFAULT_ACTION;
  // Commit-on-change: dropdowns/checkboxes commit immediately; text inputs use onFocus/onBlur for the undo snapshot.
  const changeAction = (updates: Partial<ElementAction>) => {
    if (!isFocused()) onPushSnapshot(snapshot);
    change({ action: { ...currentAction, ...updates } });
  };
  const setFormFields = (formFields: FormField[], commit: boolean) => {
    if (commit) onPushSnapshot(snapshot);
    changeContent({ formFields });
  };

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

  const bpScale = BREAKPOINT_WIDTHS[breakpoint] / CANVAS_W;
  const eff = applyBreakpoint(element, breakpoint, bpScale);

  const { onFocus, onBlur, isFocused } = useFocusSnapshot(snapshot, onPushSnapshot);

  const commitChange = (updates: Partial<CanvasElement>) => { onPushSnapshot(snapshot); change(updates); };
  const commitResp   = (updates: Partial<BreakpointOverride>) => { onPushSnapshot(snapshot); changeResp(updates); };

  const bgColor = element.style.background.color.startsWith('#') ? element.style.background.color : '#ffffff';
  const elBg = element.style.background;

  const allBpBadge = breakpoint !== 'desktop'
    ? <span className={'pb-desktop-only-badge'} style={{ marginLeft: 6 }}>all bp</span>
    : null;

  const ELEMENT_TYPE_LABELS: Record<string, string> = {
    text: 'Text', image: 'Image', button: 'Button', box: 'Box',
    divider: 'Divider', video: 'Video', spacer: 'Spacer', icon: 'Icon', form: 'Form',
  };
  const elementLabel = ELEMENT_TYPE_LABELS[element.type] ?? element.type;
  // Dividers are meant to be thin lines, so allow them below the usual 20px floor.
  const minSize = element.type === 'divider' ? 1 : 20;

  return (
    <aside className={'pb-right-sidebar'}>
      {/* ── Panel header ── */}
      <PanelHeader title={elementLabel}>
        <button className={'pb-delete-btn'} onClick={() => onDelete(id)} title="Delete (Del)">✕</button>
      </PanelHeader>

      {breakpoint !== 'desktop' && (
        <div className={`pb-bp-banner pb-bp-banner-${breakpoint}`}>
          {breakpoint === 'tablet' ? 'Tablet overrides (768px)' : 'Mobile overrides (375px)'}
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
              <PbInput type="number" value={eff.layout.x} onFocus={onFocus} onBlur={onBlur}
                onChange={e => changeResp({ layout: { x: Number(e.target.value) } })} />
            </div>
            <div className={'pb-prop-row'}>
              <label>Y</label>
              <PbInput type="number" value={eff.layout.y} onFocus={onFocus} onBlur={onBlur}
                onChange={e => changeResp({ layout: { y: Number(e.target.value) } })} />
            </div>
            {/* Dividers get Width in the Divider section below. */}
            {element.type !== 'divider' && (
              <div className={'pb-prop-row'}>
                <label>W</label>
                <PbInput type="number" value={eff.layout.width} min={minSize} onFocus={onFocus} onBlur={onBlur}
                  onChange={e => changeResp({ layout: { width: Math.max(minSize, Number(e.target.value)) } })} />
              </div>
            )}
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
              <PbInput type="number" value={element.layout.x} onFocus={onFocus} onBlur={onBlur}
                onChange={e => changeLayout({ x: Number(e.target.value) })} />
            </div>
            <div className={'pb-prop-row'}>
              <label>Y</label>
              <PbInput type="number" value={element.layout.y} onFocus={onFocus} onBlur={onBlur}
                onChange={e => changeLayout({ y: Number(e.target.value) })} />
            </div>
            <div className={'pb-prop-row'}>
              <label>W</label>
              <PbInput type="number" value={element.layout.width} min={minSize} onFocus={onFocus} onBlur={onBlur}
                onChange={e => changeLayout({ width: Math.max(minSize, Number(e.target.value)) })} />
            </div>
          </>
        )}
        {element.type !== 'divider' && !(isInGridCell && !element.overlayInCell && (element.type === 'text' || element.type === 'button')) && (
          <div className={'pb-prop-row'}>
            <label>{!isInGridCell ? 'H' : (element.type === 'image' || element.type === 'video') ? 'H' : 'Min H'}</label>
            <PbInput type="number" value={eff.layout.height} min={minSize} onFocus={onFocus} onBlur={onBlur}
              onChange={e => changeResp({ layout: { height: Math.max(minSize, Number(e.target.value)) } })} />
          </div>
        )}
        <div className={'pb-prop-row'}>
          <label>Opacity</label>
          <PbInput type="number" value={element.style.opacity} min={0} max={1} step={0.05}
            onFocus={onFocus} onBlur={onBlur}
            onChange={e => change({ style: { ...element.style, opacity: Math.max(0, Math.min(1, Number(e.target.value))) } })} />
        </div>
      </CollapsibleSection>

      {/* ── Sizing (grid elements only, not overlay) ── */}
      {isInGridCell && !element.overlayInCell && element.type !== 'divider' && (() => {
        const { widthMode, widthValue } = element.flexLayout;
        const sizingValue = widthMode === 'auto' ? 'auto' : widthMode === 'fill' ? 'fill' : 'fixed';
        const sizingOptions = [
          { value: 'auto',  label: 'Auto'  },
          { value: 'fill',  label: 'Fill'  },
          { value: 'fixed', label: 'Fixed' },
        ];
        const applySizing = (val: string) => {
          onPushSnapshot(snapshot);
          if (val === 'auto')  change({ flexLayout: { ...element.flexLayout, widthMode: 'auto',  flexGrow: 0, alignSelf: 'auto' } });
          if (val === 'fill')  change({ flexLayout: { ...element.flexLayout, widthMode: 'fill',  flexGrow: 0, alignSelf: 'auto' } });
          if (val === 'fixed') change({ flexLayout: { ...element.flexLayout, widthMode: 'fixed', flexGrow: 0, alignSelf: 'auto' } });
        };
        return (
          <CollapsibleSection sectionKey="sizing" label="Sizing" isOpen={sec('sizing')} onToggle={toggleSection}>
            <div className={'pb-prop-row'}>
              <label>Width</label>
              <PbSelect size="sm" value={sizingValue} options={sizingOptions} onChange={applySizing} />
            </div>
            {(widthMode === 'fixed' || widthMode === 'percent') && (
              <div className={'pb-prop-row'}>
                <label>Value</label>
                <PbInput type="number" value={widthValue} min={0}
                  max={widthMode === 'percent' ? 100 : undefined}
                  onFocus={onFocus} onBlur={onBlur}
                  onChange={e => change({ flexLayout: { ...element.flexLayout, widthValue: Number(e.target.value) } })} />
                <div className={'pb-toggle-group'}>
                  <button className={['pb-toggle-btn', widthMode === 'fixed' && 'pb-active'].filter(Boolean).join(' ')}
                    onClick={() => { onPushSnapshot(snapshot); change({ flexLayout: { ...element.flexLayout, widthMode: 'fixed' } }); }}>px</button>
                  <button className={['pb-toggle-btn', widthMode === 'percent' && 'pb-active'].filter(Boolean).join(' ')}
                    onClick={() => { onPushSnapshot(snapshot); change({ flexLayout: { ...element.flexLayout, widthMode: 'percent' } }); }}>%</button>
                </div>
              </div>
            )}
            {breakpoint !== 'desktop' && onUpdateResponsive && (
              <>
                <div style={{ fontSize: 10, color: 'var(--pb-text-subtle)', padding: '4px 0 2px' }}>
                  {breakpoint === 'tablet' ? 'Tablet override' : 'Mobile override'}
                </div>
                <div className={'pb-prop-row'}>
                  <label>Width</label>
                  <PbSelect
                    value={respOverrides?.flexLayout?.widthMode ?? ''}
                    options={FLEX_WIDTH_MODE_WITH_SAME_OPTIONS}
                    onChange={v => { onPushSnapshot(snapshot); onUpdateResponsive!(id, breakpoint, { flexLayout: { widthMode: (v || undefined) as FlexWidthMode | undefined } }); }} />
                </div>
                {(respOverrides?.flexLayout?.widthMode === 'fixed' || respOverrides?.flexLayout?.widthMode === 'percent') && (
                  <div className={'pb-prop-row'}>
                    <label>{respOverrides.flexLayout.widthMode === 'fixed' ? 'px' : '%'}</label>
                    <PbInput type="number" value={respOverrides.flexLayout.widthValue ?? 0} min={0}
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
                onPaste={createCleanPasteHandler()}
              />
            </div>
          )}
          {element.type === 'button' && (
            <>
              <div className={'pb-prop-row'}>
                <label>Label</label>
                <PbInput type="text" value={element.content.label}
                  onFocus={onFocus} onBlur={onBlur}
                  onChange={e => changeContent({ label: e.target.value })} />
              </div>
              <div className={'pb-prop-row'}>
                <label>Style</label>
                <ToggleGroup
                  options={[{ value: 'filled', label: 'Filled' }, { value: 'outline', label: 'Outline' }]}
                  value={element.style.background.color === 'transparent' ? 'outline' : 'filled'}
                  onChange={v => {
                    onPushSnapshot(snapshot);
                    if (v === 'filled') {
                      onUpdate(id, { style: { ...element.style, background: { ...element.style.background, color: '#0B978E' }, border: { ...element.style.border, width: 0 } } });
                    } else {
                      onUpdate(id, { style: { ...element.style, background: { ...element.style.background, color: 'transparent' }, border: { ...element.style.border, width: 2, color: element.style.typography.color, style: 'solid' } } });
                    }
                  }}
                />
              </div>
            </>
          )}
          <div className={'pb-prop-row'}>
            <label>Size</label>
            <PbInput type="number" value={eff.style.typography.size} min={8} max={200}
              onFocus={onFocus} onBlur={onBlur}
              onChange={e => changeResp({ style: { typography: { size: Number(e.target.value) } } })} />
          </div>
          <div className={'pb-prop-row'}>
            <label>Weight</label>
            <PbSelect value={eff.style.typography.weight}
              options={FONT_WEIGHT_OPTIONS}
              onChange={v => commitResp({ style: { typography: { weight: v } } })} />
          </div>
          <div className={'pb-prop-row'}>
            <label>Font</label>
            <PbSelect value={element.style.typography.family}
              options={FONT_FAMILY_OPTIONS}
              onChange={v => { injectGoogleFont(v); commitChange({ style: { ...element.style, typography: { ...element.style.typography, family: v } } }); }} />
          </div>
          <div className={'pb-prop-row'}>
            <label>Color</label>
            <ColorField
              value={element.style.typography.color.startsWith('#') ? element.style.typography.color : '#333333'}
              onChange={v => changeTypo({ color: v })}
              onFocus={onFocus} onBlur={onBlur}
              swatches={swatches} />
          </div>
          <div className={'pb-prop-row'}>
            <label>Align</label>
            <ToggleGroup
              options={[
                { value: 'left',   label: <Icon id="alignLeft"   size={14} />, title: 'Left'   },
                { value: 'center', label: <Icon id="alignCenter" size={14} />, title: 'Center' },
                { value: 'right',  label: <Icon id="alignRight"  size={14} />, title: 'Right'  },
              ]}
              value={eff.style.typography.align}
              onChange={a => commitResp({ style: { typography: { align: a as TextAlign } } })}
            />
          </div>
          <div className={'pb-prop-row'}>
            <label>Line H</label>
            <PbInput type="number" value={element.style.typography.lineHeight} min={0.5} max={5} step={0.1}
              onFocus={onFocus} onBlur={onBlur}
              onChange={e => changeTypo({ lineHeight: Number(e.target.value) })} />
          </div>
          <div className={'pb-prop-row'}>
            <label>Spacing</label>
            <PxInput value={element.style.typography.letterSpacing ?? 0} step={0.5}
              onFocus={onFocus} onBlur={onBlur}
              onChange={v => changeTypo({ letterSpacing: v })} />
          </div>
          <div className={'pb-prop-row'}>
            <label>Transform</label>
            <PbSelect value={element.style.typography.textTransform ?? 'none'}
              options={TEXT_TRANSFORM_OPTIONS}
              onChange={v => commitChange({ style: { ...element.style, typography: { ...element.style.typography, textTransform: v as TextTransform } } })} />
          </div>
          <div className={'pb-prop-row'}>
            <label>Position</label>
            <PbSelect value={element.cssPosition ?? 'relative'}
              options={CSS_POSITION_OPTIONS}
              onChange={v => commitChange({ cssPosition: v as 'relative' | 'absolute' | 'fixed' | 'sticky' })} />
          </div>
        </CollapsibleSection>
      )}

      {/* ── Form ── */}
      {element.type === 'form' && (
        <CollapsibleSection sectionKey="form" label="Form Fields" isOpen={sec('form')} onToggle={toggleSection}>
          <FormFieldsEditor
            fields={element.content.formFields ?? []}
            onChange={fields => setFormFields(fields, true)}
            onChangeNoCommit={fields => setFormFields(fields, false)}
            onFocus={onFocus}
            onBlur={onBlur}
          />
          <div style={{ height: 1, background: '#e2e8f0', margin: '10px 0' }} />
          <div className={'pb-prop-row'}>
            <label>Submit Label</label>
            <PbInput type="text" variant="plain" value={element.content.submitLabel ?? 'Submit'}
              onFocus={onFocus} onBlur={onBlur}
              onChange={e => changeContent({ submitLabel: e.target.value })} />
          </div>
          <div className={'pb-prop-row'}>
            <label>Field Gap</label>
            <PxInput value={element.content.fieldGap ?? 14}
              onFocus={onFocus} onBlur={onBlur}
              onChange={v => changeContent({ fieldGap: v })} />
          </div>
        </CollapsibleSection>
      )}

      {/* ── Action (Form submit + Button) ── */}
      {(element.type === 'form' || element.type === 'button') && (
        <CollapsibleSection
          sectionKey="action"
          label={element.type === 'form' ? 'Submit Action' : 'Action'}
          isOpen={sec('action')} onToggle={toggleSection}
        >
          <ActionEditor
            action={currentAction}
            onChange={changeAction}
            nodes={nodes}
            pages={pages}
            allowSubmit={element.type === 'form'}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </CollapsibleSection>
      )}

      {/* ── Image ── */}
      {element.type === 'image' && (
        <CollapsibleSection sectionKey="image" label="Image" isOpen={sec('image')} onToggle={toggleSection}>
          <div className={"pb-prop-row pb-full"}>
            <label>Image path</label>
            <PbInput type="text" variant="plain" value={element.content.src} placeholder="https://..."
              onFocus={onFocus} onBlur={onBlur}
              onChange={e => changeContent({ src: e.target.value })} />
          </div>
          <div className={"pb-prop-row pb-full"}>
            <label>Link</label>
            <PbInput type="text" variant="plain" value={element.content.linkUrl ?? ''} placeholder="https://..."
              onFocus={onFocus} onBlur={onBlur}
              onChange={e => changeContent({ linkUrl: e.target.value })} />
          </div>
          <div className={'pb-prop-row'}>
            <label>Alt text</label>
            <PbInput type="text" variant="plain" value={element.content.alt}
              onFocus={onFocus} onBlur={onBlur}
              onChange={e => changeContent({ alt: e.target.value })} />
          </div>
          <div className={'pb-prop-row'}>
            <label>Image Position</label>
            <PbSelect value={element.content.objectPosition ?? 'center'}
              options={OBJECT_POSITION_OPTIONS}
              onChange={v => commitChange({ content: { ...element.content, objectPosition: v } })} />
          </div>
          <div className={'pb-prop-row'}>
            <label>Image Fit</label>
            <PbSelect value={element.content.objectFit ?? 'cover'}
              options={OBJECT_FIT_OPTIONS}
              onChange={v => commitChange({ content: { ...element.content, objectFit: v as ObjectFit } })} />
          </div>
          <div className={'pb-prop-row'}>
            <label>Position</label>
            <PbSelect value={element.cssPosition ?? 'relative'}
              options={CSS_POSITION_OPTIONS}
              onChange={v => commitChange({ cssPosition: v as 'relative' | 'absolute' | 'fixed' | 'sticky' })} />
          </div>
        </CollapsibleSection>
      )}

      {/* ── Video ── */}
      {element.type === 'video' && (
        <CollapsibleSection sectionKey="video" label="Video" isOpen={sec('video')} onToggle={toggleSection}>
          <div className={"pb-prop-row pb-full"}>
            <label>Video path</label>
            <PbInput type="text" variant="plain" value={element.content.videoUrl} placeholder="https://youtube.com/watch?v=..."
              onFocus={onFocus} onBlur={onBlur}
              onChange={e => changeContent({ videoUrl: e.target.value })} />
          </div>
          <div className={"pb-prop-row pb-full"}>
            <label>Thumbnail path</label>
            <PbInput type="text" variant="plain" value={element.content.thumbnailUrl ?? ''} placeholder="https://..."
              onFocus={onFocus} onBlur={onBlur}
              onChange={e => changeContent({ thumbnailUrl: e.target.value })} />
          </div>
          <div className={'pb-prop-row'}>
            <label>Position</label>
            <PbSelect value={element.cssPosition ?? 'relative'}
              options={CSS_POSITION_OPTIONS}
              onChange={v => commitChange({ cssPosition: v as 'relative' | 'absolute' | 'fixed' | 'sticky' })} />
          </div>
        </CollapsibleSection>
      )}

      {/* ── Icon ── */}
      {element.type === 'icon' && (
        <CollapsibleSection sectionKey="icon" label="Icon" isOpen={sec('icon')} onToggle={toggleSection}>
          <div className={'pb-prop-row'}>
            <label>Size</label>
            <PxInput value={element.content.iconSize ?? 40}
              onFocus={onFocus} onBlur={onBlur}
              onChange={v => onUpdate(id, { content: { ...element.content, iconSize: v } })} />
          </div>
          <div className={'pb-prop-row'}>
            <label>Color</label>
            <ColorField
              value={element.style.typography.color.startsWith('#') ? element.style.typography.color : '#333333'}
              onChange={v => changeTypo({ color: v })}
              onFocus={onFocus} onBlur={onBlur}
              swatches={swatches} />
          </div>

          {/* SVG paste area */}
          <div style={{ padding: '8px 0 4px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 6 }}>
              Paste SVG code
            </div>
            <PbTextarea
              rows={5}
              mono
              placeholder={'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">\n  <path d="M12 2..."/>\n</svg>'}
              value={element.content.iconSvg ?? ''}
              onChange={e => {
                const raw = e.target.value.trim();
                // Never auto-clear on empty — use the ✕ button for that.
                // This prevents accidental loss when switching breakpoints triggers re-renders.
                if (!raw) return;
                onPushSnapshot(snapshot);
                // Sanitize: strip scripts and event handlers
                let clean = raw
                  .replace(/<script[\s\S]*?<\/script>/gi, '')
                  .replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, '')
                  .replace(/javascript:/gi, '');
                // Make color-controllable: set fill="currentColor" on the <svg> root
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
              <PbInput type="text" value={element.content.iconName ?? '★'}
                placeholder="★ or any emoji"
                onFocus={onFocus} onBlur={onBlur}
                onChange={e => { if (e.target.value) changeContent({ iconName: e.target.value }); }} />
            </div>
          )}

          <div className={'pb-prop-row'}>
            <label>Position</label>
            <PbSelect value={element.cssPosition ?? 'relative'}
              options={CSS_POSITION_OPTIONS}
              onChange={v => commitChange({ cssPosition: v as 'relative' | 'absolute' | 'fixed' | 'sticky' })} />
          </div>
          <div className={'pb-note-text'} style={{ paddingTop: 6 }}>
            Get SVGs free from heroicons.com, tabler.io/icons, or icons.getbootstrap.com
          </div>
        </CollapsibleSection>
      )}

      {/* ── Divider ──
          The Divider section is the single source of truth for a divider's
          dimensions in BOTH free and grid modes (the generic Layout/Sizing rows
          skip dividers). Orientation, Width, Height and Thickness behave the same
          everywhere; inside a grid a "Fill width" toggle lets the divider stretch
          to the cell while still respecting the layout constraints. */}
      {element.type === 'divider' && (() => {
        const isVertical = (element.content.orientation ?? 'horizontal') === 'vertical';
        // Thickness is the divider's short dimension: height for a horizontal
        // divider, width for a vertical one.
        const thickness = isVertical ? eff.layout.width : eff.layout.height;
        // Inside a grid cell the main-axis length is driven by flexLayout. We treat
        // widthMode 'fill' as "stretch to the cell"; anything else is an explicit px
        // Width that we keep mirrored into both layout.width and flexLayout.widthValue
        // so the grid renderer and the canvas agree.
        const inGrid = isInGridCell && !element.overlayInCell;
        const isFill = inGrid && element.flexLayout.widthMode === 'fill';

        // Set the divider's explicit Width. In a grid we also pin flexLayout to a
        // fixed px footprint so layout.width is actually honoured by the cell.
        const setWidth = (v: number) => {
          const w = Math.max(minSize, v);
          if (inGrid && !isFill) {
            change({
              layout: { ...element.layout, width: w },
              flexLayout: { ...element.flexLayout, widthMode: 'fixed', widthValue: w },
            });
          } else {
            changeResp({ layout: { width: w } });
          }
        };

        return (
          <CollapsibleSection sectionKey="divider" label="Divider" isOpen={sec('divider')} onToggle={toggleSection}>
            <div className={'pb-prop-row'}>
              <label>Orientation</label>
              <PbSelect value={element.content.orientation ?? 'horizontal'}
                options={DIVIDER_ORIENTATION_OPTIONS}
                onChange={v => {
                  const newOrientation = v as 'horizontal' | 'vertical';
                  const isChanging = newOrientation !== (element.content.orientation ?? 'horizontal');
                  onPushSnapshot(snapshot);
                  change({ content: { ...element.content, orientation: newOrientation } });
                  if (isChanging) {
                    changeResp({ layout: { width: eff.layout.height, height: eff.layout.width } });
                  }
                }} />
            </div>

            {inGrid && (
              <div className={'pb-prop-row'}>
                <label>Fill width</label>
                <input type="checkbox" checked={isFill}
                  onChange={e => {
                    onPushSnapshot(snapshot);
                    if (e.target.checked) {
                      change({ flexLayout: { ...element.flexLayout, widthMode: 'fill' } });
                    } else {
                      // Drop back to an explicit footprint matching the current width.
                      change({ flexLayout: { ...element.flexLayout, widthMode: 'fixed', widthValue: eff.layout.width } });
                    }
                  }} />
                <span style={{ fontSize: 11, color: '#888' }}>Stretch to cell</span>
              </div>
            )}

            {/* Width and Height each cover the divider's two dimensions. The one
                that equals the short side is just the Thickness, so we hide it to
                avoid two inputs that edit the same value: a vertical divider's
                Width == Thickness, a horizontal divider's Height == Thickness. */}
            {!isVertical && (
              <div className={'pb-prop-row'}>
                <label>Width</label>
                <PxInput value={eff.layout.width} disabled={isFill}
                  onFocus={onFocus} onBlur={onBlur}
                  onChange={v => setWidth(v)} />
              </div>
            )}

            {isVertical && (
              <div className={'pb-prop-row'}>
                <label>Height</label>
                <PxInput value={eff.layout.height}
                  onFocus={onFocus} onBlur={onBlur}
                  onChange={v => changeResp({ layout: { height: Math.max(minSize, v) } })} />
              </div>
            )}

            <div className={'pb-prop-row'}>
              <label>Thickness</label>
              <PxInput value={thickness}
                onFocus={onFocus} onBlur={onBlur}
                onChange={v => changeResp({ layout: isVertical ? { width: Math.max(1, v) } : { height: Math.max(1, v) } })} />
            </div>
          </CollapsibleSection>
        );
      })()}

      {/* ── Background ── */}
      <CollapsibleSection sectionKey="background" label={<>Background {allBpBadge}</>}
        isOpen={sec('background')} onToggle={toggleSection}>
        <div className={'pb-prop-row'}>
          <label>Type</label>
          <PbSelect value={elBg.type}
            options={BG_TYPE_OPTIONS}
            onChange={v => commitChange({ style: { ...element.style, background: { ...elBg, type: v as BgType } } })} />
        </div>
        {elBg.type === 'solid' && (
          <>
            {elBg.color !== 'transparent' && (
              <div className={'pb-prop-row'}>
                <label>Color</label>
                <ColorField value={bgColor} onChange={v => changeBg({ color: v })} onFocus={onFocus} onBlur={onBlur} swatches={swatches} />
              </div>
            )}
            <div className={'pb-prop-row pb-vis-row'}>
              <label>Transparent</label>
              <input type="checkbox" checked={elBg.color === 'transparent'}
                onChange={e => commitChange({ style: { ...element.style, background: { ...elBg, color: e.target.checked ? 'transparent' : '#ffffff' } } })} />
            </div>
          </>
        )}
        {(elBg.type === 'linear-gradient' || elBg.type === 'radial-gradient') && (
          <>
            <div className={'pb-prop-row'}>
              <label>From</label>
              <ColorField value={elBg.from || '#006e75'} onChange={v => changeBg({ from: v })} onFocus={onFocus} onBlur={onBlur} swatches={swatches} />
            </div>
            <div className={'pb-prop-row'}>
              <label>To</label>
              <ColorField value={elBg.to || '#0b978e'} onChange={v => changeBg({ to: v })} onFocus={onFocus} onBlur={onBlur} swatches={swatches} />
            </div>
            {elBg.type === 'linear-gradient' && (
              <div className={'pb-prop-row'}>
                <label>Angle</label>
                <PxInput value={elBg.angle ?? 135} unit="°"
                  onFocus={onFocus} onBlur={onBlur}
                  onChange={v => changeBg({ angle: v })} />
              </div>
            )}
          </>
        )}
        <div className={"pb-prop-row pb-full"}>
          <label>Image</label>
          <PbInput type="text" value={elBg.image} placeholder="https://..."
            onFocus={onFocus} onBlur={onBlur}
            onChange={e => changeBg({ image: e.target.value })} />
        </div>
        {elBg.image && (
          <div className={'pb-prop-row'}>
            <label>Position</label>
            <PbSelect value={elBg.position}
              options={IMAGE_POSITION_OPTIONS}
              onChange={v => commitChange({ style: { ...element.style, background: { ...elBg, position: v } } })} />
          </div>
        )}
      </CollapsibleSection>

      {/* ── Border ── */}
      <CollapsibleSection sectionKey="border" label={<>Border {allBpBadge}</>}
        isOpen={sec('border')} onToggle={toggleSection}>
        <BorderEditor border={element.style.border} onChange={changeBorder} onFocus={onFocus} onBlur={onBlur} swatches={swatches} />
      </CollapsibleSection>

      {/* ── Spacing ── */}
      <CollapsibleSection sectionKey="spacing" label={<>Spacing {allBpBadge}</>}
        isOpen={sec('spacing')} onToggle={toggleSection}>
        <SpacingEditor
          padding={element.style.padding}
          onPaddingChange={(k, v) => changePad({ [k]: v })}
          onFocus={onFocus} onBlur={onBlur}
        />
      </CollapsibleSection>

      {/* ── Shadow ── */}
      <CollapsibleSection sectionKey="shadow" label={<>Shadow {allBpBadge}</>}
        isOpen={sec('shadow')} onToggle={toggleSection}>
        <ShadowEditor shadow={element.style.shadow} onChange={changeShadow} onFocus={onFocus} onBlur={onBlur} swatches={swatches} />
      </CollapsibleSection>

      {/* Animation panel hidden during stabilization — data + export still intact */}

      {/* ── Advanced ── */}
      <CollapsibleSection sectionKey="advanced" label={<>Advanced {allBpBadge}</>}
        isOpen={sec('advanced')} onToggle={toggleSection}>
        <div className={'pb-prop-row'}>
          <label>Rotation</label>
          <PxInput value={element.layout.rotation} unit="°"
            onFocus={onFocus} onBlur={onBlur}
            onChange={v => changeLayout({ rotation: v })} />
        </div>
        <div className={'pb-prop-row'}>
          <label>Lock</label>
          <button
            className={['pb-toolbar-btn', element.state.locked && 'pb-active'].filter(Boolean).join(' ')}
            style={{ fontSize: 11, padding: '2px 8px', height: 24 }}
            title={element.state.locked ? 'Unlock element — allow drag/resize' : 'Lock element — prevent drag/resize'}
            onClick={() => { onPushSnapshot(snapshot); onUpdate(id, { state: { ...element.state, locked: !element.state.locked } }); }}
          >{element.state.locked ? 'Locked' : 'Unlocked'}</button>
        </div>
      </CollapsibleSection>

      {/* ── Visibility ── */}
      {onUpdateResponsive && (
        <CollapsibleSection sectionKey="responsive" label="Visibility" isOpen={sec('responsive')} onToggle={toggleSection}>
          <VisibilityEditor
            hideOnTablet={!!element.responsive.tablet?.state?.hidden}
            hideOnMobile={!!element.responsive.mobile?.state?.hidden}
            onTabletChange={v => { onPushSnapshot(snapshot); onUpdateResponsive(id, 'tablet', { state: { hidden: v } }); }}
            onMobileChange={v => { onPushSnapshot(snapshot); onUpdateResponsive(id, 'mobile', { state: { hidden: v } }); }}
          />
        </CollapsibleSection>
      )}
    </aside>
  );
}

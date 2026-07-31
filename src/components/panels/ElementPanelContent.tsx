import { useEffect, useRef, useState } from 'react';
import type {
  Breakpoint, BuilderState, CanvasElement, ElementAction,
  ElementContent, ElementLayout, BreakpointOverride,
  Typography, TextAlign, ObjectFit, NodeMap, TextTransform, SiteTheme, Page,
} from '../../types';
import { DEFAULT_ACTION } from '../../utils/builderDefaults';
import { richTextState } from '../../utils/richTextState';
import { createCleanPasteHandler, stripRichFonts } from '../../utils/cleanPaste';
import { injectGoogleFont } from '../../utils/fonts';
import { isYouTubeUrl } from '../../utils/videoEmbed';

import { Icon } from '../Icon';
import { BREAKPOINT_WIDTHS } from '../Canvas';
import { CollapsibleSection } from './CollapsibleSection';
import { ColorField, PxInput, ToggleGroup, CheckboxField, computePopupPos, type PopupPos } from './PanelFields';
import { PbColorPicker } from '../PbColorPicker';
import { ActionEditor } from './ActionEditor';
import { FormFieldsEditor } from './FormFieldsEditor';
import { ImagePickerModal } from '../ImagePickerModal';
import { useWidenUpload, UPLOAD_STAGE_LABEL } from '../../hooks/useWidenUpload';
import { PbSelect } from '../PbSelect';
import { PbInput } from '../PbInput';
import { PbTextarea } from '../PbTextarea';
import {
  FONT_WEIGHT_OPTIONS,
  FONT_FAMILY_OPTIONS,
  TEXT_TRANSFORM_OPTIONS,
  DIVIDER_ORIENTATION_OPTIONS,
  OBJECT_FIT_OPTIONS,
  IMAGE_POSITION_OPTIONS,
  ALIGN_SELF_OPTIONS,
} from '../../utils/selectOptions';

// document.queryCommandValue('foreColor') returns an "rgb(r, g, b)" string — the
// inline color picker works in hex, so convert before handing it off as `value`.
function rgbToHex(rgb: string): string {
  const m = rgb.match(/\d+(\.\d+)?/g);
  if (!m || m.length < 3) return '#000000';
  const [r, g, b] = m.map(Number);
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

interface Props {
  element: CanvasElement;
  eff: CanvasElement;
  id: string;
  breakpoint: Breakpoint;
  sec: (key: string) => boolean;
  toggleSection: (key: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  isFocused: () => boolean;
  snapshot: BuilderState;
  onPushSnapshot: (s: BuilderState) => void;
  onUpdate: (id: string, updates: Partial<CanvasElement>) => void;
  change: (updates: Partial<CanvasElement>) => void;
  changeContent: (c: Partial<ElementContent>) => void;
  changeTypo: (t: Partial<Typography>) => void;
  changeLayout: (l: Partial<ElementLayout>) => void;
  changeResp: (updates: Partial<BreakpointOverride>) => void;
  commitChange: (updates: Partial<CanvasElement>) => void;
  commitResp: (updates: Partial<BreakpointOverride>) => void;
  swatches: ReturnType<(theme: SiteTheme) => string[]>;
  nodes: NodeMap;
  pages: Page[];
  isInGridCell: boolean;
  minSize: number;
}

export function ElementPanelContent({
  element, eff, id, breakpoint,
  sec, toggleSection,
  onFocus, onBlur, isFocused,
  snapshot, onPushSnapshot,
  onUpdate, change, changeContent, changeTypo, changeLayout, changeResp,
  commitChange, commitResp,
  swatches, nodes, pages, isInGridCell, minSize,
}: Props) {
  const sidebarEditRef = useRef<HTMLDivElement>(null);
  const imgFileRef = useRef<HTMLInputElement>(null);
  const [showPicker, setShowPicker] = useState(false);
  const { upload, status: uploadStatus, error: uploadError, isUploading } = useWidenUpload();

  const handleImageUpload = async (file: File) => {
    const result = await upload(file);
    if (!result) return;
    onPushSnapshot(snapshot);
    // src drives canvas rendering; the rest are stored in the builder JSON.
    changeContent({
      src: result.imageUrl,
      imageUrl: result.imageUrl,
      assetId: result.assetId,
      assetUrl: result.assetUrl,
      assetMetadata: result.metadata ?? null,
    });
  };

  // Sync sidebar rich text div when element changes (e.g. different element selected)
  useEffect(() => {
    const div = sidebarEditRef.current;
    if (!div) return;
    const target = element.content.rich || element.content.plain || '';
    if (div.innerHTML !== target) div.innerHTML = target;
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

  const [textColorPickerOpen, setTextColorPickerOpen] = useState(false);
  const [textColorPickerPos, setTextColorPickerPos] = useState<PopupPos | null>(null);
  const [textColorValue, setTextColorValue] = useState('#000000');
  const textColorBtnRef = useRef<HTMLLabelElement>(null);

  const textColorApplyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (textColorApplyTimer.current) clearTimeout(textColorApplyTimer.current);
  }, []);
  const handleTextColorChange = (color: string) => {
    if (textColorApplyTimer.current) clearTimeout(textColorApplyTimer.current);
    textColorApplyTimer.current = setTimeout(() => applyInlineFormat('foreColor', color), 150);
  };

  useEffect(() => {
    if (!textColorPickerOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        textColorBtnRef.current && !textColorBtnRef.current.contains(e.target as Node) &&
        !(e.target as Element).closest?.('.pb-cpf-popup')
      ) {
        setTextColorPickerOpen(false);
        richTextState.applyingFormat = false;
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [textColorPickerOpen]);

  const currentAction: ElementAction = element.action ?? DEFAULT_ACTION;
  const changeAction = (updates: Partial<ElementAction>) => {
    if (!isFocused()) onPushSnapshot(snapshot);
    change({ action: { ...currentAction, ...updates } });
  };
  const setFormFields = (formFields: import('../../types').FormField[], commit: boolean) => {
    if (commit) onPushSnapshot(snapshot);
    changeContent({ formFields });
  };

  return (
    <>
      {/* ── Typography (Text + Button) ── */}
      {(element.type === 'text' || element.type === 'button') && (
        <CollapsibleSection sectionKey="typography" label="Typography" isOpen={sec('typography')} onToggle={toggleSection}>

          {/* Inline formatting toolbar */}
          {element.type === 'text' && (
            <div className={'pb-format-toolbar'}>
              <div className={'pb-format-toolbar-hint'}>
                Double-click text on canvas → select → apply:
              </div>
              <div className={'pb-format-btn-row'}>
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
                    className={'pb-format-btn'}
                  ><Tag style={{ pointerEvents: 'none' }}>{label}</Tag></button>
                ))}
                <label
                  ref={textColorBtnRef}
                  title="Text color"
                  className={'pb-format-color-label'}
                  onMouseDown={() => { richTextState.applyingFormat = true; }}
                  onClick={e => {
                    const rect = textColorBtnRef.current?.getBoundingClientRect();
                    if (rect) setTextColorPickerPos(computePopupPos(rect, e.clientX));
                    // Restore the saved selection so queryCommandValue reads the
                    // selected text's actual color, not whatever the cursor last sat in.
                    const range = richTextState.savedRange;
                    if (range) {
                      const sel = window.getSelection();
                      if (sel) { sel.removeAllRanges(); sel.addRange(range); }
                    }
                    try {
                      const val = document.queryCommandValue('foreColor');
                      setTextColorValue(val ? rgbToHex(val) : '#000000');
                    } catch {
                      setTextColorValue('#000000');
                    }
                    setTextColorPickerOpen(o => !o);
                  }}
                >
                  <span className={'pb-format-color-a'}>A</span>
                </label>
                {textColorPickerOpen && textColorPickerPos && (
                  <div
                    className={'pb-cpf-popup'}
                    style={{ position: 'fixed', zIndex: 9999, top: textColorPickerPos.top, bottom: textColorPickerPos.bottom, right: textColorPickerPos.right }}
                    onMouseDown={() => { richTextState.applyingFormat = true; }}
                  >
                    <PbColorPicker
                      value={textColorValue}
                      swatches={swatches}
                      onChange={handleTextColorChange}
                    />
                  </div>
                )}
                <button
                  title="Clear all inline formatting"
                  onMouseDown={() => { richTextState.applyingFormat = true; }}
                  onClick={() => applyInlineFormat('removeFormat')}
                  className={'pb-format-action-btn'}
                >Clear</button>
                <button
                  title="Wrap selection in a link"
                  onMouseDown={() => { richTextState.applyingFormat = true; }}
                  onClick={() => { const url = prompt('URL (include https://)'); if (url) applyInlineFormat('createLink', url); else richTextState.applyingFormat = false; }}
                  className={'pb-format-action-btn'}
                >Link</button>
                <button
                  title="Remove link"
                  onMouseDown={() => { richTextState.applyingFormat = true; }}
                  onClick={() => applyInlineFormat('unlink')}
                  className={'pb-format-action-btn'}
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
                className={'pb-rich-editor'}
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
              onChange={e => {
                changeResp({ style: { typography: { size: Number(e.target.value) } } });
                if (element.type === 'text' && element.content.rich)
                  changeContent({ rich: stripRichFonts(element.content.rich) });
              }} />
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
              searchable
              onChange={v => {
                injectGoogleFont(v);
                const update: Partial<import('../../types').CanvasElement> = { style: { ...element.style, typography: { ...element.style.typography, family: v } } };
                if (element.type === 'text' && element.content.rich)
                  update.content = { ...element.content, rich: stripRichFonts(element.content.rich) };
                commitChange(update);
              }} />
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
            <label>Line Height</label>
            <PbInput type="number" value={element.style.typography.lineHeight} min={0.5} max={5} step={0.1}
              onFocus={onFocus} onBlur={onBlur}
              onChange={e => changeTypo({ lineHeight: Number(e.target.value) })} />
          </div>
          <div className={'pb-prop-row'}>
            <label>Letter Spacing</label>
            <PxInput value={eff.style.typography.letterSpacing ?? 0} step={0.5}
              onFocus={onFocus} onBlur={onBlur}
              onChange={v => changeResp({ style: { typography: { letterSpacing: v } } })} />
          </div>
          <div className={'pb-prop-row'}>
            <label>Transform</label>
            <PbSelect value={eff.style.typography.textTransform ?? 'none'}
              options={TEXT_TRANSFORM_OPTIONS}
              onChange={v => commitResp({ style: { typography: { textTransform: v as TextTransform } } })} />
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
          <div className={'pb-panel-hr'} />
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

      {/* ── Action (Form submit + Button + Text) ── */}
      {(element.type === 'form' || element.type === 'button' || element.type === 'text') && (
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
          <div className={'pb-prop-row pb-full'}>
            <label>Image Search</label>
            <button className={'pb-img-action-btn pb-img-search-btn'} onClick={() => setShowPicker(true)}>
              Search Image
            </button>
          </div>
          <div className={'pb-prop-row pb-full'}>
            <label>Image Upload</label>
            <button
              className={'pb-img-action-btn pb-img-upload-btn'}
              disabled={isUploading}
              onClick={() => imgFileRef.current?.click()}
            >
              {uploadStatus ? UPLOAD_STAGE_LABEL[uploadStatus] : 'Upload'}
            </button>
            <input
              ref={imgFileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={e => {
                const file = e.target.files?.[0];
                e.target.value = '';
                if (!file) return;
                void handleImageUpload(file);
              }}
            />
            {uploadError && (
              <div className={'pb-img-upload-error'} role="alert">{uploadError}</div>
            )}
          </div>
          <div className={"pb-prop-row pb-full"}>
            <label>Image Url</label>
            <PbInput type="text" variant="plain" value={element.content.src ?? ''} placeholder="https://..."
              onFocus={onFocus} onBlur={onBlur}
              onChange={e => changeContent({ src: e.target.value })} />
          </div>
          <div className={'pb-prop-row'}>
            <label>Alt Text</label>
            <PbInput type="text" variant="plain" value={element.content.alt}
              onFocus={onFocus} onBlur={onBlur}
              onChange={e => changeContent({ alt: e.target.value })} />
          </div>
          <div className={'pb-prop-row'}>
            <label>Image Position</label>
            <PbSelect value={element.content.objectPosition ?? 'center'}
              options={IMAGE_POSITION_OPTIONS}
              onChange={v => commitChange({ content: { ...element.content, objectPosition: v } })} />
          </div>
          <div className={'pb-prop-row'}>
            <label>Image Fit</label>
            <PbSelect value={element.content.objectFit ?? 'cover'}
              options={OBJECT_FIT_OPTIONS}
              onChange={v => commitChange({ content: { ...element.content, objectFit: v as ObjectFit } })} />
          </div>
          <ImagePickerModal
            isOpen={showPicker}
            onClose={() => setShowPicker(false)}
            onSelect={url => { onPushSnapshot(snapshot); changeContent({ src: url }); }}
          />
        </CollapsibleSection>
      )}

      {/* ── Video ── */}
      {element.type === 'video' && (() => {
        const isYouTube = isYouTubeUrl(element.content.videoUrl ?? '');
        const autoplay = element.content.videoAutoplay !== false;
        return (
          <CollapsibleSection sectionKey="video" label="Video" isOpen={sec('video')} onToggle={toggleSection}>
            <div className={"pb-prop-row pb-full"}>
              <label>Video path</label>
              <PbInput type="text" variant="plain" value={element.content.videoUrl} placeholder="https://youtube.com/watch?v=... or a direct .mp4 URL"
                onFocus={onFocus} onBlur={onBlur}
                onChange={e => changeContent({ videoUrl: e.target.value })} />
            </div>
            {element.content.videoUrl && !isYouTube && (
              <>
                <CheckboxField label="Autoplay" checked={autoplay}
                  onChange={v => { onPushSnapshot(snapshot); changeContent({ videoAutoplay: v, ...(v ? { videoMuted: true } : {}) }); }} />
                <CheckboxField label="Loop" checked={element.content.videoLoop !== false}
                  onChange={v => { onPushSnapshot(snapshot); changeContent({ videoLoop: v }); }} />
                {/* Browsers block autoplay on an unmuted video, so muted is locked on while autoplay is on. */}
                <CheckboxField label="Muted" checked={element.content.videoMuted === true || autoplay}
                  disabled={autoplay}
                  title={autoplay ? 'Autoplaying videos must stay muted to play in the browser.' : undefined}
                  onChange={v => { onPushSnapshot(snapshot); changeContent({ videoMuted: v }); }} />
              </>
            )}
          </CollapsibleSection>
        );
      })()}

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
          <div className={'pb-svg-section'}>
            <div className={'pb-svg-label'}>Paste SVG code</div>
            <PbTextarea
              rows={5}
              mono
              placeholder={'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">\n  <path d="M12 2..."/>\n</svg>'}
              value={element.content.iconSvg ?? ''}
              onChange={e => {
                const raw = e.target.value.trim();
                if (!raw) return;
                onPushSnapshot(snapshot);
                let clean = raw
                  .replace(/<script[\s\S]*?<\/script>/gi, '')
                  .replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, '')
                  .replace(/javascript:/gi, '');
                // Normalize fill/stroke to currentColor on every element so the
                // icon color panel control works regardless of what the pasted SVG contains.
                const wrapper = document.createElement('div');
                wrapper.innerHTML = clean;
                const svgEl = wrapper.querySelector('svg');
                if (svgEl) {
                  [svgEl as Element, ...Array.from(svgEl.querySelectorAll('*'))].forEach(node => {
                    const fill = node.getAttribute('fill');
                    if (fill !== null && fill.toLowerCase() !== 'none') node.setAttribute('fill', 'currentColor');
                    const stroke = node.getAttribute('stroke');
                    if (stroke !== null && stroke.toLowerCase() !== 'none') node.setAttribute('stroke', 'currentColor');
                    const s = (node as HTMLElement).style;
                    if (s) {
                      if (s.fill && s.fill.toLowerCase() !== 'none') s.fill = 'currentColor';
                      if (s.stroke && s.stroke.toLowerCase() !== 'none') s.stroke = 'currentColor';
                    }
                  });
                  if (!svgEl.hasAttribute('fill')) svgEl.setAttribute('fill', 'currentColor');
                  clean = wrapper.innerHTML;
                }
                changeContent({ iconSvg: clean });
              }}
            />
            {element.content.iconSvg && (
              <button
                className={'pb-clear-btn'}
                onClick={() => { onPushSnapshot(snapshot); changeContent({ iconSvg: undefined }); }}
              >✕ Clear SVG</button>
            )}
          </div>
          {!element.content.iconSvg && (
            <div className={'pb-prop-row'}>
              <label>Symbol</label>
              <PbInput type="text" value={element.content.iconName ?? '★'}
                placeholder="★ or any emoji"
                onFocus={onFocus} onBlur={onBlur}
                onChange={e => { if (e.target.value) changeContent({ iconName: e.target.value }); }} />
            </div>
          )}
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
        const thickness = isVertical ? eff.layout.width : eff.layout.height;
        const inGrid = isInGridCell && !element.overlayInCell;
        const isFill = inGrid && eff.flexLayout.widthMode === 'fill';

        const setWidth = (v: number) => {
          const w = Math.max(minSize, v);
          if (inGrid && !isFill) {
            changeResp({
              layout: { width: w },
              flexLayout: { widthMode: 'fixed', widthValue: w },
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
                    if (e.target.checked) {
                      commitResp({ flexLayout: { widthMode: 'fill' } });
                    } else {
                      commitResp({ flexLayout: { widthMode: 'fixed', widthValue: eff.layout.width } });
                    }
                  }} />
                <span className={'pb-hint-inline'}>Stretch to cell</span>
              </div>
            )}
            {inGrid && !isFill && (
              <div className={'pb-prop-row'}>
                <label>Align</label>
                <PbSelect size="sm" value={eff.flexLayout.alignSelf}
                  options={ALIGN_SELF_OPTIONS}
                  onChange={v => commitResp({ flexLayout: { alignSelf: v as CanvasElement['flexLayout']['alignSelf'] } })} />
              </div>
            )}
            {!inGrid && !element.layout.fullWidth && (() => {
              const containerW = BREAKPOINT_WIDTHS[breakpoint];
              const w = eff.layout.width;
              const leftX = 0;
              const rightX = Math.max(0, containerW - w);
              const centerX = Math.max(0, Math.round((containerW - w) / 2));
              const TOL = 2;
              const current = Math.abs(eff.layout.x - leftX) <= TOL ? 'left'
                : Math.abs(eff.layout.x - rightX) <= TOL ? 'right'
                : Math.abs(eff.layout.x - centerX) <= TOL ? 'center'
                : '';
              const alignTo = (mode: 'left' | 'center' | 'right') => {
                const x = mode === 'left' ? leftX : mode === 'right' ? rightX : centerX;
                commitResp({ layout: { x, xPercent: undefined } });
              };
              return (
                <div className={'pb-prop-row'}>
                  <label>Align</label>
                  <ToggleGroup
                    options={[
                      { value: 'left',   label: <Icon id="alignLeft"   size={14} />, title: 'Left'   },
                      { value: 'center', label: <Icon id="alignCenter" size={14} />, title: 'Center' },
                      { value: 'right',  label: <Icon id="alignRight"  size={14} />, title: 'Right'  },
                    ]}
                    value={current}
                    onChange={v => alignTo(v as 'left' | 'center' | 'right')}
                  />
                </div>
              );
            })()}
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
            <div className={'pb-prop-row'}>
              <label>Color</label>
              <ColorField
                value={element.style.background.color.startsWith('#') ? element.style.background.color : '#dddddd'}
                onChange={v => change({ style: { ...element.style, background: { ...element.style.background, color: v } } })}
                onFocus={onFocus} onBlur={onBlur}
                swatches={swatches} />
            </div>
            <div className={'pb-prop-row'}>
              <label>Radius</label>
              <PxInput value={element.style.border.radius}
                onFocus={onFocus} onBlur={onBlur}
                onChange={v => change({ style: { ...element.style, border: { ...element.style.border, radius: v } } })} />
            </div>
          </CollapsibleSection>
        );
      })()}
    </>
  );
}

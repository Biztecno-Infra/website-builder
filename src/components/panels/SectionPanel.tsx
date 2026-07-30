import { useState, useRef } from 'react';
import { useFocusSnapshot } from '../../hooks/useFocusSnapshot';
import type {
  Breakpoint, BgType, BuilderState, ContentWidthMode,
  Section, GridSection, GridCell,
  NodeMap, SectionUpdate, SectionBackground, SiteTheme,
} from '../../types';

import { CollapsibleSection, usePanelSections } from './CollapsibleSection';
import { LayoutChangeModal, type LayoutChangeChoice } from '../LayoutChangeModal';
import { Modal } from '../Modal';
import { ImagePickerModal } from '../ImagePickerModal';
import { useWidenUpload, UPLOAD_STAGE_LABEL } from '../../hooks/useWidenUpload';
import { ColorField, PxInput, ToggleGroup, ShadowEditor, BorderEditor, VisibilityEditor, SpacingEditor, VideoPlaybackFields, themeToSwatches } from './PanelFields';
import { PanelHeader } from './PanelHeader';
import { PbSelect } from '../PbSelect';
import { PbInput } from '../PbInput';
import { PbButton } from '../PbButton';
import {
  SCROLL_BEHAVIOR_OPTIONS,
  CONTENT_WIDTH_OPTIONS,
  SECTION_BG_TYPE_OPTIONS,
  BG_IMAGE_POSITION_OPTIONS,
  SECTION_LAYOUT_MODE_OPTIONS,
} from '../../utils/selectOptions';

const SECTION_PANEL_DEFAULTS: Record<string, boolean> = {
  layout: true,
  background: true,
  border: false,
  shadow: false,
  spacing: true,
  visibility: false,
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
  pageLayoutWidth?: 'fixed' | 'fluid';
}

export function SectionPanel({
  section, nodes, snapshot,
  onUpdateSection, onAddGridCell, onUpdateGridCell, onPushSnapshot,
  breakpoint = 'desktop', theme, pageLayoutWidth = 'fluid',
}: Props) {
  const [showLayoutModal, setShowLayoutModal] = useState(false);
  const [showToFreeModal, setShowToFreeModal] = useState(false);
  const { sec, toggle } = usePanelSections(SECTION_PANEL_DEFAULTS, 'builder-sidebar-sec');
  const { onFocus: onNumberFocus, onBlur: onNumberBlur } = useFocusSnapshot(snapshot, onPushSnapshot);

  const swatches = themeToSwatches(theme);
  const bg = section.style.background;
  const isGrid = section.layoutMode === 'grid';
  const hasGrid = isGrid;
  const gridCfg = hasGrid ? (section as GridSection).grid : { gap: 24, rowGap: 24 };
  const secPad = section.style.padding ?? { top: 0, right: 0, bottom: 0, left: 0 };
  const secMargin = section.style.margin ?? { top: 0, right: 0, bottom: 0, left: 0 };
  const secBorder = section.style.border ?? { radius: 0, width: 0, color: '#cccccc', style: 'none' as const };
  const secShadow = section.style.shadow ?? { enabled: false, x: 0, y: 0, blur: 0, spread: 0, color: '#000000' };

  const updateBg = (b: Partial<SectionBackground>) =>
    onUpdateSection(section.id, { style: { ...section.style, background: { ...bg, ...b } } });

  // Background image search + upload (mirrors the Image element panel).
  const [showImagePicker, setShowImagePicker] = useState(false);
  const bgImgFileRef = useRef<HTMLInputElement>(null);
  const bgVideoFileRef = useRef<HTMLInputElement>(null);
  const { upload: uploadBgImage, status: bgImgStatus, error: bgImgError, isUploading: bgImgUploading } = useWidenUpload();
  const { upload: uploadBgVideo, status: bgVideoStatus, error: bgVideoError, isUploading: bgVideoUploading } = useWidenUpload();

  const handleBgImageUpload = async (file: File) => {
    const result = await uploadBgImage(file);
    if (!result) return;
    onPushSnapshot(snapshot);
    updateBg({ type: 'image', image: result.imageUrl });
  };
  const handleBgVideoUpload = async (file: File) => {
    const result = await uploadBgVideo(file);
    if (!result) return;
    onPushSnapshot(snapshot);
    updateBg({ type: 'video', video: result.imageUrl });
  };
  const updateSecPad = (p: Partial<typeof secPad>) =>
    onUpdateSection(section.id, { style: { ...section.style, padding: { ...secPad, ...p } } });
  const updateSecMargin = (m: Partial<typeof secMargin>) =>
    onUpdateSection(section.id, { style: { ...section.style, margin: { ...secMargin, ...m } } });

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
                setShowToFreeModal(true);
                return;
              }
              // free → grid: always ask (preserve content or start empty)
              setShowLayoutModal(true);
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

        {/* Width (grid/flex only) — hidden on fluid pages since page-level full-width overrides it */}
        {hasGrid && pageLayoutWidth !== 'fluid' && (
          <div className={'pb-prop-row'}>
            <label>Width</label>
            <PbSelect
              value={gridCfg.contentWidth ?? 'full'}
              options={CONTENT_WIDTH_OPTIONS}
              onChange={v => onUpdateSection(section.id, { grid: { ...gridCfg, contentWidth: v as ContentWidthMode } })}
            />
          </div>
        )}

        {/* Gap (grid/flex only) — always available regardless of page width mode */}
        {hasGrid && (
          <>
            <div className={['pb-prop-row', breakpoint === 'desktop' && 'pb-resp-row--active'].filter(Boolean).join(' ')}>
              <label>Column Gap</label>
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
          <label>Background Type</label>
          <PbSelect value={bg.type}
            options={SECTION_BG_TYPE_OPTIONS}
            onChange={v => { onPushSnapshot(snapshot); updateBg({ type: v as BgType }); }} />
        </div>
        {bg.type === 'solid' && (
          <div className={'pb-prop-row'}>
            <label>Color</label>
            <ColorField
              value={bg.color.startsWith('#') ? bg.color : '#ffffff'}
              onChange={v => updateBg({ color: v })}
              onFocus={onNumberFocus} onBlur={onNumberBlur}
              swatches={swatches} />
          </div>
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

        {/* ── Image background ── */}
        {bg.type === 'image' && (
          <>
            {bg.image && (
              <div className={'pb-prop-row pb-full'}>
                <div className={'pb-bg-media-preview'}>
                  <img src={bg.image} alt="Section background" />
                </div>
              </div>
            )}
            <div className={'pb-prop-row pb-full'}>
              <label>{bg.image ? 'Replace Image' : 'Image'}</label>
              <div className={'pb-bg-media-actions'}>
                <button className={'pb-img-action-btn pb-img-search-btn'} onClick={() => setShowImagePicker(true)}>
                  Search
                </button>
                <button
                  className={'pb-img-action-btn pb-img-upload-btn'}
                  disabled={bgImgUploading}
                  onClick={() => bgImgFileRef.current?.click()}
                >
                  {bgImgStatus ? UPLOAD_STAGE_LABEL[bgImgStatus] : 'Upload'}
                </button>
              </div>
              <input
                ref={bgImgFileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; e.target.value = ''; if (f) void handleBgImageUpload(f); }}
              />
              {bgImgError && <div className={'pb-img-upload-error'} role="alert">{bgImgError}</div>}
            </div>
            <div className={'pb-prop-row pb-full'}>
              <label>Background Source</label>
              <PbInput type="text" value={bg.image} placeholder="https://..."
                onFocus={onNumberFocus} onBlur={onNumberBlur}
                onChange={e => updateBg({ image: e.target.value })} />
            </div>
            {bg.image && (
              <div className={'pb-prop-row'}>
                <label>Position</label>
                <PbSelect value={bg.position || 'center'}
                  options={BG_IMAGE_POSITION_OPTIONS}
                  onChange={v => updateBg({ position: v })} />
              </div>
            )}
            {bg.image && (
              <div className={'pb-prop-row pb-full'}>
                <PbButton variant="outline" onClick={() => { onPushSnapshot(snapshot); updateBg({ type: 'solid', image: '' }); }}>
                  Remove image
                </PbButton>
              </div>
            )}
          </>
        )}

        {/* ── Video background ── */}
        {bg.type === 'video' && (
          <>
            {bg.video && (
              <div className={'pb-prop-row pb-full'}>
                <div className={'pb-bg-media-preview'}>
                  <video src={bg.video} muted loop autoPlay playsInline />
                </div>
              </div>
            )}
            <div className={'pb-prop-row pb-full'}>
              <label>{bg.video ? 'Replace Video' : 'Video'}</label>
              <button
                className={'pb-img-action-btn pb-img-upload-btn'}
                disabled={bgVideoUploading}
                onClick={() => bgVideoFileRef.current?.click()}
              >
                {bgVideoStatus ? UPLOAD_STAGE_LABEL[bgVideoStatus] : 'Upload'}
              </button>
              <input
                ref={bgVideoFileRef}
                type="file"
                accept="video/*"
                style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; e.target.value = ''; if (f) void handleBgVideoUpload(f); }}
              />
              {bgVideoError && <div className={'pb-img-upload-error'} role="alert">{bgVideoError}</div>}
            </div>
            <div className={'pb-prop-row pb-full'}>
              <label>Background Source</label>
              <PbInput type="text" value={bg.video ?? ''} placeholder="https://....mp4"
                onFocus={onNumberFocus} onBlur={onNumberBlur}
                onChange={e => updateBg({ video: e.target.value })} />
            </div>
            <VideoPlaybackFields bg={bg} onChange={updateBg} />
            <div className={'pb-prop-row'}>
              <label>Position</label>
              <PbSelect value={bg.position || 'center'}
                options={BG_IMAGE_POSITION_OPTIONS}
                onChange={v => updateBg({ position: v })} />
            </div>
            <div className={'pb-prop-row'}>
              <label>Fallback</label>
              <ColorField
                value={bg.color.startsWith('#') ? bg.color : '#000000'}
                onChange={v => updateBg({ color: v })}
                onFocus={onNumberFocus} onBlur={onNumberBlur}
                swatches={swatches} />
            </div>
            {bg.video && (
              <div className={'pb-prop-row pb-full'}>
                <PbButton variant="outline" onClick={() => { onPushSnapshot(snapshot); updateBg({ type: 'solid', video: '' }); }}>
                  Remove video
                </PbButton>
              </div>
            )}
          </>
        )}

        {/* Overlay — available on image/video backgrounds */}
        {(bg.type === 'image' || bg.type === 'video') && (bg.image || bg.video) && (
          <>
            <div className={'pb-prop-row'}>
              <label>Overlay</label>
              <PbInput type="number" value={bg.overlay ?? 0} min={0} max={1} step={0.05}
                onFocus={onNumberFocus} onBlur={onNumberBlur}
                onChange={e => updateBg({ overlay: Math.max(0, Math.min(1, Number(e.target.value))) })} />
            </div>
            {(bg.overlay ?? 0) > 0 && (
              <div className={'pb-prop-row'}>
                <label>Overlay Color</label>
                <ColorField
                  value={bg.overlayColor ?? '#000000'}
                  onChange={v => updateBg({ overlayColor: v })}
                  onFocus={onNumberFocus}
                  onBlur={onNumberBlur}
                  swatches={swatches}
                />
              </div>
            )}
          </>
        )}
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

      {/* ── Space ── */}
      <CollapsibleSection sectionKey="spacing" label="Space" isOpen={sec('spacing')} onToggle={toggle}>
        <SpacingEditor
          margin={secMargin}
          onMarginChange={(k, v) => updateSecMargin({ [k]: v })}
          padding={effPad}
          onPaddingChange={(k, v) => updateBpPad(k, v)}
          onFocus={onNumberFocus}
          onBlur={onNumberBlur}
        />
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


      <ImagePickerModal
        isOpen={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onSelect={url => { onPushSnapshot(snapshot); updateBg({ type: 'image', image: url }); }}
      />

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

      {showToFreeModal && (
        <Modal
          title="Switch to Free layout?"
          confirmLabel="Convert"
          onConfirm={() => {
            setShowToFreeModal(false);
            onPushSnapshot(snapshot);
            onUpdateSection(section.id, { layoutMode: 'free' });
          }}
          onCancel={() => setShowToFreeModal(false)}
        >
          <p className="pb-modal-message">
            All grid cells and their content will be removed. This cannot be undone.
          </p>
        </Modal>
      )}
    </aside>
  );
}

import type { ReactNode } from 'react';
import type {
  Breakpoint, BuilderState, CanvasElement, ElementBackground,
  Border, Padding, Shadow, BreakpointOverride, BgType, ElementHover,
} from '../../types';

import { CollapsibleSection } from './CollapsibleSection';
import { ColorField, PxInput, BorderEditor, ShadowEditor, SpacingEditor, VisibilityEditor } from './PanelFields';
import { PbSelect } from '../PbSelect';
import { PbInput } from '../PbInput';
import { BG_TYPE_OPTIONS, IMAGE_POSITION_OPTIONS } from '../../utils/selectOptions';

interface Props {
  element: CanvasElement;
  id: string;
  breakpoint: Breakpoint;
  isInGridCell: boolean;
  sec: (key: string) => boolean;
  toggleSection: (key: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  snapshot: BuilderState;
  onPushSnapshot: (s: BuilderState) => void;
  changeBg: (b: Partial<ElementBackground>) => void;
  changeBorder: (b: Partial<Border>) => void;
  changePad: (p: Partial<Padding>) => void;
  changeMargin: (p: Partial<Padding>) => void;
  changeShadow: (s: Partial<Shadow>) => void;
  changeHover: (h: Partial<ElementHover>) => void;
  changeLayout: (l: Partial<import('../../types').ElementLayout>) => void;
  commitChange: (updates: Partial<CanvasElement>) => void;
  allBpBadge: ReactNode;
  swatches: string[];
  onUpdateResponsive?: (id: string, bp: Breakpoint, updates: Partial<BreakpointOverride>) => void;
}

export function ElementPanelStyle({
  element, id, isInGridCell,
  sec, toggleSection,
  onFocus, onBlur, snapshot, onPushSnapshot,
  changeBg, changeBorder, changePad, changeMargin, changeShadow, changeHover, changeLayout,
  commitChange, allBpBadge, swatches, onUpdateResponsive,
}: Props) {
  const elBg = element.style.background;
  const bgColor = elBg.color.startsWith('#') ? elBg.color : '#ffffff';
  const hover = element.style.hover ?? { enabled: false, transitionDuration: 200 };

  return (
    <>
      {/* ── Background (not image / video / divider / spacer) ── */}
      {!['image', 'video', 'divider', 'spacer'].includes(element.type) && (
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
      )}

      {/* ── Hover (buttons only — Phase 1) ── */}
      {element.type === 'button' && (
        <CollapsibleSection sectionKey="hover" label={<>Hover {allBpBadge}</>}
          isOpen={sec('hover')} onToggle={toggleSection}>
          <div className={'pb-prop-row pb-vis-row'}>
            <label>Enable Hover Effect</label>
            <input type="checkbox" checked={hover.enabled}
              onChange={e => commitChange({ style: { ...element.style, hover: { ...hover, enabled: e.target.checked } } })} />
          </div>
          {hover.enabled && (
            <>
              <div className={'pb-prop-row'}>
                <label>Background Color</label>
                <ColorField value={hover.backgroundColor ?? bgColor}
                  onChange={v => changeHover({ backgroundColor: v })}
                  onFocus={onFocus} onBlur={onBlur} swatches={swatches} />
              </div>
              <div className={'pb-prop-row'}>
                <label>Text Color</label>
                <ColorField value={hover.textColor ?? element.style.typography.color}
                  onChange={v => changeHover({ textColor: v })}
                  onFocus={onFocus} onBlur={onBlur} swatches={swatches} />
              </div>
              <div className={'pb-prop-row'}>
                <label>Transition Duration</label>
                <PxInput value={hover.transitionDuration} unit="ms" min={0} step={50}
                  onFocus={onFocus} onBlur={onBlur}
                  onChange={v => changeHover({ transitionDuration: Math.max(0, v) })} />
              </div>
            </>
          )}
        </CollapsibleSection>
      )}

      {/* ── Border ── */}
      <CollapsibleSection sectionKey="border" label={<>Border {allBpBadge}</>}
        isOpen={sec('border')} onToggle={toggleSection}>
        <BorderEditor border={element.style.border} onChange={changeBorder} onFocus={onFocus} onBlur={onBlur} swatches={swatches} />
      </CollapsibleSection>

      {/* ── Spacing ──
           Margin: only meaningful in grid flow (not free-section, not overlay-in-cell).
           Padding: only for text/button/icon/box/form.
           Hide entire section for spacer, and for absolutely-positioned elements with no padding. */}
      {(() => {
        const inGridFlow = isInGridCell && !element.overlayInCell;
        const showPad = ['text', 'button', 'icon', 'box', 'form'].includes(element.type);
        const showSection = element.type !== 'spacer' && (inGridFlow || showPad);
        if (!showSection) return null;
        return (
          <CollapsibleSection sectionKey="spacing" label={<>Spacing {allBpBadge}</>}
            isOpen={sec('spacing')} onToggle={toggleSection}>
            <SpacingEditor
              margin={inGridFlow ? (element.style.margin ?? {}) : undefined}
              onMarginChange={inGridFlow ? (k, v) => changeMargin({ [k]: v }) : undefined}
              padding={showPad ? element.style.padding : undefined}
              onPaddingChange={showPad ? (k, v) => changePad({ [k]: v }) : undefined}
              onFocus={onFocus} onBlur={onBlur}
            />
          </CollapsibleSection>
        );
      })()}

      {/* ── Shadow (not divider / spacer) ── */}
      {!['divider', 'spacer'].includes(element.type) && (
        <CollapsibleSection sectionKey="shadow" label={<>Shadow {allBpBadge}</>}
          isOpen={sec('shadow')} onToggle={toggleSection}>
          <ShadowEditor shadow={element.style.shadow} onChange={changeShadow} onFocus={onFocus} onBlur={onBlur} swatches={swatches} />
        </CollapsibleSection>
      )}

      {/* ── Advanced (not spacer) ── */}
      {element.type !== 'spacer' && (
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
              onClick={() => { onPushSnapshot(snapshot); commitChange({ state: { ...element.state, locked: !element.state.locked } }); }}
            >{element.state.locked ? 'Locked' : 'Unlocked'}</button>
          </div>
        </CollapsibleSection>
      )}

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
    </>
  );
}

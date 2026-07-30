import type { ReactNode } from 'react';
import type {
  Breakpoint, BuilderState, CanvasElement, SectionBackground,
  Border, Padding, Shadow, BreakpointOverride, ElementHover, SiteTheme,
} from '../../types';

import { CollapsibleSection } from './CollapsibleSection';
import { CheckboxField, ColorField, PxInput, BorderEditor, ShadowEditor, SpacingEditor, VisibilityEditor, BackgroundEditor } from './PanelFields';

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
  changeBg: (b: Partial<SectionBackground>) => void;
  changeBorder: (b: Partial<Border>) => void;
  changePad: (p: Partial<Padding>) => void;
  changeMargin: (p: Partial<Padding>) => void;
  changeShadow: (s: Partial<Shadow>) => void;
  changeHover: (h: Partial<ElementHover>) => void;
  changeLayout: (l: Partial<import('../../types').ElementLayout>) => void;
  commitChange: (updates: Partial<CanvasElement>) => void;
  allBpBadge: ReactNode;
  swatches: string[];
  theme: SiteTheme;
  onUpdateResponsive?: (id: string, bp: Breakpoint, updates: Partial<BreakpointOverride>) => void;
}

export function ElementPanelStyle({
  element, id, isInGridCell,
  sec, toggleSection,
  onFocus, onBlur, snapshot, onPushSnapshot,
  changeBg, changeBorder, changePad, changeMargin, changeShadow, changeHover, changeLayout,
  commitChange, allBpBadge, swatches, theme, onUpdateResponsive,
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
          <BackgroundEditor
            bg={elBg}
            onChange={changeBg}
            onPushSnapshot={() => onPushSnapshot(snapshot)}
            onFocus={onFocus} onBlur={onBlur}
            theme={theme}
          />
        </CollapsibleSection>
      )}

      {/* ── Hover (buttons only — Phase 1) ── */}
      {element.type === 'button' && (
        <CollapsibleSection sectionKey="hover" label={<>Hover {allBpBadge}</>}
          isOpen={sec('hover')} onToggle={toggleSection}>
          <CheckboxField label="Enable Hover Effect" checked={hover.enabled} className="pb-vis-row"
            onChange={v => commitChange({ style: { ...element.style, hover: { ...hover, enabled: v } } })} />
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
          <CollapsibleSection sectionKey="spacing" label={<>Space {allBpBadge}</>}
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

import { useFocusSnapshot } from '../../hooks/useFocusSnapshot';
import { BREAKPOINT_WIDTHS } from '../Canvas';
import type {
  Breakpoint, CanvasElement, BuilderState,
  BreakpointOverride, SectionBackground, ElementContent,
  Border, Padding, Shadow, Typography,
  FlexWidthMode, NodeMap, SiteTheme, Page,
} from '../../types';
import { applyBreakpoint, CANVAS_W } from '../../hooks/useBuilderStore';
import { isFreeSection } from '../../utils/nodeHelpers';
import { themeToSwatches } from './PanelFields';

import { CollapsibleSection, usePanelSections } from './CollapsibleSection';
import { PanelHeader } from './PanelHeader';
import { PbInput } from '../PbInput';
import { PbSelect } from '../PbSelect';
import { FLEX_WIDTH_MODE_WITH_SAME_OPTIONS, ALIGN_SELF_OPTIONS } from '../../utils/selectOptions';
import { ElementPanelContent } from './ElementPanelContent';
import { ElementPanelStyle } from './ElementPanelStyle';

const ELEMENT_SECTION_DEFAULTS: Record<string, boolean> = {
  layout: true, sizing: true,
  typography: true, image: true, video: true, icon: true,
  form: true, action: true,
  background: true, hover: true, border: true, spacing: true,
  shadow: false, interactions: false,
  advanced: false, responsive: false,
};

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
  const { sec, toggle: toggleSection } = usePanelSections(ELEMENT_SECTION_DEFAULTS, 'builder-sidebar-el');

  const id = element.id;

  const change = (updates: Partial<CanvasElement>) => onUpdate(id, updates);
  const changeBg     = (b: Partial<SectionBackground>) => change({ style: { ...element.style, background: { ...element.style.background, ...b } } });
  const changeBorder = (b: Partial<Border>) => change({ style: { ...element.style, border: { ...element.style.border, ...b } } });
  const changePad    = (p: Partial<Padding>) => change({ style: { ...element.style, padding: { ...element.style.padding, ...p } } });
  const changeMargin = (p: Partial<Padding>) => change({ style: { ...element.style, margin: { ...element.style.margin, ...p } } });
  const changeShadow = (s: Partial<Shadow>) => change({ style: { ...element.style, shadow: { ...element.style.shadow, ...s } } });
  const changeHover  = (h: Partial<import('../../types').ElementHover>) => change({ style: { ...element.style, hover: { enabled: false, transitionDuration: 200, ...element.style.hover, ...h } } });
  const changeTypo   = (t: Partial<Typography>) => change({ style: { ...element.style, typography: { ...element.style.typography, ...t } } });
  const changeLayout = (l: Partial<import('../../types').ElementLayout>) => change({ layout: { ...element.layout, ...l } });
  const changeContent = (c: Partial<ElementContent>) => change({ content: { ...element.content, ...c } });
  const changeResp = (updates: Partial<BreakpointOverride>) => {
    if (breakpoint !== 'desktop' && onUpdateResponsive) {
      onUpdateResponsive(id, breakpoint, updates);
    } else {
      if (updates.layout) change({ layout: { ...element.layout, ...updates.layout } });
      if (updates.style?.typography) changeTypo(updates.style.typography);
      if (updates.flexLayout) change({ flexLayout: { ...element.flexLayout, ...updates.flexLayout } });
      if (updates.state) change({ state: { ...element.state, ...updates.state } });
    }
  };

  const respOverrides = breakpoint === 'tablet' ? element.responsive.tablet
    : breakpoint === 'mobile' ? element.responsive.mobile : undefined;

  const bpScale = BREAKPOINT_WIDTHS[breakpoint] / CANVAS_W;
  const eff = applyBreakpoint(element, breakpoint, bpScale);
  const parentNode = nodes[element.parent];
  const isInFreeSection = !isInGridCell && !!parentNode && isFreeSection(parentNode);

  const { onFocus, onBlur, isFocused } = useFocusSnapshot(snapshot, onPushSnapshot);
  const commitChange = (updates: Partial<CanvasElement>) => { onPushSnapshot(snapshot); change(updates); };
  const commitResp   = (updates: Partial<BreakpointOverride>) => { onPushSnapshot(snapshot); changeResp(updates); };

  const allBpBadge = breakpoint !== 'desktop'
    ? <span className={'pb-desktop-only-badge'} style={{ marginLeft: 6 }}>all bp</span>
    : null;

  const ELEMENT_TYPE_LABELS: Record<string, string> = {
    text: 'Text', image: 'Image', button: 'Button', box: 'Box',
    divider: 'Divider', video: 'Video', spacer: 'Spacer', icon: 'Icon', form: 'Form',
  };
  const elementLabel = ELEMENT_TYPE_LABELS[element.type] ?? element.type;
  const minSize = element.type === 'divider' ? 1 : 20;

  return (
    <aside className={'pb-right-sidebar pb-flex-col'}>
      <PanelHeader title={elementLabel} />

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
            {!isInFreeSection && (
              <div className={'pb-prop-row'}>
                <label>Full Width</label>
                <input type="checkbox" checked={!!element.layout.fullWidth}
                  onChange={e => commitChange({ layout: { ...element.layout, fullWidth: e.target.checked || undefined, x: 0 } })} />
              </div>
            )}
            {!element.layout.fullWidth && (() => {
              const xMode = (breakpoint === 'desktop' && element.layout.xPercent != null) ? 'percent' : 'px';
              return (
                <div className={'pb-prop-row'}>
                  <label>X</label>
                  {xMode === 'percent' ? (
                    <PbInput type="number" value={element.layout.xPercent!} step={0.1} onFocus={onFocus} onBlur={onBlur}
                      onChange={e => changeLayout({ xPercent: Number(e.target.value) })} />
                  ) : (
                    <PbInput type="number" value={eff.layout.x} onFocus={onFocus} onBlur={onBlur}
                      onChange={e => changeResp({ layout: { x: Number(e.target.value) } })} />
                  )}
                  {breakpoint === 'desktop' && (
                    <div className={'pb-unit-tabs'}>
                      <button className={['pb-unit-tab', xMode === 'px' ? 'pb-unit-tab--active' : ''].filter(Boolean).join(' ')}
                        onClick={() => xMode === 'percent' && commitChange({ layout: { ...element.layout, xPercent: undefined, x: Math.round(element.layout.xPercent! / 100 * CANVAS_W) } })}>px</button>
                      <button className={['pb-unit-tab', xMode === 'percent' ? 'pb-unit-tab--active' : ''].filter(Boolean).join(' ')}
                        onClick={() => xMode === 'px' && commitChange({ layout: { ...element.layout, xPercent: +(element.layout.x / CANVAS_W * 100).toFixed(1) } })}>%</button>
                    </div>
                  )}
                </div>
              );
            })()}
            <div className={'pb-prop-row'}>
              <label>Y</label>
              <PbInput type="number" value={eff.layout.y} onFocus={onFocus} onBlur={onBlur}
                onChange={e => changeResp({ layout: { y: Number(e.target.value) } })} />
            </div>
            {element.type !== 'divider' && !element.layout.fullWidth && (() => {
              const wMode = (breakpoint === 'desktop' && element.layout.widthPercent != null) ? 'percent' : 'px';
              return (
                <div className={'pb-prop-row'}>
                  <label>Width</label>
                  {wMode === 'percent' ? (
                    <PbInput type="number" value={element.layout.widthPercent!} step={0.1} onFocus={onFocus} onBlur={onBlur}
                      onChange={e => changeLayout({ widthPercent: Number(e.target.value) })} />
                  ) : (
                    <PbInput type="number" value={eff.layout.width} min={minSize} onFocus={onFocus} onBlur={onBlur}
                      onChange={e => changeResp({ layout: { width: Math.max(minSize, Number(e.target.value)) } })} />
                  )}
                  {breakpoint === 'desktop' && (
                    <div className={'pb-unit-tabs'}>
                      <button className={['pb-unit-tab', wMode === 'px' ? 'pb-unit-tab--active' : ''].filter(Boolean).join(' ')}
                        onClick={() => wMode === 'percent' && commitChange({ layout: { ...element.layout, widthPercent: undefined, width: Math.round(element.layout.widthPercent! / 100 * CANVAS_W) } })}>px</button>
                      <button className={['pb-unit-tab', wMode === 'percent' ? 'pb-unit-tab--active' : ''].filter(Boolean).join(' ')}
                        onClick={() => wMode === 'px' && commitChange({ layout: { ...element.layout, widthPercent: +(element.layout.width / CANVAS_W * 100).toFixed(1) } })}>%</button>
                    </div>
                  )}
                </div>
              );
            })()}
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
              <PbInput type="number" value={eff.layout.x} onFocus={onFocus} onBlur={onBlur}
                onChange={e => changeResp({ layout: { x: Number(e.target.value) } })} />
            </div>
            <div className={'pb-prop-row'}>
              <label>Y</label>
              <PbInput type="number" value={eff.layout.y} onFocus={onFocus} onBlur={onBlur}
                onChange={e => changeResp({ layout: { y: Number(e.target.value) } })} />
            </div>
            <div className={'pb-prop-row'}>
              <label>Width</label>
              <PbInput type="number" value={eff.layout.width} min={minSize} onFocus={onFocus} onBlur={onBlur}
                onChange={e => changeResp({ layout: { width: Math.max(minSize, Number(e.target.value)) } })} />
            </div>
          </>
        )}
        {element.type !== 'divider' && !(isInGridCell && !element.overlayInCell && (element.type === 'text' || element.type === 'button')) && !(isInGridCell && !element.overlayInCell && (element.type === 'image' || element.type === 'box')) && (
          <div className={'pb-prop-row'}>
            <label>{!isInGridCell ? 'Height' : element.type === 'video' ? 'Height' : 'Min Height'}</label>
            <PbInput type="number" value={eff.layout.height} min={0} onFocus={onFocus} onBlur={onBlur}
              onChange={e => changeResp({ layout: { height: Math.max(0, Number(e.target.value)) } })} />
          </div>
        )}
        {element.type !== 'spacer' && (
          <div className={'pb-prop-row'}>
            <label>Opacity</label>
            <PbInput type="number" value={element.style.opacity} min={0} max={1} step={0.05}
              onFocus={onFocus} onBlur={onBlur}
              onChange={e => change({ style: { ...element.style, opacity: Math.max(0, Math.min(1, Number(e.target.value))) } })} />
          </div>
        )}
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
          <CollapsibleSection sectionKey="sizing" label="Size" isOpen={sec('sizing')} onToggle={toggleSection}>
            {breakpoint === 'desktop' && (
              <div className={'pb-prop-row'}>
                <label>Width</label>
                <PbSelect size="sm" value={sizingValue} options={sizingOptions} onChange={applySizing} />
              </div>
            )}
            {breakpoint === 'desktop' && (widthMode === 'fixed' || widthMode === 'percent') && (
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
            {element.type === 'image' && (
              <div className={'pb-prop-row'}>
                <label>Height</label>
                <PbInput type="number" value={eff.layout.height} min={0} onFocus={onFocus} onBlur={onBlur}
                  onChange={e => changeResp({ layout: { height: Math.max(0, Number(e.target.value)) } })} />
              </div>
            )}
            {element.type === 'box' && (
              <div className={'pb-prop-row'}>
                <label>Min Height</label>
                <PbInput type="number" value={eff.layout.height} min={0} onFocus={onFocus} onBlur={onBlur}
                  onChange={e => changeResp({ layout: { height: Math.max(0, Number(e.target.value)) } })} />
              </div>
            )}
            <div className={'pb-prop-row'}>
              <label>Align</label>
              <PbSelect size="sm" value={eff.flexLayout.alignSelf}
                options={ALIGN_SELF_OPTIONS}
                onChange={v => commitResp({ flexLayout: { alignSelf: v as typeof element.flexLayout.alignSelf } })} />
            </div>
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

      <ElementPanelContent
        element={element} eff={eff} id={id} breakpoint={breakpoint}
        sec={sec} toggleSection={toggleSection}
        onFocus={onFocus} onBlur={onBlur} isFocused={isFocused}
        snapshot={snapshot} onPushSnapshot={onPushSnapshot}
        onUpdate={onUpdate} change={change}
        changeContent={changeContent} changeTypo={changeTypo}
        changeLayout={changeLayout} changeResp={changeResp}
        commitChange={commitChange} commitResp={commitResp}
        swatches={swatches} nodes={nodes} pages={pages}
        isInGridCell={isInGridCell} minSize={minSize}
      />

      <ElementPanelStyle
        element={element} id={id} breakpoint={breakpoint} isInGridCell={isInGridCell}
        sec={sec} toggleSection={toggleSection}
        onFocus={onFocus} onBlur={onBlur}
        snapshot={snapshot} onPushSnapshot={onPushSnapshot}
        changeBg={changeBg} changeBorder={changeBorder}
        changePad={changePad} changeMargin={changeMargin}
        changeShadow={changeShadow} changeLayout={changeLayout}
        changeHover={changeHover}
        commitChange={commitChange}
        allBpBadge={allBpBadge} swatches={swatches} theme={theme}
        onUpdateResponsive={onUpdateResponsive}
      />
    </aside>
  );
}

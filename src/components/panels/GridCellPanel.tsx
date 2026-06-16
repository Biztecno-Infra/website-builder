import { useEffect, useState } from 'react';
import { useFocusSnapshot } from '../../hooks/useFocusSnapshot';
import type {
  Breakpoint, BuilderState, GridCell, NodeMap,
  CellLayoutMode, SiteTheme,
} from '../../types';

import { Icon } from '../Icon';
import { CollapsibleSection, usePanelSections } from './CollapsibleSection';
import { BackgroundEditor, PxInput, ToggleGroup, BorderEditor, VisibilityEditor, themeToSwatches } from './PanelFields';
import { PanelHeader } from './PanelHeader';
import { PbSelect } from '../PbSelect';
import { PbInput } from '../PbInput';
import {
  FLEX_JUSTIFY_OPTIONS,
  FLEX_ALIGN_OPTIONS,
} from '../../utils/selectOptions';
import { resolveResponsive, isBreakpointOverridden } from '../../utils/responsive';

const CELL_PANEL_DEFAULTS: Record<string, boolean> = {
  columnSpan: true,
  layout: true,
  minHeight: true,
  background: true,
  border: true,
  rowSpan: false,
  visibility: false,
};

interface Props {
  gridCell: GridCell;
  nodes: NodeMap;
  snapshot: BuilderState;
  onUpdateGridCell: (id: string, updates: Partial<GridCell>) => void;
  onDeleteGridCell?: (id: string) => void;
  onPushSnapshot: (snapshot: BuilderState) => void;
  breakpoint?: Breakpoint;
  theme: SiteTheme;
}

export function GridCellPanel({
  gridCell: gc, nodes, snapshot,
  onUpdateGridCell, onDeleteGridCell,
  onPushSnapshot, breakpoint = 'desktop', theme,
}: Props) {
  const swatches = themeToSwatches(theme);
  const [renderedHeight, setRenderedHeight] = useState<number | null>(null);

  useEffect(() => {
    const el = document.querySelector(`[data-grid-cell-id="${gc.id}"]`);
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const h = entries[0]?.contentRect.height;
      if (h !== undefined) setRenderedHeight(Math.round(h));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [gc.id]);
  const { onFocus: gcFocus, onBlur: gcBlur } = useFocusSnapshot(snapshot, onPushSnapshot);
  const { sec, toggle } = usePanelSections(CELL_PANEL_DEFAULTS, 'builder-sidebar-cell');

  const { style, responsive } = gc;
  const isDesktop = breakpoint === 'desktop';

  // Writes a single style property into the cell at the correct breakpoint.
  const writeCellProp = (key: string, v: unknown) => {
    onPushSnapshot(snapshot);
    if (isDesktop) {
      onUpdateGridCell(gc.id, { style: { ...style, [key]: v } as typeof style });
    } else if (breakpoint === 'tablet') {
      onUpdateGridCell(gc.id, { responsive: { ...responsive, tablet: { ...responsive.tablet, [key]: v } as typeof responsive.tablet } });
    } else {
      onUpdateGridCell(gc.id, { responsive: { ...responsive, mobile: { ...responsive.mobile, [key]: v } as typeof responsive.mobile } });
    }
  };

  // Removes a breakpoint override for a single style property.
  const clearCellProp = (key: string) => {
    onPushSnapshot(snapshot);
    if (breakpoint === 'tablet') {
      const { [key]: _, ...rest } = (responsive.tablet ?? {}) as Record<string, unknown>;
      onUpdateGridCell(gc.id, { responsive: { ...responsive, tablet: Object.keys(rest).length ? rest as typeof responsive.tablet : undefined } });
    } else if (breakpoint === 'mobile') {
      const { [key]: _, ...rest } = (responsive.mobile ?? {}) as Record<string, unknown>;
      onUpdateGridCell(gc.id, { responsive: { ...responsive, mobile: Object.keys(rest).length ? rest as typeof responsive.mobile : undefined } });
    }
  };

  type JustifyVal = typeof style.justifyContent;
  type AlignVal = typeof style.alignItems;

  const effMode    = resolveResponsive(breakpoint, style.layoutMode, responsive.tablet?.layoutMode, responsive.mobile?.layoutMode);
  const effJustify = resolveResponsive(breakpoint, style.justifyContent, responsive.tablet?.justifyContent, responsive.mobile?.justifyContent);
  const effAlign   = resolveResponsive(breakpoint, style.alignItems, responsive.tablet?.alignItems, responsive.mobile?.alignItems);

  const modeIsOverridden    = isBreakpointOverridden(breakpoint, responsive.tablet?.layoutMode, responsive.mobile?.layoutMode);
  const justifyIsOverridden = isBreakpointOverridden(breakpoint, responsive.tablet?.justifyContent, responsive.mobile?.justifyContent);
  const alignIsOverridden   = isBreakpointOverridden(breakpoint, responsive.tablet?.alignItems, responsive.mobile?.alignItems);

  const setCurrentMode    = (v: CellLayoutMode) => writeCellProp('layoutMode', v);
  const setCurrentJustify = (v: JustifyVal) => writeCellProp('justifyContent', v);
  const setCurrentAlign   = (v: AlignVal) => writeCellProp('alignItems', v);
  const resetModeOverride    = () => clearCellProp('layoutMode');
  const resetJustifyOverride = () => clearCellProp('justifyContent');
  const resetAlignOverride   = () => clearCellProp('alignItems');

  // Card mode: cell has a visible border and non-transparent background
  const isCard = (gc.style.border?.width ?? 0) > 0 && gc.style.border?.style !== 'none';

  const toggleCard = () => {
    onPushSnapshot(snapshot);
    if (isCard) {
      // Remove card style
      onUpdateGridCell(gc.id, {
        style: {
          ...gc.style,
          background: { ...gc.style.background, color: 'transparent' },
          border: { radius: 0, width: 0, color: '#cccccc', style: 'none' },
        },
      });
    } else {
      // Apply card style using theme colors
      onUpdateGridCell(gc.id, {
        style: {
          ...gc.style,
          background: { ...gc.style.background, color: theme.colors.background },
          border: { radius: 8, width: 1, color: theme.colors.light, style: 'solid' },
        },
      });
    }
  };

  return (
    <aside className={'pb-right-sidebar'}>
      <PanelHeader title="Grid Column">
        <button
          className={['pb-toolbar-btn pb-quick-btn', isCard && 'pb-active'].filter(Boolean).join(' ')}
          title={isCard ? 'Remove card style' : 'Apply card style (background + border)'}
          onClick={toggleCard}
        >{isCard ? '▪ Card' : '□ Card'}</button>
      </PanelHeader>

      {breakpoint !== 'desktop' && (
        <div className={`pb-bp-banner pb-bp-banner-${breakpoint}`}>
          {breakpoint === 'tablet' ? 'Tablet overrides (768px)' : 'Mobile overrides (375px)'}
        </div>
      )}

      {/* ── Column Span ── */}
      <CollapsibleSection sectionKey="columnSpan" label="Column Span" isOpen={sec('columnSpan')} onToggle={toggle}>
        <div className={['pb-prop-row', breakpoint === 'desktop' && 'pb-resp-row--active'].filter(Boolean).join(' ')}>
          <label>Desktop</label>
          <div className="pb-px-field">
            <PbInput type="number" value={gc.columnSpan} min={1} max={12}
              onFocus={gcFocus} onBlur={gcBlur}
              onChange={e => onUpdateGridCell(gc.id, { columnSpan: Math.max(1, Math.min(12, Number(e.target.value))) })} />
            <span className="pb-px-unit">/12</span>
          </div>
        </div>
        <div className={['pb-prop-row', breakpoint === 'tablet' && 'pb-resp-row--active'].filter(Boolean).join(' ')}>
          <label>Tablet</label>
          <div className="pb-px-field">
            <PbInput type="number" value={responsive.tablet?.columnSpan ?? gc.columnSpan} min={1} max={12}
              onFocus={gcFocus} onBlur={gcBlur}
              onChange={e => onUpdateGridCell(gc.id, { responsive: { ...responsive, tablet: { ...responsive.tablet, columnSpan: Math.max(1, Math.min(12, Number(e.target.value))) } } })} />
            <span className="pb-px-unit">/12</span>
          </div>
          {responsive.tablet?.columnSpan !== undefined && (
            <button className={'pb-resp-clear-btn'} title="Reset to desktop" onClick={() => {
              onPushSnapshot(snapshot);
              const { columnSpan: _cs, ...rest } = responsive.tablet ?? {};
              onUpdateGridCell(gc.id, { responsive: { ...responsive, tablet: Object.keys(rest).length ? rest : undefined } });
            }}>↺</button>
          )}
        </div>
        <div className={['pb-prop-row', breakpoint === 'mobile' && 'pb-resp-row--active'].filter(Boolean).join(' ')}>
          <label>Mobile</label>
          <div className="pb-px-field">
            <PbInput type="number" value={responsive.mobile?.columnSpan ?? gc.columnSpan} min={1} max={12}
              onFocus={gcFocus} onBlur={gcBlur}
              onChange={e => onUpdateGridCell(gc.id, { responsive: { ...responsive, mobile: { ...responsive.mobile, columnSpan: Math.max(1, Math.min(12, Number(e.target.value))) } } })} />
            <span className="pb-px-unit">/12</span>
          </div>
          {responsive.mobile?.columnSpan !== undefined && (
            <button className={'pb-resp-clear-btn'} title="Reset to desktop" onClick={() => {
              onPushSnapshot(snapshot);
              const { columnSpan: _cs, ...rest } = responsive.mobile ?? {};
              onUpdateGridCell(gc.id, { responsive: { ...responsive, mobile: Object.keys(rest).length ? rest : undefined } });
            }}>↺</button>
          )}
        </div>
        <div className={'pb-prop-row pb-quick-row'}>
          <label className={'pb-quick-label'}>Quick</label>
          <button className={'pb-resp-clear-btn pb-quick-btn'}
            title="Full width on tablet (span 12)"
            onClick={() => { onPushSnapshot(snapshot); onUpdateGridCell(gc.id, { responsive: { ...responsive, tablet: { ...responsive.tablet, columnSpan: 12 } } }); }}>
            Tab full</button>
          <button className={'pb-resp-clear-btn pb-quick-btn'}
            title="Full width on mobile (span 12)"
            onClick={() => { onPushSnapshot(snapshot); onUpdateGridCell(gc.id, { responsive: { ...responsive, mobile: { ...responsive.mobile, columnSpan: 12 } } }); }}>
            Mob full</button>
        </div>
      </CollapsibleSection>

      {/* ── Layout ── */}
      <CollapsibleSection sectionKey="layout" label="Layout" isOpen={sec('layout')} onToggle={toggle}>
        <div className={'pb-prop-row'}>
          <label>Direction</label>
          <ToggleGroup
            options={[
              { value: 'column', label: <Icon id="flexColumn" size={14} />, title: 'Column' },
              { value: 'row',    label: <Icon id="flexRow"    size={14} />, title: 'Row'    },
              { value: 'wrap',   label: <Icon id="flexWrap"   size={14} />, title: 'Wrap'   },
            ]}
            value={effMode}
            onChange={m => setCurrentMode(m as CellLayoutMode)}
          />
          {!isDesktop && modeIsOverridden && (
            <button className={'pb-resp-clear-btn'} title={`Reset to desktop (${style.layoutMode})`} onClick={resetModeOverride}>↺</button>
          )}
        </div>
        {!isDesktop && (
          <div className={'pb-resp-ref-row'}>
            <span className={'pb-resp-ref-label'}>Desktop:</span>
            <span className={'pb-resp-ref-value'}>{style.layoutMode}</span>
            {modeIsOverridden && <span className={'pb-resp-badge'}>overridden</span>}
          </div>
        )}
        <div className={'pb-prop-row'}>
          <label>Justify</label>
          <PbSelect value={effJustify}
            options={FLEX_JUSTIFY_OPTIONS}
            onChange={v => setCurrentJustify(v as JustifyVal)} />
          {!isDesktop && justifyIsOverridden && (
            <button className={'pb-resp-clear-btn'} title={`Reset to desktop (${style.justifyContent})`} onClick={resetJustifyOverride}>↺</button>
          )}
        </div>
        {!isDesktop && (
          <div className={'pb-resp-ref-row'}>
            <span className={'pb-resp-ref-label'}>Desktop:</span>
            <span className={'pb-resp-ref-value'}>{style.justifyContent}</span>
            {justifyIsOverridden && <span className={'pb-resp-badge'}>overridden</span>}
          </div>
        )}
        <div className={'pb-prop-row'}>
          <label>Align</label>
          <PbSelect value={effAlign}
            options={FLEX_ALIGN_OPTIONS}
            onChange={v => setCurrentAlign(v as AlignVal)} />
          {!isDesktop && alignIsOverridden && (
            <button className={'pb-resp-clear-btn'} title={`Reset to desktop (${style.alignItems})`} onClick={resetAlignOverride}>↺</button>
          )}
        </div>
        {!isDesktop && (
          <div className={'pb-resp-ref-row'}>
            <span className={'pb-resp-ref-label'}>Desktop:</span>
            <span className={'pb-resp-ref-value'}>{style.alignItems}</span>
            {alignIsOverridden && <span className={'pb-resp-badge'}>overridden</span>}
          </div>
        )}
        <div className={'pb-prop-row'}>
          <label>Elem. Gap</label>
          <PxInput value={style.gap}
            onFocus={gcFocus} onBlur={gcBlur}
            onChange={v => onUpdateGridCell(gc.id, { style: { ...style, gap: v } })} />
        </div>
        {/* Padding — responsive-aware. On tablet/mobile, writes to responsive override. */}
        {(() => {
          const bpPadOverride =
            breakpoint === 'mobile' ? responsive.mobile?.padding
            : breakpoint === 'tablet' ? responsive.tablet?.padding
            : undefined;
          const effPad = { ...style.padding, ...bpPadOverride };
          const padIsOverridden = isDesktop ? false : bpPadOverride !== undefined;

          const updatePad = (key: keyof typeof style.padding, val: number) => {
            if (isDesktop) {
              onUpdateGridCell(gc.id, { style: { ...style, padding: { ...style.padding, [key]: val } } });
            } else if (breakpoint === 'tablet') {
              onUpdateGridCell(gc.id, { responsive: { ...responsive, tablet: { ...responsive.tablet, padding: { ...responsive.tablet?.padding, [key]: val } } } });
            } else {
              onUpdateGridCell(gc.id, { responsive: { ...responsive, mobile: { ...responsive.mobile, padding: { ...responsive.mobile?.padding, [key]: val } } } });
            }
          };

          const clearPadOverride = () => {
            if (breakpoint === 'tablet') {
              const { padding: _p, ...rest } = responsive.tablet ?? {};
              onUpdateGridCell(gc.id, { responsive: { ...responsive, tablet: Object.keys(rest).length ? rest : undefined } });
            } else {
              const { padding: _p, ...rest } = responsive.mobile ?? {};
              onUpdateGridCell(gc.id, { responsive: { ...responsive, mobile: Object.keys(rest).length ? rest : undefined } });
            }
          };

          return (
            <>
              {(['top','right','bottom','left'] as const).map(side => (
                <div key={side} className={['pb-prop-row', padIsOverridden && 'pb-resp-row--active'].filter(Boolean).join(' ')}>
                  <label>Pad {side.charAt(0).toUpperCase() + side.slice(1)}</label>
                  <PbInput type="number" value={effPad[side]} min={0}
                    onFocus={gcFocus} onBlur={gcBlur}
                    onChange={e => updatePad(side, Number(e.target.value))} />
                </div>
              ))}
              {!isDesktop && padIsOverridden && (
                <div className={'pb-resp-ref-row'}>
                  <span className={'pb-resp-ref-label'}>Desktop: {style.padding.top}/{style.padding.right}/{style.padding.bottom}/{style.padding.left}</span>
                  <button className={'pb-resp-clear-btn'} onClick={clearPadOverride}>↺ Reset</button>
                </div>
              )}
            </>
          );
        })()}
      </CollapsibleSection>

      {/* ── Height ── */}
      <CollapsibleSection sectionKey="minHeight" label="Height" isOpen={sec('minHeight')} onToggle={toggle}>
          <div className={'pb-prop-row'}>
            <label>Min H</label>
            <PxInput value={style.minHeight ?? ''}
              placeholder={renderedHeight !== null ? String(renderedHeight) : 'auto'}
              onFocus={gcFocus} onBlur={gcBlur}
              onChange={v => onUpdateGridCell(gc.id, { style: { ...style, minHeight: v || undefined } })} />
          </div>
      </CollapsibleSection>

      {/* ── Background ── */}
      <CollapsibleSection sectionKey="background" label="Background" isOpen={sec('background')} onToggle={toggle}>
        <BackgroundEditor
          bg={style.background}
          onChange={updates => onUpdateGridCell(gc.id, { style: { ...style, background: { ...style.background, ...updates } } })}
          onPushSnapshot={() => onPushSnapshot(snapshot)}
          onFocus={gcFocus} onBlur={gcBlur}
          theme={theme}
        />
      </CollapsibleSection>

      {/* ── Border ── */}
      <CollapsibleSection sectionKey="border" label="Border" isOpen={sec('border')} onToggle={toggle}>
        <BorderEditor
          border={style.border ?? { radius: 0, width: 0, color: '#cccccc', style: 'none' }}
          onChange={updates => onUpdateGridCell(gc.id, { style: { ...style, border: { ...(style.border ?? { radius: 0, width: 0, color: '#cccccc', style: 'none' }), ...updates } } })}
          onFocus={gcFocus} onBlur={gcBlur}
          swatches={swatches}
        />
      </CollapsibleSection>

      {/* ── Row Span ── */}
      <CollapsibleSection sectionKey="rowSpan" label="Row Span" isOpen={sec('rowSpan')} onToggle={toggle}>
        <div className={'pb-prop-row'}>
          <label>Rows</label>
          <div className="pb-px-field">
            <PbInput type="number" value={gc.rowSpan ?? 1} min={1} max={6}
              onFocus={gcFocus} onBlur={gcBlur}
              onChange={e => onUpdateGridCell(gc.id, { rowSpan: Math.max(1, Math.min(6, Number(e.target.value))) })} />
            <span className="pb-px-unit">/6</span>
          </div>
        </div>
      </CollapsibleSection>

      {/* ── Visibility ── */}
      <CollapsibleSection sectionKey="visibility" label="Visibility" isOpen={sec('visibility')} onToggle={toggle}>
        <VisibilityEditor
          hideOnTablet={!!responsive.tablet?.hidden}
          hideOnMobile={!!responsive.mobile?.hidden}
          onTabletChange={checked => { onPushSnapshot(snapshot); onUpdateGridCell(gc.id, { responsive: { ...responsive, tablet: { ...responsive.tablet, hidden: checked || undefined } } }); }}
          onMobileChange={checked => { onPushSnapshot(snapshot); onUpdateGridCell(gc.id, { responsive: { ...responsive, mobile: { ...responsive.mobile, hidden: checked || undefined } } }); }}
        />
      </CollapsibleSection>

    </aside>
  );
}

import { useEffect, useRef, useState } from 'react';
import type {
  Breakpoint, BorderStyle, BuilderState, GridCell, NodeMap,
  CellLayoutMode, SiteTheme,
} from '../../types';
import { ThemeSwatches } from './ThemeSwatches';
import { CollapsibleSection, usePanelSections } from './CollapsibleSection';

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
  onAddGridCell?: (sectionId: string) => void;
  onPushSnapshot: (snapshot: BuilderState) => void;
  breakpoint?: Breakpoint;
  theme: SiteTheme;
}

export function GridCellPanel({
  gridCell: gc, nodes, snapshot,
  onUpdateGridCell, onDeleteGridCell, onAddGridCell,
  onPushSnapshot, breakpoint = 'desktop', theme,
}: Props) {
  const focusSnapshot = useRef<BuilderState | null>(null);
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
  const gcFocus = () => { if (!focusSnapshot.current) focusSnapshot.current = snapshot; };
  const gcBlur = () => { if (focusSnapshot.current) { onPushSnapshot(focusSnapshot.current); focusSnapshot.current = null; } };
  const { sec, toggle } = usePanelSections(CELL_PANEL_DEFAULTS, 'builder-sidebar-cell');

  const { style, responsive } = gc;
  const bgColor = style.background.color?.startsWith('#') ? style.background.color : '#ffffff';
  const isDesktop = breakpoint === 'desktop';

  const effMode: CellLayoutMode =
    breakpoint === 'tablet' ? (responsive.tablet?.layoutMode ?? style.layoutMode) :
    breakpoint === 'mobile' ? (responsive.mobile?.layoutMode ?? responsive.tablet?.layoutMode ?? style.layoutMode) :
    style.layoutMode;

  const modeIsOverridden =
    (breakpoint === 'tablet' && responsive.tablet?.layoutMode !== undefined) ||
    (breakpoint === 'mobile' && responsive.mobile?.layoutMode !== undefined);

  const setCurrentMode = (mode: CellLayoutMode) => {
    onPushSnapshot(snapshot);
    if (isDesktop) {
      onUpdateGridCell(gc.id, { style: { ...style, layoutMode: mode } });
    } else if (breakpoint === 'tablet') {
      onUpdateGridCell(gc.id, { responsive: { ...responsive, tablet: { ...responsive.tablet, layoutMode: mode } } });
    } else {
      onUpdateGridCell(gc.id, { responsive: { ...responsive, mobile: { ...responsive.mobile, layoutMode: mode } } });
    }
  };

  const resetModeOverride = () => {
    onPushSnapshot(snapshot);
    if (breakpoint === 'tablet') {
      const { layoutMode: _lm, ...rest } = responsive.tablet ?? {};
      onUpdateGridCell(gc.id, { responsive: { ...responsive, tablet: Object.keys(rest).length ? rest : undefined } });
    } else {
      const { layoutMode: _lm, ...rest } = responsive.mobile ?? {};
      onUpdateGridCell(gc.id, { responsive: { ...responsive, mobile: Object.keys(rest).length ? rest : undefined } });
    }
  };

  type JustifyVal = typeof style.justifyContent;
  type AlignVal = typeof style.alignItems;

  const effJustify: JustifyVal =
    breakpoint === 'tablet' ? (responsive.tablet?.justifyContent ?? style.justifyContent) :
    breakpoint === 'mobile' ? (responsive.mobile?.justifyContent ?? responsive.tablet?.justifyContent ?? style.justifyContent) :
    style.justifyContent;

  const effAlign: AlignVal =
    breakpoint === 'tablet' ? (responsive.tablet?.alignItems ?? style.alignItems) :
    breakpoint === 'mobile' ? (responsive.mobile?.alignItems ?? responsive.tablet?.alignItems ?? style.alignItems) :
    style.alignItems;

  const justifyIsOverridden =
    (breakpoint === 'tablet' && responsive.tablet?.justifyContent !== undefined) ||
    (breakpoint === 'mobile' && responsive.mobile?.justifyContent !== undefined);

  const alignIsOverridden =
    (breakpoint === 'tablet' && responsive.tablet?.alignItems !== undefined) ||
    (breakpoint === 'mobile' && responsive.mobile?.alignItems !== undefined);

  const setCurrentJustify = (v: JustifyVal) => {
    onPushSnapshot(snapshot);
    if (isDesktop) onUpdateGridCell(gc.id, { style: { ...style, justifyContent: v } });
    else if (breakpoint === 'tablet') onUpdateGridCell(gc.id, { responsive: { ...responsive, tablet: { ...responsive.tablet, justifyContent: v } } });
    else onUpdateGridCell(gc.id, { responsive: { ...responsive, mobile: { ...responsive.mobile, justifyContent: v } } });
  };

  const setCurrentAlign = (v: AlignVal) => {
    onPushSnapshot(snapshot);
    if (isDesktop) onUpdateGridCell(gc.id, { style: { ...style, alignItems: v } });
    else if (breakpoint === 'tablet') onUpdateGridCell(gc.id, { responsive: { ...responsive, tablet: { ...responsive.tablet, alignItems: v } } });
    else onUpdateGridCell(gc.id, { responsive: { ...responsive, mobile: { ...responsive.mobile, alignItems: v } } });
  };

  const resetJustifyOverride = () => {
    onPushSnapshot(snapshot);
    if (breakpoint === 'tablet') {
      const { justifyContent: _jc, ...rest } = responsive.tablet ?? {};
      onUpdateGridCell(gc.id, { responsive: { ...responsive, tablet: Object.keys(rest).length ? rest : undefined } });
    } else {
      const { justifyContent: _jc, ...rest } = responsive.mobile ?? {};
      onUpdateGridCell(gc.id, { responsive: { ...responsive, mobile: Object.keys(rest).length ? rest : undefined } });
    }
  };

  const resetAlignOverride = () => {
    onPushSnapshot(snapshot);
    if (breakpoint === 'tablet') {
      const { alignItems: _ai, ...rest } = responsive.tablet ?? {};
      onUpdateGridCell(gc.id, { responsive: { ...responsive, tablet: Object.keys(rest).length ? rest : undefined } });
    } else {
      const { alignItems: _ai, ...rest } = responsive.mobile ?? {};
      onUpdateGridCell(gc.id, { responsive: { ...responsive, mobile: Object.keys(rest).length ? rest : undefined } });
    }
  };

  return (
    <aside className={'pb-right-sidebar'}>
      <div className={'pb-panel-header'}>
        <span className={'pb-panel-header-title'}>Grid Column</span>
        {onDeleteGridCell && (
          <button
            className={'pb-panel-delete-btn'}
            title="Delete this column"
            onClick={() => {
              const parent = nodes[gc.parent];
              const siblings = (parent && 'children' in parent) ? (parent as { children: string[] }).children.length : 2;
              if (siblings <= 1) { alert('At least one column is required.'); return; }
              if (window.confirm('Delete this column and all its content?')) onDeleteGridCell(gc.id);
            }}
          >✕ Delete</button>
        )}
      </div>

      {breakpoint !== 'desktop' && (
        <div className={`pb-bp-banner pb-bp-banner-${breakpoint}`}>
          {breakpoint === 'tablet' ? '⬛ Tablet overrides (768px)' : '📱 Mobile overrides (375px)'}
        </div>
      )}

      {/* ── Column Span ── */}
      <CollapsibleSection sectionKey="columnSpan" label="Column Span" isOpen={sec('columnSpan')} onToggle={toggle}>
        <div className={['pb-prop-row', breakpoint === 'desktop' && 'pb-resp-row--active'].filter(Boolean).join(' ')}>
          <label>Desktop</label>
          <input type="number" value={gc.columnSpan} min={1} max={12}
            onFocus={gcFocus} onBlur={gcBlur}
            onChange={e => onUpdateGridCell(gc.id, { columnSpan: Math.max(1, Math.min(12, Number(e.target.value))) })} />
          <span style={{ fontSize: 11, color: '#888' }}>/12</span>
        </div>
        <div className={['pb-prop-row', breakpoint === 'tablet' && 'pb-resp-row--active'].filter(Boolean).join(' ')}>
          <label>Tablet</label>
          <input type="number" value={responsive.tablet?.columnSpan ?? gc.columnSpan} min={1} max={12}
            onFocus={gcFocus} onBlur={gcBlur}
            onChange={e => onUpdateGridCell(gc.id, { responsive: { ...responsive, tablet: { ...responsive.tablet, columnSpan: Math.max(1, Math.min(12, Number(e.target.value))) } } })} />
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
          <input type="number" value={responsive.mobile?.columnSpan ?? gc.columnSpan} min={1} max={12}
            onFocus={gcFocus} onBlur={gcBlur}
            onChange={e => onUpdateGridCell(gc.id, { responsive: { ...responsive, mobile: { ...responsive.mobile, columnSpan: Math.max(1, Math.min(12, Number(e.target.value))) } } })} />
          {responsive.mobile?.columnSpan !== undefined && (
            <button className={'pb-resp-clear-btn'} title="Reset to desktop" onClick={() => {
              onPushSnapshot(snapshot);
              const { columnSpan: _cs, ...rest } = responsive.mobile ?? {};
              onUpdateGridCell(gc.id, { responsive: { ...responsive, mobile: Object.keys(rest).length ? rest : undefined } });
            }}>↺</button>
          )}
        </div>
        <div className={'pb-prop-row'} style={{ gap: 4 }}>
          <label style={{ color: '#888', fontSize: 11 }}>Quick</label>
          <button className={'pb-resp-clear-btn'} style={{ flex: 1, padding: '3px 0', fontSize: 11 }}
            title="Full width on tablet (span 12)"
            onClick={() => { onPushSnapshot(snapshot); onUpdateGridCell(gc.id, { responsive: { ...responsive, tablet: { ...responsive.tablet, columnSpan: 12 } } }); }}>
            ⬛ Tab full</button>
          <button className={'pb-resp-clear-btn'} style={{ flex: 1, padding: '3px 0', fontSize: 11 }}
            title="Full width on mobile (span 12)"
            onClick={() => { onPushSnapshot(snapshot); onUpdateGridCell(gc.id, { responsive: { ...responsive, mobile: { ...responsive.mobile, columnSpan: 12 } } }); }}>
            📱 Mob full</button>
        </div>
      </CollapsibleSection>

      {/* ── Layout ── */}
      <CollapsibleSection sectionKey="layout" label="Layout" isOpen={sec('layout')} onToggle={toggle}>
        <div className={'pb-prop-row'}>
          <label>Mode</label>
          <div className={'pb-layout-mode-toggle'}>
            <button
              className={['pb-layout-mode-btn', effMode !== 'free' && 'pb-active'].filter(Boolean).join(' ')}
              onClick={() => {
                const fallback: CellLayoutMode = style.layoutMode !== 'free' ? style.layoutMode : 'column';
                setCurrentMode(fallback);
              }}
            >Flex</button>
            <button
              className={['pb-layout-mode-btn', effMode === 'free' && 'pb-active'].filter(Boolean).join(' ')}
              onClick={() => setCurrentMode('free')}
            >Free Canvas</button>
          </div>
          {!isDesktop && modeIsOverridden && (
            <button className={'pb-resp-clear-btn'} title={`Reset to desktop (${style.layoutMode})`} onClick={resetModeOverride}>↺</button>
          )}
        </div>
        {!isDesktop && (
          <div className={'pb-resp-ref-row'}>
            <span className={'pb-resp-ref-label'}>🖥 Desktop:</span>
            <span className={'pb-resp-ref-value'}>{style.layoutMode}</span>
            {modeIsOverridden && <span className={'pb-resp-badge'}>overridden</span>}
          </div>
        )}
        {effMode !== 'free' && (
          <div className={'pb-prop-row'}>
            <label>Direction</label>
            <div className={'pb-btn-group'}>
              {(['column', 'row', 'wrap'] as CellLayoutMode[]).map(m => (
                <button key={m}
                  className={effMode === m ? 'active' : ''}
                  onClick={() => setCurrentMode(m)}>
                  {m === 'column' ? '↕' : m === 'row' ? '↔' : '⤵'}
                </button>
              ))}
            </div>
          </div>
        )}
        {style.layoutMode === 'free' && (
          <>
            <div className={['pb-prop-row', breakpoint === 'desktop' && 'pb-resp-row--active'].filter(Boolean).join(' ')}>
              <label>Canvas H</label>
              <input type="number" min={80} step={8} value={gc.freeHeight ?? 320} style={{ width: 72 }}
                onChange={e => { onPushSnapshot(snapshot); onUpdateGridCell(gc.id, { freeHeight: Math.max(80, Number(e.target.value)) }); }} />
              <span style={{ fontSize: 12, color: '#888' }}>px</span>
            </div>
            <div className={['pb-prop-row', breakpoint === 'tablet' && 'pb-resp-row--active'].filter(Boolean).join(' ')}>
              <label>↳ Tab H</label>
              <input type="number" min={80} step={8} style={{ width: 72 }}
                value={responsive.tablet?.freeHeight ?? gc.freeHeight ?? 320}
                onChange={e => { onPushSnapshot(snapshot); onUpdateGridCell(gc.id, { responsive: { ...responsive, tablet: { ...responsive.tablet, freeHeight: Math.max(80, Number(e.target.value)) } } }); }} />
              <span style={{ fontSize: 12, color: '#888' }}>px</span>
              {responsive.tablet?.freeHeight !== undefined && (
                <button className={'pb-resp-clear-btn'} title="Reset" onClick={() => {
                  onPushSnapshot(snapshot);
                  const { freeHeight: _fh, ...rest } = responsive.tablet ?? {};
                  onUpdateGridCell(gc.id, { responsive: { ...responsive, tablet: Object.keys(rest).length ? rest : undefined } });
                }}>↺</button>
              )}
            </div>
            <div className={['pb-prop-row', breakpoint === 'mobile' && 'pb-resp-row--active'].filter(Boolean).join(' ')}>
              <label>↳ Mob H</label>
              <input type="number" min={80} step={8} style={{ width: 72 }}
                value={responsive.mobile?.freeHeight ?? responsive.tablet?.freeHeight ?? gc.freeHeight ?? 320}
                onChange={e => { onPushSnapshot(snapshot); onUpdateGridCell(gc.id, { responsive: { ...responsive, mobile: { ...responsive.mobile, freeHeight: Math.max(80, Number(e.target.value)) } } }); }} />
              <span style={{ fontSize: 12, color: '#888' }}>px</span>
              {responsive.mobile?.freeHeight !== undefined && (
                <button className={'pb-resp-clear-btn'} title="Reset" onClick={() => {
                  onPushSnapshot(snapshot);
                  const { freeHeight: _fh, ...rest } = responsive.mobile ?? {};
                  onUpdateGridCell(gc.id, { responsive: { ...responsive, mobile: Object.keys(rest).length ? rest : undefined } });
                }}>↺</button>
              )}
            </div>
          </>
        )}
        <div className={'pb-prop-row'} style={effMode === 'free' ? { opacity: 0.35, pointerEvents: 'none' } : undefined}>
          <label>Justify</label>
          <select value={effJustify} onChange={e => setCurrentJustify(e.target.value as JustifyVal)}>
            <option value="flex-start">Start</option>
            <option value="center">Center</option>
            <option value="flex-end">End</option>
            <option value="space-between">Space Between</option>
            <option value="space-around">Space Around</option>
          </select>
          {!isDesktop && justifyIsOverridden && (
            <button className={'pb-resp-clear-btn'} title={`Reset to desktop (${style.justifyContent})`} onClick={resetJustifyOverride}>↺</button>
          )}
        </div>
        {!isDesktop && (
          <div className={'pb-resp-ref-row'}>
            <span className={'pb-resp-ref-label'}>🖥 Desktop:</span>
            <span className={'pb-resp-ref-value'}>{style.justifyContent}</span>
            {justifyIsOverridden && <span className={'pb-resp-badge'}>overridden</span>}
          </div>
        )}
        <div className={'pb-prop-row'}>
          <label>Align</label>
          <select value={effAlign} onChange={e => setCurrentAlign(e.target.value as AlignVal)}>
            <option value="flex-start">Start</option>
            <option value="center">Center</option>
            <option value="flex-end">End</option>
            <option value="stretch">Stretch</option>
          </select>
          {!isDesktop && alignIsOverridden && (
            <button className={'pb-resp-clear-btn'} title={`Reset to desktop (${style.alignItems})`} onClick={resetAlignOverride}>↺</button>
          )}
        </div>
        {!isDesktop && (
          <div className={'pb-resp-ref-row'}>
            <span className={'pb-resp-ref-label'}>🖥 Desktop:</span>
            <span className={'pb-resp-ref-value'}>{style.alignItems}</span>
            {alignIsOverridden && <span className={'pb-resp-badge'}>overridden</span>}
          </div>
        )}
        <div className={'pb-prop-row'}>
          <label>Elem. Gap</label>
          <input type="number" value={style.gap} min={0}
            onFocus={gcFocus} onBlur={gcBlur}
            onChange={e => onUpdateGridCell(gc.id, { style: { ...style, gap: Number(e.target.value) } })} />
          <span style={{ fontSize: 11, color: '#888' }}>px</span>
        </div>
        <div className={'pb-prop-row'}>
          <label>Pad Top</label>
          <input type="number" value={style.padding.top} min={0}
            onFocus={gcFocus} onBlur={gcBlur}
            onChange={e => onUpdateGridCell(gc.id, { style: { ...style, padding: { ...style.padding, top: Number(e.target.value) } } })} />
        </div>
        <div className={'pb-prop-row'}>
          <label>Pad Right</label>
          <input type="number" value={style.padding.right} min={0}
            onFocus={gcFocus} onBlur={gcBlur}
            onChange={e => onUpdateGridCell(gc.id, { style: { ...style, padding: { ...style.padding, right: Number(e.target.value) } } })} />
        </div>
        <div className={'pb-prop-row'}>
          <label>Pad Bottom</label>
          <input type="number" value={style.padding.bottom} min={0}
            onFocus={gcFocus} onBlur={gcBlur}
            onChange={e => onUpdateGridCell(gc.id, { style: { ...style, padding: { ...style.padding, bottom: Number(e.target.value) } } })} />
        </div>
        <div className={'pb-prop-row'}>
          <label>Pad Left</label>
          <input type="number" value={style.padding.left} min={0}
            onFocus={gcFocus} onBlur={gcBlur}
            onChange={e => onUpdateGridCell(gc.id, { style: { ...style, padding: { ...style.padding, left: Number(e.target.value) } } })} />
        </div>
      </CollapsibleSection>

      {/* ── Height ── */}
      <CollapsibleSection sectionKey="minHeight" label="Height" isOpen={sec('minHeight')} onToggle={toggle}>
        {renderedHeight !== null && (
          <div className={'pb-prop-row'} style={{ marginBottom: 4 }}>
            <label style={{ color: '#888' }}>Actual</label>
            <span style={{ fontSize: 12, color: '#0b978e', fontWeight: 600 }}>{renderedHeight}px</span>
          </div>
        )}
        <div className={'pb-prop-row'}>
          <label>Min H</label>
          <input type="number" value={style.minHeight ?? 0} min={0}
            onFocus={gcFocus} onBlur={gcBlur}
            onChange={e => onUpdateGridCell(gc.id, { style: { ...style, minHeight: Number(e.target.value) || undefined } })} />
          <span style={{ fontSize: 11, color: '#888' }}>px</span>
        </div>
        <p style={{ margin: '4px 0 0', fontSize: 10, color: '#aaa', lineHeight: 1.4 }}>
          Drag bottom edge to resize. Content grows beyond this floor.
        </p>
      </CollapsibleSection>

      {/* ── Background ── */}
      <CollapsibleSection sectionKey="background" label="Background" isOpen={sec('background')} onToggle={toggle}>
        <div className={'pb-prop-row'}>
          <label>Color</label>
          <input type="color" value={bgColor}
            onChange={e => { onPushSnapshot(snapshot); onUpdateGridCell(gc.id, { style: { ...style, background: { ...style.background, color: e.target.value, type: 'solid' } } }); }} />
          <label className={'pb-transparent-label'}>
            <input type="checkbox" checked={style.background.color === 'transparent' || !style.background.color}
              onChange={e => { onPushSnapshot(snapshot); onUpdateGridCell(gc.id, { style: { ...style, background: { ...style.background, color: e.target.checked ? 'transparent' : '#ffffff' } } }); }} />
            {' '}None
          </label>
        </div>
        <ThemeSwatches colors={theme.colors} onPick={c => { onPushSnapshot(snapshot); onUpdateGridCell(gc.id, { style: { ...style, background: { ...style.background, color: c, type: 'solid' } } }); }} />
      </CollapsibleSection>

      {/* ── Border ── */}
      <CollapsibleSection sectionKey="border" label="Border" isOpen={sec('border')} onToggle={toggle}>
        <div className={'pb-prop-row'}>
          <label>Radius</label>
          <input type="number" value={style.border?.radius ?? 0} min={0}
            onFocus={gcFocus} onBlur={gcBlur}
            onChange={e => onUpdateGridCell(gc.id, { style: { ...style, border: { ...(style.border ?? { radius: 0, width: 0, color: '#cccccc', style: 'none' }), radius: Number(e.target.value) } } })} />
          <span style={{ fontSize: 11, color: '#888' }}>px</span>
        </div>
        <div className={'pb-prop-row'}>
          <label>Width</label>
          <input type="number" value={style.border?.width ?? 0} min={0}
            onFocus={gcFocus} onBlur={gcBlur}
            onChange={e => onUpdateGridCell(gc.id, { style: { ...style, border: { ...(style.border ?? { radius: 0, width: 0, color: '#cccccc', style: 'solid' }), width: Number(e.target.value) } } })} />
          <span style={{ fontSize: 11, color: '#888' }}>px</span>
        </div>
        {(style.border?.width ?? 0) > 0 && (
          <>
            <div className={'pb-prop-row'}>
              <label>Color</label>
              <input type="color"
                value={(style.border?.color ?? '#cccccc').startsWith('#') ? (style.border?.color ?? '#cccccc') : '#cccccc'}
                onFocus={gcFocus} onBlur={gcBlur}
                onChange={e => onUpdateGridCell(gc.id, { style: { ...style, border: { ...(style.border ?? { radius: 0, width: 0, color: '#cccccc', style: 'solid' }), color: e.target.value } } })} />
            </div>
            <div className={'pb-prop-row'}>
              <label>Style</label>
              <select value={style.border?.style ?? 'solid'}
                onChange={e => { onPushSnapshot(snapshot); onUpdateGridCell(gc.id, { style: { ...style, border: { ...(style.border ?? { radius: 0, width: 0, color: '#cccccc', style: 'solid' }), style: e.target.value as BorderStyle } } }); }}>
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
              </select>
            </div>
          </>
        )}
      </CollapsibleSection>

      {/* ── Row Span ── */}
      <CollapsibleSection sectionKey="rowSpan" label="Row Span" isOpen={sec('rowSpan')} onToggle={toggle}>
        <div className={'pb-prop-row'}>
          <label>Rows</label>
          <input type="number" value={gc.rowSpan ?? 1} min={1} max={6}
            onFocus={gcFocus} onBlur={gcBlur}
            onChange={e => onUpdateGridCell(gc.id, { rowSpan: Math.max(1, Math.min(6, Number(e.target.value))) })} />
          <span style={{ fontSize: 11, color: '#888' }}>/6</span>
        </div>
      </CollapsibleSection>

      {/* ── Visibility ── */}
      <CollapsibleSection sectionKey="visibility" label="Visibility" isOpen={sec('visibility')} onToggle={toggle}>
        <div className={'pb-prop-row'}>
          <label>Hide on Tablet</label>
          <input type="checkbox"
            checked={!!(responsive.tablet?.hidden)}
            onChange={e => {
              onPushSnapshot(snapshot);
              onUpdateGridCell(gc.id, { responsive: { ...responsive, tablet: { ...responsive.tablet, hidden: e.target.checked || undefined } } });
            }} />
        </div>
        <div className={'pb-prop-row'}>
          <label>Hide on Mobile</label>
          <input type="checkbox"
            checked={!!(responsive.mobile?.hidden ?? responsive.tablet?.hidden)}
            onChange={e => {
              onPushSnapshot(snapshot);
              onUpdateGridCell(gc.id, { responsive: { ...responsive, mobile: { ...responsive.mobile, hidden: e.target.checked || undefined } } });
            }} />
        </div>
      </CollapsibleSection>

    </aside>
  );
}

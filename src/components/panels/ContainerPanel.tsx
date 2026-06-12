import type { Breakpoint, BuilderState, Container, ContainerLayoutMode, ContainerResponsive } from '../../types';
import { PanelHeader } from './PanelHeader';
import { useFocusSnapshot } from '../../hooks/useFocusSnapshot';
import { resolveResponsive } from '../../utils/responsive';

interface Props {
  container: Container;
  snapshot: BuilderState;
  onUpdateContainer: (id: string, updates: Partial<Pick<Container, 'layoutMode' | 'gap' | 'rowGap' | 'responsive'>>) => void;
  onPushSnapshot: (snapshot: BuilderState) => void;
  breakpoint?: Breakpoint;
}

const MODES: Array<{ mode: ContainerLayoutMode; label: string; icon: string }> = [
  { mode: 'grid',     label: 'Columns', icon: '⊞' },
  { mode: 'flex-col', label: 'Stack',   icon: '☰' },
  { mode: 'flex-row', label: 'Row',     icon: '⇔' },
];

export function ContainerPanel({ container, snapshot, onUpdateContainer, onPushSnapshot, breakpoint = 'desktop' }: Props) {
  const { onFocus, onBlur } = useFocusSnapshot(snapshot, onPushSnapshot);

  const resp = container.responsive ?? {};

  const effectiveMode = resolveResponsive(breakpoint, container.layoutMode, resp.tablet?.layoutMode, resp.mobile?.layoutMode);

  const isOverridden =
    (breakpoint === 'tablet' && resp.tablet?.layoutMode !== undefined) ||
    (breakpoint === 'mobile' && resp.mobile?.layoutMode !== undefined);

  const setMode = (mode: ContainerLayoutMode) => {
    onPushSnapshot(snapshot);
    if (breakpoint === 'desktop') {
      onUpdateContainer(container.id, { layoutMode: mode });
    } else if (breakpoint === 'tablet') {
      const newResp: ContainerResponsive = { ...resp, tablet: { ...resp.tablet, layoutMode: mode } };
      onUpdateContainer(container.id, { responsive: newResp });
    } else {
      const newResp: ContainerResponsive = { ...resp, mobile: { ...resp.mobile, layoutMode: mode } };
      onUpdateContainer(container.id, { responsive: newResp });
    }
  };

  const resetOverride = () => {
    onPushSnapshot(snapshot);
    if (breakpoint === 'tablet') {
      const { layoutMode: _lm, ...rest } = resp.tablet ?? {};
      const newResp: ContainerResponsive = { ...resp, tablet: Object.keys(rest).length ? rest : undefined };
      onUpdateContainer(container.id, { responsive: newResp });
    } else if (breakpoint === 'mobile') {
      const { layoutMode: _lm, ...rest } = resp.mobile ?? {};
      const newResp: ContainerResponsive = { ...resp, mobile: Object.keys(rest).length ? rest : undefined };
      onUpdateContainer(container.id, { responsive: newResp });
    }
  };

  return (
    <div style={{ borderBottom: '1px solid #e9eef4', paddingBottom: 12, marginBottom: 4 }}>
      <PanelHeader title="Container" />

      <div style={{ padding: '0 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div className={'pb-sublabel'}>
            Layout mode{breakpoint !== 'desktop' ? ` · ${breakpoint}` : ''}
          </div>
          {isOverridden && (
            <button
              onClick={resetOverride}
              style={{ fontSize: 10, color: '#0b978e', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >reset</button>
          )}
        </div>
        <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
          {MODES.map(({ mode, label, icon }) => (
            <button
              key={mode}
              onClick={() => setMode(mode)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                padding: '6px 4px', border: '1px solid',
                borderColor: effectiveMode === mode ? '#0b978e' : '#e2e8f0',
                borderRadius: 6, background: effectiveMode === mode ? '#f0faf9' : '#fff',
                color: effectiveMode === mode ? '#0b978e' : '#64748b',
                fontSize: 10, fontWeight: 600, cursor: 'pointer',
                opacity: (isOverridden && mode === container.layoutMode && effectiveMode !== mode) ? 0.45 : 1,
              }}
            >
              <span style={{ fontSize: 16 }}>{icon}</span>
              {label}
            </button>
          ))}
        </div>

        {breakpoint === 'desktop' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <div className={'pb-sublabel'} style={{ marginBottom: 4 }}>Gap</div>
              <input
                type="number" min={0} max={80}
                value={container.gap}
                className={'pb-input'}
                onFocus={onFocus}
                onBlur={onBlur}
                onChange={e => onUpdateContainer(container.id, { gap: Math.max(0, Number(e.target.value)) })}
              />
            </div>
            <div>
              <div className={'pb-sublabel'} style={{ marginBottom: 4 }}>Row Gap</div>
              <input
                type="number" min={0} max={80}
                value={container.rowGap}
                className={'pb-input'}
                onFocus={onFocus}
                onBlur={onBlur}
                onChange={e => onUpdateContainer(container.id, { rowGap: Math.max(0, Number(e.target.value)) })}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

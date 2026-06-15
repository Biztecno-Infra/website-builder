import React from 'react';
import type { Breakpoint, BuilderState, Container, ContainerLayoutMode, ContainerResponsive } from '../../types';
import { PanelHeader } from './PanelHeader';
import { ToggleGroup } from './PanelFields';
import { PbInput } from '../PbInput';
import { Icon } from '../Icon';
import { useFocusSnapshot } from '../../hooks/useFocusSnapshot';
import { resolveResponsive, isBreakpointOverridden } from '../../utils/responsive';

interface Props {
  container: Container;
  snapshot: BuilderState;
  onUpdateContainer: (id: string, updates: Partial<Pick<Container, 'layoutMode' | 'gap' | 'rowGap' | 'responsive'>>) => void;
  onPushSnapshot: (snapshot: BuilderState) => void;
  breakpoint?: Breakpoint;
}

const MODE_OPTIONS: Array<{ value: ContainerLayoutMode; label: React.ReactNode; title: string }> = [
  { value: 'grid',     label: <Icon id="flexWrap"   size={14} />, title: 'Columns' },
  { value: 'flex-col', label: <Icon id="flexColumn" size={14} />, title: 'Stack'   },
  { value: 'flex-row', label: <Icon id="flexRow"    size={14} />, title: 'Row'     },
];

export function ContainerPanel({ container, snapshot, onUpdateContainer, onPushSnapshot, breakpoint = 'desktop' }: Props) {
  const { onFocus, onBlur } = useFocusSnapshot(snapshot, onPushSnapshot);

  const resp = container.responsive ?? {};

  const effectiveMode = resolveResponsive(breakpoint, container.layoutMode, resp.tablet?.layoutMode, resp.mobile?.layoutMode);

  const isOverridden = isBreakpointOverridden(breakpoint, resp.tablet?.layoutMode, resp.mobile?.layoutMode);

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
        <div style={{ marginBottom: 12 }}>
          <ToggleGroup
            options={MODE_OPTIONS}
            value={effectiveMode}
            onChange={v => setMode(v as ContainerLayoutMode)}
          />
        </div>

        {breakpoint === 'desktop' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <div className={'pb-sublabel'} style={{ marginBottom: 4 }}>Gap</div>
              <PbInput type="number" min={0} max={80}
                value={container.gap}
                onFocus={onFocus} onBlur={onBlur}
                onChange={e => onUpdateContainer(container.id, { gap: Math.max(0, Number(e.target.value)) })}
              />
            </div>
            <div>
              <div className={'pb-sublabel'} style={{ marginBottom: 4 }}>Row Gap</div>
              <PbInput type="number" min={0} max={80}
                value={container.rowGap}
                onFocus={onFocus} onBlur={onBlur}
                onChange={e => onUpdateContainer(container.id, { rowGap: Math.max(0, Number(e.target.value)) })}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

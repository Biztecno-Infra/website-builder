import type { ReactNode } from 'react';

interface Props {
  title: ReactNode;
  children?: ReactNode;
}

export function PanelHeader({ title, children }: Props) {
  return (
    <div className={'pb-panel-header'}>
      <span className={'pb-panel-header-title'}>{title}</span>
      {children && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {children}
        </div>
      )}
    </div>
  );
}

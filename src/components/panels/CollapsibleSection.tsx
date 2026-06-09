import { useCallback, useState, type ReactNode } from 'react';

// ── Shared collapsible section component + hook ───────────────────────────────

interface Props {
  sectionKey: string;
  label: ReactNode;
  isOpen: boolean;
  onToggle: (key: string) => void;
  children: ReactNode;
}

export function CollapsibleSection({ sectionKey, label, isOpen, onToggle, children }: Props) {
  return (
    <div className={'pb-prop-section'}>
      <div className={"pb-section-header pb-section-header--collapsible"} onClick={() => onToggle(sectionKey)}>
        {label}
        <span className={'pb-section-collapse-chevron'}>{isOpen ? '∧' : '∨'}</span>
      </div>
      {isOpen && <div className="pb-section-content">{children}</div>}
    </div>
  );
}

export function usePanelSections(defaults: Record<string, boolean>, storageKey: string) {
  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return { ...defaults, ...JSON.parse(saved) };
    } catch {}
    return { ...defaults };
  });

  const toggle = useCallback((key: string) => {
    setOpen(prev => {
      const next = { ...prev, [key]: !prev[key] };
      try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [storageKey]);

  const sec = (key: string): boolean => open[key] ?? defaults[key] ?? true;

  return { sec, toggle };
}

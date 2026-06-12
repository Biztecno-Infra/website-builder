import { useState, useRef, useEffect } from 'react';
import { Icon } from './Icon';

export interface SelectOption {
  value: string;
  label: string;
}

interface PbSelectProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  size?: 'sm' | 'md';
  className?: string;
}

export function PbSelect({ value, options, onChange, size = 'sm', className }: PbSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const selected = options.find(o => o.value === value);

  return (
    <div
      ref={ref}
      className={['pb-select', `pb-select--${size}`, open && 'pb-select--open', className].filter(Boolean).join(' ')}
    >
      <button type="button" className={'pb-select-trigger'} onClick={() => setOpen(v => !v)}>
        <span className={'pb-select-value pb-truncate'}>{selected?.label ?? value}</span>
        <Icon id="chevronDown" size={size === 'sm' ? 10 : 12} color="#6b7280" />
      </button>
      {open && (
        <div className={'pb-select-menu'}>
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              className={['pb-select-option', opt.value === value && 'pb-select-option--active'].filter(Boolean).join(' ')}
              onClick={() => { onChange(opt.value); setOpen(false); }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

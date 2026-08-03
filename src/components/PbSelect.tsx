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
  searchable?: boolean;
}

export function PbSelect({ value, options, onChange, size = 'sm', className, searchable }: PbSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) { setQuery(''); return; }
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    if (searchable) setTimeout(() => inputRef.current?.focus(), 0);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, searchable]);

  const selected = options.find(o => o.value === value);
  const filtered = searchable && query
    ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

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
          {searchable && (
            <div className="pb-select-search">
              <input
                ref={inputRef}
                type="text"
                className="pb-select-search-input"
                placeholder="Search fonts…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onMouseDown={e => e.stopPropagation()}
              />
            </div>
          )}
          {filtered.map(opt => (
            <button
              key={opt.value}
              type="button"
              title={opt.label}
              className={['pb-select-option', opt.value === value && 'pb-select-option--active'].filter(Boolean).join(' ')}
              onClick={() => { onChange(opt.value); setOpen(false); }}
            >
              {opt.label}
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="pb-select-no-results">No results</div>
          )}
        </div>
      )}
    </div>
  );
}

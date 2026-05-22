import { useEffect, useRef, useState } from 'react';

const GRID_PRESETS = [
  { label: '1 col', spans: [12] },
  { label: '2 cols', spans: [6, 6] },
  { label: '3 cols', spans: [4, 4, 4] },
];

interface Props {
  position: 'top' | 'bottom';
  onAddFreeSection?: () => void;
  onAddGrid: (columnSpans: number[]) => void;
}

export function SectionInsertMenu({ position, onAddFreeSection, onAddGrid }: Props) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const posClass = position === 'top' ? 'pb-section-add-btn--top' : 'pb-section-add-btn--bottom';

  return (
    <div
      ref={menuRef}
      className={`pb-section-add-btn ${posClass}`}
      onMouseDown={e => e.stopPropagation()}
    >
      <button
        className="pb-section-insert-trigger"
        title={position === 'top' ? 'Add section above' : 'Add section below'}
        onClick={e => { e.stopPropagation(); setOpen(v => !v); }}
      >+</button>
      {open && (
        <div className="pb-section-insert-menu">
          {onAddFreeSection && (
            <button className="pb-section-insert-item" onClick={() => { setOpen(false); onAddFreeSection(); }}>
              Free Section
            </button>
          )}
          {onAddFreeSection && <div className="pb-section-insert-divider" />}
          {GRID_PRESETS.map(p => (
            <button
              key={p.label}
              className="pb-section-insert-item"
              onClick={() => { setOpen(false); onAddGrid(p.spans); }}
            >
              Grid — {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

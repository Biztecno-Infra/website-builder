import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  anchorRef: React.RefObject<HTMLElement | null>;
  onDuplicate?: () => void;
  onDelete?: () => void;
}

/**
 * Quick bar (⧉ duplicate, ✕ delete) rendered as a fixed-position portal
 * at the BOTTOM of the element so it's never clipped by overflow:hidden parents.
 */
export function ElementQuickBar({ anchorRef, onDuplicate, onDelete }: Props) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const update = () => {
      const el = anchorRef.current;
      if (!el) { setPos(null); return; }
      const rect = el.getBoundingClientRect();
      setPos({
        top:  rect.bottom + 6,   // 6px below the element
        left: rect.left + rect.width / 2,
      });
    };

    update();

    const obs = new ResizeObserver(() => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(update);
    });
    if (anchorRef.current) obs.observe(anchorRef.current);
    window.addEventListener('scroll', update, true);

    return () => {
      obs.disconnect();
      window.removeEventListener('scroll', update, true);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [anchorRef]);

  if (!pos || (!onDuplicate && !onDelete)) return null;

  return createPortal(
    <div
      className={'pb-grid-el-quick-bar'}
      style={{ position: 'fixed', top: pos.top, left: pos.left, transform: 'translateX(-50%)', zIndex: 99999 }}
      onMouseDown={e => e.stopPropagation()}
    >
      {onDuplicate && (
        <button className={'pb-el-quick-btn'} title="Duplicate"
          onClick={e => { e.stopPropagation(); onDuplicate(); }}>⧉</button>
      )}
      {onDelete && (
        <button className={'pb-el-quick-btn pb-danger'} title="Delete"
          onClick={e => { e.stopPropagation(); onDelete(); }}>✕</button>
      )}
    </div>,
    document.body,
  );
}

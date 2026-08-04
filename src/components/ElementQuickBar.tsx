import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { IconButton } from './IconButton';

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

  useEffect(() => {
    let rafId: number;

    // Polling via rAF (rather than Resize/MutationObserver on the anchor itself) so the
    // bar keeps following during an absolute/overlay-element drag, where it's an ancestor
    // wrapper's left/top that moves, not the anchor node's own size or style attribute.
    const loop = () => {
      const el = anchorRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        setPos({
          top:  rect.bottom + 6,
          left: rect.left + rect.width / 2,
        });
      } else {
        setPos(null);
      }
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(rafId);
  }, [anchorRef]);

  if (!pos || (!onDuplicate && !onDelete)) return null;

  return createPortal(
    <div
      className={'pb-grid-el-quick-bar'}
      style={{ position: 'fixed', top: pos.top, left: pos.left, transform: 'translateX(-50%)', zIndex: 99999 }}
      onMouseDown={e => e.stopPropagation()}
    >
      {onDuplicate && (
        <IconButton variant="dark" title="Duplicate"
          onClick={e => { e.stopPropagation(); onDuplicate(); }}>⧉</IconButton>
      )}
      {onDelete && (
        <IconButton variant="dark" className="pb-danger" title="Delete"
          onClick={e => { e.stopPropagation(); onDelete(); }}>✕</IconButton>
      )}
    </div>,
    document.body,
  );
}

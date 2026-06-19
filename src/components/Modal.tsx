import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { PbButton } from './PbButton';

interface ModalProps {
  title: string;
  children: ReactNode;
  /** Label for the confirm (primary) action. */
  confirmLabel?: string;
  /** Label for the cancel (secondary) action. */
  cancelLabel?: string;
  /** Disable the confirm button (e.g. nothing selected yet). */
  confirmDisabled?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Lightweight confirmation modal rendered in a portal at document.body.
 * The root carries the `pb-app` class so the scoped design tokens
 * (variables.css) apply even though it lives outside the app subtree.
 */
export function Modal({
  title, children,
  confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  confirmDisabled = false,
  onConfirm, onCancel,
}: ModalProps) {
  // Close on Escape, mirroring the cancel action.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onCancel(); }
      else if (e.key === 'Enter' && !confirmDisabled) { e.stopPropagation(); onConfirm(); }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onCancel, onConfirm, confirmDisabled]);

  return createPortal(
    <div className={'pb-modal-overlay'} onMouseDown={onCancel}>
      <div className={'pb-modal'} role="dialog" aria-modal="true" aria-label={title}
        onMouseDown={e => e.stopPropagation()}>
        <div className={'pb-modal-header'}>
          <h3 className={'pb-modal-title'}>{title}</h3>
          <button className={'pb-modal-close'} aria-label="Close" onClick={onCancel}>✕</button>
        </div>
        <div className={'pb-modal-body'}>{children}</div>
        <div className={'pb-modal-footer'}>
          <PbButton variant="outline" onClick={onCancel}>{cancelLabel}</PbButton>
          <PbButton variant="primary" disabled={confirmDisabled} onClick={onConfirm}>{confirmLabel}</PbButton>
        </div>
      </div>
    </div>,
    document.body,
  );
}

import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';
import { IconButton } from './IconButton';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function ContentModal({ isOpen, onClose, title, children }: Props) {
  if (!isOpen) return null;
  return createPortal(
    <div className="pb-app pb-modal-overlay" onMouseDown={onClose}>
      <div className="pb-content-modal pb-flex-col" onMouseDown={e => e.stopPropagation()}>
        <div className="pb-content-modal-header pb-flex-between">
          <span className="pb-content-modal-title">{title}</span>
          <IconButton variant="close" size="lg" onClick={onClose} title="Close">✕</IconButton>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}

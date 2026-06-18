import type { ReactNode } from 'react';

interface Props {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  title?: string;
  disabled?: boolean;
  children: ReactNode;
  /** ghost = muted→primary on hover (action buttons)
   *  close = muted→strong on hover (X close buttons)
   *  danger = red color always (delete buttons)
   *  dark   = light-on-dark (element toolbar)            */
  variant?: 'ghost' | 'close' | 'danger' | 'dark';
  /** sm=22px  md=24px(default)  lg=28px */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function IconButton({
  onClick,
  title,
  disabled,
  children,
  variant = 'ghost',
  size = 'md',
  className = '',
}: Props) {
  const cls = [
    'pb-icon-btn',
    `pb-icon-btn--${variant}`,
    `pb-icon-btn--${size}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      className={cls}
      onClick={onClick}
      title={title}
      disabled={disabled}
      type="button"
    >
      {children}
    </button>
  );
}

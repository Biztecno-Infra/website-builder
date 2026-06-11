import type React from 'react';

interface PbButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline';
  fullWidth?: boolean;
}

export function PbButton({ variant = 'primary', fullWidth, className, children, ...rest }: PbButtonProps) {
  return (
    <button
      className={[
        'pb-btn',
        `pb-btn--${variant}`,
        fullWidth && 'pb-btn--full',
        className,
      ].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </button>
  );
}

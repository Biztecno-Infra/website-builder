import type React from 'react';

interface PbInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  type?: 'text' | 'number';
  variant?: 'default' | 'plain';
}

export function PbInput({ type = 'text', variant = 'default', className, min: _min, max: _max, ...rest }: PbInputProps) {
  return (
    <input
      type={type}
      className={['pb-input', variant === 'plain' && 'pb-input--plain', className].filter(Boolean).join(' ')}
      {...rest}
    />
  );
}

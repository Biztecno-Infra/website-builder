import type React from 'react';

interface PbTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  mono?: boolean;
}

export function PbTextarea({ mono, className, ...rest }: PbTextareaProps) {
  return (
    <textarea
      className={['pb-textarea', mono && 'pb-textarea--mono', className].filter(Boolean).join(' ')}
      {...rest}
    />
  );
}

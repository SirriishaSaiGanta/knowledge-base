import type { TextareaHTMLAttributes } from 'react';

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className = '', ...rest }: TextareaProps) {
  return <textarea className={`textarea ${className}`.trim()} {...rest} />;
}

import type { HTMLAttributes } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: string;
}

export function Badge({ color, style, className = '', ...rest }: BadgeProps) {
  return (
    <span
      className={`badge ${className}`.trim()}
      style={color ? { ...style, backgroundColor: color } : style}
      {...rest}
    />
  );
}

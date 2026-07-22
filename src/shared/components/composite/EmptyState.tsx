import type { PropsWithChildren, ReactNode } from 'react';

export interface EmptyStateProps extends PropsWithChildren {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action, children }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
      {children}
    </div>
  );
}

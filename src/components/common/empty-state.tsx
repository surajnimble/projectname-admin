import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="border-border bg-surface-muted/60 text-fg-muted flex flex-col items-center gap-2 rounded-lg border border-dashed px-6 py-10 text-center">
      <h3 className="text-fg text-base font-semibold">{title}</h3>
      {description && <p className="text-fg-muted max-w-md text-sm">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

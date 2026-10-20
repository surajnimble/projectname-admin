import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  meta?: ReactNode;
  action?: ReactNode;
}

export function PageHeader({ title, description, meta, action }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-fg text-2xl font-semibold tracking-tight break-words">{title}</h1>
        {description && <p className="text-fg-muted text-sm">{description}</p>}
        {meta && <div className="text-fg-muted text-xs">{meta}</div>}
      </div>
      {action && <div className="ml-auto shrink-0">{action}</div>}
    </div>
  );
}

import type * as React from 'react';
import { cn } from '@/lib/utils';

export type SelectProps = React.ComponentProps<'select'>;

export function Select({ className, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        'border-border bg-surface text-fg h-9 w-full rounded-md border px-3 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

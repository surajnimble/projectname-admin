import type * as React from 'react';
import { cn } from '@/lib/utils';

export type InputProps = React.ComponentProps<'input'>;

export function Input({ className, type = 'text', ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        'border-border bg-surface text-fg placeholder:text-fg-muted aria-[invalid=true]:border-danger h-9 w-full rounded-md border px-3 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

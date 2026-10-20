import type * as React from 'react';
import { cn } from '@/lib/utils';

export type TextareaProps = React.ComponentProps<'textarea'>;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        'border-border bg-surface text-fg placeholder:text-fg-muted aria-[invalid=true]:border-danger h-20 w-full resize-y rounded-md border px-3 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

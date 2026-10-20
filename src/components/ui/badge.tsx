import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      intent: {
        neutral: 'bg-surface-muted text-fg-muted',
        primary: 'bg-primary-soft text-primary',
        success: 'bg-success-bg text-success',
        warning: 'bg-warning-bg text-warning',
        danger: 'bg-danger-bg text-danger',
        info: 'bg-info-bg text-info',
      },
    },
    defaultVariants: { intent: 'neutral' },
  },
);

export interface BadgeProps
  extends React.ComponentProps<'span'>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, intent, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ intent }), className)} {...props} />;
}

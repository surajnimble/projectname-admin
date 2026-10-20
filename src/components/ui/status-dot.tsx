import type { BadgeProps } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type BadgeIntent = NonNullable<BadgeProps['intent']>;

const DOT_CLASSES: Record<BadgeIntent, string> = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
  neutral: 'bg-fg-muted',
};

interface StatusDotProps {
  intent: BadgeIntent;
  label: string;
  className?: string;
}

export function StatusDot({ intent, label, className }: StatusDotProps) {
  return (
    <span className={cn('inline-flex items-center', className)} title={label}>
      <span aria-hidden="true" className={cn('size-2.5 rounded-full', DOT_CLASSES[intent])} />
      <span className="sr-only">{label}</span>
    </span>
  );
}

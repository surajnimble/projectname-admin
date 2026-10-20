import { ArrowRight, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MESSAGES } from '@/messages';
import { cn } from '@/lib/utils';

type WidgetIntent = 'primary' | 'info' | 'success' | 'warning' | 'danger';

const INTENT_CLASSES: Record<WidgetIntent, string> = {
  primary: 'bg-soft text-soft-fg',
  info: 'bg-info-bg text-info',
  success: 'bg-success-bg text-success',
  warning: 'bg-warning-bg text-warning',
  danger: 'bg-danger-bg text-danger',
};

interface DashboardWidgetProps {
  title: string;
  hasMore: boolean;
  onViewAll: () => void;
  isLoading: boolean;
  error: string;
  onRetry: () => void;
  isEmpty: boolean;
  emptyTitle: string;
  emptyBody: string;
  skeletonRows?: number;
  children: ReactNode;
}

function SkeletonRows({ rows }: { rows: number }) {
  return (
    <div className="divide-border divide-y" role="status" aria-busy="true">
      <span className="sr-only">{MESSAGES.common.loading}</span>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-start gap-3 px-5 py-3.5">
          <Skeleton className="size-8 shrink-0 rounded-lg" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-4 w-14" />
        </div>
      ))}
    </div>
  );
}

export function DashboardWidget({
  title,
  hasMore,
  onViewAll,
  isLoading,
  error,
  onRetry,
  isEmpty,
  emptyTitle,
  emptyBody,
  skeletonRows = 4,
  children,
}: DashboardWidgetProps) {
  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <CardHeader className="border-border flex flex-row items-center justify-between gap-3 border-b p-5">
        <CardTitle>{title}</CardTitle>
        {hasMore && (
          <Button variant="ghost" size="sm" className="-mr-2 px-2" onClick={onViewAll}>
            {MESSAGES.common.viewAll}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        )}
      </CardHeader>
      {isLoading ? (
        <SkeletonRows rows={skeletonRows} />
      ) : error ? (
        <div className="p-4">
          <ErrorState message={error} onRetry={onRetry} />
        </div>
      ) : isEmpty ? (
        <div className="p-4">
          <EmptyState title={emptyTitle} description={emptyBody} />
        </div>
      ) : (
        <div className="flex-1">{children}</div>
      )}
    </Card>
  );
}

interface WidgetRowProps {
  icon: LucideIcon;
  intent: WidgetIntent;
  title: string;
  subtitle?: ReactNode;
  value?: string;
  valueClassName?: string;
  trailing?: ReactNode;
}

export function WidgetRow({
  icon: Icon,
  intent,
  title,
  subtitle,
  value,
  valueClassName,
  trailing,
}: WidgetRowProps) {
  return (
    <li className="flex items-start gap-3 px-5 py-3.5">
      <span
        aria-hidden="true"
        className={cn(
          'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg',
          INTENT_CLASSES[intent],
        )}
      >
        <Icon className="size-4" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="text-fg truncate text-sm font-medium">{title}</p>
        {subtitle && (
          <div className="text-fg-muted flex flex-wrap items-center gap-1 text-xs">{subtitle}</div>
        )}
      </div>
      {(value || trailing) && (
        <div className="flex shrink-0 flex-col items-end gap-1">
          {value && (
            <span className={cn('text-fg text-sm font-semibold tabular-nums', valueClassName)}>
              {value}
            </span>
          )}
          {trailing}
        </div>
      )}
    </li>
  );
}

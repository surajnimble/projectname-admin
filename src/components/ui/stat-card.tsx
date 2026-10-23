import * as React from 'react';
import { cn } from '@/lib/utils';

type StatCardProps = React.ComponentProps<'div'> & {
  icon?: React.ReactNode;
  title: React.ReactNode;
  value: React.ReactNode;
  growthRate?: React.ReactNode;
  className?: string;
};

function StatCard({
  icon,
  title,
  value,
  growthRate,
  className,
  ...props
}: StatCardProps) {
  return (
    <div
      data-slot="stat-card"
      className={cn(
        'rounded-xl border bg-card p-4 text-card-foreground md:p-6',
        className,
      )}
      {...props}
    >
      <div className="relative flex items-center gap-3">
        <div className="relative flex items-center gap-3">{icon}</div>
        <div className="relative items-center gap-3">
          <p className="text-2xl font-medium tabular-nums md:text-3xl">
            {value}
          </p>
          <p className="relative text-sm text-muted-foreground">{title}</p>
          {growthRate && (
            <p className="relative text-sm text-muted-foreground">
              {growthRate}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export type { StatCardProps };
export { StatCard };

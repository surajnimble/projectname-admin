'use client';

import { cn } from '@/lib/utils';

export interface TabItem {
  value: string;
  label: string;
}

interface TabsProps {
  items: readonly TabItem[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  className?: string;
}

export function Tabs({ items, value, onChange, ariaLabel, className }: TabsProps) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn('flex flex-wrap items-center gap-2', className)}
    >
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cn(
              'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
              active
                ? 'bg-soft text-soft-fg border-transparent'
                : 'border-border text-fg-muted hover:bg-hover hover:text-fg',
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface CalendarProps {
  value?: Date;
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  weekStartsOn?: 0 | 1;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const isSameDate = (left?: Date, right?: Date) => Boolean(
  left && right && left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() && left.getDate() === right.getDate(),
);

/** Theme-aware calendar grid without a separate date-picker dependency. */
export function Calendar({
  value,
  selected,
  onSelect,
  disabled = false,
  minDate,
  maxDate,
  className,
  weekStartsOn = 0,
}: CalendarProps) {
  const activeDate = selected ?? value;
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(
    (activeDate ?? new Date()).getFullYear(),
    (activeDate ?? new Date()).getMonth(),
    1,
  ));

  const days = useMemo(() => {
    const firstDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    const offset = (firstDay.getDay() - weekStartsOn + 7) % 7;
    const start = new Date(firstDay);
    start.setDate(firstDay.getDate() - offset);
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date;
    });
  }, [visibleMonth, weekStartsOn]);

  const monthLabel = visibleMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const weekdays = [...WEEKDAYS.slice(weekStartsOn), ...WEEKDAYS.slice(0, weekStartsOn)];
  const moveMonth = (amount: number) => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));

  return (
    <div className={cn('w-calendar-panel rounded-lg bg-background p-3 text-foreground', className)}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <Button type="button" variant="ghost" size="icon-sm" ripple={false} disabled={disabled} onClick={() => moveMonth(-1)} aria-label="Previous month">
          <ChevronLeft className="size-4" />
        </Button>
        <span aria-live="polite" className="text-sm font-semibold">{monthLabel}</span>
        <Button type="button" variant="ghost" size="icon-sm" ripple={false} disabled={disabled} onClick={() => moveMonth(1)} aria-label="Next month">
          <ChevronRight className="size-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1" role="grid" aria-label={monthLabel}>
        {weekdays.map((day) => (
          <span key={day} role="columnheader" className="flex h-8 items-center justify-center text-xs font-medium text-fg-muted">{day}</span>
        ))}
        {days.map((date) => {
          const inMonth = date.getMonth() === visibleMonth.getMonth();
          const tooEarly = Boolean(minDate && date < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()));
          const tooLate = Boolean(maxDate && date > new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate()));
          const isDisabled = disabled || tooEarly || tooLate;
          const isSelected = isSameDate(activeDate, date);
          const isToday = isSameDate(new Date(), date);
          return (
            <button
              key={`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`}
              type="button"
              role="gridcell"
              aria-selected={isSelected}
              aria-label={date.toLocaleDateString()}
              disabled={isDisabled}
              onClick={() => onSelect?.(new Date(date.getFullYear(), date.getMonth(), date.getDate()))}
              className={cn(
                'flex size-9 items-center justify-center rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-30',
                !inMonth && 'text-fg-subtle/50',
                isToday && !isSelected && 'border border-primary/50',
                isSelected && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

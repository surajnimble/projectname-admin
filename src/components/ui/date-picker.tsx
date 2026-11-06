'use client';

import { CalendarDays, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface DatePickerProps {
  value?: Date;
  onChange?: (value: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  clearable?: boolean;
  className?: string;
}

/** Controlled, keyboard-accessible date picker built on the app's themed primitives. */
export function DatePicker({
  value,
  onChange,
  placeholder = 'Select date',
  disabled = false,
  minDate,
  maxDate,
  clearable = true,
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const label = value
    ? value.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          aria-expanded={open}
          className={cn('w-full justify-start text-left font-normal', !value && 'text-fg-muted', className)}
        >
          <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
          <span className="min-w-0 flex-1 truncate">{label}</span>
          {clearable && value && <X className="size-3.5 shrink-0 text-fg-muted" aria-hidden="true" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          value={value}
          onSelect={(date) => {
            onChange?.(date);
            setOpen(false);
          }}
          minDate={minDate}
          maxDate={maxDate}
        />
        {clearable && value && (
          <div className="border-t border-border p-2">
            <Button type="button" variant="ghost" size="sm" className="w-full" onClick={() => { onChange?.(undefined); setOpen(false); }}>
              <X className="size-4" aria-hidden="true" />
              Clear date
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

'use client';

import { Check, ChevronsUpDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface ComboboxOption { label: string; value: string; disabled?: boolean }
export interface ComboboxProps {
  options: readonly ComboboxOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
}

export function Combobox({
  options, value, onChange, placeholder = 'Select an option',
  searchPlaceholder = 'Search...', emptyMessage = 'No results found.', disabled, className,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const selected = options.find((option) => option.value === value);
  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return options;
    return options.filter((option) => `${option.label} ${option.value}`.toLocaleLowerCase().includes(query));
  }, [options, search]);

  return (
    <Popover open={open} onOpenChange={(next) => { setOpen(next); if (!next) setSearch(''); }}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" disabled={disabled} aria-expanded={open} className={cn('w-full justify-between font-normal', className)}>
          <span className={cn('truncate', !selected && 'text-fg-muted')}>{selected?.label ?? placeholder}</span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 text-fg-muted" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-2">
        <Input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder={searchPlaceholder} aria-label={searchPlaceholder} className="mb-2" />
        <div className="max-h-60 overflow-y-auto" role="listbox" aria-label={placeholder}>
          {filtered.length === 0 ? <p className="px-2 py-5 text-center text-sm text-fg-muted">{emptyMessage}</p> : filtered.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              disabled={option.disabled}
              onClick={() => { onChange?.(option.value); setOpen(false); setSearch(''); }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-40"
            >
              <Check className={cn('size-4 shrink-0', value === option.value ? 'opacity-100' : 'opacity-0')} />
              <span className="truncate">{option.label}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

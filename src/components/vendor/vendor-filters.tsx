'use client';

import { Search, SlidersHorizontal } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MESSAGES } from '@/messages';

interface VendorFiltersProps {
  search: string;
  filterCount: number;
  action?: ReactNode;
  onSearchChange: (value: string) => void;
  onOpenFilters: () => void;
}

export function VendorFilters({
  search,
  filterCount,
  action,
  onSearchChange,
  onOpenFilters,
}: VendorFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-0 flex-1 sm:w-80 sm:flex-none lg:w-96">
        <Search
          className="text-fg-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={MESSAGES.vendors.searchPlaceholder}
          aria-label={MESSAGES.common.search}
          className="pl-9"
        />
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onOpenFilters}
        className="shrink-0"
      >
        <SlidersHorizontal className="size-4" aria-hidden="true" />
        {MESSAGES.common.filters}
        {filterCount > 0 && (
          <span className="bg-primary text-primary-fg flex size-5 items-center justify-center rounded-full text-xs">
            {filterCount}
          </span>
        )}
      </Button>
      {action && <div className="w-full sm:ml-auto sm:w-auto">{action}</div>}
    </div>
  );
}

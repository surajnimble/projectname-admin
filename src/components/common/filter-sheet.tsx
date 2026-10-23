'use client';

import { Check } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { MESSAGES } from '@/messages';

interface FilterSheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onReset: () => void;
  onDone: () => void;
  children: ReactNode;
}

export function FilterSheet({ open, title, onClose, onReset, onDone, children }: FilterSheetProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      closeLabel={MESSAGES.common.close}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onReset}>
            {MESSAGES.common.reset}
          </Button>
          <Button type="button" onClick={onDone}>
            {MESSAGES.common.done}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">{children}</div>
    </Dialog>
  );
}

interface FilterGroupProps {
  label: string;
  children: ReactNode;
}

export function FilterGroup({ label, children }: FilterGroupProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-fg-muted text-xs font-medium">{label}</span>
      <div role="radiogroup" aria-label={label} className="flex flex-col gap-1">
        {children}
      </div>
    </div>
  );
}

interface FilterOptionProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
}

export function FilterOption({ label, selected, onSelect }: FilterOptionProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        'flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm transition-colors',
        selected ? 'bg-soft text-soft-fg font-medium' : 'text-fg hover:bg-hover',
      )}
    >
      {label}
      {selected && <Check className="size-4" aria-hidden="true" />}
    </button>
  );
}

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
  children: ReactNode;
}

export function FilterSheet({ open, title, onClose, onReset, children }: FilterSheetProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      placement="bottom"
      closeLabel={MESSAGES.common.close}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onReset}>
            {MESSAGES.common.reset}
          </Button>
          <Button type="button" onClick={onClose}>
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
        selected
          ? 'bg-primary-soft text-primary font-medium'
          : 'text-fg hover:bg-surface-muted',
      )}
    >
      {label}
      {selected && <Check className="size-4" aria-hidden="true" />}
    </button>
  );
}

interface FilterSwitchProps {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

export function FilterSwitch({ label, checked, onChange }: FilterSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm transition-colors',
        checked ? 'bg-primary-soft text-primary font-medium' : 'text-fg hover:bg-surface-muted',
      )}
    >
      {label}
      {checked && <Check className="size-4" aria-hidden="true" />}
    </button>
  );
}

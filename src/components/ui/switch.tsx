'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwitchProps {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  className?: string;
}

export function Switch({ label, checked, onChange, className }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm transition-colors',
        checked ? 'bg-soft text-soft-fg font-medium' : 'text-fg hover:bg-hover',
        className,
      )}
    >
      {label}
      {checked && <Check className="size-4" aria-hidden="true" />}
    </button>
  );
}

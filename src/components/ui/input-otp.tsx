'use client';

import { useRef, type ClipboardEvent, type KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';

export interface InputOTPProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  inputMode?: 'numeric' | 'text' | 'decimal';
  className?: string;
  ariaLabel?: string;
}

/** Dependency-free, controlled OTP input compatible with the dashboard theme. */
export function InputOTP({
  value, onChange, length = 6, disabled = false, autoFocus = false,
  inputMode = 'numeric', className, ariaLabel = 'One-time password',
}: InputOTPProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const chars = Array.from({ length }, (_, index) => value[index] ?? '');

  const updateAt = (index: number, raw: string) => {
    const inserted = raw.replace(inputMode === 'numeric' ? /\D/g : /[^\p{L}\p{N}]/gu, '');
    if (!inserted) return;
    const next = chars.slice();
    for (let offset = 0; offset < inserted.length && index + offset < length; offset += 1) next[index + offset] = inserted[offset] ?? '';
    onChange(next.join('').slice(0, length));
    refs.current[Math.min(index + inserted.length, length - 1)]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === 'Backspace') {
      event.preventDefault();
      const next = chars.slice();
      const target = chars[index] ? index : Math.max(0, index - 1);
      next[target] = '';
      onChange(next.join(''));
      refs.current[target]?.focus();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault(); refs.current[Math.max(0, index - 1)]?.focus();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault(); refs.current[Math.min(length - 1, index + 1)]?.focus();
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>, index: number) => {
    event.preventDefault();
    updateAt(index, event.clipboardData.getData('text'));
  };

  return (
    <div className={cn('flex items-center justify-center gap-2', className)} role="group" aria-label={ariaLabel}>
      {chars.map((character, index) => (
        <input
          key={index}
          ref={(node) => { refs.current[index] = node; }}
          type="text"
          inputMode={inputMode}
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          autoFocus={autoFocus && index === 0}
          value={character}
          disabled={disabled}
          maxLength={length}
          aria-label={`${ariaLabel} digit ${index + 1}`}
          onChange={(event) => updateAt(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(event, index)}
          onPaste={(event) => handlePaste(event, index)}
          className="bg-background border-input text-foreground focus-visible:ring-ring size-10 rounded-md border text-center text-lg font-semibold shadow-sm outline-none transition focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 sm:size-11"
        />
      ))}
    </div>
  );
}

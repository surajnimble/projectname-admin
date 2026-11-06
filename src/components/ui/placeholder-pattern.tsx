'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils';

interface PlaceholderPatternProps { className?: string; stroke?: string }

export function PlaceholderPattern({ className, stroke = 'var(--border)' }: PlaceholderPatternProps) {
  const patternId = useId().replace(/:/g, '');
  return (
    <svg aria-hidden="true" className={cn('pointer-events-none h-full w-full', className)} fill="none" preserveAspectRatio="none">
      <defs><pattern id={patternId} x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M-3 15 15-3M-3 3 3-3M9 15l6-6" stroke={stroke} strokeOpacity="0.6" strokeWidth="0.7" /></pattern></defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

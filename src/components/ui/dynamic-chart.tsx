'use client';

import { cn } from '@/lib/utils';

export interface DynamicChartProps {
  value: number;
  label: string;
  max?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  color?: string;
  formatValue?: (value: number) => string;
}

/** Compact circular KPI indicator using CSS variables from the active theme. */
export function DynamicChart({ value, label, max = 100, size = 112, strokeWidth = 10, className, color = 'var(--success)', formatValue = (number) => `${Math.round(number)}%` }: DynamicChartProps) {
  const safeMax = max > 0 ? max : 100;
  const ratio = Math.min(1, Math.max(0, Number.isFinite(value) ? value / safeMax : 0));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - ratio);
  return (
    <div className={cn('inline-flex flex-col items-center gap-2', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full -rotate-90" role="img" aria-label={`${label}: ${formatValue(value)}`}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--border)" strokeWidth={strokeWidth} />
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="transition-[stroke-dashoffset] duration-500" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-lg font-semibold tabular-nums text-foreground">{formatValue(value)}</span>
      </div>
      <span className="text-center text-sm font-medium text-fg-muted">{label}</span>
    </div>
  );
}

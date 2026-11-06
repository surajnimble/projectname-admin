'use client';

import { cn } from '@/lib/utils';

export interface ChartDataItem { label: string; value: number }
export interface ChartProps {
  data: readonly ChartDataItem[];
  name?: string;
  color?: string;
  height?: number;
  formatValue?: (value: number) => string;
  isLoading?: boolean;
  className?: string;
  emptyMessage?: string;
}

/** Small responsive SVG bar chart; all colors resolve through live theme tokens. */
export function Chart({ data, name = 'Value', color = 'var(--chart-1)', height = 220, formatValue = (value) => String(value), isLoading = false, className, emptyMessage = 'No chart data available.' }: ChartProps) {
  if (isLoading) return <div aria-label="Loading chart" className={cn('animate-pulse rounded-lg bg-surface-muted', className)} style={{ height }} />;
  if (data.length === 0) return <div className={cn('flex items-center justify-center rounded-lg border border-dashed border-border text-sm text-fg-muted', className)} style={{ minHeight: height }}>{emptyMessage}</div>;

  const width = Math.max(320, data.length * 64);
  const maxValue = Math.max(1, ...data.map((item) => Number.isFinite(item.value) ? Math.max(0, item.value) : 0));
  const chartHeight = height - 48;
  const barWidth = Math.min(36, Math.max(12, width / data.length / 2));
  const gap = width / data.length;

  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${name} bar chart`} className="block w-full min-w-chart" preserveAspectRatio="xMinYMid meet">
        <line x1="12" y1={chartHeight} x2={width - 12} y2={chartHeight} stroke="var(--border)" />
        {data.map((item, index) => {
          const value = Number.isFinite(item.value) ? Math.max(0, item.value) : 0;
          const barHeight = (value / maxValue) * (chartHeight - 16);
          const x = gap * index + (gap - barWidth) / 2;
          const y = chartHeight - barHeight;
          return (
            <g key={`${item.label}-${index}`}>
              <title>{`${item.label}: ${formatValue(value)}`}</title>
              <rect x={x} y={y} width={barWidth} height={Math.max(0, barHeight)} rx="5" fill={color} opacity="0.9" />
              <text x={x + barWidth / 2} y={Math.max(12, y - 6)} textAnchor="middle" fill="var(--foreground)" fontSize="10">{formatValue(value)}</text>
              <text x={gap * index + gap / 2} y={height - 14} textAnchor="middle" fill="var(--muted-foreground)" fontSize="10">{item.label.length > 12 ? `${item.label.slice(0, 10)}…` : item.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

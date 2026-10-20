import { Trophy } from 'lucide-react';
import { DASHBOARD_WIDGET_LIMIT } from '@/constants';
import type { ProductPerformanceData } from '@/lib/api/contract';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { MESSAGES } from '@/messages';
import { DashboardWidget, WidgetRow } from './dashboard-widget';

const { dashboard } = MESSAGES;

interface TopSellingProps {
  items: ProductPerformanceData[];
  totalRecord: number;
  isLoading: boolean;
  error: string;
  onRetry: () => void;
  onViewAll: () => void;
}

export function TopSelling({
  items,
  totalRecord,
  isLoading,
  error,
  onRetry,
  onViewAll,
}: TopSellingProps) {
  const displayed = items.slice(0, DASHBOARD_WIDGET_LIMIT);

  return (
    <DashboardWidget
      title={dashboard.topSellingTitle}
      hasMore={totalRecord > displayed.length}
      onViewAll={onViewAll}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      isEmpty={displayed.length === 0}
      emptyTitle={dashboard.topSellingEmptyTitle}
      emptyBody={dashboard.topSellingEmptyBody}
    >
      <ul className="divide-border divide-y">
        {displayed.map((product) => (
          <WidgetRow
            key={product.productId}
            icon={Trophy}
            intent="warning"
            title={product.name || dashboard.productFallback}
            subtitle={dashboard.revenue(formatCurrency(product.revenue))}
            value={formatNumber(product.qty)}
          />
        ))}
      </ul>
    </DashboardWidget>
  );
}

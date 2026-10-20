import { TrendingUp } from 'lucide-react';
import { DASHBOARD_WIDGET_LIMIT } from '@/constants';
import type { ProductPerformanceData } from '@/lib/api/contract';
import { formatCurrency } from '@/lib/utils';
import { MESSAGES } from '@/messages';
import { DashboardWidget, WidgetRow } from './dashboard-widget';

const { dashboard } = MESSAGES;

interface ProductPerformanceProps {
  items: ProductPerformanceData[];
  totalRecord: number;
  isLoading: boolean;
  error: string;
  onRetry: () => void;
  onViewAll: () => void;
}

export function ProductPerformance({
  items,
  totalRecord,
  isLoading,
  error,
  onRetry,
  onViewAll,
}: ProductPerformanceProps) {
  const displayed = items.slice(0, DASHBOARD_WIDGET_LIMIT);

  return (
    <DashboardWidget
      title={dashboard.productPerformanceTitle}
      hasMore={totalRecord > displayed.length}
      onViewAll={onViewAll}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      isEmpty={displayed.length === 0}
      emptyTitle={dashboard.productPerformanceEmptyTitle}
      emptyBody={dashboard.productPerformanceEmptyBody}
    >
      <ul className="divide-border divide-y">
        {displayed.map((product) => (
          <WidgetRow
            key={product.productId}
            icon={TrendingUp}
            intent="info"
            title={product.name || dashboard.productFallback}
            subtitle={dashboard.soldCount(product.qty)}
            value={formatCurrency(product.revenue)}
          />
        ))}
      </ul>
    </DashboardWidget>
  );
}

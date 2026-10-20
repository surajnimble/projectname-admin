import { AlertTriangle } from 'lucide-react';
import { DASHBOARD_WIDGET_LIMIT } from '@/constants';
import type { LowStockProductData } from '@/lib/api/contract';
import { MESSAGES } from '@/messages';
import { DashboardWidget, WidgetRow } from './dashboard-widget';

const { dashboard } = MESSAGES;

interface LowStockProps {
  items: LowStockProductData[];
  totalRecord: number;
  isLoading: boolean;
  error: string;
  onRetry: () => void;
  onViewAll: () => void;
}

export function LowStock({
  items,
  totalRecord,
  isLoading,
  error,
  onRetry,
  onViewAll,
}: LowStockProps) {
  const displayed = items.slice(0, DASHBOARD_WIDGET_LIMIT);

  return (
    <DashboardWidget
      title={dashboard.lowStockTitle}
      hasMore={totalRecord > displayed.length}
      onViewAll={onViewAll}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      isEmpty={displayed.length === 0}
      emptyTitle={dashboard.lowStockEmptyTitle}
      emptyBody={dashboard.lowStockEmptyBody}
    >
      <ul className="divide-border divide-y">
        {displayed.map((product) => (
          <WidgetRow
            key={`${product.sku}-${product.name}`}
            icon={AlertTriangle}
            intent="danger"
            title={product.name || dashboard.productFallback}
            subtitle={[product.sku, product.shop, dashboard.threshold(product.threshold)]
              .filter(Boolean)
              .join(' · ')}
            value={
              product.stock === 0
                ? dashboard.lowStockOut
                : dashboard.lowStockLeft(product.stock)
            }
            valueClassName="text-danger"
          />
        ))}
      </ul>
    </DashboardWidget>
  );
}

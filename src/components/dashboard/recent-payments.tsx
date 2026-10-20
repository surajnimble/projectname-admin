import { CreditCard } from 'lucide-react';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { DASHBOARD_WIDGET_LIMIT } from '@/constants';
import type { PaymentSummaryData } from '@/lib/api/contract';
import { formatRelativeTime } from '@/lib/utils/datetime';
import { formatCurrency } from '@/lib/utils';
import { MESSAGES } from '@/messages';
import { DashboardWidget, WidgetRow } from './dashboard-widget';

const { dashboard } = MESSAGES;

type BadgeIntent = NonNullable<BadgeProps['intent']>;

const STATUS_INTENTS: Record<string, BadgeIntent> = {
  PAID: 'success',
  COD_COLLECTED: 'success',
  PENDING: 'warning',
  COD_PENDING: 'warning',
  PARTIALLY_REFUNDED: 'warning',
  FAILED: 'danger',
  REFUNDED: 'info',
};

interface RecentPaymentsProps {
  items: PaymentSummaryData[];
  totalRecord: number;
  isLoading: boolean;
  error: string;
  onRetry: () => void;
  onViewAll: () => void;
}

export function RecentPayments({
  items,
  totalRecord,
  isLoading,
  error,
  onRetry,
  onViewAll,
}: RecentPaymentsProps) {
  const displayed = items.slice(0, DASHBOARD_WIDGET_LIMIT);

  return (
    <DashboardWidget
      title={dashboard.recentPaymentsTitle}
      hasMore={totalRecord > displayed.length}
      onViewAll={onViewAll}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      isEmpty={displayed.length === 0}
      emptyTitle={dashboard.recentPaymentsEmptyTitle}
      emptyBody={dashboard.recentPaymentsEmptyBody}
    >
      <ul className="divide-border divide-y">
        {displayed.map((payment) => {
          const orderNumber = payment.orderData.orderNumber;
          const method = payment.method
            ? (dashboard.activityMethods[payment.method] ?? payment.method)
            : '';
          const time = formatRelativeTime(payment.createdAt);
          const status = payment.status
            ? (dashboard.paymentStatuses[payment.status] ?? payment.status)
            : '';
          const amount = payment.paidAmount > 0 ? payment.paidAmount : payment.amount;

          return (
            <WidgetRow
              key={payment.paymentId}
              icon={CreditCard}
              intent="success"
              title={orderNumber ? `#${orderNumber}` : dashboard.paymentFallback}
              subtitle={[method, time].filter(Boolean).join(' · ')}
              value={formatCurrency(amount)}
              trailing={
                status ? (
                  <Badge intent={STATUS_INTENTS[payment.status] ?? 'neutral'}>{status}</Badge>
                ) : undefined
              }
            />
          );
        })}
      </ul>
    </DashboardWidget>
  );
}

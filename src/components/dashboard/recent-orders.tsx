import { DASHBOARD_WIDGET_LIMIT } from '@/constants';
import type { ActivityLogData } from '@/lib/api/contract';
import { MESSAGES } from '@/messages';
import { DashboardWidget } from './dashboard-widget';
import { ActivityItem } from './recent-activity';

const { dashboard } = MESSAGES;

interface RecentOrdersProps {
  items: ActivityLogData[];
  totalRecord: number;
  isLoading: boolean;
  error: string;
  onRetry: () => void;
  onViewAll: () => void;
}

export function RecentOrders({
  items,
  totalRecord,
  isLoading,
  error,
  onRetry,
  onViewAll,
}: RecentOrdersProps) {
  const displayed = items.slice(0, DASHBOARD_WIDGET_LIMIT);

  return (
    <DashboardWidget
      title={dashboard.recentOrdersTitle}
      hasMore={totalRecord > displayed.length}
      onViewAll={onViewAll}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      isEmpty={displayed.length === 0}
      emptyTitle={dashboard.recentOrdersEmptyTitle}
      emptyBody={dashboard.recentOrdersEmptyBody}
    >
      <ul className="divide-border divide-y">
        {displayed.map((activity) => (
          <ActivityItem key={activity.activityLogId} activity={activity} />
        ))}
      </ul>
    </DashboardWidget>
  );
}

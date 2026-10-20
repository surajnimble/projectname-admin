'use client';

import { useRouter } from 'next/navigation';
import {
  Clock,
  LifeBuoy,
  Package,
  RefreshCw,
  RotateCcw,
  ShoppingCart,
  Store,
  Undo2,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { ErrorState } from '@/components/common/error-state';
import { PageHeader } from '@/components/common/page-header';
import { LowStock } from '@/components/dashboard/low-stock';
import { ProductPerformance } from '@/components/dashboard/product-performance';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { RecentOrders } from '@/components/dashboard/recent-orders';
import { RecentPayments } from '@/components/dashboard/recent-payments';
import { TopSelling } from '@/components/dashboard/top-selling';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/constants';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';
import { useLowStock } from '@/hooks/use-low-stock';
import { useMounted } from '@/hooks/use-mounted';
import { useProductPerformance } from '@/hooks/use-product-performance';
import { useRecentActivity } from '@/hooks/use-recent-activity';
import { useRecentOrders } from '@/hooks/use-recent-orders';
import { useRecentPayments } from '@/hooks/use-recent-payments';
import type { DashboardStatsData } from '@/lib/api/contract';
import { formatLongDate } from '@/lib/utils/datetime';
import { showInfo } from '@/lib/utils/toast';
import { cn } from '@/lib/utils';
import { MESSAGES } from '@/messages';
import { useAuth } from '@/providers/auth-provider';

const { dashboard, sections } = MESSAGES;

type StatKey = keyof DashboardStatsData;
type StatIntent = 'primary' | 'info' | 'success' | 'warning' | 'danger';

interface StatDefinition {
  key: StatKey;
  label: string;
  section: string;
  icon: LucideIcon;
  intent: StatIntent;
}

const STATS: readonly StatDefinition[] = [
  {
    key: 'totalOrders',
    label: dashboard.stats.totalOrders,
    section: sections.orders,
    icon: ShoppingCart,
    intent: 'info',
  },
  {
    key: 'totalVendors',
    label: dashboard.stats.totalVendors,
    section: sections.vendors,
    icon: Store,
    intent: 'info',
  },
  {
    key: 'totalUsers',
    label: dashboard.stats.totalUsers,
    section: sections.users,
    icon: Users,
    intent: 'primary',
  },
  {
    key: 'pendingVendors',
    label: dashboard.stats.pendingVendors,
    section: sections.vendors,
    icon: Clock,
    intent: 'warning',
  },
  {
    key: 'totalProducts',
    label: dashboard.stats.totalProducts,
    section: sections.products,
    icon: Package,
    intent: 'primary',
  },
  {
    key: 'revenue30d',
    label: dashboard.stats.revenue30d,
    section: sections.analytics,
    icon: Wallet,
    intent: 'success',
  },
  {
    key: 'openTickets',
    label: dashboard.stats.openTickets,
    section: sections.tickets,
    icon: LifeBuoy,
    intent: 'warning',
  },
  {
    key: 'pendingReturns',
    label: dashboard.stats.pendingReturns,
    section: sections.returns,
    icon: RotateCcw,
    intent: 'warning',
  },
  {
    key: 'pendingRefunds',
    label: dashboard.stats.pendingRefunds,
    section: sections.refunds,
    icon: Undo2,
    intent: 'danger',
  },
];

const INTENT_CLASSES: Record<StatIntent, string> = {
  primary: 'bg-soft text-soft-fg',
  info: 'bg-info-bg text-info',
  success: 'bg-success-bg text-success',
  warning: 'bg-warning-bg text-warning',
  danger: 'bg-danger-bg text-danger',
};

const INTENT_TEXT_CLASSES: Record<StatIntent, string> = {
  primary: 'text-primary',
  info: 'text-info',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
};

const STAT_ROUTES: Partial<Record<StatKey, string>> = {
  totalVendors: ROUTES.vendors,
  pendingVendors: ROUTES.vendors,
};

const formatValue = (value: number) => value.toLocaleString('en-IN');

function StatCard({
  label,
  value,
  icon: Icon,
  intent,
  onSelect,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  intent: StatIntent;
  onSelect: () => void;
}) {
  return (
    <Card flat className="hover:border-border-strong h-full py-0 transition-colors">
      <button
        type="button"
        onClick={onSelect}
        className="flex h-full w-full flex-col overflow-hidden rounded-md p-4 text-left 2xl:p-5"
      >
        <span className="flex items-start justify-between gap-2 2xl:gap-4">
          <span className="flex min-w-0 flex-col gap-1">
            <span className={cn('text-sm font-medium 2xl:text-base', INTENT_TEXT_CLASSES[intent])}>
              {label}
            </span>
            <span className="text-fg text-xl font-semibold tracking-tight tabular-nums 2xl:text-2xl">
              {formatValue(value)}
            </span>
          </span>
          <span
            aria-hidden="true"
            className={cn(
              'flex size-8 shrink-0 items-center justify-center rounded-lg 2xl:size-10',
              INTENT_CLASSES[intent],
            )}
          >
            <Icon className="size-4 2xl:size-5" />
          </span>
        </span>
      </button>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card className="p-4 2xl:p-5">
      <div className="flex items-start justify-between gap-2 2xl:gap-4">
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-4 w-20 2xl:h-5 2xl:w-28" />
          <Skeleton className="h-7 w-12 2xl:h-8 2xl:w-16" />
        </div>
        <Skeleton className="size-8 rounded-lg 2xl:size-10" />
      </div>
    </Card>
  );
}

export function DashboardOverview() {
  const { user } = useAuth();
  const router = useRouter();
  const stats = useDashboardStats();
  const activity = useRecentActivity();
  const orders = useRecentOrders();
  const payments = useRecentPayments();
  const performance = useProductPerformance('revenue');
  const topSelling = useProductPerformance('qty');
  const lowStock = useLowStock();
  const mounted = useMounted();
  const today = new Date();
  const isLoading =
    stats.isLoading ||
    activity.isLoading ||
    orders.isLoading ||
    payments.isLoading ||
    performance.isLoading ||
    topSelling.isLoading ||
    lowStock.isLoading;

  const viewAll = (section: string) => showInfo(MESSAGES.common.comingSoon(section));

  const refresh = () => {
    void stats.refresh();
    void activity.refresh();
    void orders.refresh();
    void payments.refresh();
    void performance.refresh();
    void topSelling.refresh();
    void lowStock.refresh();
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={dashboard.greeting(user?.name ?? '')}
        description={dashboard.homeSubtitle}
        meta={
          mounted ? (
            <time className="text-primary font-bold" dateTime={today.toISOString()}>
              {formatLongDate(today)}
            </time>
          ) : undefined
        }
        action={
          <Button variant="outline" size="sm" loading={isLoading} onClick={refresh}>
            <RefreshCw className="size-4" aria-hidden="true" />
            {dashboard.refresh}
          </Button>
        }
      />

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_20rem] 2xl:grid-cols-[minmax(0,1fr)_22rem]">
        {stats.isLoading ? (
          <div
            className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-4"
            role="status"
            aria-busy="true"
          >
            <span className="sr-only">{MESSAGES.common.loading}</span>
            {STATS.map((stat) => (
              <StatCardSkeleton key={stat.key} />
            ))}
          </div>
        ) : stats.error ? (
          <ErrorState message={stats.error} onRetry={() => void stats.refresh()} />
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-4">
            {STATS.map((stat) => (
              <StatCard
                key={stat.key}
                label={stat.label}
                value={stats.data[stat.key]}
                icon={stat.icon}
                intent={stat.intent}
                onSelect={() => {
                  const route = STAT_ROUTES[stat.key];
                  if (route) {
                    router.push(route);
                    return;
                  }
                  showInfo(MESSAGES.common.comingSoon(stat.section));
                }}
              />
            ))}
          </div>
        )}

        <RecentActivity
          items={activity.data.itemList}
          isLoading={activity.isLoading}
          error={activity.error}
          hasMore={activity.data.totalRecord > activity.data.itemList.length}
          onRetry={() => void activity.refresh()}
          onViewAll={() => viewAll(sections.activity)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <RecentOrders
          items={orders.data.itemList}
          totalRecord={orders.data.totalRecord}
          isLoading={orders.isLoading}
          error={orders.error}
          onRetry={() => void orders.refresh()}
          onViewAll={() => viewAll(sections.orders)}
        />
        <RecentPayments
          items={payments.data.itemList}
          totalRecord={payments.data.totalRecord}
          isLoading={payments.isLoading}
          error={payments.error}
          onRetry={() => void payments.refresh()}
          onViewAll={() => viewAll(sections.payments)}
        />
        <ProductPerformance
          items={performance.data.itemList}
          totalRecord={performance.data.totalRecord}
          isLoading={performance.isLoading}
          error={performance.error}
          onRetry={() => void performance.refresh()}
          onViewAll={() => viewAll(sections.analytics)}
        />
        <TopSelling
          items={topSelling.data.itemList}
          totalRecord={topSelling.data.totalRecord}
          isLoading={topSelling.isLoading}
          error={topSelling.error}
          onRetry={() => void topSelling.refresh()}
          onViewAll={() => viewAll(sections.products)}
        />
        <LowStock
          items={lowStock.data.itemList}
          totalRecord={lowStock.data.totalRecord}
          isLoading={lowStock.isLoading}
          error={lowStock.error}
          onRetry={() => void lowStock.refresh()}
          onViewAll={() => viewAll(sections.inventory)}
        />
      </div>
    </div>
  );
}

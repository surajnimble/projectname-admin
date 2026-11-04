'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { PageHeader } from '@/components/common/page-header';
import { DataTable } from '@/components/common/data-table';
import { Pagination } from '@/components/common/pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePermission } from '@/hooks/use-permission';
import { useCustomerDetail } from '@/hooks/use-customer-detail';
import type { AddressData, ActivityLogData, OrderSummaryData } from '@/lib/api/contract';
import { PERMISSIONS, ROUTES } from '@/constants';
import { formatCurrency } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils/datetime';
import { showSuccess } from '@/lib/utils/toast';
import { MESSAGES } from '@/messages';
import { StatusBadge, orderStatusMeta } from '@/components/common/status-badge';

const { customers } = MESSAGES;
const orderMessages = MESSAGES.orders;
const df = customers.detail.fields;

const orderColumns = [
  {
    key: 'order',
    header: orderMessages.columns.order,
    cell: (row: OrderSummaryData) => (
      <span className="font-medium">{row.orderNumber || customers.fallback}</span>
    ),
  },
  {
    key: 'status',
    header: customers.columns.status,
    hideBelow: 'lg',
    width: 'w-32',
    cell: (row: OrderSummaryData) => <StatusBadge meta={orderStatusMeta(row.status)} />,
  },
  {
    key: 'total',
    header: orderMessages.columns.total,
    align: 'right',
    hideBelow: 'xl',
    width: 'w-32',
    numeric: true,
    cell: (row: OrderSummaryData) => <span className="block">{formatCurrency(row.total)}</span>,
  },
  {
    key: 'date',
    header: orderMessages.columns.date,
    hideBelow: '2xl',
    width: 'w-40',
    cell: (row: OrderSummaryData) => <span className="text-sm">{formatRelativeTime(row.createdAt)}</span>,
  },
] as const;

const activityColumns = [
  {
    key: 'action',
    header: MESSAGES.activityLogs.columns.action,
    cell: (row: ActivityLogData) => <span className="font-medium">{row.action}</span>,
  },
  {
    key: 'entity',
    header: MESSAGES.activityLogs.columns.entity,
    hideBelow: 'lg',
    width: 'w-32',
    cell: (row: ActivityLogData) => <span className="text-sm">{row.entity}</span>,
  },
  {
    key: 'ip',
    header: MESSAGES.activityLogs.statuses.ip,
    hideBelow: 'xl',
    width: 'w-32',
    cell: (row: ActivityLogData) => <span className="text-sm text-fg-muted">{row.ip}</span>,
  },
  {
    key: 'date',
    header: MESSAGES.activityLogs.columns.created,
    hideBelow: '2xl',
    width: 'w-40',
    cell: (row: ActivityLogData) => <span className="text-sm">{formatRelativeTime(row.createdAt)}</span>,
  },
] as const;

type Params = { userId: string };

export default function CustomerDetailPage({ params }: { params: Params | Promise<Params> }) {
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    void (async () => {
      setUserId((await params).userId);
    })();
  }, [params]);

  const { can } = usePermission();
  const {
    detail,
    activityLogs,
    orders: orderList,
    activityPage,
    setActivityPage,
    ordersPage,
    setOrdersPage,
    activityTotal,
    ordersTotal,
    isLoading,
    error,
    isActioning,
    suspendUser,
    banUser,
    unbanUser,
    refresh,
  } = useCustomerDetail(userId);

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'activity'>('overview');

  if (!userId) {
    return (
      <div className="flex min-h-0 flex-col">
        <PageHeader title={customers.detail.title} description={customers.detail.subtitle} />
        <div className="p-8 flex items-center justify-center">
          <span className="size-8"><Spinner /></span>
        </div>
      </div>
    );
  }

  const isSuspended = detail?.userData.isActive === false;
  const isBanned = detail?.userData.isActive === false;

  const handleSuspend = async () => {
    const done = await suspendUser(!isSuspended, '');
    if (done) {
      await refresh();
      showSuccess(
        detail?.userData.isActive === false
          ? customers.customerReactivated
          : customers.customerSuspended,
      );
    }
  };

  const handleBan = async () => {
    const done = await banUser('Banned from admin panel');
    if (done) {
      await refresh();
      showSuccess(customers.customerBanned);
    }
  };

  const handleUnban = async () => {
    const done = await unbanUser();
    if (done) {
      await refresh();
      showSuccess(customers.customerUnbanned);
    }
  };

  if (isLoading && !detail) {
    return (
      <div className="flex min-h-0 flex-col">
        <PageHeader title={customers.detail.title} description={customers.detail.subtitle} />
        <div className="p-8 flex items-center justify-center">
          <span className="size-8"><Spinner /></span>
        </div>
      </div>
    );
  }

  if (error && !detail) {
    return (
      <div className="flex min-h-0 flex-col">
        <PageHeader title={customers.detail.title} description={customers.detail.subtitle} />
        <div className="p-8 flex flex-col items-center justify-center gap-3">
          <p className="text-destructive">{error}</p>
          <Button variant="outline" onClick={() => void refresh()}>
            {MESSAGES.common.retry}
          </Button>
        </div>
      </div>
    );
  }

  const user = detail?.userData;
  const stats = detail?.statsData;

  return (
    <div className="flex min-h-0 flex-col">
      <PageHeader
        title={user?.name || customers.detail.title}
        description={`${customers.detail.subtitle} • ${user?.email}`}
        action={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Link href={ROUTES.customers} replace>
              <Button size="sm" variant="outline">{customers.back}</Button>
            </Link>
            {detail && can(PERMISSIONS.userSuspend) && (
              <Button
                size="sm"
                onClick={handleSuspend}
                disabled={isActioning}
                loading={isActioning}
                variant={isSuspended ? 'outline' : 'destructive'}
              >
                {isSuspended ? customers.reactivate : customers.suspend}
              </Button>
            )}
            {detail && can(PERMISSIONS.userBan) && (
              <Button
                size="sm"
                onClick={isBanned ? handleUnban : handleBan}
                disabled={isActioning}
                loading={isActioning}
                variant={isBanned ? 'outline' : 'destructive'}
              >
                {isBanned ? customers.unban : customers.ban}
              </Button>
            )}
          </div>
        }
      />

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'overview' | 'orders' | 'activity')} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">{customers.detail.tabs.overview}</TabsTrigger>
          <TabsTrigger value="orders">{customers.detail.tabs.orders}</TabsTrigger>
          <TabsTrigger value="activity">{customers.detail.tabs.activity}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="border-t p-0">
          <div className="p-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>{customers.detail.sections.profile}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col">
                    <Label className="text-xs font-medium text-fg-muted">{df.role}</Label>
                    <p className="text-sm capitalize">{user?.role}</p>
                  </div>
                  <div className="flex flex-col">
                    <Label className="text-xs font-medium text-fg-muted">{df.email}</Label>
                    <p className="text-sm truncate">{user?.email}</p>
                  </div>
                  <div className="flex flex-col">
                    <Label className="text-xs font-medium text-fg-muted">{df.phone}</Label>
                    <p className="text-sm">{user?.phone || customers.dash}</p>
                  </div>
                  <div className="flex flex-col">
                    <Label className="text-xs font-medium text-fg-muted">{df.lastLogin}</Label>
                    <p className="text-sm">{user?.lastLoginAt ? formatRelativeTime(user.lastLoginAt) : customers.dash}</p>
                  </div>
                  <div className="flex flex-col">
                    <Label className="text-xs font-medium text-fg-muted">{df.joined}</Label>
                    <p className="text-sm">{user?.createdAt ? formatRelativeTime(user.createdAt) : customers.dash}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{customers.detail.sections.verification}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{df.email}</span>
                    <StatusBadge
                      meta={{
                        label: user?.isEmailVerified ? customers.statuses.active : customers.statuses.inactive,
                        intent: user?.isEmailVerified ? 'success' : 'neutral',
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{df.phone}</span>
                    <StatusBadge
                      meta={{
                        label: user?.isPhoneVerified ? customers.statuses.active : customers.statuses.inactive,
                        intent: user?.isPhoneVerified ? 'success' : 'neutral',
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{customers.detail.sections.stats}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col">
                    <Label className="text-xs font-medium text-fg-muted">{df.orderCount}</Label>
                    <p className="text-lg font-semibold">{stats?.orderCount ?? 0}</p>
                  </div>
                  <div className="flex flex-col">
                    <Label className="text-xs font-medium text-fg-muted">{df.reviewCount}</Label>
                    <p className="text-lg font-semibold">{stats?.reviewCount ?? 0}</p>
                  </div>
                  <div className="flex flex-col">
                    <Label className="text-xs font-medium text-fg-muted">{df.addressCount}</Label>
                    <p className="text-lg font-semibold">{stats?.addressCount ?? 0}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {detail && detail.addressList.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>{customers.detail.sections.addresses}</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {detail.addressList.map((addr: AddressData) => (
                      <div key={addr.addressId} className="p-3 border border-border rounded-lg bg-surface-muted/50">
                        <p className="text-sm font-medium">{addr.fullName}</p>
                        <p className="text-sm text-fg-muted">
                          {addr.line1} {addr.line2 ? `, ${addr.line2}` : ''}
                        </p>
                        <p className="text-sm text-fg-muted">
                          {addr.city}, {addr.state} {addr.pincode}, {addr.country}
                        </p>
                        <p className="text-sm text-fg-muted">{addr.phone}</p>
                        {addr.isDefault && (
                          <StatusBadge meta={{ label: customers.statuses.active, intent: 'success' }} />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {detail && detail.socialProviderList.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>{customers.detail.sections.socialProviders}</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {detail.socialProviderList.map((sp) => (
                      <div key={sp.provider} className="p-3 border border-border rounded-lg bg-surface-muted/50 flex items-center justify-between">
                        <span className="text-sm capitalize">{sp.provider}</span>
                        <span className="text-sm text-fg-muted truncate max-w-xs">{sp.providerId}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="orders" className="border-t p-0">
          <Card className="overflow-hidden">
            <div className="p-6">
              <DataTable
                columns={orderColumns}
                rows={orderList}
                rowKey={(row: OrderSummaryData) => row.orderId}
                isLoading={isLoading}
                error={error}
                onRetry={() => void refresh()}
                emptyTitle={df.noOrders}
                footer={
                  <Pagination
                    currentPage={ordersPage}
                    totalPage={Math.ceil(ordersTotal / 10)}
                    totalRecord={ordersTotal}
                    limit={10}
                    onPageChange={setOrdersPage}
                  />
                }
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="border-t p-0">
          <Card className="overflow-hidden">
            <div className="p-6">
              <DataTable
                columns={activityColumns}
                rows={activityLogs}
                rowKey={(row: ActivityLogData) => row.activityLogId}
                isLoading={isLoading}
                error={error}
                onRetry={() => void refresh()}
                emptyTitle={df.noActivity}
                footer={
                  <Pagination
                    currentPage={activityPage}
                    totalPage={Math.ceil(activityTotal / 10)}
                    totalRecord={activityTotal}
                    limit={10}
                    onPageChange={setActivityPage}
                  />
                }
              />
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

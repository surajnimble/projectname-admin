'use client';

import { useState } from 'react';
import { PermissionGuard } from '@/components/auth/guards';
import { PageHeader } from '@/components/common/page-header';
import { DataTable } from '@/components/common/data-table';
import { Pagination } from '@/components/common/pagination';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { OptionsMenu, type OptionsMenuItem } from '@/components/ui/options-menu';
import { StatusBadge } from '@/components/common/status-badge';
import { useOrders } from '@/hooks/use-orders';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';

export default function ClientActivityLogsPage() {
  const {
    data,
    isLoading,
    error,
    page,
    search,
    setPage,
    setSearch,
    refresh,
  } = useOrders();

  const columns = [
    {
      key: 'activity',
      header: 'Activity',
      cell: (row: any) => <span className="font-medium">{row.orderNumber || row.orderId}</span>,
    },
    {
      key: 'entity',
      header: 'Entity',
      hideBelow: 'lg',
      width: 'w-32',
      cell: (row: any) => <span className="text-sm truncate">{row.paymentMethod}</span>,
    },
    {
      key: 'user',
      header: 'Staff',
      hideBelow: 'xl',
      width: 'w-40',
      cell: (row: any) => <span className="text-sm truncate">{row.userData?.name || row.userData?.email}</span>,
    },
    {
      key: 'created',
      header: 'Created',
      cell: (row: any) => <span className="text-sm">{row.createdAt}</span>,
    },
  ] as const;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={MESSAGES.sections.activity}
        description='View staff activity and system audit logs.'
      />
      <PermissionGuard permission={PERMISSIONS.activityLogView}>
        <Card className="overflow-hidden">
          <DataTable
            columns={columns}
            rows={data.itemList}
            rowKey={(row: any) => row.orderId}
            toolbar={{
              search: {
                value: search,
                placeholder: 'Search by action, user or entity',
                onChange: setSearch,
              },
              filters: {
                label: MESSAGES.common.filters,
                count: 0,
                onOpen: () => {},
              },
              actions: (
                <Button variant="outline" size="sm" loading={isLoading} onClick={() => void refresh()}>
                  {MESSAGES.dashboard.refresh}
                </Button>
              ),
            }}
            isLoading={isLoading}
            error={error}
            onRetry={() => void refresh()}
            emptyTitle={MESSAGES.sections.activity}
            footer={
              <Pagination
                currentPage={data.currentPage}
                totalPage={data.totalPage}
                totalRecord={data.totalRecord}
                limit={data.limit}
                onPageChange={setPage}
              />
            }
          />
        </Card>
      </PermissionGuard>
    </div>
  );
}

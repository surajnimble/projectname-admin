'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { DataTable } from '@/components/common/data-table';
import { Pagination } from '@/components/common/pagination';
import { orderColumns } from '@/components/order/order-columns';
import { Card } from '@/components/ui/card';
import { OptionsMenu, type OptionsMenuItem } from '@/components/ui/options-menu';
import {
  ORDER_PAGE_SIZE,
  ORDER_STATUS_OPTIONS,
  ORDER_STATUSES,
  PERMISSIONS,
  ROUTES,
  type OrderStatusFilter,
} from '@/constants';
import { useOrders } from '@/hooks/use-orders';
import { usePermission } from '@/hooks/use-permission';
import type { OrderSummaryData } from '@/lib/api/contract';
import { showSuccess } from '@/lib/utils/toast';
import { MESSAGES } from '@/messages';
import { OrderStatusDialog } from './order-status-dialog';

const { orders } = MESSAGES;

const STATUS_OPTIONS = [
  { value: ORDER_STATUSES.all, label: orders.allStatuses },
  ...ORDER_STATUS_OPTIONS.map((option) => ({
    value: option,
    label: orders.statuses[option],
  })),
];

export function OrderList() {
  const router = useRouter();
  const { can } = usePermission();
  const {
    data,
    isLoading,
    error,
    actionError,
    isActioning,
    page,
    search,
    status,
    setPage,
    setSearch,
    setStatus,
    updateStatus,
    clearActionError,
  } = useOrders();
  const [editing, setEditing] = useState<OrderSummaryData | null>(null);

  const closeDialog = () => {
    setEditing(null);
    clearActionError();
  };

  const handleUpdate = async (values: { status: string; remark: string; location: string }) => {
    if (!editing) return;
    const done = await updateStatus(editing.orderId, values);
    if (!done) return;
    showSuccess(orders.statusUpdated);
    closeDialog();
  };

  const emptyMessage =
    search || status !== ORDER_STATUSES.all ? orders.emptyFiltered : orders.empty;

  return (
    <Card className="overflow-hidden">
      <DataTable
        columns={orderColumns}
        rows={data.itemList}
        rowKey={(order) => order.orderId}
        onRowClick={(order) => router.push(ROUTES.orderDetails(order.orderId))}
        toolbar={{
          search: {
            value: search,
            placeholder: orders.searchPlaceholder,
            onChange: setSearch,
          },
          select: {
            value: status,
            ariaLabel: orders.statusLabel,
            options: STATUS_OPTIONS,
            onChange: (value) => setStatus(value as OrderStatusFilter),
          },
        }}
        actions={{
          header: orders.columns.actions,
          render: (order) => {
            const items: OptionsMenuItem[] = [
              {
                label: orders.view,
                onSelect: () => router.push(ROUTES.orderDetails(order.orderId)),
              },
              ...(can(PERMISSIONS.orderUpdateStatus)
                ? [{ label: orders.updateStatus, onSelect: () => setEditing(order) }]
                : []),
            ];

            return (
              <OptionsMenu label={orders.actionsLabel} items={items} className="flex justify-end" />
            );
          },
        }}
        isLoading={isLoading}
        error={error}
        emptyTitle={emptyMessage}
        footer={
          <Pagination
            currentPage={data.currentPage || page}
            totalPage={data.totalPage}
            totalRecord={data.totalRecord}
            limit={data.limit || ORDER_PAGE_SIZE}
            onPageChange={setPage}
          />
        }
      />

      {editing && (
        <OrderStatusDialog
          key={editing.orderId}
          open
          currentStatus={editing.status}
          isSubmitting={isActioning}
          error={actionError}
          onConfirm={(values) => void handleUpdate(values)}
          onClose={closeDialog}
        />
      )}
    </Card>
  );
}

'use client';

import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Pagination } from '@/components/common/pagination';
import { orderStatusMeta, StatusBadge } from '@/components/common/status-badge';
import { TableSkeleton } from '@/components/common/table-skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { OptionsMenu, type OptionsMenuItem } from '@/components/ui/options-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ORDER_PAGE_SIZE, ORDER_STATUS_OPTIONS, ORDER_STATUSES, PERMISSIONS, ROUTES, type OrderStatusFilter } from '@/constants';
import { useOrders } from '@/hooks/use-orders';
import { usePermission } from '@/hooks/use-permission';
import type { OrderSummaryData } from '@/lib/api/contract';
import { formatCurrency } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils/datetime';
import { showSuccess } from '@/lib/utils/toast';
import { MESSAGES } from '@/messages';
import { OrderStatusDialog } from './order-status-dialog';

const { orders } = MESSAGES;

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

  const emptyMessage = search || status !== ORDER_STATUSES.all ? orders.emptyFiltered : orders.empty;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-border border-b p-4">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>{orders.title}</CardTitle>
          <div className="ml-auto flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <div className="relative min-w-0 flex-1 sm:w-72 sm:flex-none">
              <Search
                className="text-fg-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                aria-hidden="true"
              />
              <Input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={orders.searchPlaceholder}
                aria-label={MESSAGES.common.search}
                className="pl-9"
              />
            </div>
            <Select value={status} onValueChange={(value) => setStatus(value as OrderStatusFilter)}>
              <SelectTrigger aria-label={orders.statusLabel} className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ORDER_STATUSES.all}>{orders.allStatuses}</SelectItem>
                {ORDER_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {orders.statuses[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : error ? (
        <div className="p-4">
          <p role="alert" className="text-danger text-sm">
            {error}
          </p>
        </div>
      ) : data.itemList.length === 0 ? (
        <CardContent className="p-4">
          <p className="text-fg-muted text-sm">{emptyMessage}</p>
        </CardContent>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{orders.columns.order}</TableHead>
              <TableHead className="hidden md:table-cell">{orders.columns.customer}</TableHead>
              <TableHead className="hidden lg:table-cell">{orders.columns.items}</TableHead>
              <TableHead>{orders.columns.total}</TableHead>
              <TableHead>{orders.columns.status}</TableHead>
              <TableHead className="hidden lg:table-cell">{orders.columns.date}</TableHead>
              <TableHead className="text-right">{orders.columns.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.itemList.map((order) => {
              const items: OptionsMenuItem[] = [
                { label: orders.view, onSelect: () => router.push(ROUTES.orderDetails(order.orderId)) },
                ...(can(PERMISSIONS.orderUpdateStatus)
                  ? [{ label: orders.updateStatus, onSelect: () => setEditing(order) }]
                  : []),
              ];

              return (
                <TableRow
                  key={order.orderId}
                  data-ripple=""
                  className="cursor-pointer"
                  onClick={() => router.push(ROUTES.orderDetails(order.orderId))}
                >
                  <TableCell>
                    <span className="font-medium">{order.orderNumber || orders.fallback}</span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {order.userData.name || order.userData.email || orders.dash}
                  </TableCell>
                  <TableCell className="hidden tabular-nums lg:table-cell">{order.itemCount}</TableCell>
                  <TableCell className="tabular-nums">{formatCurrency(order.total)}</TableCell>
                  <TableCell>
                    <StatusBadge meta={orderStatusMeta(order.status)} />
                  </TableCell>
                  <TableCell className="text-fg-muted hidden whitespace-nowrap lg:table-cell">
                    {formatRelativeTime(order.createdAt)}
                  </TableCell>
                  <TableCell onClick={(event) => event.stopPropagation()}>
                    <OptionsMenu label={orders.actionsLabel} items={items} className="flex justify-end" />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <Pagination
        currentPage={data.currentPage || page}
        totalPage={data.totalPage}
        totalRecord={data.totalRecord}
        limit={data.limit || ORDER_PAGE_SIZE}
        onPageChange={setPage}
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

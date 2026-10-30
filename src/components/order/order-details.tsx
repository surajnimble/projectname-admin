'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { DetailCard, DetailItem } from '@/components/common/detail-grid';
import { ErrorState } from '@/components/common/error-state';
import { PageHeader } from '@/components/common/page-header';
import { orderStatusMeta } from '@/components/common/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DataTable, type DataTableColumn } from '@/components/common/data-table';
import { DataTableIdentity, DataTableMedia } from '@/components/common/data-table-media';
import { PERMISSIONS, ROUTES } from '@/constants';
import { useOrderDetail } from '@/hooks/use-order-detail';
import type { OrderItemData } from '@/lib/api/contract';
import { usePermission } from '@/hooks/use-permission';
import { formatCurrency } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils/datetime';
import { showSuccess } from '@/lib/utils/toast';
import { MESSAGES } from '@/messages';
import { OrderStatusDialog } from './order-status-dialog';

const { orders } = MESSAGES;

const orderItemColumns: readonly DataTableColumn<OrderItemData>[] = [
  {
    key: 'product',
    header: orders.columns.product,
    cell: (item) => (
      <div className="flex items-center gap-3">
        <DataTableMedia sources={item.image ? [item.image] : []} alt={item.name} />
        <DataTableIdentity title={item.name} />
      </div>
    ),
  },
  {
    key: 'sku',
    header: orders.columns.sku,
    hideBelow: 'sm',
    cell: (item) => <span className="block truncate">{item.sku || orders.dash}</span>,
  },
  {
    key: 'price',
    header: orders.columns.price,
    align: 'right',
    numeric: true,
    cell: (item) => <span className="block whitespace-nowrap">{formatCurrency(item.price)}</span>,
  },
  {
    key: 'qty',
    header: orders.columns.qty,
    align: 'right',
    numeric: true,
    cell: (item) => <span className="block">{item.qty}</span>,
  },
  {
    key: 'total',
    header: orders.columns.total,
    align: 'right',
    numeric: true,
    cell: (item) => <span className="block whitespace-nowrap">{formatCurrency(item.total)}</span>,
  },
];

const show = (value: string) => value || orders.dash;

export function OrderDetails({ orderId }: { orderId: string }) {
  const { can } = usePermission();
  const { order, isLoading, error, actionError, isActioning, updateStatus, retry } =
    useOrderDetail(orderId);
  const [editing, setEditing] = useState(false);

  const handleUpdate = async (values: { status: string; remark: string; location: string }) => {
    const done = await updateStatus(values);
    if (!done) return;
    showSuccess(orders.statusUpdated);
    setEditing(false);
  };

  if (error && !order.orderId) return <ErrorState message={error} onRetry={retry} />;

  const address = [
    order.addressData.line1,
    order.addressData.line2,
    order.addressData.landmark,
    order.addressData.city,
    order.addressData.state,
    order.addressData.pincode,
    order.addressData.country,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="flex flex-col gap-4">
      <Link
        href={ROUTES.orders}
        replace
        className="border-border bg-surface-muted/50 text-fg-muted hover:text-fg data-hover-color inline-flex w-fit items-center gap-1 rounded-md border px-2.5 py-1.5 text-sm transition-colors"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {orders.back}
      </Link>

      {isLoading ? (
        <Skeleton className="h-16 w-full" />
      ) : (
        <PageHeader
          title={order.orderNumber || orders.fallback}
          description={formatRelativeTime(order.createdAt)}
          action={
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Badge intent={orderStatusMeta(order.status).intent}>
                {orderStatusMeta(order.status).label}
              </Badge>
              {can(PERMISSIONS.orderUpdateStatus) && (
                <Button size="sm" onClick={() => setEditing(true)}>
                  {orders.updateStatus}
                </Button>
              )}
            </div>
          }
        />
      )}

      <DetailCard title={orders.sections.summary}>
        <DetailItem label={orders.fields.paymentMethod} value={show(order.paymentMethod)} />
        <DetailItem label={orders.fields.paymentStatus} value={show(order.paymentStatus)} />
        <DetailItem label={orders.fields.subtotal} value={formatCurrency(order.subtotal)} />
        <DetailItem label={orders.fields.discount} value={formatCurrency(order.discount)} />
        <DetailItem label={orders.fields.coupon} value={formatCurrency(order.couponDiscount)} />
        <DetailItem label={orders.fields.tax} value={formatCurrency(order.taxAmount)} />
        <DetailItem label={orders.fields.shipping} value={formatCurrency(order.shippingAmount)} />
        <DetailItem label={orders.fields.wallet} value={formatCurrency(order.walletAmount)} />
        <DetailItem label={orders.fields.total} value={formatCurrency(order.total)} />
        {order.deliveredAt && (
          <DetailItem
            label={orders.fields.delivered}
            value={formatRelativeTime(order.deliveredAt)}
          />
        )}
        {order.cancelReason && (
          <DetailItem label={orders.fields.cancelReason} value={order.cancelReason} />
        )}
        {order.notes && <DetailItem label={orders.fields.notes} value={order.notes} />}
      </DetailCard>

      <DetailCard title={orders.sections.customer}>
        <DetailItem label={orders.fields.name} value={show(order.userData.name)} />
        <DetailItem label={orders.fields.email} value={show(order.userData.email)} />
        <DetailItem label={orders.fields.phone} value={show(order.userData.phone)} />
      </DetailCard>

      <DetailCard title={orders.sections.address}>
        <DetailItem label={orders.fields.name} value={show(order.addressData.fullName)} />
        <DetailItem label={orders.fields.phone} value={show(order.addressData.phone)} />
        <DetailItem label={orders.sections.address} value={show(address)} />
      </DetailCard>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>{orders.sections.items}</CardTitle>
        </CardHeader>
        <DataTable
          columns={orderItemColumns}
          rows={order.itemList}
          rowKey={(item) => item.orderItemId}
          emptyTitle={orders.empty}
        />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{orders.sections.timeline}</CardTitle>
        </CardHeader>
        <CardContent>
          {order.timelineList.length === 0 ? (
            <p className="text-fg-muted text-sm">{orders.noTimeline}</p>
          ) : (
            <ol className="flex flex-col gap-3">
              {order.timelineList.map((entry) => (
                <li key={entry.timelineId} className="flex flex-col gap-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge intent={orderStatusMeta(entry.status).intent}>
                      {orderStatusMeta(entry.status).label}
                    </Badge>
                    <span className="text-fg-muted text-xs">
                      {formatRelativeTime(entry.createdAt)}
                    </span>
                  </div>
                  {(entry.remark || entry.location) && (
                    <p className="text-fg-muted text-sm">
                      {[entry.location, entry.remark].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>

      {editing && (
        <OrderStatusDialog
          open
          currentStatus={order.status}
          isSubmitting={isActioning}
          error={actionError}
          onConfirm={(values) => void handleUpdate(values)}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  );
}

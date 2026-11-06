'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { DetailCard, DetailItem } from '@/components/common/detail-grid';
import { ErrorState } from '@/components/common/error-state';
import { PageHeader } from '@/components/common/page-header';
import { RefreshButton } from '@/components/common/refresh-button';
import { orderStatusMeta } from '@/components/common/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { DataTable, type DataTableColumn } from '@/components/common/data-table';
import { DataTableIdentity, DataTableMedia } from '@/components/common/data-table-media';
import { PERMISSIONS, ORDER_STATUSES, ROUTES } from '@/constants';
import { useOrderDetail } from '@/hooks/use-order-detail';
import type { OrderItemData, ShipmentTrackingData } from '@/lib/api/contract';
import { apiService } from '@/lib/api/api.service';
import { usePermission } from '@/hooks/use-permission';
import { formatCurrency } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils/datetime';
import { showSuccess } from '@/lib/utils/toast';
import { safeExternalUrl } from '@/lib/utils/external-url';
import { MESSAGES } from '@/messages';
import { OrderStatusDialog } from './order-status-dialog';
import { DeliveryOtpDialog } from './delivery-otp-dialog';

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
    hideBelow: 'lg',
    width: 'w-40',
    cell: (item) => <span className="block truncate">{item.sku || orders.dash}</span>,
  },
  {
    key: 'price',
    header: orders.columns.price,
    align: 'right',
    hideBelow: 'xl',
    width: 'w-32',
    numeric: true,
    cell: (item) => <span className="block whitespace-nowrap">{formatCurrency(item.price)}</span>,
  },
  {
    key: 'qty',
    header: orders.columns.qty,
    align: 'right',
    hideBelow: 'xl',
    width: 'w-24',
    numeric: true,
    cell: (item) => <span className="block">{item.qty}</span>,
  },
  {
    key: 'total',
    header: orders.columns.total,
    align: 'right',
    hideBelow: 'lg',
    width: 'w-32',
    numeric: true,
    cell: (item) => <span className="block whitespace-nowrap">{formatCurrency(item.total)}</span>,
  },
];

const show = (value: string) => value || orders.dash;

const canConfirm = (status: string) =>
  status === ORDER_STATUSES.pending ||
  status === ORDER_STATUSES.pendingToken ||
  status === ORDER_STATUSES.awaitingAdminReview;

export function OrderDetails({ orderId }: { orderId: string }) {
  const { can } = usePermission();
  const {
    order,
    notes,
    tags,
    deliveryBoys,
    isLoading,
    error,
    actionError,
    isActioning,
    updateStatus,
    addNote,
    removeNote,
    addTag,
    removeTag,
    assignDeliveryBoy,
    verifyDeliveryOtp,
    refresh,
    retry,
  } = useOrderDetail(orderId);
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [newTag, setNewTag] = useState('');
  const [assigningSubOrder, setAssigningSubOrder] = useState<string | null>(null);
  const [selectedDeliveryBoy, setSelectedDeliveryBoy] = useState('');
  const [verifyingSubOrder, setVerifyingSubOrder] = useState<string | null>(null);
  const [trackingAwb, setTrackingAwb] = useState('');
  const [trackingData, setTrackingData] = useState<ShipmentTrackingData | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState('');

  const handleUpdate = async (values: { status: string; remark: string; location: string }) => {
    const done = await updateStatus(values);
    if (!done) return;
    showSuccess(orders.statusUpdated);
    setEditing(false);
  };

  const handleConfirm = async () => {
    setConfirming(true);
    const targetStatus =
      order.status === ORDER_STATUSES.awaitingAdminReview
        ? ORDER_STATUSES.pending
        : ORDER_STATUSES.confirmed;
    const done = await updateStatus({
      status: targetStatus,
      remark: 'Confirmed by admin and forwarded to vendors',
      location: '',
    });
    setConfirming(false);
    if (!done) return;
    showSuccess(orders.statusUpdated);
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    const done = await addNote(newNote.trim());
    if (done) {
      setNewNote('');
      showSuccess(orders.noteAdded);
    }
  };

  const handleRemoveNote = async (noteId: string) => {
    const done = await removeNote(noteId);
    if (done) showSuccess('Note removed.');
  };

  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    const done = await addTag(newTag.trim());
    if (done) {
      setNewTag('');
      showSuccess(orders.tagAdded);
    }
  };

  const handleRemoveTag = async (tagId: string) => {
    const done = await removeTag(tagId);
    if (done) showSuccess(orders.tagRemoved);
  };

  const handleAssignDeliveryBoy = async (subOrderId: string) => {
    if (!selectedDeliveryBoy) return;
    const done = await assignDeliveryBoy(subOrderId, selectedDeliveryBoy);
    if (done) {
      setAssigningSubOrder(null);
      setSelectedDeliveryBoy('');
      showSuccess(orders.deliveryBoyAssigned);
    }
  };

  const handleTrackShipment = async (awb: string) => {
    setTrackingAwb(awb);
    setTrackingData(null);
    setTrackingError('');
    setTrackingLoading(true);
    const response = await apiService.getAdminShipmentTracking(awb);
    setTrackingLoading(false);
    if (response.status) setTrackingData(response.data);
    else setTrackingError(response.message);
  };

  const closeTracking = () => {
    setTrackingAwb('');
    setTrackingData(null);
    setTrackingError('');
  };

  const handleVerifyDelivery = async (values: {
    otp: string;
    remarks?: string;
    collectedAmount?: number;
  }) => {
    if (!verifyingSubOrder) return;
    const done = await verifyDeliveryOtp(verifyingSubOrder, values);
    if (done) {
      setVerifyingSubOrder(null);
      showSuccess(orders.fields.deliveryVerified);
    }
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
              <RefreshButton onRefresh={refresh} isRefreshing={isLoading} label={MESSAGES.dashboard.refresh} />
              <Badge intent={orderStatusMeta(order.status).intent}>
                {orderStatusMeta(order.status).label}
              </Badge>
              {canConfirm(order.status) && can(PERMISSIONS.orderUpdateStatus) && (
                <Button
                  size="sm"
                  onClick={() => setConfirming(true)}
                  disabled={confirming}
                  loading={confirming}
                >
                  {orders.confirmOrder}
                </Button>
              )}
              {can(PERMISSIONS.orderUpdateStatus) && order.status !== ORDER_STATUSES.delivered && (
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

      {order.vendorList.length > 0 && (
        <DetailCard title={orders.sections.vendors}>
          {order.vendorList.map((vendor) => (
            <DetailItem
              key={vendor.subOrderId}
              label={vendor.shopName}
              value={orderStatusMeta(vendor.status).label}
            />
          ))}
        </DetailCard>
      )}

      {can(PERMISSIONS.orderUpdateStatus) && (
        <Card>
          <CardHeader>
            <CardTitle>{orders.sections.notes}</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ul className="space-y-3">
              {notes.map((note) => (
                <li key={note.noteId} className="p-3 border border-border rounded-lg bg-surface-muted/50">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-fg">{note.userName}</p>
                      <p className="text-sm text-fg-muted whitespace-pre-wrap">{note.note}</p>
                      <span className="text-xs text-fg-muted">
                        {formatRelativeTime(note.createdAt)}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void handleRemoveNote(note.noteId)}
                      disabled={isActioning}
                    >
                      Remove
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex gap-2">
              <Input
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder={orders.fields.notePlaceholder}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddNote}
                disabled={isActioning || !newNote.trim()}
              >
                {orders.fields.addNote}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {can(PERMISSIONS.orderUpdateStatus) && (
        <Card>
          <CardHeader>
            <CardTitle>{orders.sections.tags}</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              {tags.length === 0 ? (
                <p className="text-fg-muted text-sm">{orders.noTimeline}</p>
              ) : (
                tags.map((tag) => (
                  <span
                    key={tag.tagId}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
                      tag.color
                        ?                     `border-${tag.color}/30 bg-${tag.color}/10 text-${tag.color}`
                        : 'border-border text-fg-muted'
                    }`}
                  >
                    {tag.name}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void handleRemoveTag(tag.tagId)}
                      disabled={isActioning}
                      className="ml-1 p-0.5"
                    >
                      ×
                    </Button>
                  </span>
                ))
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder={orders.fields.tagPlaceholder}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddTag}
                disabled={isActioning || !newTag.trim()}
              >
                {orders.fields.addTag}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {order.vendorList.length > 0 && (can(PERMISSIONS.orderUpdateStatus) || can(PERMISSIONS.trackingView)) && (
        <Card>
          <CardHeader>
            <CardTitle>{orders.sections.delivery}</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {order.vendorList.map((vendor) => (
                <div
                  key={vendor.subOrderId}
                  className="flex items-center justify-between p-3 border border-border rounded-lg bg-surface-muted/50"
                >
                  <div>
                    <p className="text-sm font-medium text-fg">{vendor.shopName}</p>
                    <p className="text-xs text-fg-muted">{vendor.subOrderId}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {can(PERMISSIONS.trackingView) && (vendor.shipmentData.awb || vendor.trackingNumber) && (
                      <Button variant="outline" size="sm" onClick={() => void handleTrackShipment(vendor.shipmentData.awb || vendor.trackingNumber)}>
                        {MESSAGES.shipmentTracking.search}
                      </Button>
                    )}
                  {vendor.status === ORDER_STATUSES.delivered ? (
                    <Badge intent="success">{orders.fields.delivered}</Badge>
                  ) : can(PERMISSIONS.orderUpdateStatus) ? vendor.status === ORDER_STATUSES.outForDelivery ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setVerifyingSubOrder(vendor.subOrderId)}
                      disabled={isActioning}
                    >
                      {orders.fields.verifyDelivery}
                    </Button>
                  ) : assigningSubOrder === vendor.subOrderId ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedDeliveryBoy}
                        onChange={(e) => setSelectedDeliveryBoy(e.target.value)}
                        className="border border-input bg-background rounded-md px-2 py-1 text-sm text-fg focus:ring-2 focus:ring-ring focus:border-ring outline-none"
                      >
                        <option value="">{orders.fields.deliveryBoy}</option>
                        {deliveryBoys.map((db) => (
                          <option key={db.deliveryBoyId} value={db.deliveryBoyId}>
                            {db.name}
                          </option>
                        ))}
                      </select>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => void handleAssignDeliveryBoy(vendor.subOrderId)}
                        disabled={!selectedDeliveryBoy || isActioning}
                      >
                        Assign
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAssigningSubOrder(vendor.subOrderId)}
                      disabled={isActioning}
                    >
                      {orders.fields.assignDeliveryBoy}
                    </Button>
                  ) : null}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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

      {verifyingSubOrder && (
        <DeliveryOtpDialog
          open
          isSubmitting={isActioning}
          error={actionError}
          requiresCodCollection={order.paymentMethod === 'COD' && order.paymentStatus !== 'PAID'}
          onConfirm={(values) => void handleVerifyDelivery(values)}
          onClose={() => setVerifyingSubOrder(null)}
        />
      )}

      {trackingAwb && (
        <Dialog open onClose={closeTracking} title={MESSAGES.shipmentTracking.title} description={`${MESSAGES.shipmentTracking.awb}: ${trackingAwb}`} footer={<Button onClick={closeTracking}>{MESSAGES.common.close}</Button>}>
          {trackingLoading ? <p className="text-sm text-fg-muted">{MESSAGES.common.loading}</p> : trackingError ? <p role="alert" className="text-sm text-danger">{trackingError}</p> : trackingData ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div><p className="text-xs text-fg-muted">{MESSAGES.shipmentTracking.order}</p><p className="text-sm font-medium">{trackingData.orderNumber || orders.dash}</p></div>
              <div><p className="text-xs text-fg-muted">{MESSAGES.shipmentTracking.status}</p><Badge intent={trackingData.status === 'DELIVERED' ? 'success' : trackingData.status === 'FAILED' || trackingData.status === 'CANCELLED' ? 'danger' : 'info'}>{trackingData.status || orders.dash}</Badge></div>
              <div><p className="text-xs text-fg-muted">{MESSAGES.shipmentTracking.estimatedDays}</p><p className="text-sm font-medium">{trackingData.estimatedDays || orders.dash}</p></div>
              <div><p className="text-xs text-fg-muted">{MESSAGES.shipmentTracking.shippedAt}</p><p className="text-sm font-medium">{trackingData.shippedAt ? new Date(trackingData.shippedAt).toLocaleString() : orders.dash}</p></div>
              <div><p className="text-xs text-fg-muted">{MESSAGES.shipmentTracking.deliveredAt}</p><p className="text-sm font-medium">{trackingData.deliveredAt ? new Date(trackingData.deliveredAt).toLocaleString() : orders.dash}</p></div>
              {trackingData.trackingUrl && <div className="sm:col-span-2"><p className="text-xs text-fg-muted">{MESSAGES.shipmentTracking.trackingUrl}</p>{safeExternalUrl(trackingData.trackingUrl) ? <a href={safeExternalUrl(trackingData.trackingUrl) ?? undefined} target="_blank" rel="noopener noreferrer" className="break-all text-sm text-primary underline">{trackingData.trackingUrl}</a> : <p className="break-all text-sm">{trackingData.trackingUrl}</p>}</div>}
              <div className="sm:col-span-2"><p className="text-xs text-fg-muted">{MESSAGES.shipmentTracking.remarks}</p><p className="text-sm">{trackingData.remarks || orders.dash}</p></div>
            </div>
          ) : null}
        </Dialog>
      )}

      {confirming && (
        <OrderStatusDialog
          open
          currentStatus={order.status}
          isSubmitting={confirming}
          error={actionError}
          onConfirm={() => void handleConfirm()}
          onClose={() => setConfirming(false)}
        />
      )}
    </div>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { CheckCheck, XCircle } from 'lucide-react';
import { useState } from 'react';
import { DataTable } from '@/components/common/data-table';
import { RefreshButton } from '@/components/common/refresh-button';
import { Pagination } from '@/components/common/pagination';
import { orderReviewColumns } from '@/components/order/order-review-columns';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { OptionsMenu, type OptionsMenuItem } from '@/components/ui/options-menu';
import {
  ORDER_PAGE_SIZE,
  PERMISSIONS,
  ROUTES,
} from '@/constants';
import { useOrderReviews } from '@/hooks/use-order-reviews';
import { usePermission } from '@/hooks/use-permission';
import type { OrderReviewData } from '@/lib/api/contract';
import { showSuccess, showWarning } from '@/lib/utils/toast';
import { MESSAGES } from '@/messages';
import { ReasonDialog } from '@/components/common/reason-dialog';
import { FormError } from '@/components/common/form-error';

const { orderReviews } = MESSAGES;

export function OrderReviewList() {
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
    from,
    to,
    setDateRange,
    setPage,
    setSearch,
    confirmForVendor,
    rejectByAdmin,
    adminBulkReview,
    refresh,
    clearActionError,
  } = useOrderReviews();
  const [rejecting, setRejecting] = useState<OrderReviewData | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<OrderReviewData[]>([]);
  const [rejectingSelection, setRejectingSelection] = useState<OrderReviewData[] | null>(null);

  const closeDialog = () => {
    setRejecting(null);
    clearActionError();
  };

  const emptyMessage =
    search || from || to ? orderReviews.emptyFiltered : orderReviews.empty;

  const handleConfirm = async (order: OrderReviewData) => {
    const done = await confirmForVendor(order.subOrderId);
    if (!done) return;
    setSelectedOrders([]);
    showSuccess(orderReviews.orderConfirmed);
  };

  const handleReject = async (reason: string) => {
    if (!rejecting) return;
    const done = await rejectByAdmin(rejecting.subOrderId, reason);
    if (!done) return;
    showSuccess(orderReviews.orderRejected);
    setRejecting(null);
    setSelectedOrders([]);
  };

  const handleBulkConfirm = async (rows: OrderReviewData[]) => {
    const result = await adminBulkReview('CONFIRM', rows.map((row) => row.subOrderId));
    if (!result) return;
    setSelectedOrders([]);
    const summary = orderReviews.bulkResultSummary(result.updatedCount, result.skippedCount);
    if (result.skippedCount > 0) showWarning(summary);
    else showSuccess(orderReviews.bulkConfirmSuccess);
  };

  const handleBulkReject = async (reason: string) => {
    if (!rejectingSelection?.length) return;
    const result = await adminBulkReview(
      'REJECT',
      rejectingSelection.map((row) => row.subOrderId),
      reason,
    );
    if (!result) return;
    setSelectedOrders([]);
    setRejectingSelection(null);
    const summary = orderReviews.bulkResultSummary(result.updatedCount, result.skippedCount);
    if (result.skippedCount > 0) showWarning(summary);
    else showSuccess(orderReviews.bulkRejectSuccess);
  };

  return (
    <Card className="overflow-hidden">
      {actionError && <FormError message={actionError} className="m-4 mb-0" />}
      <DataTable
        columns={orderReviewColumns}
        rows={data.itemList}
        rowKey={(order) => order.subOrderId}
        onRowClick={(order) => router.push(ROUTES.orderDetails(order.orderId))}
        selection={can(PERMISSIONS.orderConfirm) ? {
          selected: selectedOrders,
          onChange: setSelectedOrders,
          isSelectable: (order) => order.status === 'AWAITING_ADMIN_REVIEW',
          actions: [
            {
              label: orderReviews.bulkConfirm,
              icon: CheckCheck,
              onSelect: (rows) => void handleBulkConfirm(rows),
            },
            {
              label: orderReviews.bulkReject,
              icon: XCircle,
              intent: 'danger',
              onSelect: (rows) => setRejectingSelection(rows),
            },
          ],
        } : undefined}
        toolbar={{
          search: {
            value: search,
            placeholder: orderReviews.searchPlaceholder,
            onChange: setSearch,
          },
          actions: (
            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
              <label className="flex items-center gap-2 text-xs text-fg-muted">
                <span>{orderReviews.fromDate}</span>
                <Input
                  type="date"
                  value={from}
                  max={to || undefined}
                  aria-label={orderReviews.fromDate}
                  onChange={(event) => setDateRange(event.target.value, to)}
                  className="w-full sm:w-36"
                />
              </label>
              <label className="flex items-center gap-2 text-xs text-fg-muted">
                <span>{orderReviews.toDate}</span>
                <Input
                  type="date"
                  value={to}
                  min={from || undefined}
                  aria-label={orderReviews.toDate}
                  onChange={(event) => setDateRange(from, event.target.value)}
                  className="w-full sm:w-36"
                />
              </label>
              {(from || to) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setDateRange('', '')}
                >
                  {orderReviews.clearDates}
                </Button>
              )}
              <RefreshButton onRefresh={refresh} isRefreshing={isLoading} label={MESSAGES.dashboard.refresh} />
            </div>
          ),
        }}
        actions={{
          header: orderReviews.columns.actions,
          render: (order) => {
            const items: OptionsMenuItem[] = [
              {
                label: orderReviews.view,
                onSelect: () => router.push(ROUTES.orderDetails(order.orderId)),
              },
              ...(can(PERMISSIONS.orderConfirm)
                ? [
                    {
                      label: orderReviews.confirm,
                      onSelect: () => void handleConfirm(order),
                    },
                    {
                      label: orderReviews.reject,
                      onSelect: () => setRejecting(order),
                    },
                  ]
                : []),
            ];

            return (
              <OptionsMenu label={orderReviews.actionsLabel} items={items} className="flex justify-end" />
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

      {rejecting && (
        <ReasonDialog
          open
          title={orderReviews.rejectTitle}
          description={orderReviews.rejectDescription}
          label={orderReviews.reasonLabel}
          placeholder={orderReviews.reasonPlaceholder}
          confirmLabel={orderReviews.reject}
          isSubmitting={isActioning}
          error={actionError}
          onConfirm={handleReject}
          onClose={closeDialog}
        />
      )}

      {rejectingSelection && (
        <ReasonDialog
          open
          title={orderReviews.bulkRejectTitle}
          description={orderReviews.bulkRejectDescription}
          label={orderReviews.reasonLabel}
          placeholder={orderReviews.reasonPlaceholder}
          confirmLabel={orderReviews.bulkReject}
          isSubmitting={isActioning}
          error={actionError}
          onConfirm={handleBulkReject}
          onClose={() => {
            setRejectingSelection(null);
            clearActionError();
          }}
        />
      )}
    </Card>
  );
}

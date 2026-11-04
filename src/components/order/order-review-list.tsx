'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { DataTable } from '@/components/common/data-table';
import { Pagination } from '@/components/common/pagination';
import { orderReviewColumns } from '@/components/order/order-review-columns';
import { Card } from '@/components/ui/card';
import { OptionsMenu, type OptionsMenuItem } from '@/components/ui/options-menu';
import {
  ORDER_PAGE_SIZE,
  ORDER_STATUSES,
  PERMISSIONS,
  ROUTES,
} from '@/constants';
import { useOrderReviews } from '@/hooks/use-order-reviews';
import { usePermission } from '@/hooks/use-permission';
import type { OrderReviewData } from '@/lib/api/contract';
import { showSuccess } from '@/lib/utils/toast';
import { MESSAGES } from '@/messages';
import { ReasonDialog } from '@/components/common/reason-dialog';

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
    setPage,
    setSearch,
    setDateRange,
    refresh,
    confirmForVendor,
    rejectByAdmin,
    clearActionError,
  } = useOrderReviews();
  const [rejecting, setRejecting] = useState<OrderReviewData | null>(null);

  const closeDialog = () => {
    setRejecting(null);
    clearActionError();
  };

  const emptyMessage =
    search || from || to ? orderReviews.emptyFiltered : orderReviews.empty;

  const handleConfirm = async (order: OrderReviewData) => {
    const done = await confirmForVendor(order.subOrderId);
    if (!done) return;
    showSuccess(orderReviews.orderConfirmed);
  };

  const handleReject = async (reason: string) => {
    if (!rejecting) return;
    const done = await rejectByAdmin(rejecting.subOrderId, reason);
    if (!done) return;
    showSuccess(orderReviews.orderRejected);
    setRejecting(null);
  };

  return (
    <Card className="overflow-hidden">
      <DataTable
        columns={orderReviewColumns}
        rows={data.itemList}
        rowKey={(order) => order.subOrderId}
        onRowClick={(order) => router.push(ROUTES.orderDetails(order.orderId))}
        toolbar={{
          search: {
            value: search,
            placeholder: orderReviews.searchPlaceholder,
            onChange: setSearch,
          },
          select: {
            value: ORDER_STATUSES.all,
            ariaLabel: orderReviews.statusLabel,
            options: [
              { value: ORDER_STATUSES.all, label: orderReviews.columns.order },
              {
                value: ORDER_STATUSES.awaitingAdminReview,
                label: orderReviews.statuses.AWAITING_ADMIN_REVIEW,
              },
            ],
            onChange: () => {},
          },
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
    </Card>
  );
}

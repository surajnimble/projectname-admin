'use client';

import { useState } from 'react';
import { DataTable, type DataTableColumn } from '@/components/common/data-table';
import { DataTableIdentity } from '@/components/common/data-table-media';
import { Pagination } from '@/components/common/pagination';
import { ReasonDialog } from '@/components/common/reason-dialog';
import { StatusBadge, paymentStatusMeta } from '@/components/common/status-badge';
import { Card } from '@/components/ui/card';
import { OptionsMenu, type OptionsMenuItem } from '@/components/ui/options-menu';
import { usePayments } from '@/hooks/use-payments';
import type { PaymentSummaryData } from '@/lib/api/contract';
import { formatCurrency } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils/datetime';
import { showSuccess } from '@/lib/utils/toast';
import { MESSAGES } from '@/messages';
import { RefreshButton } from '@/components/common/refresh-button';

const { payments } = MESSAGES;

export function PaymentList() {
  const {
    data,
    isLoading,
    error,
    actionError,
    isActioning,
    page,
    search,
    setPage,
    setSearch,
    refresh,
    runAction,
  } = usePayments();
  const [refunding, setRefunding] = useState<PaymentSummaryData | null>(null);

  const handleRefund = async (reason: string) => {
    if (!refunding) return;
    const done = await runAction('refund', refunding.paymentId, {
      orderId: refunding.orderData.orderId,
      amount: refunding.paidAmount > 0 ? refunding.paidAmount : refunding.amount,
      reason,
      mode: 'ORIGINAL',
    });
    if (!done) return;
    showSuccess(payments.refunded);
    setRefunding(null);
  };

  const handleConfirm = async (payment: PaymentSummaryData) => {
    const done = await runAction('confirm', payment.paymentId);
    if (!done) return;
    showSuccess(payments.confirmed);
  };

  const columns: readonly DataTableColumn<PaymentSummaryData>[] = [
    {
      key: 'order',
      header: payments.columns.order,
      cell: (payment: PaymentSummaryData) => (
        <DataTableIdentity title={payment.orderData.orderNumber || payments.fallback} />
      ),
    },
    {
      key: 'method',
      header: payments.columns.method,
      hideBelow: 'xl',
      width: 'w-32',
      cell: (payment: PaymentSummaryData) => (
        <span className="block truncate">{payment.method || payments.fallback}</span>
      ),
    },
    {
      key: 'amount',
      header: payments.columns.amount,
      align: 'right',
      hideBelow: 'lg',
      width: 'w-32',
      numeric: true,
      cell: (payment: PaymentSummaryData) => (
        <span className="block whitespace-nowrap">
          {formatCurrency(payment.paidAmount > 0 ? payment.paidAmount : payment.amount)}
        </span>
      ),
    },
    {
      key: 'status',
      header: payments.columns.status,
      hideBelow: 'lg',
      width: 'w-28',
      cell: (payment: PaymentSummaryData) => <StatusBadge meta={paymentStatusMeta(payment.status)} />,
    },
    {
      key: 'date',
      header: payments.columns.date,
      hideBelow: 'xl',
      width: 'w-32',
      cell: (payment: PaymentSummaryData) => (
        <span className="text-fg-muted block whitespace-nowrap">
          {formatRelativeTime(payment.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <Card className="overflow-hidden">
      <DataTable
        columns={columns}
        rows={data.itemList}
        rowKey={(payment) => payment.paymentId}
        toolbar={{
          search: {
            value: search,
            placeholder: payments.searchPlaceholder,
            onChange: setSearch,
          },
          actions: <RefreshButton onRefresh={refresh} isRefreshing={isLoading} label={MESSAGES.dashboard.refresh} />,
        }}
        actions={{
          header: payments.columns.actions,
          render: (payment) => {
            const items: OptionsMenuItem[] = [
              {
                label: payments.confirm,
                onSelect: () => void handleConfirm(payment),
              },
              {
                label: payments.refund,
                intent: 'danger',
                onSelect: () => setRefunding(payment),
              },
            ];

            return (
              <OptionsMenu
                label={payments.actionsLabel}
                items={items}
                className="flex justify-end"
              />
            );
          },
        }}
        isLoading={isLoading}
        error={error}
        emptyTitle={payments.empty}
        footer={
          <Pagination
            currentPage={data.currentPage || page}
            totalPage={data.totalPage}
            totalRecord={data.totalRecord}
            limit={data.limit || 10}
            onPageChange={setPage}
          />
        }
      />

      <ReasonDialog
        open={refunding !== null}
        title={payments.refundTitle}
        description={payments.refundDescription}
        label={payments.reasonLabel}
        confirmLabel={payments.refund}
        isSubmitting={isActioning}
        error={actionError}
        onConfirm={(reason) => void handleRefund(reason)}
        onClose={() => setRefunding(null)}
      />
    </Card>
  );
}

'use client';

import { useState } from 'react';
import { DataTable } from '@/components/common/data-table';
import { DataTableIdentity } from '@/components/common/data-table-media';
import { Pagination } from '@/components/common/pagination';
import { ReasonDialog } from '@/components/common/reason-dialog';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { OptionsMenu, type OptionsMenuItem } from '@/components/ui/options-menu';
import { usePayments } from '@/hooks/use-payments';
import type { PaymentSummaryData } from '@/lib/api/contract';
import { formatCurrency } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils/datetime';
import { showSuccess } from '@/lib/utils/toast';
import { MESSAGES } from '@/messages';

const { vendors, payments } = MESSAGES;

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

  const columns = [
    {
      key: 'order',
      header: vendors.columns.order,
      cell: (payment: PaymentSummaryData) => (
        <DataTableIdentity title={payment.orderData.orderNumber || payments.fallback} />
      ),
    },
    {
      key: 'method',
      header: vendors.columns.paymentMethod,
      hideBelow: 'sm' as const,
      cell: (payment: PaymentSummaryData) => (
        <span className="block truncate">{payment.method || vendors.dash}</span>
      ),
    },
    {
      key: 'amount',
      header: vendors.columns.amount,
      align: 'right' as const,
      numeric: true,
      cell: (payment: PaymentSummaryData) => (
        <span className="block whitespace-nowrap">
          {formatCurrency(payment.paidAmount > 0 ? payment.paidAmount : payment.amount)}
        </span>
      ),
    },
    {
      key: 'status',
      header: vendors.columns.status,
      cell: (payment: PaymentSummaryData) => (
        <Badge intent={payment.isPaid ? 'success' : 'warning'}>
          {payment.status || vendors.dash}
        </Badge>
      ),
    },
    {
      key: 'date',
      header: vendors.columns.date,
      hideBelow: 'lg' as const,
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
        }}
        actions={{
          header: vendors.columns.actions,
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

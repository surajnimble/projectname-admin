'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { OptionsMenu, type OptionsMenuItem } from '@/components/ui/options-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination } from '@/components/common/pagination';
import { ReasonDialog } from '@/components/common/reason-dialog';
import { TableSkeleton } from '@/components/common/table-skeleton';
import { usePayments } from '@/hooks/use-payments';
import type { PaymentSummaryData } from '@/lib/api/contract';
import { formatCurrency } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils/datetime';
import { showSuccess } from '@/lib/utils/toast';
import { MESSAGES } from '@/messages';

const { vendors, payments } = MESSAGES;

export function PaymentList() {
  const { data, isLoading, error, actionError, isActioning, page, search, setPage, setSearch, runAction } =
    usePayments();
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

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-border border-b p-4">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>{payments.title}</CardTitle>
          <div className="relative ml-auto w-full min-w-0 sm:w-80 sm:flex-none">
            <Input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={payments.searchPlaceholder}
              aria-label={MESSAGES.common.search}
            />
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
          <p className="text-fg-muted text-sm">{payments.empty}</p>
        </CardContent>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{vendors.columns.order}</TableHead>
              <TableHead className="hidden sm:table-cell">{vendors.columns.paymentMethod}</TableHead>
              <TableHead>{vendors.columns.amount}</TableHead>
              <TableHead>{vendors.columns.status}</TableHead>
              <TableHead className="hidden lg:table-cell">{vendors.columns.date}</TableHead>
              <TableHead className="text-right">{vendors.columns.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.itemList.map((payment) => {
              const items: OptionsMenuItem[] = [
                {
                  label: payments.confirm,
                  onSelect: () => void handleConfirm(payment),
                },
                {
                  label: payments.refund,
                  intent: 'danger',
                  onSelect: () => {
                    setRefunding(payment);
                  },
                },
              ];

              return (
                <TableRow key={payment.paymentId}>
                  <TableCell>
                    <span className="font-medium">
                      {payment.orderData.orderNumber || payments.fallback}
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {payment.method || vendors.dash}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatCurrency(
                      payment.paidAmount > 0 ? payment.paidAmount : payment.amount,
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge intent={payment.isPaid ? 'success' : 'warning'}>
                      {payment.status || vendors.dash}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-fg-muted hidden whitespace-nowrap lg:table-cell">
                    {formatRelativeTime(payment.createdAt)}
                  </TableCell>
                  <TableCell>
                    <OptionsMenu
                      label={payments.actionsLabel}
                      items={items}
                      className="flex justify-end"
                    />
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
        limit={data.limit || 10}
        onPageChange={setPage}
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
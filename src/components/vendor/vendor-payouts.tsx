'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OptionsMenu, type OptionsMenuItem } from '@/components/ui/options-menu';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { ReasonDialog } from '@/components/common/reason-dialog';
import { DetailItem } from '@/components/common/detail-grid';
import { Skeleton } from '@/components/ui/skeleton';
import { useVendorPayouts } from '@/hooks/use-vendor-payouts';
import { formatCurrency } from '@/lib/utils';
import { MESSAGES } from '@/messages';

const { vendors } = MESSAGES;

export function VendorPayouts({ vendorId }: { vendorId: string }) {
  const { data, statement, isLoading, error, actionError, isActioning, runAction } =
    useVendorPayouts(vendorId);
  const [approving, setApproving] = useState('');
  const [rejecting, setRejecting] = useState('');

  const handleApprove = async () => {
    const id = approving;
    const done = await runAction('approve', id);
    if (done) setApproving('');
  };

  const handleReject = async (reason: string) => {
    const id = rejecting;
    const done = await runAction('reject', id, reason);
    if (done) setRejecting('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{vendors.payoutsTitle}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <DetailItem label={vendors.payoutGross} value={formatCurrency(statement.grossAmount)} />
          <DetailItem
            label={vendors.payoutCommission}
            value={formatCurrency(statement.commissionAmount)}
          />
          <DetailItem label={vendors.payoutNet} value={formatCurrency(statement.netAmount)} />
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-2" role="status" aria-busy="true">
            <span className="sr-only">{MESSAGES.common.loading}</span>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ) : error ? (
          <p role="alert" className="text-danger text-sm">
            {error}
          </p>
        ) : data.itemList.length === 0 ? (
          <p className="text-fg-muted text-sm">{vendors.payoutsEmpty}</p>
        ) : (
          <ul className="divide-border divide-y">
            {data.itemList.map((payout) => {
              const items: OptionsMenuItem[] = [];
              if (payout.isPending) {
                items.push({
                  label: vendors.approve,
                  icon: Check,
                  onSelect: () => setApproving(payout.payoutId),
                });
                items.push({
                  label: vendors.reject,
                  icon: X,
                  intent: 'danger',
                  onSelect: () => setRejecting(payout.payoutId),
                });
              }

              return (
                <li
                  key={payout.payoutId}
                  className="flex flex-wrap items-center justify-between gap-2 py-2.5"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-fg text-sm font-medium">
                      {formatCurrency(payout.amount)}
                    </span>
                    <span className="text-fg-muted text-xs">
                      {[payout.period, payout.method].filter(Boolean).join(' · ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge intent={payout.isPaid ? 'success' : payout.isPending ? 'warning' : 'neutral'}>
                      {payout.status || vendors.dash}
                    </Badge>
                    {items.length > 0 && (
                      <OptionsMenu label={vendors.payoutsActionsLabel} items={items} />
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <ConfirmDialog
          open={approving !== ''}
          title={vendors.approvePayoutTitle}
          description={vendors.approvePayoutDescription}
          confirmLabel={vendors.approve}
          isSubmitting={isActioning}
          onConfirm={() => void handleApprove()}
          onClose={() => setApproving('')}
        />

        <ReasonDialog
          open={rejecting !== ''}
          title={vendors.rejectPayoutTitle}
          description={vendors.rejectPayoutDescription}
          label={vendors.reasonLabel}
          confirmLabel={vendors.reject}
          isSubmitting={isActioning}
          error={actionError}
          onConfirm={(reason) => void handleReject(reason)}
          onClose={() => setRejecting('')}
        />
      </CardContent>
    </Card>
  );
}

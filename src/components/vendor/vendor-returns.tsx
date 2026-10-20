'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OptionsMenu, type OptionsMenuItem } from '@/components/ui/options-menu';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { ReasonDialog } from '@/components/common/reason-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useVendorReturns } from '@/hooks/use-vendor-returns';
import { formatCurrency } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils/datetime';
import { MESSAGES } from '@/messages';

const { vendors } = MESSAGES;

export function VendorReturns({ vendorId }: { vendorId: string }) {
  const { data, isLoading, error, actionError, isActioning, runAction } = useVendorReturns(vendorId);
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
        <CardTitle>{vendors.returnsTitle}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {isLoading ? (
          <div className="flex flex-col gap-2" role="status" aria-busy="true">
            <span className="sr-only">{MESSAGES.common.loading}</span>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/5" />
          </div>
        ) : error ? (
          <p role="alert" className="text-danger text-sm">
            {error}
          </p>
        ) : data.itemList.length === 0 ? (
          <p className="text-fg-muted text-sm">{vendors.returnsEmpty}</p>
        ) : (
          <ul className="divide-border divide-y">
            {data.itemList.map((item) => {
              const items: OptionsMenuItem[] = [];
              if (item.status === 'REQUESTED' || item.status === 'PENDING') {
                items.push({
                  label: vendors.approve,
                  icon: Check,
                  onSelect: () => setApproving(item.returnId),
                });
                items.push({
                  label: vendors.reject,
                  icon: X,
                  intent: 'danger',
                  onSelect: () => setRejecting(item.returnId),
                });
              }

              return (
                <li
                  key={item.returnId}
                  className="flex flex-wrap items-center justify-between gap-2 py-2.5"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-fg text-sm font-medium">
                      {item.returnNumber || vendors.dash}
                    </span>
                    <span className="text-fg-muted text-xs">
                      {[formatCurrency(item.refundAmount), formatRelativeTime(item.requestedAt)]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge intent={item.status === 'REFUNDED' ? 'success' : 'warning'}>
                      {item.status || vendors.dash}
                    </Badge>
                    {items.length > 0 && (
                      <OptionsMenu label={vendors.returnActionsLabel} items={items} />
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <ConfirmDialog
          open={approving !== ''}
          title={vendors.approveReturnTitle}
          description={vendors.approveReturnDescription}
          confirmLabel={vendors.approve}
          isSubmitting={isActioning}
          onConfirm={() => void handleApprove()}
          onClose={() => setApproving('')}
        />

        <ReasonDialog
          open={rejecting !== ''}
          title={vendors.rejectReturnTitle}
          description={vendors.rejectReturnDescription}
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

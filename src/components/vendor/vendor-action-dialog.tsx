'use client';

import { useId, useState, type FormEvent } from 'react';
import { FormError } from '@/components/common/form-error';
import { FormField } from '@/components/common/form-field';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  VENDOR_COMMISSION_MAX,
  VENDOR_COMMISSION_MIN,
  VENDOR_REASON_MAX_LENGTH,
} from '@/constants';
import type { VendorAction } from '@/lib/api/vendor-actions';
import type { VendorData } from '@/lib/api/contract';
import { validateVendorCommission, validateVendorReason } from '@/lib/utils/validations';
import { MESSAGES } from '@/messages';

const { vendors } = MESSAGES;

const TITLES: Record<VendorAction, string> = {
  approve: vendors.approveTitle,
  reject: vendors.rejectTitle,
  suspend: vendors.suspendTitle,
  reactivate: vendors.reactivateTitle,
  commission: vendors.commissionTitle,
};

const DESCRIPTIONS: Record<VendorAction, (shop: string) => string> = {
  approve: vendors.approveDescription,
  reject: vendors.rejectDescription,
  suspend: vendors.suspendDescription,
  reactivate: vendors.reactivateDescription,
  commission: vendors.commissionDescription,
};

const CONFIRM_LABELS: Record<VendorAction, string> = {
  approve: vendors.confirmApprove,
  reject: vendors.confirmReject,
  suspend: vendors.confirmSuspend,
  reactivate: vendors.confirmReactivate,
  commission: vendors.confirmCommission,
};

interface VendorActionDialogProps {
  open: boolean;
  vendor: VendorData;
  action: VendorAction;
  isSubmitting: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (values: { reason: string; commissionRate?: number; remark?: string }) => void;
}

export function VendorActionDialog({
  open,
  vendor,
  action,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: VendorActionDialogProps) {
  const formId = useId();
  const [reason, setReason] = useState('');
  const [commission, setCommission] = useState(
    action === 'commission' ? String(vendor.commissionRate) : '',
  );
  const [remark, setRemark] = useState('');
  const [reasonError, setReasonError] = useState('');
  const [commissionError, setCommissionError] = useState('');
  const shop = vendor.shopName || vendors.shopFallback;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (action === 'reactivate') {
      onSubmit({ reason: '', commissionRate: vendor.commissionRate });
      return;
    }

    if (action === 'approve' || action === 'commission') {
      const commissionResult = validateVendorCommission(commission);
      setCommissionError(commissionResult.message);
      if (!commissionResult.isValid) return;
      onSubmit({
        reason: '',
        commissionRate: commission.trim() === '' ? undefined : Number(commission),
        remark: remark.trim() || undefined,
      });
      return;
    }

    const reasonResult = validateVendorReason(reason);
    setReasonError(reasonResult.message);
    if (!reasonResult.isValid) return;
    onSubmit({ reason: reason.trim() });
  };

  const isDanger = action === 'reject' || action === 'suspend';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={TITLES[action]}
      description={DESCRIPTIONS[action](shop)}
      closeLabel={MESSAGES.common.close}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            {MESSAGES.common.cancel}
          </Button>
          <Button
            type="submit"
            form={formId}
            variant={isDanger ? 'danger' : 'primary'}
            loading={isSubmitting}
          >
            {CONFIRM_LABELS[action]}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <FormError message={error} />}

        {action === 'reactivate' ? (
          <>
            <p className="text-fg-muted text-sm">
              {vendors.reactivateCommission(vendors.commission(vendor.commissionRate))}
            </p>
            <FormField label={vendors.approveRemarkLabel} hint={vendors.approveRemarkHint}>
              <Textarea
                value={remark}
                onChange={(event) => setRemark(event.target.value)}
                maxLength={VENDOR_REASON_MAX_LENGTH}
              />
            </FormField>
          </>
        ) : action === 'approve' || action === 'commission' ? (
          <>
            <FormField
              label={vendors.approveCommissionLabel}
              hint={action === 'commission' ? vendors.commissionHint : vendors.approveCommissionHint}
              error={commissionError}
            >
              <Input
                type="number"
                inputMode="decimal"
                min={VENDOR_COMMISSION_MIN}
                max={VENDOR_COMMISSION_MAX}
                value={commission}
                onChange={(event) => setCommission(event.target.value)}
                autoFocus
              />
            </FormField>
            {action === 'approve' && (
              <FormField label={vendors.approveRemarkLabel} hint={vendors.approveRemarkHint}>
                <Textarea
                  value={remark}
                  onChange={(event) => setRemark(event.target.value)}
                  maxLength={VENDOR_REASON_MAX_LENGTH}
                />
              </FormField>
            )}
          </>
        ) : (
          <FormField label={vendors.reasonLabel} error={reasonError}>
            <Textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder={vendors.reasonPlaceholder}
              maxLength={VENDOR_REASON_MAX_LENGTH}
              autoFocus
            />
          </FormField>
        )}
      </form>
    </Dialog>
  );
}

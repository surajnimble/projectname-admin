'use client';

import { useState } from 'react';
import { FormError } from '@/components/common/form-error';
import { FormField } from '@/components/common/form-field';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MESSAGES } from '@/messages';

const { orders } = MESSAGES;

interface DeliveryOtpDialogProps {
  open: boolean;
  isSubmitting?: boolean;
  error?: string;
  requiresCodCollection?: boolean;
  onConfirm: (values: { otp: string; remarks?: string; collectedAmount?: number }) => void;
  onClose: () => void;
}

export function DeliveryOtpDialog({
  open,
  isSubmitting = false,
  error = '',
  requiresCodCollection = false,
  onConfirm,
  onClose,
}: DeliveryOtpDialogProps) {
  const [otp, setOtp] = useState('');
  const [collectedAmount, setCollectedAmount] = useState('');
  const [remarks, setRemarks] = useState('');
  const amount = collectedAmount.trim() ? Number(collectedAmount) : undefined;
  const validAmount = amount === undefined || (Number.isFinite(amount) && amount >= 0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={orders.fields.deliveryOtpTitle}
      description={orders.fields.deliveryOtpDescription}
      closeLabel={MESSAGES.common.close}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            {MESSAGES.common.cancel}
          </Button>
          <Button
            type="button"
            loading={isSubmitting}
            disabled={!/^\d{4}$/.test(otp) || !validAmount}
            onClick={() => onConfirm({
              otp,
              ...(remarks.trim() ? { remarks: remarks.trim() } : {}),
              ...(amount === undefined ? {} : { collectedAmount: amount }),
            })}
          >
            {orders.fields.verifyDelivery}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {error && <FormError message={error} />}
        <FormField label={orders.fields.deliveryOtpLabel} hint="Enter exactly 4 digits.">
          <Input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={otp}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 4))}
            maxLength={4}
            placeholder="0000"
            autoFocus
          />
        </FormField>
        {requiresCodCollection && (
          <FormField label={orders.fields.collectedAmountLabel} hint="Leave blank to use the calculated sub-order COD amount.">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={collectedAmount}
              onChange={(event) => setCollectedAmount(event.target.value)}
              placeholder="0.00"
            />
          </FormField>
        )}
        <FormField label={orders.fields.deliveryRemarksLabel}>
          <Textarea
            value={remarks}
            onChange={(event) => setRemarks(event.target.value)}
            maxLength={300}
            placeholder="Optional delivery note"
          />
        </FormField>
      </div>
    </Dialog>
  );
}

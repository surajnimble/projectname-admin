'use client';

import { useState } from 'react';
import { FormError } from '@/components/common/form-error';
import { FormField } from '@/components/common/form-field';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ORDER_STATUS_OPTIONS, VENDOR_REASON_MAX_LENGTH } from '@/constants';
import { MESSAGES } from '@/messages';

const { orders } = MESSAGES;

interface OrderStatusDialogProps {
  open: boolean;
  currentStatus: string;
  isSubmitting?: boolean;
  error?: string;
  onConfirm: (values: { status: string; remark: string; location: string }) => void;
  onClose: () => void;
}

export function OrderStatusDialog({
  open,
  currentStatus,
  isSubmitting = false,
  error = '',
  onConfirm,
  onClose,
}: OrderStatusDialogProps) {
  const [status, setStatus] = useState(currentStatus);
  const [remark, setRemark] = useState('');
  const [location, setLocation] = useState('');

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={orders.updateStatus}
      description={orders.updateStatusDescription}
      closeLabel={MESSAGES.common.close}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            {MESSAGES.common.cancel}
          </Button>
          <Button
            type="button"
            loading={isSubmitting}
            disabled={status === currentStatus}
            onClick={() => onConfirm({ status, remark: remark.trim(), location: location.trim() })}
          >
            {orders.save}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {error && <FormError message={error} />}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="order-status">{orders.statusLabel}</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="order-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ORDER_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {orders.statuses[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <FormField label={orders.locationLabel}>
          <Input value={location} onChange={(event) => setLocation(event.target.value)} maxLength={120} />
        </FormField>
        <FormField label={orders.remarkLabel}>
          <Textarea
            value={remark}
            onChange={(event) => setRemark(event.target.value)}
            placeholder={orders.remarkPlaceholder}
            maxLength={VENDOR_REASON_MAX_LENGTH}
          />
        </FormField>
      </div>
    </Dialog>
  );
}

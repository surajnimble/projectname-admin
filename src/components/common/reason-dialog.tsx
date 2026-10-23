'use client';

import { useState } from 'react';
import { FormError } from '@/components/common/form-error';
import { FormField } from '@/components/common/form-field';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { VENDOR_REASON_MAX_LENGTH } from '@/constants';
import { MESSAGES } from '@/messages';

interface ReasonDialogProps {
  open: boolean;
  title: string;
  description?: string;
  label: string;
  placeholder?: string;
  confirmLabel: string;
  isSubmitting?: boolean;
  error?: string;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

export function ReasonDialog({
  open,
  title,
  description,
  label,
  placeholder,
  confirmLabel,
  isSubmitting = false,
  error = '',
  onConfirm,
  onClose,
}: ReasonDialogProps) {
  const [reason, setReason] = useState('');

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      closeLabel={MESSAGES.common.close}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            {MESSAGES.common.cancel}
          </Button>
          <Button
            type="button"
            variant="destructive"
            loading={isSubmitting}
            onClick={() => onConfirm(reason.trim())}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {error && <FormError message={error} />}
        <FormField label={label}>
          <Textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder={placeholder}
            maxLength={VENDOR_REASON_MAX_LENGTH}
            autoFocus
          />
        </FormField>
      </div>
    </Dialog>
  );
}

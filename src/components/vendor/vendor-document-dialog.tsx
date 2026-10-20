'use client';

import { useState } from 'react';
import { FormError } from '@/components/common/form-error';
import { FormField } from '@/components/common/form-field';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { VENDOR_REASON_MAX_LENGTH } from '@/constants';
import { MESSAGES } from '@/messages';

const { vendors } = MESSAGES;

export type DocumentDecision = 'verify' | 'reject';

interface VendorDocumentDialogProps {
  open: boolean;
  shop: string;
  decision: DocumentDecision;
  isSubmitting: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (remark: string) => void;
}

export function VendorDocumentDialog({
  open,
  shop,
  decision,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: VendorDocumentDialogProps) {
  const [remark, setRemark] = useState('');
  const isVerify = decision === 'verify';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isVerify ? vendors.verifyTitle : vendors.rejectDocumentTitle}
      description={
        isVerify ? vendors.verifyDescription(shop) : vendors.rejectDocumentDescription(shop)
      }
      closeLabel={MESSAGES.common.close}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            {MESSAGES.common.cancel}
          </Button>
          <Button
            type="button"
            variant={isVerify ? 'primary' : 'danger'}
            loading={isSubmitting}
            onClick={() => onSubmit(remark.trim())}
          >
            {isVerify ? vendors.confirmVerify : vendors.confirmRejectDocument}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {error && <FormError message={error} />}
        <FormField label={vendors.remarkLabel} hint={vendors.remarkHint}>
          <Textarea
            value={remark}
            onChange={(event) => setRemark(event.target.value)}
            maxLength={VENDOR_REASON_MAX_LENGTH}
            autoFocus
          />
        </FormField>
      </div>
    </Dialog>
  );
}

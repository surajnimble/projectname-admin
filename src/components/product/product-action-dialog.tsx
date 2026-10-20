'use client';

import { useId, useState, type FormEvent } from 'react';
import { FormError } from '@/components/common/form-error';
import { FormField } from '@/components/common/form-field';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { PRODUCT_STATUSES, type ProductStatus } from '@/constants';
import type { ProductSummaryData } from '@/lib/api/contract';
import { MESSAGES } from '@/messages';

const { products } = MESSAGES;

const STATUS_OPTIONS: readonly { value: ProductStatus; label: string }[] = [
  { value: PRODUCT_STATUSES.active, label: products.statuses.ACTIVE },
  { value: PRODUCT_STATUSES.inactive, label: products.statuses.INACTIVE },
  { value: PRODUCT_STATUSES.draft, label: products.statuses.DRAFT },
  { value: PRODUCT_STATUSES.archived, label: products.statuses.ARCHIVED },
];

export type ProductDialogAction = 'status' | 'stock' | 'delete' | 'approve' | 'reject' | 'submit';

interface ProductActionDialogProps {
  open: boolean;
  product: ProductSummaryData | null;
  action: ProductDialogAction;
  isSubmitting: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (values: {
    status?: ProductStatus;
    stock?: number;
    reason?: string;
  }) => void;
}

export function ProductActionDialog({
  open,
  product,
  action,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: ProductActionDialogProps) {
  const formId = useId();
  const [status, setStatus] = useState<ProductStatus>(PRODUCT_STATUSES.active);
  const [stock, setStock] = useState('');
  const [reason, setReason] = useState('');

  if (!product) return null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (action === 'status') {
      onSubmit({ status });
      return;
    }
    if (action === 'stock') {
      const value = Number(stock);
      if (!Number.isFinite(value) || value < 0) return;
      onSubmit({ stock: Math.round(value) });
      return;
    }
    if (action === 'approve') {
      onSubmit({});
      return;
    }
    if (action === 'reject') {
      const trimmed = reason.trim();
      if (!trimmed) return;
      onSubmit({ reason: trimmed });
    }
    if (action === 'submit') {
      onSubmit({});
    }
  };

  const title =
    action === 'status'
      ? products.changeStatusTitle
      : action === 'stock'
        ? products.updateStockTitle
        : action === 'approve'
          ? products.approveProductTitle
          : action === 'reject'
            ? products.rejectProductTitle
            : products.deleteProductTitle;

  const description =
    action === 'status'
      ? products.changeStatusDescription(product.name)
      : action === 'stock'
        ? products.updateStockDescription(product.name)
        : action === 'approve'
          ? products.approveProductDescription(product.name)
          : action === 'reject'
            ? products.rejectProductDescription(product.name)
            : products.deleteProductDescription(product.name);

  const confirmLabel =
    action === 'status'
      ? products.saveStatus
      : action === 'stock'
        ? products.saveStock
        : action === 'approve'
          ? products.confirmApprove
          : action === 'reject'
            ? products.confirmReject
            : products.confirmDelete;

  const confirmVariant =
    action === 'delete' || action === 'reject' ? 'destructive' : 'primary';

  const showReason = action === 'reject';

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
            type="submit"
            form={formId}
            variant={confirmVariant}
            loading={isSubmitting}
            disabled={showReason && reason.trim() === ''}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <FormError message={error} />}

        {action === 'status' && (
          <FormField label={products.statusLabel}>
            <div role="radiogroup" aria-label={products.statusLabel} className="flex flex-col gap-1">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={status === option.value}
                  onClick={() => setStatus(option.value)}
                  className={
                    status === option.value
                      ? 'bg-soft text-soft-fg rounded-md px-3 py-2 text-left text-sm font-medium'
                      : 'text-fg data-hover-color rounded-md px-3 py-2 text-left text-sm'
                  }
                >
                  {option.label}
                </button>
              ))}
            </div>
          </FormField>
        )}

        {action === 'stock' && (
          <FormField
            label={products.stockLabel}
            hint={products.stockHint}
            error={stock !== '' && (!Number.isFinite(Number(stock)) || Number(stock) < 0) ? products.stockInvalid : ''}
          >
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              value={stock}
              onChange={(event) => setStock(event.target.value)}
              placeholder={String(product.stock)}
              autoFocus
            />
          </FormField>
        )}

        {showReason && (
          <FormField label={products.rejectReasonLabel} hint={products.rejectReasonHint}>
            <TextareaEl
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder={products.rejectReasonPlaceholder}
              maxLength={500}
              autoFocus
            />
          </FormField>
        )}

        {action === 'delete' && (
          <p className="text-fg-muted text-sm">{products.deleteProductWarning}</p>
        )}
      </form>
    </Dialog>
  );
}

function TextareaEl({
  value,
  onChange,
  placeholder,
  maxLength,
  autoFocus,
}: {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  maxLength: number;
  autoFocus: boolean;
}) {
  return (
    <textarea
      className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-fg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      placeholder={placeholder}
      maxLength={maxLength}
      value={value}
      onChange={onChange}
      autoFocus={autoFocus}
      rows={3}
    />
  );
}

'use client';

import { useState } from 'react';
import { z } from 'zod';
import { FormError } from '@/components/common/form-error';
import { FormField } from '@/components/common/form-field';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { FlashSaleData, ApiRequest } from '@/lib/api/contract';
import { MESSAGES } from '@/messages';

const { flashSales } = MESSAGES;

const flashSaleSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  banner: z.string().optional(),
  startsAt: z.string(),
  endsAt: z.string(),
  discountType: z.enum(['PERCENT', 'FLAT']),
  discountValue: z.coerce.number().min(0),
});

interface FlashSaleDialogProps {
  open: boolean;
  flashSale?: FlashSaleData;
  isSubmitting: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (values: ApiRequest) => void;
}

export function FlashSaleDialog({
  open,
  flashSale,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: FlashSaleDialogProps) {
  const [name, setName] = useState(flashSale?.name ?? '');
  const [banner, setBanner] = useState(flashSale?.banner ?? '');
  const [startsAt, setStartsAt] = useState(flashSale?.startsAt ?? '');
  const [endsAt, setEndsAt] = useState(flashSale?.endsAt ?? '');
  const [discountType, setDiscountType] = useState(flashSale?.discountType ?? 'PERCENT');
  const [discountValue, setDiscountValue] = useState(flashSale?.discountValue?.toString() ?? '');

  const handleSubmit = () => {
    const parsed = flashSaleSchema.safeParse({
      name,
      banner,
      startsAt,
      endsAt,
      discountType,
      discountValue: Number(discountValue),
    });
    if (!parsed.success) return;
    onSubmit(parsed.data);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={flashSale ? flashSales.editTitle : flashSales.createTitle}
      description={flashSale ? flashSales.editDescription : flashSales.createDescription}
    >
      <div className="flex flex-col gap-4">
        {error && <FormError message={error} />}
        <FormField label={flashSales.fields.name}>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={flashSales.fields.namePlaceholder}
            autoFocus
          />
        </FormField>
        <FormField label={flashSales.fields.banner}>
          <Input
            value={banner}
            onChange={(e) => setBanner(e.target.value)}
            placeholder={flashSales.fields.bannerPlaceholder}
          />
        </FormField>
        <FormField label={flashSales.fields.startsAt}>
          <Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
        </FormField>
        <FormField label={flashSales.fields.endsAt}>
          <Input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
        </FormField>
        <FormField label={flashSales.fields.discountType}>
          <select
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value)}
            className="border border-input bg-background rounded-md px-3 py-2 text-sm text-fg focus:ring-2 focus:ring-ring focus:border-ring outline-none w-full"
          >
            <option value="PERCENT">{flashSales.discountTypes.PERCENT}</option>
            <option value="FLAT">{flashSales.discountTypes.FLAT}</option>
          </select>
        </FormField>
        <FormField label={flashSales.fields.discountValue}>
          <Input
            type="number"
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            placeholder={flashSales.fields.discountValuePlaceholder}
          />
        </FormField>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          {MESSAGES.common.cancel}
        </Button>
        <Button type="button" variant="primary" loading={isSubmitting} onClick={handleSubmit}>
          {flashSale ? flashSales.save : flashSales.createButton}
        </Button>
      </div>
    </Dialog>
  );
}

'use client';

import { useCallback, useEffect, useId, useState, type FormEvent } from 'react';
import { z } from 'zod';
import { Search, X } from 'lucide-react';
import { FormError } from '@/components/common/form-error';
import { FormField } from '@/components/common/form-field';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { FlashSaleData, ApiRequest, ProductSummaryData } from '@/lib/api/contract';
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

interface FlashSaleItemInput {
  productId: string;
  productName: string;
  salePrice: string;
  saleStock: string;
}

interface FlashSaleDialogProps {
  open: boolean;
  flashSale?: FlashSaleData;
  isSubmitting: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (values: ApiRequest) => void;
  searchProducts: (query: string) => Promise<ProductSummaryData[]>;
}

export function FlashSaleDialog({
  open,
  flashSale,
  isSubmitting,
  error,
  onClose,
  onSubmit,
  searchProducts,
}: FlashSaleDialogProps) {
  const formId = useId();
  const [name, setName] = useState(flashSale?.name ?? '');
  const [banner, setBanner] = useState(flashSale?.banner ?? '');
  const [startsAt, setStartsAt] = useState(flashSale?.startsAt ?? '');
  const [endsAt, setEndsAt] = useState(flashSale?.endsAt ?? '');
  const [discountType, setDiscountType] = useState(flashSale?.discountType ?? 'PERCENT');
  const [discountValue, setDiscountValue] = useState(flashSale?.discountValue?.toString() ?? '');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ProductSummaryData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedItems, setSelectedItems] = useState<FlashSaleItemInput[]>(
    flashSale?.itemList.map((i) => ({
      productId: i.productId,
      productName: i.productData?.name ?? i.productId,
      salePrice: i.salePrice?.toString() ?? '',
      saleStock: i.saleStock?.toString() ?? '',
    })) ?? [],
  );

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const results = await searchProducts(query);
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchProducts]);

  useEffect(() => {
    const timer = setTimeout(() => void handleSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  const addProduct = (product: ProductSummaryData) => {
    if (selectedItems.some((i) => i.productId === product.productId)) return;
    setSelectedItems([
      ...selectedItems,
      {
        productId: product.productId,
        productName: product.name,
        salePrice: product.price?.toString() ?? '',
        saleStock: product.stock?.toString() ?? '',
      },
    ]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsed = flashSaleSchema.safeParse({
      name,
      banner,
      startsAt,
      endsAt,
      discountType,
      discountValue: Number(discountValue),
    });
    if (!parsed.success) return;
    if (selectedItems.length === 0) return;

    onSubmit({
      ...parsed.data,
      items: selectedItems.map((i) => ({
        productId: i.productId,
        salePrice: i.salePrice ? Number(i.salePrice) : undefined,
        saleStock: i.saleStock ? Number(i.saleStock) : undefined,
      })),
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={flashSale ? flashSales.editTitle : flashSales.createTitle}
      description={flashSale ? flashSales.editDescription : flashSales.createDescription}
      closeLabel={MESSAGES.common.cancel}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            {MESSAGES.common.cancel}
          </Button>
          <Button
            type="submit"
            form={formId}
            variant="primary"
            loading={isSubmitting}
            disabled={selectedItems.length === 0}
          >
            {flashSale ? flashSales.save : flashSales.createButton}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-4">
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

        <div className="rounded-lg border border-input bg-background p-4">
          <div className="flex flex-col gap-2 pt-1">
            <label className="text-xs font-medium text-fg">{flashSales.fields.name}</label>
            <div className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products to add to this sale"
                className="flex-1 text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSearching}
                onClick={() => void searchProducts(searchQuery)}
              >
                <Search className="size-4" aria-hidden="true" />
              </Button>
            </div>
            {isSearching && <p className="text-xs text-fg-muted mt-2">Searching…</p>}
            {searchResults.length > 0 && (
              <div className="mt-2 space-y-1">
                {searchResults.map((p) => (
                  <Button
                    key={p.productId}
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full text-left text-xs border border-input rounded-md hover:bg-accent"
                    onClick={() => addProduct(p)}
                  >
                    {p.name} — {p.stock} in stock
                  </Button>
                ))}
              </div>
            )}
            {selectedItems.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-medium text-fg-muted uppercase">Items</p>
                {selectedItems.map((item, index) => (
                  <div key={item.productId} className="flex items-center justify-between gap-2 p-3 border rounded-md">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-fg">{item.productName}</p>
                      <p className="text-xs text-fg-muted">{item.productId}</p>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={item.salePrice}
                        onChange={(e) => {
                          setSelectedItems(
                            selectedItems.map((it, i) =>
                              i === index ? { ...it, salePrice: e.target.value } : it,
                            ),
                          );
                        }}
                        placeholder="Sale price"
                        className="w-24 text-xs"
                      />
                      <Input
                        type="number"
                        value={item.saleStock}
                        onChange={(e) => {
                          setSelectedItems(
                            selectedItems.map((it, i) =>
                              i === index ? { ...it, saleStock: e.target.value } : it,
                            ),
                          );
                        }}
                        placeholder="Stock"
                        className="w-20 text-xs"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        <X className="size-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {selectedItems.length === 0 && searchResults.length === 0 && !isSearching && searchQuery.trim() && (
              <p className="text-xs text-fg-muted mt-2">No products found.</p>
            )}
          </div>
        </div>
      </form>
    </Dialog>
  );
}

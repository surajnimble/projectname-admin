'use client';

import { RefreshCw, Search, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { FilterGroup, FilterOption, FilterSheet } from '@/components/common/filter-sheet';
import { Pagination } from '@/components/common/pagination';
import { TableSkeleton } from '@/components/common/table-skeleton';
import { ProductActionDialog, type ProductDialogAction } from '@/components/product/product-action-dialog';
import { ProductTable } from '@/components/product/product-table';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PRODUCT_PAGE_SIZE, PRODUCT_SKELETON_ROWS, PRODUCT_STATUSES, type ProductStatus } from '@/constants';
import { useVendorProducts, type ProductStatusFilter } from '@/hooks/use-vendor-products';
import type { ProductSummaryData } from '@/lib/api/contract';
import { showSuccess } from '@/lib/utils/toast';
import { MESSAGES } from '@/messages';

const { products } = MESSAGES;

const STATUS_FILTERS: readonly { value: ProductStatusFilter; label: string }[] = [
  { value: '', label: products.statuses.ALL },
  { value: PRODUCT_STATUSES.active, label: products.statuses.ACTIVE },
  { value: PRODUCT_STATUSES.inactive, label: products.statuses.INACTIVE },
  { value: PRODUCT_STATUSES.draft, label: products.statuses.DRAFT },
  { value: PRODUCT_STATUSES.archived, label: products.statuses.ARCHIVED },
];

export function ProductList({ vendorId }: { vendorId: string }) {
  const {
    data,
    isLoading,
    error,
    actionError,
    isActioning,
    page,
    search,
    status,
    inStock,
    isFeatured,
    setPage,
    setSearch,
    setStatus,
    setInStock,
    setIsFeatured,
    refresh,
    runAction,
  } = useVendorProducts(vendorId);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draft, setDraft] = useState<{
    status: ProductStatusFilter;
    inStock: boolean;
    isFeatured: boolean;
  }>({ status: '', inStock: false, isFeatured: false });
  const [dialog, setDialog] = useState<{
    product: ProductSummaryData;
    action: ProductDialogAction;
  } | null>(null);

  const activeFilterCount =
    (status === '' ? 0 : 1) + (inStock ? 1 : 0) + (isFeatured ? 1 : 0);

  const openFilters = () => {
    setDraft({ status, inStock, isFeatured });
    setFiltersOpen(true);
  };

  const resetDraft = () => {
    setDraft({ status: '', inStock: false, isFeatured: false });
  };

  const applyDraft = () => {
    setStatus(draft.status);
    setInStock(draft.inStock);
    setIsFeatured(draft.isFeatured);
    setFiltersOpen(false);
  };

  const handleSubmit = async (values: { status?: ProductStatus; stock?: number }) => {
    if (!dialog) return;
    const done = await runAction(dialog.action, dialog.product.productId, values);
    if (!done) return;
    showSuccess(
      dialog.action === 'status'
        ? products.statusUpdated
        : dialog.action === 'stock'
          ? products.stockUpdated
          : products.productDeleted,
    );
    setDialog(null);
  };

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="border-border border-b p-4">
          <div className="flex flex-col gap-3">
            <CardTitle>{products.title}</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-0 flex-1 sm:w-80 sm:flex-none lg:w-96">
                <Search
                  className="text-fg-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                  aria-hidden="true"
                />
                <Input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={products.searchPlaceholder}
                  aria-label={MESSAGES.common.search}
                  className="pl-9"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => openFilters()}
                className="shrink-0"
              >
                <SlidersHorizontal className="size-4" aria-hidden="true" />
                {MESSAGES.common.filters}
                {activeFilterCount > 0 && (
                  <span className="bg-primary text-primary-fg flex size-5 items-center justify-center rounded-full text-xs">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
              <div className="w-full sm:ml-auto sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  loading={isLoading}
                  onClick={() => void refresh()}
                  className="shrink-0"
                >
                  <RefreshCw className="size-4" aria-hidden="true" />
                  {MESSAGES.dashboard.refresh}
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        {isLoading ? (
          <TableSkeleton rows={PRODUCT_SKELETON_ROWS} />
        ) : error ? (
          <div className="p-4">
            <ErrorState message={error} onRetry={() => void refresh()} />
          </div>
        ) : data.itemList.length === 0 ? (
          <div className="p-4">
            <EmptyState title={products.emptyTitle} description={products.emptyBody} />
          </div>
        ) : (
          <ProductTable
            products={data.itemList}
            vendorId={vendorId}
            onAction={(product, action) => setDialog({ product, action })}
          />
        )}

        <Pagination
          currentPage={data.currentPage || page}
          totalPage={data.totalPage}
          totalRecord={data.totalRecord}
          limit={data.limit || PRODUCT_PAGE_SIZE}
          onPageChange={setPage}
        />
      </Card>

      <FilterSheet
        open={filtersOpen}
        title={products.filtersTitle}
        onClose={() => setFiltersOpen(false)}
        onReset={resetDraft}
        onDone={applyDraft}
      >
        <FilterGroup label={products.statusLabel}>
          {STATUS_FILTERS.map((option) => (
            <FilterOption
              key={option.value || 'all'}
              label={option.label}
              selected={draft.status === option.value}
              onSelect={() => setDraft((current) => ({ ...current, status: option.value }))}
            />
          ))}
        </FilterGroup>
        <Switch
          label={products.inStockFilter}
          checked={draft.inStock}
          onChange={(value) => setDraft((current) => ({ ...current, inStock: value }))}
        />
        <Switch
          label={products.featuredFilter}
          checked={draft.isFeatured}
          onChange={(value) => setDraft((current) => ({ ...current, isFeatured: value }))}
        />
      </FilterSheet>

      <ProductActionDialog
        open={dialog !== null}
        product={dialog?.product ?? null}
        action={dialog?.action ?? 'status'}
        isSubmitting={isActioning}
        error={actionError}
        onClose={() => setDialog(null)}
        onSubmit={(values) => void handleSubmit(values)}
      />

    </>
  );
}
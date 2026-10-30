'use client';

import { RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { DataTable } from '@/components/common/data-table';
import { FilterGroup, FilterOption, FilterSheet } from '@/components/common/filter-sheet';
import { Pagination } from '@/components/common/pagination';
import {
  ProductActionDialog,
  type ProductDialogAction,
} from '@/components/product/product-action-dialog';
import { productColumns, ProductRowActions } from '@/components/product/product-columns';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { PRODUCT_PAGE_SIZE, PRODUCT_STATUSES, ROUTES, type ProductStatus } from '@/constants';
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
  const router = useRouter();
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

  const activeFilterCount = (status === '' ? 0 : 1) + (inStock ? 1 : 0) + (isFeatured ? 1 : 0);

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
        <DataTable
          columns={productColumns(vendorId)}
          rows={data.itemList}
          rowKey={(product) => product.productId}
          onRowClick={(product) =>
            router.push(ROUTES.vendorProductDetails(vendorId, product.productId))
          }
          toolbar={{
            search: {
              value: search,
              placeholder: products.searchPlaceholder,
              onChange: setSearch,
            },
            filters: {
              label: MESSAGES.common.filters,
              count: activeFilterCount,
              onOpen: openFilters,
            },
            actions: (
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
            ),
          }}
          actions={{
            header: products.columns.actions,
            render: (product) => (
              <ProductRowActions
                product={product}
                onAction={(value, action) => setDialog({ product: value, action })}
              />
            ),
          }}
          isLoading={isLoading}
          error={error}
          onRetry={() => void refresh()}
          emptyTitle={products.emptyTitle}
          emptyDescription={products.emptyBody}
          footer={
            <Pagination
              currentPage={data.currentPage || page}
              totalPage={data.totalPage}
              totalRecord={data.totalRecord}
              limit={data.limit || PRODUCT_PAGE_SIZE}
              onPageChange={setPage}
            />
          }
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

      {dialog && (
        <ProductActionDialog
          open
          product={dialog.product}
          action={dialog.action}
          isSubmitting={isActioning}
          error={actionError}
          onClose={() => setDialog(null)}
          onSubmit={(values) => void handleSubmit(values)}
        />
      )}
    </>
  );
}

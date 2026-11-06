'use client';

import { RefreshButton } from '@/components/common/refresh-button';
import { useState } from 'react';
import { DataTable, type DataTableColumn } from '@/components/common/data-table';
import { FilterGroup, FilterSheet } from '@/components/common/filter-sheet';
import { Pagination } from '@/components/common/pagination';
import { ProductActionDialog, type ProductDialogAction } from '@/components/product/product-action-dialog';
import { OptionsMenu, type OptionsMenuItem } from '@/components/ui/options-menu';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PRODUCT_PAGE_SIZE } from '@/constants';
import { useProductApprovals } from '@/hooks/use-product-approvals';
import type { ProductApprovalData, ProductSummaryData } from '@/lib/api/contract';
import { showSuccess } from '@/lib/utils/toast';
import { MESSAGES } from '@/messages';
import { StatusBadge, productStatusMeta } from '@/components/common/status-badge';

const { products } = MESSAGES;

const approvalColumns: readonly DataTableColumn<ProductApprovalData>[] = [
  {
    key: 'product',
    header: products.columns.product,
    cell: (product) => (
      <div className="flex items-center gap-3">
        <div className="size-8 rounded-md bg-surface-muted flex items-center justify-center">
          {product.sku?.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <div className="font-medium">{product.name}</div>
          <div className="text-fg-muted text-sm">{product.sku || products.dash}</div>
        </div>
      </div>
    ),
  },
  {
    key: 'vendor',
    header: products.columns.vendor,
    cell: (product) => (
      <span className="block truncate">{product.vendorData.shopName || products.dash}</span>
    ),
  },
  {
    key: 'sku',
    header: products.columns.sku,
    cell: (product) => <span className="block truncate">{product.sku || products.dash}</span>,
  },
  {
    key: 'submittedAt',
    header: products.columns.submittedAt,
    cell: (product) => <span className="block">{product.submittedAt}</span>,
  },
  {
    key: 'approvalStatus',
    header: products.columns.approvalStatus,
    cell: (product) => <StatusBadge meta={productStatusMeta(product.approvalStatus)} />,
  },
];

export function ProductApprovalsList() {
  const {
    data,
    isLoading,
    error,
    actionError,
    isActioning,
    page,
    search,
    vendorId,
    setPage,
    setSearch,
    setVendorId,
    refresh,
    approve,
    reject,
  } = useProductApprovals();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftVendorId, setDraftVendorId] = useState(vendorId);
  const [dialog, setDialog] = useState<{
    product: ProductApprovalData;
    action: ProductDialogAction;
  } | null>(null);

  const activeFilterCount = (search ? 1 : 0) + (vendorId ? 1 : 0);

  const handleSubmit = async (values: { reason?: string }) => {
    if (!dialog) return;
    let done = false;
    if (dialog.action === 'approve') {
      done = await approve(dialog.product.productId);
      if (done) showSuccess(products.productApproved);
    } else if (dialog.action === 'reject') {
      done = await reject(dialog.product.productId, values.reason ?? '');
      if (done) showSuccess(products.productRejected);
    }
    if (!done) return;
    setDialog(null);
  };

  const emptyMessage = search || vendorId ? products.emptyFiltered : products.emptyTitle;

  const openAction = (product: ProductApprovalData, action: ProductDialogAction) => {
    setDialog({ product, action });
  };

  const openFilters = () => {
    setDraftVendorId(vendorId);
    setFiltersOpen(true);
  };

  const resetFilters = () => {
    setDraftVendorId('');
  };

  const applyFilters = () => {
    setVendorId(draftVendorId);
    setPage(1);
    setFiltersOpen(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="overflow-hidden">
        <DataTable
          columns={approvalColumns}
          rows={data.itemList}
          rowKey={(product) => product.productId}
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
            actions: <RefreshButton onRefresh={() => void refresh()} isRefreshing={isLoading} label={MESSAGES.dashboard.refresh} />,
          }}
          actions={{
            header: products.columns.actions,
            render: (product) => {
              const items: OptionsMenuItem[] = [
                {
                  label: products.approveProduct,
                  onSelect: () => openAction(product, 'approve'),
                },
                {
                  label: products.rejectProduct,
                  intent: 'danger',
                  onSelect: () => openAction(product, 'reject'),
                },
              ];
              return (
                <OptionsMenu label={products.rowActionsLabel} items={items} className="flex justify-end" />
              );
            },
          }}
          isLoading={isLoading}
          error={error}
          onRetry={() => void refresh()}
          emptyTitle={emptyMessage}
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
        onReset={resetFilters}
        onDone={applyFilters}
      >
        <FilterGroup label={products.columns.vendor}>
          <Input
            value={draftVendorId}
            onChange={(event) => setDraftVendorId(event.target.value)}
            placeholder={products.searchPlaceholder}
          />
        </FilterGroup>
      </FilterSheet>

      {dialog && (
        <ProductActionDialog
          open
          product={dialog.product as unknown as ProductSummaryData}
          action={dialog.action}
          isSubmitting={isActioning}
          error={actionError}
          onClose={() => setDialog(null)}
          onSubmit={(values) => void handleSubmit(values)}
        />
      )}
    </div>
  );
}

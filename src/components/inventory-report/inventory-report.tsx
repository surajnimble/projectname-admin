'use client';

import { RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '@/components/common/page-header';
import { DataTable } from '@/components/common/data-table';
import { Pagination } from '@/components/common/pagination';
import { FilterGroup, FilterOption, FilterSheet } from '@/components/common/filter-sheet';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/status-badge';
import { useLowStock } from '@/hooks/use-low-stock';
import type { LowStockProductData } from '@/lib/api/contract';
import { MESSAGES } from '@/messages';

const { inventoryReport } = MESSAGES;

const columns = [
  {
    key: 'product',
    header: inventoryReport.columns.product,
    cell: (row: LowStockProductData) => <span className="font-medium">{row.name || MESSAGES.common.dash}</span>,
  },
  {
    key: 'sku',
    header: inventoryReport.columns.sku,
    hideBelow: 'lg',
    width: 'w-32',
    cell: (row: LowStockProductData) => <span className="text-sm text-fg-muted">{row.sku}</span>,
  },
  {
    key: 'shop',
    header: inventoryReport.columns.shop,
    hideBelow: 'xl',
    width: 'w-40',
    cell: (row: LowStockProductData) => <span className="text-sm truncate">{row.shop}</span>,
  },
  {
    key: 'stock',
    header: inventoryReport.columns.stock,
    align: 'center',
    hideBelow: '2xl',
    width: 'w-24',
    numeric: true,
    cell: (row: LowStockProductData) => <span className="block">{row.stock}</span>,
  },
  {
    key: 'threshold',
    header: inventoryReport.columns.threshold,
    align: 'center',
    hideBelow: '2xl',
    width: 'w-28',
    numeric: true,
    cell: (row: LowStockProductData) => <span className="block text-fg-muted">{row.threshold}</span>,
  },
  {
    key: 'status',
    header: inventoryReport.columns.status,
    align: 'center',
    hideBelow: '2xl',
    width: 'w-32',
    cell: (row: LowStockProductData) => (
      <StatusBadge
        meta={{
          label: row.isLow ? inventoryReport.statuses.low : inventoryReport.statuses.ok,
          intent: row.isLow ? 'warning' : 'success',
        }}
      />
    ),
  },
] as const;

export function InventoryReportPage() {
  const { data, isLoading, error, refresh } = useLowStock();
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftStatus, setDraftStatus] = useState<'all' | 'low' | 'ok'>('all');
  const [appliedStatus, setAppliedStatus] = useState<'all' | 'low' | 'ok'>('all');
  const activeFilterCount = appliedStatus !== 'all' ? 1 : 0;

  const openFilters = () => {
    setDraftStatus(appliedStatus);
    setFiltersOpen(true);
  };

  const resetDraft = () => {
    setDraftStatus('all');
  };

  const applyDraft = () => {
    setAppliedStatus(draftStatus);
    setFiltersOpen(false);
  };

  const filteredItems = data.itemList.filter((row) => {
    if (appliedStatus === 'all') return true;
    return appliedStatus === 'low' ? row.isLow : !row.isLow;
  });

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={MESSAGES.sections.inventory}
        description={inventoryReport.subtitle}
        action={
          <Button variant="outline" size="sm" loading={isLoading} onClick={() => void refresh()}>
            {MESSAGES.dashboard.refresh}
          </Button>
        }
      />
      <Card className="overflow-hidden">
        <DataTable
          columns={columns}
          rows={filteredItems}
          rowKey={(row) => `${row.sku}-${row.shop}`}
          toolbar={{
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
          isLoading={isLoading}
          error={error}
          emptyTitle={inventoryReport.emptyTitle}
          emptyDescription={inventoryReport.emptyBody}
          footer={
            <Pagination
              currentPage={page}
              totalPage={1}
              totalRecord={data.totalRecord}
              limit={10}
              onPageChange={setPage}
            />
          }
        />
      </Card>
      <FilterSheet
        open={filtersOpen}
        title={MESSAGES.common.filters}
        onClose={() => setFiltersOpen(false)}
        onReset={resetDraft}
        onDone={applyDraft}
      >
        <FilterGroup label={inventoryReport.columns.status}>
          <FilterOption
            label={MESSAGES.common.viewAll}
            selected={draftStatus === 'all'}
            onSelect={() => setDraftStatus('all')}
          />
          <FilterOption
            label={inventoryReport.statuses.low}
            selected={draftStatus === 'low'}
            onSelect={() => setDraftStatus('low')}
          />
          <FilterOption
            label={inventoryReport.statuses.ok}
            selected={draftStatus === 'ok'}
            onSelect={() => setDraftStatus('ok')}
          />
        </FilterGroup>
      </FilterSheet>
    </div>
  );
}

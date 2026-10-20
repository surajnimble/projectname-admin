'use client';

import { RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { FilterGroup, FilterOption, FilterSheet, FilterSwitch } from '@/components/common/filter-sheet';
import { Pagination } from '@/components/common/pagination';
import { VendorActionDialog } from '@/components/vendor/vendor-action-dialog';
import { VendorFilters } from '@/components/vendor/vendor-filters';
import { VendorTable } from '@/components/vendor/vendor-table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { VENDOR_PAGE_SIZE, VENDOR_SKELETON_ROWS, VENDOR_STATUSES, type VendorStatusFilter } from '@/constants';
import { useVendors } from '@/hooks/use-vendors';
import type { VendorAction } from '@/lib/api/vendor-actions';
import type { VendorData } from '@/lib/api/contract';
import { showSuccess } from '@/lib/utils/toast';
import { MESSAGES } from '@/messages';
import { toVendor } from '@/types/vendor';

const { vendors, dashboard } = MESSAGES;

const SUCCESS_MESSAGES: Record<VendorAction, string> = {
  approve: vendors.approved,
  reject: vendors.rejected,
  suspend: vendors.suspended,
  reactivate: vendors.reactivated,
  commission: vendors.commissionUpdated,
};

const fallbackVendor: VendorData = toVendor();

const STATUS_FILTERS: readonly { value: VendorStatusFilter; label: string }[] = [
  { value: VENDOR_STATUSES.all, label: vendors.statusAll },
  { value: VENDOR_STATUSES.pending, label: vendors.statuses.PENDING },
  { value: VENDOR_STATUSES.approved, label: vendors.statuses.APPROVED },
  { value: VENDOR_STATUSES.rejected, label: vendors.statuses.REJECTED },
  { value: VENDOR_STATUSES.suspended, label: vendors.statuses.SUSPENDED },
];

function VendorTableSkeleton() {
  return (
    <div className="divide-border divide-y" role="status" aria-busy="true">
      <span className="sr-only">{MESSAGES.common.loading}</span>
      {Array.from({ length: VENDOR_SKELETON_ROWS }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 px-4 py-3">
          <Skeleton className="bg-border-strong h-4 w-1/3" />
          <Skeleton className="bg-border-strong h-4 w-16" />
          <Skeleton className="bg-border-strong h-4 w-12" />
          <Skeleton className="bg-border-strong h-4 w-16" />
          <Skeleton className="bg-border-strong h-4 w-20" />
        </div>
      ))}
    </div>
  );
}

export function VendorList() {
  const {
    data,
    isLoading,
    isFetching,
    error,
    actionError,
    isActioning,
    page,
    status,
    search,
    hasDocuments,
    setPage,
    setStatus,
    setSearch,
    setHasDocuments,
    refresh,
    runAction,
  } = useVendors();
  const [target, setTarget] = useState<{ vendor: VendorData; action: VendorAction } | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeFilterCount =
    (status === VENDOR_STATUSES.all ? 0 : 1) + (hasDocuments ? 1 : 0);

  const resetFilters = () => {
    setStatus(VENDOR_STATUSES.all);
    setHasDocuments(false);
  };

  const handleSubmit = async (values: {
    reason: string;
    commissionRate?: number;
    remark?: string;
  }) => {
    if (!target) return;
    const done = await runAction(target.action, target.vendor.vendorId, values);
    if (!done) return;
    showSuccess(SUCCESS_MESSAGES[target.action]);
    setTarget(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="overflow-hidden">
        <div className="border-border border-b p-4">
          <VendorFilters
            search={search}
            filterCount={activeFilterCount}
            action={
              <Button
                variant="outline"
                size="sm"
                loading={isLoading || isFetching}
                onClick={() => void refresh()}
                className="shrink-0"
              >
                {!isLoading && !isFetching && <RefreshCw className="size-4" aria-hidden="true" />}
                {dashboard.refresh}
              </Button>
            }
            onSearchChange={setSearch}
            onOpenFilters={() => setFiltersOpen(true)}
          />
        </div>

        {isLoading ? (
          <VendorTableSkeleton />
        ) : error ? (
          <div className="p-4">
            <ErrorState message={error} onRetry={() => void refresh()} />
          </div>
        ) : data.itemList.length === 0 ? (
          <div className="p-4">
            <EmptyState title={vendors.emptyTitle} description={vendors.emptyBody} />
          </div>
        ) : (
          <VendorTable
            vendors={data.itemList}
            onAction={(vendor, action) => setTarget({ vendor, action })}
          />
        )}

        <Pagination
          currentPage={data.currentPage || page}
          totalPage={data.totalPage}
          totalRecord={data.totalRecord}
          limit={data.limit || VENDOR_PAGE_SIZE}
          onPageChange={setPage}
        />
      </Card>

      <VendorActionDialog
        open={target !== null}
        vendor={target?.vendor ?? fallbackVendor}
        action={target?.action ?? 'approve'}
        isSubmitting={isActioning}
        error={actionError}
        onClose={() => setTarget(null)}
        onSubmit={(values) => void handleSubmit(values)}
      />

      <FilterSheet
        open={filtersOpen}
        title={vendors.filtersTitle}
        onClose={() => setFiltersOpen(false)}
        onReset={resetFilters}
      >
        <FilterGroup label={vendors.columns.status}>
          {STATUS_FILTERS.map((option) => (
            <FilterOption
              key={option.value}
              label={option.label}
              selected={status === option.value}
              onSelect={() => setStatus(option.value)}
            />
          ))}
        </FilterGroup>
        <FilterSwitch
          label={vendors.hasDocumentsFilter}
          checked={hasDocuments}
          onChange={setHasDocuments}
        />
      </FilterSheet>
    </div>
  );
}

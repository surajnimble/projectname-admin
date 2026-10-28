'use client';

import { RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { FilterGroup, FilterOption, FilterSheet } from '@/components/common/filter-sheet';
import { Pagination } from '@/components/common/pagination';
import { TableSkeleton } from '@/components/common/table-skeleton';
import { VendorActionDialog } from '@/components/vendor/vendor-action-dialog';
import { VendorFilters } from '@/components/vendor/vendor-filters';
import { VendorTable } from '@/components/vendor/vendor-table';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
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
  const [draft, setDraft] = useState<{ status: VendorStatusFilter; hasDocuments: boolean }>({
    status: VENDOR_STATUSES.all,
    hasDocuments: false,
  });
  const activeFilterCount =
    (status === VENDOR_STATUSES.all ? 0 : 1) + (hasDocuments ? 1 : 0);

  const openFilters = () => {
    setDraft({ status, hasDocuments });
    setFiltersOpen(true);
  };

  const resetDraft = () => {
    setDraft({ status: VENDOR_STATUSES.all, hasDocuments: false });
  };

  const applyDraft = () => {
    setStatus(draft.status);
    setHasDocuments(draft.hasDocuments);
    setFiltersOpen(false);
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
                <RefreshCw className="size-4" aria-hidden="true" />
                {dashboard.refresh}
              </Button>
            }
            onSearchChange={setSearch}
            onOpenFilters={openFilters}
          />
        </div>

        {isLoading ? (
          <TableSkeleton rows={VENDOR_SKELETON_ROWS} />
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
        onReset={resetDraft}
        onDone={applyDraft}
      >
        <FilterGroup label={vendors.columns.status}>
          {STATUS_FILTERS.map((option) => (
            <FilterOption
              key={option.value}
              label={option.label}
              selected={draft.status === option.value}
              onSelect={() => setDraft((current) => ({ ...current, status: option.value }))}
            />
          ))}
        </FilterGroup>
        <Switch
          label={vendors.hasDocumentsFilter}
          checked={draft.hasDocuments}
          onChange={(value) => setDraft((current) => ({ ...current, hasDocuments: value }))}
        />
      </FilterSheet>
    </div>
  );
}

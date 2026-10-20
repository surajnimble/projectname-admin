'use client';

import { RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { DataTable } from '@/components/common/data-table';
import { FilterGroup, FilterOption, FilterSheet } from '@/components/common/filter-sheet';
import { Pagination } from '@/components/common/pagination';
import { VendorActionDialog } from '@/components/vendor/vendor-action-dialog';
import { vendorColumns, VendorRowActions } from '@/components/vendor/vendor-columns';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { ROUTES, VENDOR_PAGE_SIZE, VENDOR_STATUSES, type VendorStatusFilter } from '@/constants';
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
  const router = useRouter();
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
  const activeFilterCount = (status === VENDOR_STATUSES.all ? 0 : 1) + (hasDocuments ? 1 : 0);

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
        <DataTable
          columns={vendorColumns}
          rows={data.itemList}
          rowKey={(vendor) => vendor.vendorId}
          onRowClick={(vendor) => router.push(ROUTES.vendorDetails(vendor.vendorId))}
          toolbar={{
            search: {
              value: search,
              placeholder: vendors.searchPlaceholder,
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
                loading={isLoading || isFetching}
                onClick={() => void refresh()}
                className="shrink-0"
              >
                <RefreshCw className="size-4" aria-hidden="true" />
                {dashboard.refresh}
              </Button>
            ),
          }}
          actions={{
            header: vendors.columns.actions,
            render: (vendor) => (
              <VendorRowActions
                vendor={vendor}
                onAction={(value, action) => setTarget({ vendor: value, action })}
              />
            ),
          }}
          isLoading={isLoading}
          error={error}
          onRetry={() => void refresh()}
          emptyTitle={vendors.emptyTitle}
          emptyDescription={vendors.emptyBody}
          footer={
            <Pagination
              currentPage={data.currentPage || page}
              totalPage={data.totalPage}
              totalRecord={data.totalRecord}
              limit={data.limit || VENDOR_PAGE_SIZE}
              onPageChange={setPage}
            />
          }
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

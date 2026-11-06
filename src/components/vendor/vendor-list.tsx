'use client';


import { useRouter } from 'next/navigation';
import { CheckCheck, Ban } from 'lucide-react';
import { useState } from 'react';
import { DataTable } from '@/components/common/data-table';
import { FilterGroup, FilterOption, FilterSheet } from '@/components/common/filter-sheet';
import { Pagination } from '@/components/common/pagination';
import { VendorActionDialog } from '@/components/vendor/vendor-action-dialog';
import { ReasonDialog } from '@/components/common/reason-dialog';
import { vendorColumns, VendorRowActions } from '@/components/vendor/vendor-columns';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { PERMISSIONS, ROUTES, VENDOR_PAGE_SIZE, VENDOR_STATUSES, type VendorStatusFilter } from '@/constants';
import { usePermission } from '@/hooks/use-permission';
import { useVendors } from '@/hooks/use-vendors';
import type { VendorAction } from '@/lib/api/vendor-actions';
import type { VendorData } from '@/lib/api/contract';
import { showError, showSuccess, showWarning } from '@/lib/utils/toast';
import { MESSAGES } from '@/messages';
import { toVendor } from '@/types/vendor';
import { RefreshButton } from '@/components/common/refresh-button';

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
  const { can } = usePermission();
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
    bulkApprove,
    bulkSuspend,
  } = useVendors();
  const [target, setTarget] = useState<{ vendor: VendorData; action: VendorAction } | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedVendors, setSelectedVendors] = useState<VendorData[]>([]);
  const [suspendingSelection, setSuspendingSelection] = useState<VendorData[] | null>(null);
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

  const handleBulkApprove = async (rows: VendorData[]) => {
    const response = await bulkApprove(rows.map((vendor) => vendor.vendorId));
    if (!response.status) {
      showError(response.message);
      return;
    }
    setSelectedVendors([]);
    if (response.data.failedList.length > 0) {
      showWarning(vendors.bulkPartial(response.data.updatedCount, response.data.failedList.length));
    } else {
      showSuccess(vendors.bulkApproved(response.data.updatedCount));
    }
  };

  const handleBulkSuspend = async (reason: string) => {
    if (!suspendingSelection?.length || !reason.trim()) return;
    const response = await bulkSuspend(
      suspendingSelection.map((vendor) => vendor.vendorId),
      reason.trim(),
    );
    if (!response.status) {
      showError(response.message);
      return;
    }
    setSelectedVendors([]);
    setSuspendingSelection(null);
    if (response.data.failedList.length > 0) {
      showWarning(vendors.bulkPartial(response.data.updatedCount, response.data.failedList.length));
    } else {
      showSuccess(vendors.bulkSuspended(response.data.updatedCount));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="overflow-hidden">
        <DataTable
          columns={vendorColumns}
          rows={data.itemList}
          rowKey={(vendor) => vendor.vendorId}
          onRowClick={(vendor) => router.push(ROUTES.vendorDetails(vendor.vendorId))}
          selection={can(PERMISSIONS.vendorApprove) || can(PERMISSIONS.vendorSuspend) ? {
            selected: selectedVendors,
            onChange: setSelectedVendors,
            isSelectable: (vendor) => vendor.status === 'PENDING' || vendor.status === 'APPROVED',
            actions: [
              ...(can(PERMISSIONS.vendorApprove) ? [{
                label: vendors.bulkApprove,
                icon: CheckCheck,
                isVisible: (rows: readonly VendorData[]) => rows.length > 0 && rows.every((vendor) => vendor.status === 'PENDING'),
                onSelect: (rows: VendorData[]) => void handleBulkApprove(rows),
              }] : []),
              ...(can(PERMISSIONS.vendorSuspend) ? [{
                label: vendors.bulkSuspend,
                icon: Ban,
                intent: 'danger' as const,
                isVisible: (rows: readonly VendorData[]) => rows.length > 0 && rows.every((vendor) => vendor.status === 'APPROVED'),
                onSelect: (rows: VendorData[]) => setSuspendingSelection(rows),
              }] : []),
            ],
          } : undefined}
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
              <RefreshButton onRefresh={() => void refresh()} size="sm" label={dashboard.refresh} isRefreshing={isLoading || isFetching} />
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

      {suspendingSelection && (
        <ReasonDialog
          open={suspendingSelection !== null}
          title={vendors.bulkSuspendTitle}
          description={vendors.bulkSuspendDescription}
          label={vendors.reasonLabel}
          placeholder={vendors.reasonPlaceholder}
          confirmLabel={vendors.bulkSuspend}
          isSubmitting={isActioning}
          onConfirm={(reason) => void handleBulkSuspend(reason)}
          onClose={() => setSuspendingSelection(null)}
        />
      )}

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

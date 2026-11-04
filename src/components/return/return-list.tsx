'use client';

import { useState } from 'react';
import { DataTable, type DataTableColumn } from '@/components/common/data-table';
import { FilterGroup, FilterOption, FilterSheet } from '@/components/common/filter-sheet';
import { Pagination } from '@/components/common/pagination';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { OptionsMenu, type OptionsMenuItem } from '@/components/ui/options-menu';
import { RETURNS_PAGE_SIZE } from '@/constants';
import { useReturns } from '@/hooks/use-returns';
import type { ReturnRequestData } from '@/lib/api/contract';
import { showSuccess } from '@/lib/utils/toast';
import { MESSAGES } from '@/messages';
import { StatusBadge, productStatusMeta } from '@/components/common/status-badge';

const { returns } = MESSAGES;

const RETURN_STATUS_OPTIONS = [
  { value: '', label: returns.statuses.all ?? 'All' },
  { value: 'PENDING', label: returns.statuses.PENDING },
  { value: 'APPROVED', label: returns.statuses.APPROVED },
  { value: 'REJECTED', label: returns.statuses.REJECTED },
];

export const returnColumns: readonly DataTableColumn<ReturnRequestData>[] = [
  {
    key: 'return',
    header: returns.columns.return,
    cell: (ret) => <span className="font-medium">{ret.returnNumber}</span>,
  },
  {
    key: 'order',
    header: returns.columns.order,
    hideBelow: 'lg',
    width: 'w-40',
    cell: (ret) => <span className="text-sm truncate">{ret.orderId}</span>,
  },
  {
    key: 'customer',
    header: returns.columns.customer,
    hideBelow: 'xl',
    width: 'w-40',
    cell: (ret) => <span className="text-sm truncate">{ret.userId}</span>,
  },
  {
    key: 'vendor',
    header: returns.columns.vendor,
    hideBelow: '2xl',
    width: 'w-32',
    cell: (ret) => <span className="text-sm truncate">{ret.vendorData.shopName}</span>,
  },
  {
    key: 'amount',
    header: returns.columns.amount,
    align: 'right',
    hideBelow: 'lg',
    width: 'w-32',
    numeric: true,
    cell: (ret) => <span className="text-sm whitespace-nowrap">{ret.refundAmount}</span>,
  },
  {
    key: 'status',
    header: returns.columns.status,
    align: 'center',
    hideBelow: 'lg',
    width: 'w-32',
    cell: (ret) => <StatusBadge meta={productStatusMeta(ret.status)} />,
  },
  {
    key: 'requested',
    header: returns.columns.requested,
    hideBelow: 'xl',
    width: 'w-40',
    cell: (ret) => <span className="text-sm">{ret.requestedAt}</span>,
  },
];

interface ReturnRowActionsProps {
  ret: ReturnRequestData;
  onAction: (ret: ReturnRequestData, action: 'approve' | 'reject') => void;
}

export function ReturnRowActions({ ret, onAction }: ReturnRowActionsProps) {
  const items: OptionsMenuItem[] = ret.status === 'PENDING'
    ? [
        {
          label: returns.approve,
          onSelect: () => onAction(ret, 'approve'),
        },
        {
          label: returns.reject,
          intent: 'danger',
          onSelect: () => onAction(ret, 'reject'),
        },
      ]
    : [];

  return (
    <OptionsMenu label={returns.actionsLabel} items={items} className="flex justify-end" />
  );
}

export function ReturnList() {
  const {
    data,
    isLoading,
    error,
    isActioning,
    page,
    search,
    status,
    vendorId,
    orderId,
    setPage,
    setSearch,
    setStatus,
    setVendorId,
    setOrderId,
    refresh,
    approve,
    reject,
    clearActionError,
  } = useReturns();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftStatus, setDraftStatus] = useState(status);
  const [draftVendorId, setDraftVendorId] = useState(vendorId);
  const [draftOrderId, setDraftOrderId] = useState(orderId);
  const [dialog, setDialog] = useState<{ ret: ReturnRequestData; action: 'approve' | 'reject' } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const activeFilterCount =
    (search ? 1 : 0) + (status ? 1 : 0) + (vendorId ? 1 : 0) + (orderId ? 1 : 0);

  const closeDialog = () => {
    setDialog(null);
    clearActionError();
  };

  const handleAction = async () => {
    if (!dialog) return;
    let done = false;
    if (dialog.action === 'approve') {
      done = await approve(dialog.ret.returnId);
      if (done) showSuccess(returns.returnApproved);
    } else if (dialog.action === 'reject') {
      done = await reject(dialog.ret.returnId, rejectReason);
      if (done) {
        showSuccess(returns.returnRejected);
        setRejectReason('');
      }
    }
    if (!done) return;
    closeDialog();
  };

  const openFilters = () => {
    setDraftStatus(status);
    setDraftVendorId(vendorId);
    setDraftOrderId(orderId);
    setFiltersOpen(true);
  };

  const resetFilters = () => {
    setDraftStatus('');
    setDraftVendorId('');
    setDraftOrderId('');
  };

  const applyFilters = () => {
    setStatus(draftStatus);
    setVendorId(draftVendorId);
    setOrderId(draftOrderId);
    setFiltersOpen(false);
  };

  const emptyMessage = search || status || vendorId || orderId ? returns.emptyFiltered : returns.empty;

  return (
    <div className="flex flex-col gap-4">
      <Card className="overflow-hidden">
        <DataTable
          columns={returnColumns}
          rows={data.itemList}
          rowKey={(ret) => ret.returnId}
          toolbar={{
            search: {
              value: search,
              placeholder: returns.searchPlaceholder,
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
                {MESSAGES.dashboard.refresh}
              </Button>
            ),
          }}
          actions={{
            header: returns.actionsLabel,
            render: (ret) => (
              <ReturnRowActions
                ret={ret}
                onAction={(r, action) => setDialog({ ret: r, action })}
              />
            ),
          }}
          isLoading={isLoading}
          error={error}
          onRetry={() => void refresh()}
          emptyTitle={emptyMessage}
          emptyDescription={returns.empty}
          footer={
            <Pagination
              currentPage={data.currentPage || page}
              totalPage={data.totalPage}
              totalRecord={data.totalRecord}
              limit={data.limit || RETURNS_PAGE_SIZE}
              onPageChange={setPage}
            />
          }
        />
      </Card>

      <FilterSheet
        open={filtersOpen}
        title={MESSAGES.common.filters}
        onClose={() => setFiltersOpen(false)}
        onReset={resetFilters}
        onDone={applyFilters}
      >
        <FilterGroup label={returns.statusLabel}>
          {RETURN_STATUS_OPTIONS.map((option) => (
            <FilterOption
              key={option.value || 'all'}
              label={option.label}
              selected={draftStatus === option.value}
              onSelect={() => setDraftStatus(option.value)}
            />
          ))}
        </FilterGroup>
        <FilterGroup label={returns.columns.vendor}>
          <Input
            value={draftVendorId}
            onChange={(e) => setDraftVendorId(e.target.value)}
            placeholder={returns.searchPlaceholder}
          />
        </FilterGroup>
        <FilterGroup label={returns.columns.order}>
          <Input
            value={draftOrderId}
            onChange={(e) => setDraftOrderId(e.target.value)}
            placeholder={returns.searchPlaceholder}
          />
        </FilterGroup>
      </FilterSheet>

      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-muted/40 backdrop-blur-sm" onClick={closeDialog}>
          <div className="bg-surface rounded-md p-6 w-full max-w-sm shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-fg mb-4">
              {dialog.action === 'approve' ? returns.approveTitle : returns.rejectTitle}
            </h3>
            <p className="text-fg-muted text-sm mb-6">
              {dialog.action === 'approve' ? returns.approveDescription : returns.rejectDescription}
            </p>
            {dialog.action === 'reject' && (
              <div className="flex flex-col gap-3 mb-4">
                <label className="text-sm font-medium text-fg">{returns.reasonLabel}</label>
                <textarea
                  className="border border-input rounded-md px-3 py-2 text-sm w-full"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter rejection reason..."
                  rows={3}
                />
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={closeDialog}>
                {MESSAGES.common.cancel}
              </Button>
              <Button
                onClick={handleAction}
                loading={isActioning}
                disabled={dialog.action === 'reject' && !rejectReason.trim()}
              >
                {dialog.action === 'approve' ? returns.approve : returns.reject}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

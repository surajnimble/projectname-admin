'use client';

import { useState } from 'react';
import { DataTable, type DataTableColumn } from '@/components/common/data-table';
import { FilterGroup, FilterOption, FilterSheet } from '@/components/common/filter-sheet';
import { Pagination } from '@/components/common/pagination';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { OptionsMenu, type OptionsMenuItem } from '@/components/ui/options-menu';
import { PAYOUTS_PAGE_SIZE } from '@/constants';
import { usePayouts } from '@/hooks/use-payouts';
import type { PayoutData } from '@/lib/api/contract';
import { showSuccess } from '@/lib/utils/toast';
import { MESSAGES } from '@/messages';
import { StatusBadge, productStatusMeta } from '@/components/common/status-badge';

const { payouts } = MESSAGES;

const PAYOUT_STATUS_OPTIONS = [
  { value: '', label: payouts.statuses.all ?? 'All' },
  { value: 'PENDING', label: payouts.statuses.PENDING },
  { value: 'APPROVED', label: payouts.statuses.APPROVED },
  { value: 'REJECTED', label: payouts.statuses.REJECTED },
];

export const payoutColumns: readonly DataTableColumn<PayoutData>[] = [
  {
    key: 'payout',
    header: payouts.columns.payout,
    cell: (p) => <span className="font-medium">{p.payoutId}</span>,
  },
  {
    key: 'vendor',
    header: payouts.columns.vendor,
    hideBelow: 'lg',
    width: 'w-40',
    cell: (p) => <span className="text-sm truncate">{p.vendorId}</span>,
  },
  {
    key: 'amount',
    header: payouts.columns.amount,
    align: 'right',
    hideBelow: 'lg',
    width: 'w-32',
    numeric: true,
    cell: (p) => <span className="text-sm whitespace-nowrap">{p.amount}</span>,
  },
  {
    key: 'method',
    header: payouts.columns.method,
    hideBelow: 'xl',
    width: 'w-32',
    cell: (p) => <span className="text-sm truncate">{p.method}</span>,
  },
  {
    key: 'status',
    header: payouts.columns.status,
    align: 'center',
    hideBelow: 'lg',
    width: 'w-32',
    cell: (p) => <StatusBadge meta={productStatusMeta(p.status)} />,
  },
  {
    key: 'period',
    header: payouts.columns.period,
    hideBelow: '2xl',
    width: 'w-32',
    cell: (p) => <span className="text-sm truncate">{p.period}</span>,
  },
  {
    key: 'created',
    header: payouts.columns.created,
    hideBelow: 'xl',
    width: 'w-40',
    cell: (p) => <span className="text-sm">{p.createdAt}</span>,
  },
];

interface PayoutRowActionsProps {
  payout: PayoutData;
  onAction: (payout: PayoutData, action: 'approve' | 'reject') => void;
}

export function PayoutRowActions({ payout, onAction }: PayoutRowActionsProps) {
  const items: OptionsMenuItem[] = payout.status === 'PENDING'
    ? [
        {
          label: payouts.approve,
          onSelect: () => onAction(payout, 'approve'),
        },
        {
          label: payouts.reject,
          intent: 'danger',
          onSelect: () => onAction(payout, 'reject'),
        },
      ]
    : [];

  return (
    <OptionsMenu label={payouts.actionsLabel} items={items} className="flex justify-end" />
  );
}

export function PayoutList() {
  const {
    data,
    isLoading,
    error,
    isActioning,
    page,
    search,
    status,
    vendorId,
    from,
    to,
    setPage,
    setSearch,
    setStatus,
    setVendorId,
    setFrom,
    setTo,
    refresh,
    approve,
    reject,
    clearActionError,
  } = usePayouts();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftStatus, setDraftStatus] = useState(status);
  const [draftVendorId, setDraftVendorId] = useState(vendorId);
  const [draftFrom, setDraftFrom] = useState(from);
  const [draftTo, setDraftTo] = useState(to);
  const [dialog, setDialog] = useState<{ payout: PayoutData; action: 'approve' | 'reject' } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const activeFilterCount =
    (search ? 1 : 0) + (status ? 1 : 0) + (vendorId ? 1 : 0) + (from ? 1 : 0) + (to ? 1 : 0);

  const closeDialog = () => {
    setDialog(null);
    clearActionError();
  };

  const handleAction = async () => {
    if (!dialog) return;
    let done = false;
    if (dialog.action === 'approve') {
      done = await approve(dialog.payout.payoutId);
      if (done) showSuccess(payouts.payoutApproved);
    } else if (dialog.action === 'reject') {
      done = await reject(dialog.payout.payoutId, rejectReason);
      if (done) {
        showSuccess(payouts.payoutRejected);
        setRejectReason('');
      }
    }
    if (!done) return;
    closeDialog();
  };

  const openFilters = () => {
    setDraftStatus(status);
    setDraftVendorId(vendorId);
    setDraftFrom(from);
    setDraftTo(to);
    setFiltersOpen(true);
  };

  const resetFilters = () => {
    setDraftStatus('');
    setDraftVendorId('');
    setDraftFrom('');
    setDraftTo('');
  };

  const applyFilters = () => {
    setStatus(draftStatus);
    setVendorId(draftVendorId);
    setFrom(draftFrom);
    setTo(draftTo);
    setFiltersOpen(false);
  };

  const emptyMessage =
    search || status || vendorId || from || to ? payouts.emptyFiltered : payouts.empty;

  return (
    <div className="flex flex-col gap-4">
      <Card className="overflow-hidden">
        <DataTable
          columns={payoutColumns}
          rows={data.itemList}
          rowKey={(payout) => payout.payoutId}
          toolbar={{
            search: {
              value: search,
              placeholder: payouts.searchPlaceholder,
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
            header: payouts.actionsLabel,
            render: (payout) => (
              <PayoutRowActions
                payout={payout}
                onAction={(p, action) => setDialog({ payout: p, action })}
              />
            ),
          }}
          isLoading={isLoading}
          error={error}
          onRetry={() => void refresh()}
          emptyTitle={emptyMessage}
          emptyDescription={payouts.empty}
          footer={
            <Pagination
              currentPage={data.currentPage || page}
              totalPage={data.totalPage}
              totalRecord={data.totalRecord}
              limit={data.limit || PAYOUTS_PAGE_SIZE}
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
        <FilterGroup label={payouts.statusLabel}>
          {PAYOUT_STATUS_OPTIONS.map((option) => (
            <FilterOption
              key={option.value || 'all'}
              label={option.label}
              selected={draftStatus === option.value}
              onSelect={() => setDraftStatus(option.value)}
            />
          ))}
        </FilterGroup>
        <FilterGroup label={payouts.columns.vendor}>
          <Input
            value={draftVendorId}
            onChange={(e) => setDraftVendorId(e.target.value)}
            placeholder={payouts.searchPlaceholder}
          />
        </FilterGroup>
        <FilterGroup label="From">
          <Input
            type="date"
            value={draftFrom}
            onChange={(e) => setDraftFrom(e.target.value)}
          />
        </FilterGroup>
        <FilterGroup label="To">
          <Input
            type="date"
            value={draftTo}
            onChange={(e) => setDraftTo(e.target.value)}
          />
        </FilterGroup>
      </FilterSheet>

      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-muted/40 backdrop-blur-sm" onClick={closeDialog}>
          <div className="bg-surface rounded-md p-6 w-full max-w-sm shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-fg mb-4">
              {dialog.action === 'approve' ? payouts.approveTitle : payouts.rejectTitle}
            </h3>
            <p className="text-fg-muted text-sm mb-6">
              {dialog.action === 'approve' ? payouts.approveDescription : payouts.rejectDescription}
            </p>
            {dialog.action === 'reject' && (
              <div className="flex flex-col gap-3 mb-4">
                <label className="text-sm font-medium text-fg">{payouts.reasonLabel}</label>
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
                {dialog.action === 'approve' ? payouts.approve : payouts.reject}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

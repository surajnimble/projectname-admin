'use client';

import { useState } from 'react';
import { DataTable, type DataTableColumn } from '@/components/common/data-table';
import { FilterGroup, FilterOption, FilterSheet } from '@/components/common/filter-sheet';
import { Pagination } from '@/components/common/pagination';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { OptionsMenu, type OptionsMenuItem } from '@/components/ui/options-menu';
import { CUSTOMER_PAGE_SIZE } from '@/constants';
import { useUsers } from '@/hooks/use-users';
import type { UserData } from '@/lib/api/contract';
import { showSuccess } from '@/lib/utils/toast';
import { MESSAGES } from '@/messages';
import { StatusBadge, catalogStatusMeta } from '@/components/common/status-badge';

const { customers } = MESSAGES;

const ROLE_OPTIONS = [
  { value: '', label: customers.statuses.all },
  { value: 'CUSTOMER', label: 'Customer' },
  { value: 'VENDOR', label: 'Vendor' },
  { value: 'DELIVERY_BOY', label: 'Delivery Boy' },
];

const STATUS_OPTIONS = [
  { value: '', label: customers.statuses.all },
  { value: 'active', label: customers.statuses.active },
  { value: 'inactive', label: customers.statuses.inactive },
];

export const customerColumns: readonly DataTableColumn<UserData>[] = [
  {
    key: 'customer',
    header: customers.columns.customer,
    cell: (user) => <span className="font-medium">{user.name}</span>,
  },
  {
    key: 'email',
    header: customers.columns.email,
    hideBelow: 'lg',
    width: 'w-48',
    cell: (user) => <span className="text-sm truncate">{user.email}</span>,
  },
  {
    key: 'phone',
    header: customers.columns.phone,
    hideBelow: 'xl',
    width: 'w-40',
    cell: (user) => <span className="text-sm truncate">{user.phone}</span>,
  },
  {
    key: 'role',
    header: customers.columns.role,
    hideBelow: '2xl',
    width: 'w-32',
    cell: () => <span className="text-sm">Customer</span>,
  },
  {
    key: 'status',
    header: customers.columns.status,
    align: 'center',
    hideBelow: 'lg',
    width: 'w-32',
    cell: (user) => <StatusBadge meta={catalogStatusMeta(user.isActive ? 'ACTIVE' : 'INACTIVE')} />,
  },
];

interface CustomerRowActionsProps {
  user: UserData;
  onAction: (user: UserData, action: 'suspend' | 'reactivate' | 'ban' | 'unban') => void;
}

export function CustomerRowActions({ user, onAction }: CustomerRowActionsProps) {
  const items: OptionsMenuItem[] = user.isActive
    ? [
        {
          label: customers.suspend,
          onSelect: () => onAction(user, 'suspend'),
        },
        {
          label: customers.ban,
          intent: 'danger',
          onSelect: () => onAction(user, 'ban'),
        },
      ]
    : [
        {
          label: customers.reactivate,
          onSelect: () => onAction(user, 'reactivate'),
        },
        {
          label: customers.unban,
          onSelect: () => onAction(user, 'unban'),
        },
      ];

  return (
    <OptionsMenu label={customers.actionsLabel} items={items} className="flex justify-end" />
  );
}

export function CustomerList() {
  const {
    data,
    isLoading,
    error,
    isActioning,
    page,
    search,
    role,
    status,
    setPage,
    setSearch,
    setRole,
    setStatus,
    refresh,
    toggleStatus,
    ban,
    unban,
    clearActionError,
  } = useUsers();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftRole, setDraftRole] = useState(role);
  const [draftStatus, setDraftStatus] = useState(status);
  const [dialog, setDialog] = useState<{
    user: UserData;
    action: 'suspend' | 'reactivate' | 'ban' | 'unban';
  } | null>(null);
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState('');

  const activeFilterCount = (search ? 1 : 0) + (role ? 1 : 0) + (status ? 1 : 0);

  const closeDialog = () => {
    setDialog(null);
    clearActionError();
  };

  const handleAction = async () => {
    if (!dialog) return;
    let done = false;
    if (dialog.action === 'suspend') {
      done = await toggleStatus(dialog.user.userId, false, '');
      if (done) showSuccess(customers.customerSuspended);
    } else if (dialog.action === 'reactivate') {
      done = await toggleStatus(dialog.user.userId, true, '');
      if (done) showSuccess(customers.customerReactivated);
    } else if (dialog.action === 'ban') {
      done = await ban(dialog.user.userId, banReason, banDuration ? Number(banDuration) : undefined);
      if (done) {
        showSuccess(customers.customerBanned);
        setBanReason('');
        setBanDuration('');
      }
    } else if (dialog.action === 'unban') {
      done = await unban(dialog.user.userId);
      if (done) showSuccess(customers.customerUnbanned);
    }
    if (!done) return;
    closeDialog();
  };

  const openFilters = () => {
    setDraftRole(role);
    setDraftStatus(status);
    setFiltersOpen(true);
  };

  const resetFilters = () => {
    setDraftRole('');
    setDraftStatus('');
  };

  const applyFilters = () => {
    setRole(draftRole);
    setStatus(draftStatus);
    setFiltersOpen(false);
  };

  const emptyMessage = search || role || status ? customers.emptyFiltered : customers.empty;

  return (
    <div className="flex flex-col gap-4">
      <Card className="overflow-hidden">
        <DataTable
          columns={customerColumns}
          rows={data.itemList}
          rowKey={(user) => user.userId}
          toolbar={{
            search: {
              value: search,
              placeholder: customers.searchPlaceholder,
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
            header: customers.actionsLabel,
            render: (user) => (
              <CustomerRowActions
                user={user}
                onAction={(u, action) => setDialog({ user: u, action })}
              />
            ),
          }}
          isLoading={isLoading}
          error={error}
          onRetry={() => void refresh()}
          emptyTitle={emptyMessage}
          emptyDescription={customers.empty}
          footer={
            <Pagination
              currentPage={data.currentPage || page}
              totalPage={data.totalPage}
              totalRecord={data.totalRecord}
              limit={data.limit || CUSTOMER_PAGE_SIZE}
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
        <FilterGroup label={customers.columns.role}>
          {ROLE_OPTIONS.map((option) => (
            <FilterOption
              key={option.value || 'all'}
              label={option.label}
              selected={draftRole === option.value}
              onSelect={() => setDraftRole(option.value)}
            />
          ))}
        </FilterGroup>
        <FilterGroup label={customers.statusLabel}>
          {STATUS_OPTIONS.map((option) => (
            <FilterOption
              key={option.value || 'all'}
              label={option.label}
              selected={draftStatus === option.value}
              onSelect={() => setDraftStatus(option.value)}
            />
          ))}
        </FilterGroup>
      </FilterSheet>

      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-muted/40 backdrop-blur-sm" onClick={closeDialog}>
          <div className="bg-surface rounded-md p-6 w-full max-w-sm shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-fg mb-4">
              {dialog.action === 'ban' ? customers.banTitle : dialog.action === 'unban' ? customers.unbanTitle : ''}
            </h3>
            <p className="text-fg-muted text-sm mb-6">
              {dialog.action === 'ban'
                ? customers.banDescription
                : dialog.action === 'unban'
                  ? customers.unbanDescription
                  : dialog.action === 'suspend'
                    ? `Suspend ${dialog.user.name}?`
                    : `Reactivate ${dialog.user.name}?`}
            </p>
            {dialog.action === 'ban' && (
              <div className="flex flex-col gap-3 mb-4">
                <label className="text-sm font-medium text-fg">{customers.reasonLabel}</label>
                <input
                  className="border border-input rounded-md px-3 py-2 text-sm w-full"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Enter ban reason..."
                />
                <label className="text-sm font-medium text-fg">{customers.durationLabel}</label>
                <input
                  className="border border-input rounded-md px-3 py-2 text-sm w-full"
                  type="number"
                  min={1}
                  value={banDuration}
                  onChange={(e) => setBanDuration(e.target.value)}
                  placeholder="Leave blank for permanent"
                />
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={closeDialog}>
                {MESSAGES.common.cancel}
              </Button>
              <Button onClick={handleAction} loading={isActioning} disabled={dialog.action === 'ban' && !banReason.trim()}>
                {dialog.action === 'ban' ? customers.ban : dialog.action === 'unban' ? customers.unban : dialog.action === 'suspend' ? customers.suspend : customers.reactivate}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

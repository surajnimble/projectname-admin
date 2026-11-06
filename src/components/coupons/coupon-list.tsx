'use client';

import { useMemo, useState } from 'react';

import { PageHeader } from '@/components/common/page-header';
import { DataTable } from '@/components/common/data-table';
import { FilterGroup, FilterOption, FilterSheet } from '@/components/common/filter-sheet';
import { Pagination } from '@/components/common/pagination';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { EntityDialog } from '@/components/common/entity-dialog';
import { OptionsMenu, type OptionsMenuItem } from '@/components/ui/options-menu';
import { StatusBadge, catalogStatusMeta } from '@/components/common/status-badge';
import { PermissionGuard } from '@/components/auth/guards';
import { useCoupons } from '@/hooks/use-coupons';
import type { CouponData } from '@/lib/api/contract';
import { COUPON_PAGE_SIZE } from '@/constants';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';
import { CouponUsagesDialog } from '@/components/coupons/coupon-usages-dialog';
import { RefreshButton } from '@/components/common/refresh-button';

const { coupons, common } = MESSAGES;

const couponFields = [
  { key: 'code', label: coupons.columns.code, type: 'text' as const, required: true, placeholder: coupons.codePlaceholder },
  { key: 'title', label: coupons.columns.title, type: 'text' as const, required: true, placeholder: coupons.titlePlaceholder },
  { key: 'description', label: coupons.descriptionLabel, type: 'textarea' as const, placeholder: coupons.descriptionPlaceholder },
  { key: 'type', label: coupons.columns.type, type: 'select' as const, required: true, options: [
    { label: coupons.typeFixed, value: 'FIXED' },
    { label: coupons.typePercent, value: 'PERCENT' },
  ] },
  { key: 'value', label: coupons.columns.value, type: 'number' as const, placeholder: coupons.valuePlaceholder },
  { key: 'minOrderValue', label: coupons.columns.minOrderValue, type: 'number' as const, placeholder: coupons.minOrderValuePlaceholder },
  { key: 'maxDiscount', label: coupons.columns.maxDiscount, type: 'number' as const, placeholder: coupons.maxDiscountPlaceholder },
  { key: 'usageLimit', label: coupons.columns.usageLimit, type: 'number' as const, placeholder: coupons.usageLimitPlaceholder },
  { key: 'startsAt', label: coupons.columns.startsAt, type: 'text' as const },
  { key: 'expiresAt', label: coupons.columns.expiresAt, type: 'text' as const },
  { key: 'isActive', label: coupons.columns.isActive, type: 'switch' as const },
];

export function CouponList() {
  const {
    data,
    isLoading,
    error,
    actionError,
    isActioning,
    page,
    search,
    isActive,
    setPage,
    setSearch,
    setStatus,
    refresh,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    toggleCouponStatus,
  } = useCoupons();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [defaultValues, setDefaultValues] = useState<Record<string, unknown>>({});
  const [dialogKey, setDialogKey] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmRow, setConfirmRow] = useState<CouponData | null>(null);
  const [usageCoupon, setUsageCoupon] = useState<CouponData | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftStatus, setDraftStatus] = useState(isActive);
  const activeFilterCount = useMemo(() => (search ? 1 : 0) + (isActive !== 'all' ? 1 : 0), [search, isActive]);

  const handleAdd = () => {
    setDialogMode('add');
    setEditingId(null);
    setDefaultValues({});
    setDialogKey((k) => k + 1);
    setDialogOpen(true);
  };

  const handleEdit = (row: CouponData) => {
    setDialogMode('edit');
    setEditingId(row.couponId);
    setDefaultValues({
      code: row.code,
      title: row.title,
      description: row.description,
      type: row.type,
      value: row.value,
      minOrderValue: row.minOrderValue,
      maxDiscount: row.maxDiscount,
      usageLimit: row.usageLimit,
      startsAt: row.startsAt,
      expiresAt: row.expiresAt,
      isActive: row.isActive,
    });
    setDialogKey((k) => k + 1);
    setDialogOpen(true);
  };

  const handleDelete = (row: CouponData) => {
    setConfirmRow(row);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!confirmRow) return;
    setConfirmOpen(false);
    const id = confirmRow.couponId;
    setConfirmRow(null);
    await deleteCoupon(id);
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    let ok = false;
    if (dialogMode === 'add') {
      ok = await createCoupon({
        code: String(values.code).trim(),
        title: String(values.title).trim(),
        description: String(values.description).trim() || undefined,
        type: String(values.type),
        value: Number(values.value) || 0,
        minOrderValue: Number(values.minOrderValue) || undefined,
        maxDiscount: Number(values.maxDiscount) || undefined,
        usageLimit: Number(values.usageLimit) || undefined,
        startsAt: String(values.startsAt) || undefined,
        expiresAt: String(values.expiresAt) || undefined,
      });
    } else if (editingId) {
      ok = await updateCoupon(editingId, {
        code: String(values.code).trim() || undefined,
        title: String(values.title).trim() || undefined,
        description: String(values.description).trim() || undefined,
        type: String(values.type) || undefined,
        value: Number(values.value) || undefined,
        minOrderValue: Number(values.minOrderValue) || undefined,
        maxDiscount: Number(values.maxDiscount) || undefined,
        usageLimit: Number(values.usageLimit) || undefined,
        startsAt: String(values.startsAt) || undefined,
        expiresAt: String(values.expiresAt) || undefined,
      });
    }
    if (ok) setDialogOpen(false);
  };

  const openFilters = () => {
    setDraftStatus(isActive);
    setFiltersOpen(true);
  };

  const resetDraft = () => setDraftStatus('all');

  const applyDraft = () => {
    setStatus(draftStatus);
    setFiltersOpen(false);
  };

  const columns = [
    {
      key: 'code',
      header: coupons.columns.code,
      cell: (row: CouponData) => <span className="font-medium text-fg-muted">{row.code}</span>,
    },
    {
      key: 'title',
      header: coupons.columns.title,
      cell: (row: CouponData) => <span className="font-medium">{row.title}</span>,
    },
    {
      key: 'type',
      header: coupons.columns.type,
      hideBelow: 'lg',
      width: 'w-32',
      cell: (row: CouponData) => <span className="text-sm capitalize">{row.type}</span>,
    },
    {
      key: 'value',
      header: coupons.columns.value,
      align: 'right',
      hideBelow: 'xl',
      width: 'w-32',
      numeric: true,
      cell: (row: CouponData) => <span className="text-sm">{row.type === 'PERCENT' ? `${row.value}%` : String(row.value)}</span>,
    },
    {
      key: 'usage',
      header: coupons.columns.usedCount,
      align: 'center',
      hideBelow: 'xl',
      width: 'w-32',
      cell: (row: CouponData) => <span className="text-sm">{row.usedCount} / {row.usageLimit}</span>,
    },
    {
      key: 'expires',
      header: coupons.columns.expiresAt,
      hideBelow: '2xl',
      width: 'w-40',
      cell: (row: CouponData) => <span className="text-sm">{row.expiresAt}</span>,
    },
    {
      key: 'status',
      header: coupons.columns.isActive,
      align: 'center',
      hideBelow: '2xl',
      width: 'w-32',
      cell: (row: CouponData) => <StatusBadge meta={catalogStatusMeta(row.isActive ? 'ACTIVE' : 'INACTIVE')} />,
    },
    {
      key: 'actions',
      header: coupons.columns.actions,
      align: 'center',
      width: 'w-32',
      cell: () => null,
    },
  ] as const;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={coupons.title}
        description={coupons.subtitle}
        action={
          <Button variant="primary" size="sm" onClick={handleAdd} disabled={isActioning}>
            {MESSAGES.common.addNew}
          </Button>
        }
      />
      <PermissionGuard permission={PERMISSIONS.couponManage}>
        <Card className="overflow-hidden">
          <DataTable
            columns={columns}
            rows={data.itemList}
            rowKey={(row: CouponData) => row.couponId}
            toolbar={{
              search: {
                value: search,
                placeholder: coupons.searchPlaceholder,
                onChange: setSearch,
              },
              filters: {
                label: MESSAGES.common.filters,
                count: activeFilterCount,
                onOpen: openFilters,
              },
              actions: (
                <RefreshButton onRefresh={() => void refresh()} size="sm" label={MESSAGES.dashboard.refresh} isRefreshing={isLoading} />
              ),
            }}
            actions={{
              header: MESSAGES.common.actions,
              render: (row: CouponData) => {
                const items: OptionsMenuItem[] = [
                  { label: coupons.viewUsage, onSelect: () => setUsageCoupon(row) },
                  { label: MESSAGES.common.editExisting, onSelect: () => handleEdit(row) },
                  { label: row.isActive ? coupons.deactivate : coupons.activate, onSelect: () => void toggleCouponStatus(row.couponId, !row.isActive) },
                  { label: coupons.delete, intent: 'danger', onSelect: () => handleDelete(row) },
                ];
                return (
                  <OptionsMenu label={coupons.actionsLabel} items={items} className="flex justify-end" />
                );
              },
            }}
            isLoading={isLoading}
            error={error}
            onRetry={() => void refresh()}
            emptyTitle={coupons.empty}
            emptyDescription={activeFilterCount > 0 ? coupons.emptyFiltered : undefined}
            footer={
              <Pagination
                currentPage={data.currentPage || page}
                totalPage={data.totalPage}
                totalRecord={data.totalRecord}
                limit={data.limit || COUPON_PAGE_SIZE}
                onPageChange={setPage}
              />
            }
          />
        </Card>

        {actionError && <div className="p-4 text-destructive text-sm">{actionError}</div>}

        <FilterSheet
          open={filtersOpen}
          title={MESSAGES.common.filters}
          onClose={() => setFiltersOpen(false)}
          onReset={resetDraft}
          onDone={applyDraft}
        >
          <FilterGroup label={coupons.columns.isActive}>
            <FilterOption
              key="all"
              label={coupons.statuses.all}
              selected={draftStatus === 'all'}
              onSelect={() => setDraftStatus('all')}
            />
            <FilterOption
              key="active"
              label={coupons.statuses.active}
              selected={draftStatus === 'active'}
              onSelect={() => setDraftStatus('active')}
            />
            <FilterOption
              key="inactive"
              label={coupons.statuses.inactive}
              selected={draftStatus === 'inactive'}
              onSelect={() => setDraftStatus('inactive')}
            />
          </FilterGroup>
        </FilterSheet>

        <EntityDialog
          open={dialogOpen}
          mode={dialogMode}
          title={dialogMode === 'add' ? coupons.createTitle : common.editExisting}
          submitLabel={dialogMode === 'add' ? MESSAGES.common.addNew : common.save}
          fields={couponFields}
          defaultValues={defaultValues}
          key={dialogKey}
          isSubmitting={isActioning}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleSubmit}
        />

        <CouponUsagesDialog
          coupon={usageCoupon}
          open={usageCoupon !== null}
          onClose={() => setUsageCoupon(null)}
        />

        <ConfirmDialog
          open={confirmOpen}
          title={coupons.delete}
          description={confirmRow ? coupons.deleteConfirm.replace('{name}', confirmRow.code) : ''}
          confirmLabel={MESSAGES.common.delete}
          isSubmitting={isActioning}
          onConfirm={() => void confirmDelete()}
          onClose={() => setConfirmOpen(false)}
        />
      </PermissionGuard>
    </div>
  );
}

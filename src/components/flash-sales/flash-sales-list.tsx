'use client';

import { useMemo, useState } from 'react';

import { PageHeader } from '@/components/common/page-header';
import { DataTable } from '@/components/common/data-table';
import { FilterGroup, FilterOption, FilterSheet } from '@/components/common/filter-sheet';
import { Pagination } from '@/components/common/pagination';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { EntityDialog } from '@/components/common/entity-dialog';
import { FormError } from '@/components/common/form-error';
import { OptionsMenu, type OptionsMenuItem } from '@/components/ui/options-menu';
import { StatusBadge } from '@/components/common/status-badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useFlashSales, type FlashSaleScope } from '@/hooks/use-flash-sales';
import type { FlashSaleData } from '@/lib/api/contract';
import { CONTENT_PAGE_SIZE } from '@/constants';
import { MESSAGES } from '@/messages';
import { RefreshButton } from '@/components/common/refresh-button';

const { flashSales, common, dashboard } = MESSAGES;

const flashSaleFields = [
  { key: 'name', label: flashSales.fields.name, type: 'text' as const, required: true },
  { key: 'banner', label: flashSales.fields.banner, type: 'text' as const },
  { key: 'startsAt', label: flashSales.fields.startsAt, type: 'text' as const, required: true, placeholder: '2026-11-05T18:00:00.000Z' },
  { key: 'endsAt', label: flashSales.fields.endsAt, type: 'text' as const, required: true, placeholder: '2026-11-06T00:00:00.000Z' },
  {
    key: 'discountType',
    label: flashSales.fields.discountType,
    type: 'select' as const,
    required: true,
    options: [
      { label: 'Percentage', value: 'PERCENT' },
      { label: 'Flat amount', value: 'FLAT' },
    ],
  },
  { key: 'discountValue', label: flashSales.fields.discountValue, type: 'number' as const, required: true },
  { key: 'items', label: flashSales.fields.items, type: 'textarea' as const, required: true, placeholder: flashSales.itemsPlaceholder },
  { key: 'isActive', label: flashSales.fields.active, type: 'switch' as const },
];

type FlashSaleInputItem = { productId: string; saleStock: number; salePrice?: number };

const parseItems = (value: unknown): FlashSaleInputItem[] => {
  const parsed: unknown = JSON.parse(String(value ?? ''));
  if (!Array.isArray(parsed) || parsed.length < 1 || parsed.length > 200) {
    throw new Error(flashSales.invalidItems);
  }
  const items = parsed.map((item): FlashSaleInputItem => {
    if (!item || typeof item !== 'object' || !('productId' in item)) {
      throw new Error(flashSales.invalidItems);
    }
    const record = item as Record<string, unknown>;
    const productId = typeof record.productId === 'string' ? record.productId.trim() : '';
    const saleStock = Number(record.saleStock ?? 0);
    const salePrice = record.salePrice === undefined || record.salePrice === null || record.salePrice === ''
      ? undefined
      : Number(record.salePrice);
    if (!productId || !Number.isInteger(saleStock) || saleStock < 0 || (salePrice !== undefined && (!Number.isFinite(salePrice) || salePrice < 0))) {
      throw new Error(flashSales.invalidItems);
    }
    return { productId, saleStock, ...(salePrice === undefined ? {} : { salePrice }) };
  });
  if (new Set(items.map((item) => item.productId)).size !== items.length) {
    throw new Error('Each product can only be added to a flash sale once.');
  }
  return items;
};

const toLocalInput = (value: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString();
};

const toFlashSaleStatus = (row: FlashSaleData) => {
  if (!row.isActive) return { label: flashSales.status.inactive, intent: 'neutral' as const };
  if (row.isLive) return { label: flashSales.status.live, intent: 'success' as const };
  const now = Date.now();
  if (new Date(row.startsAt).getTime() > now) return { label: flashSales.status.upcoming, intent: 'warning' as const };
  if (new Date(row.endsAt).getTime() < now) return { label: flashSales.status.ended, intent: 'danger' as const };
  return { label: flashSales.status.active, intent: 'info' as const };
};

export function FlashSalesList() {
  const {
    data, isLoading, isActioning, error, actionError, page, scope, isActive,
    setPage, setScope, setIsActive, refresh, createFlashSale, updateFlashSale, deleteFlashSale,
  } = useFlashSales();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [defaultValues, setDefaultValues] = useState<Record<string, unknown>>({});
  const [dialogKey, setDialogKey] = useState(0);
  const [dialogError, setDialogError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmRow, setConfirmRow] = useState<FlashSaleData | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftScope, setDraftScope] = useState<FlashSaleScope>(scope);
  const [draftActive, setDraftActive] = useState(isActive);
  const activeFilterCount = useMemo(() => (scope !== 'all' ? 1 : 0) + (isActive ? 1 : 0), [scope, isActive]);

  const openCreate = () => {
    setDialogMode('add');
    setEditingId(null);
    setDialogError('');
    setDefaultValues({ discountType: 'PERCENT', discountValue: 10, isActive: true, items: flashSales.itemsPlaceholder });
    setDialogKey((value) => value + 1);
    setDialogOpen(true);
  };

  const openEdit = (row: FlashSaleData) => {
    setDialogMode('edit');
    setEditingId(row.flashSaleId);
    setDialogError('');
    setDefaultValues({
      name: row.name,
      banner: row.banner,
      startsAt: toLocalInput(row.startsAt),
      endsAt: toLocalInput(row.endsAt),
      discountType: row.discountType,
      discountValue: row.discountValue,
      isActive: row.isActive,
      items: JSON.stringify(row.itemList.map((item) => ({
        productId: item.productId,
        saleStock: item.saleStock,
        salePrice: item.salePrice,
      })), null, 2),
    });
    setDialogKey((value) => value + 1);
    setDialogOpen(true);
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    setDialogError('');
    let items: FlashSaleInputItem[];
    try {
      items = parseItems(values.items);
    } catch (error) {
      setDialogError(error instanceof Error ? error.message : flashSales.invalidItems);
      return;
    }

    const startsAt = String(values.startsAt ?? '').trim();
    const endsAt = String(values.endsAt ?? '').trim();
    if (!startsAt || !endsAt || Number.isNaN(new Date(startsAt).getTime()) || Number.isNaN(new Date(endsAt).getTime()) || new Date(endsAt) <= new Date(startsAt)) {
      setDialogError('Enter valid ISO date/time values and make sure the end is after the start.');
      return;
    }

    const body = {
      name: String(values.name ?? '').trim(),
      banner: String(values.banner ?? '').trim(),
      startsAt: new Date(startsAt).toISOString(),
      endsAt: new Date(endsAt).toISOString(),
      discountType: String(values.discountType ?? 'PERCENT'),
      discountValue: Number(values.discountValue),
      items,
      ...(dialogMode === 'edit' ? { isActive: values.isActive === true } : {}),
    };
    if (!body.name || body.name.length < 2 || !Number.isFinite(body.discountValue) || body.discountValue < 0) {
      setDialogError('Enter a sale name and a valid non-negative discount value.');
      return;
    }

    const ok = dialogMode === 'add'
      ? await createFlashSale(body)
      : editingId ? await updateFlashSale(editingId, body) : false;
    if (ok) setDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!confirmRow) return;
    const id = confirmRow.flashSaleId;
    setConfirmOpen(false);
    setConfirmRow(null);
    await deleteFlashSale(id);
  };

  const columns = [
    {
      key: 'name', header: flashSales.columns.name,
      cell: (row: FlashSaleData) => <div className="min-w-0"><span className="block truncate font-medium">{row.name}</span><span className="block truncate text-xs text-fg-muted">/{row.slug}</span></div>,
    },
    {
      key: 'window', header: flashSales.columns.window, hideBelow: 'lg', width: 'w-64',
      cell: (row: FlashSaleData) => <div className="text-xs"><span className="block">{new Date(row.startsAt).toLocaleString()}</span><span className="block text-fg-muted">to {new Date(row.endsAt).toLocaleString()}</span></div>,
    },
    {
      key: 'discount', header: flashSales.columns.discount, align: 'center', width: 'w-32',
      cell: (row: FlashSaleData) => <span className="text-sm">{row.discountValue}{row.discountType === 'PERCENT' ? '%' : ' flat'}</span>,
    },
    {
      key: 'products', header: flashSales.columns.products, align: 'center', width: 'w-28',
      cell: (row: FlashSaleData) => <span className="text-sm">{row.itemList.length}</span>,
    },
    {
      key: 'status', header: flashSales.columns.status, align: 'center', width: 'w-32',
      cell: (row: FlashSaleData) => {
        return <StatusBadge meta={toFlashSaleStatus(row)} />;
      },
    },
  ] as const;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={flashSales.title}
        description={flashSales.subtitle}
        action={<Button variant="primary" size="sm" onClick={openCreate}>{common.addNew}</Button>}
      />
        {actionError && <FormError message={actionError} />}
        <Card className="overflow-hidden">
          <DataTable
            columns={columns}
            rows={data.itemList}
            rowKey={(row: FlashSaleData) => row.flashSaleId}
            toolbar={{
              filters: { label: common.filters, count: activeFilterCount, onOpen: () => { setDraftScope(scope); setDraftActive(isActive); setFiltersOpen(true); } },
              actions: <RefreshButton onRefresh={() => void refresh()} size="sm" label={dashboard.refresh} isRefreshing={isLoading} />,
            }}
            actions={{
              header: common.actions,
              render: (row: FlashSaleData) => {
                const items: OptionsMenuItem[] = [
                  { label: common.editExisting, onSelect: () => openEdit(row) },
                  { label: row.isActive ? flashSales.deactivate : flashSales.activate, onSelect: () => void updateFlashSale(row.flashSaleId, { isActive: !row.isActive }) },
                  { label: flashSales.delete, intent: 'danger', onSelect: () => { setConfirmRow(row); setConfirmOpen(true); } },
                ];
                return <OptionsMenu label={flashSales.actionsLabel} items={items} className="flex justify-end" />;
              },
            }}
            isLoading={isLoading}
            error={error}
            onRetry={() => void refresh()}
            emptyTitle={flashSales.empty}
            emptyDescription={activeFilterCount > 0 ? flashSales.emptyFiltered : undefined}
            footer={<Pagination currentPage={data.currentPage || page} totalPage={data.totalPage} totalRecord={data.totalRecord} limit={data.limit || CONTENT_PAGE_SIZE} onPageChange={setPage} />}
          />
        </Card>

        <FilterSheet
          open={filtersOpen}
          title={common.filters}
          onClose={() => setFiltersOpen(false)}
          onReset={() => { setDraftScope('all'); setDraftActive(''); }}
          onDone={() => { setScope(draftScope); setIsActive(draftActive); setFiltersOpen(false); }}
        >
          <FilterGroup label={flashSales.columns.window}>
            {(['all', 'live', 'upcoming', 'ended'] as const).map((value) => (
              <FilterOption key={value} label={flashSales.scopes[value]} selected={draftScope === value} onSelect={() => setDraftScope(value)} />
            ))}
          </FilterGroup>
          <FilterGroup label={flashSales.columns.status}>
            <FilterOption label="All statuses" selected={draftActive === ''} onSelect={() => setDraftActive('')} />
            <FilterOption label="Active" selected={draftActive === 'true'} onSelect={() => setDraftActive('true')} />
            <FilterOption label="Inactive" selected={draftActive === 'false'} onSelect={() => setDraftActive('false')} />
          </FilterGroup>
        </FilterSheet>

        <div className="text-xs text-fg-muted">{flashSales.itemsHelp}</div>
        <EntityDialog
          key={dialogKey}
          open={dialogOpen}
          mode={dialogMode}
          title={dialogMode === 'add' ? flashSales.createTitle : flashSales.editTitle}
          submitLabel={dialogMode === 'add' ? common.addNew : common.save}
          fields={flashSaleFields}
          defaultValues={defaultValues}
          isSubmitting={isActioning}
          error={dialogError}
          onClose={() => { setDialogOpen(false); setDialogError(''); }}
          onSubmit={handleSubmit}
        />
        <ConfirmDialog
          open={confirmOpen}
          title={flashSales.delete}
          description={confirmRow ? flashSales.deleteConfirm.replace('{name}', confirmRow.name) : ''}
          confirmLabel={common.delete}
          isSubmitting={isActioning}
          onConfirm={() => void handleDelete()}
          onClose={() => setConfirmOpen(false)}
        />
    </div>
  );
}

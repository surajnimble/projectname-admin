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
import { useShippingZones } from '@/hooks/use-shipping-zones';
import type { ShippingZoneData } from '@/lib/api/contract';
import { SHIPPING_ZONE_PAGE_SIZE } from '@/constants';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';
import { RefreshButton } from '@/components/common/refresh-button';

const { shipping, common } = MESSAGES;

const shippingFields = [
  { key: 'name', label: shipping.columns.name, type: 'text' as const, required: true, placeholder: shipping.namePlaceholder },
  { key: 'description', label: shipping.descriptionLabel, type: 'textarea' as const, placeholder: shipping.descriptionPlaceholder },
  { key: 'countries', label: shipping.columns.countries, type: 'text' as const, placeholder: shipping.countriesPlaceholder },
  { key: 'states', label: shipping.columns.states, type: 'text' as const, placeholder: shipping.statesPlaceholder },
  { key: 'cities', label: shipping.columns.cities, type: 'text' as const, placeholder: shipping.citiesPlaceholder },
  { key: 'pincodes', label: shipping.columns.pincodes, type: 'text' as const, placeholder: shipping.pincodesPlaceholder },
  { key: 'isActive', label: shipping.columns.isActive, type: 'switch' as const },
];

export function ShippingList() {
  const {
    data,
    isLoading,
    error,
    actionError,
    isActioning,
    page,
    search,
    setPage,
    setSearch,
    refresh,
    createShippingZone,
    updateShippingZone,
    deleteShippingZone,
    toggleShippingZoneStatus,
  } = useShippingZones();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [defaultValues, setDefaultValues] = useState<Record<string, unknown>>({});
  const [dialogKey, setDialogKey] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmRow, setConfirmRow] = useState<ShippingZoneData | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const activeFilterCount = useMemo(() => (search ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0), [search, statusFilter]);

  const rows = useMemo(() => data.itemList.filter((row) => {
    if (statusFilter === 'active') return row.isActive;
    if (statusFilter === 'inactive') return !row.isActive;
    return true;
  }), [data.itemList, statusFilter]);

  const handleAdd = () => {
    setDialogMode('add');
    setEditingId(null);
    setDefaultValues({});
    setDialogKey((k) => k + 1);
    setDialogOpen(true);
  };

  const handleEdit = (row: ShippingZoneData) => {
    setDialogMode('edit');
    setEditingId(row.zoneId);
    setDefaultValues({
      name: row.name,
      description: row.description,
      countries: row.countries.join(', '),
      states: row.states.join(', '),
      cities: row.cities.join(', '),
      pincodes: row.pincodes.join(', '),
      isActive: row.isActive,
    });
    setDialogKey((k) => k + 1);
    setDialogOpen(true);
  };

  const handleDelete = (row: ShippingZoneData) => {
    setConfirmRow(row);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!confirmRow) return;
    setConfirmOpen(false);
    const id = confirmRow.zoneId;
    setConfirmRow(null);
    await deleteShippingZone(id);
  };

  const toArray = (value: unknown) => String(value).split(',').map((c) => c.trim()).filter(Boolean);

  const handleSubmit = async (values: Record<string, unknown>) => {
    let ok = false;
    if (dialogMode === 'add') {
      ok = await createShippingZone({
        name: String(values.name).trim(),
        description: String(values.description).trim() || undefined,
        countries: toArray(values.countries),
        states: toArray(values.states),
        cities: toArray(values.cities),
        pincodes: toArray(values.pincodes),
      });
    } else if (editingId) {
      ok = await updateShippingZone(editingId, {
        name: String(values.name).trim() || undefined,
        description: String(values.description).trim() || undefined,
        countries: toArray(values.countries),
        states: toArray(values.states),
        cities: toArray(values.cities),
        pincodes: toArray(values.pincodes),
      });
    }
    if (ok) setDialogOpen(false);
  };

  const openFilters = () => setFiltersOpen(true);
  const resetDraft = () => setStatusFilter('all');
  const applyDraft = () => setFiltersOpen(false);

  const columns = [
    {
      key: 'name',
      header: shipping.columns.name,
      cell: (row: ShippingZoneData) => <span className="font-medium">{row.name}</span>,
    },
    {
      key: 'countries',
      header: shipping.columns.countries,
      hideBelow: 'lg',
      width: 'w-40',
      cell: (row: ShippingZoneData) => <span className="text-sm truncate">{row.countries.join(', ') || shipping.fallback}</span>,
    },
    {
      key: 'states',
      header: shipping.columns.states,
      hideBelow: 'xl',
      width: 'w-40',
      cell: (row: ShippingZoneData) => <span className="text-sm truncate text-fg-muted">{row.states.join(', ') || shipping.fallback}</span>,
    },
    {
      key: 'cities',
      header: shipping.columns.cities,
      hideBelow: 'xl',
      width: 'w-40',
      cell: (row: ShippingZoneData) => <span className="text-sm truncate text-fg-muted">{row.cities.join(', ') || shipping.fallback}</span>,
    },
    {
      key: 'pincodes',
      header: shipping.columns.pincodes,
      hideBelow: '2xl',
      width: 'w-48',
      cell: (row: ShippingZoneData) => <span className="text-sm truncate text-fg-muted">{row.pincodes.join(', ') || shipping.fallback}</span>,
    },
    {
      key: 'status',
      header: shipping.columns.isActive,
      align: 'center',
      hideBelow: '2xl',
      width: 'w-32',
      cell: (row: ShippingZoneData) => <StatusBadge meta={catalogStatusMeta(row.isActive ? 'ACTIVE' : 'INACTIVE')} />,
    },
    {
      key: 'actions',
      header: shipping.columns.actions,
      align: 'center',
      width: 'w-32',
      cell: () => null,
    },
  ] as const;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={shipping.title}
        description={shipping.subtitle}
        action={
          <Button variant="primary" size="sm" onClick={handleAdd}>
            {MESSAGES.common.addNew}
          </Button>
        }
      />
      <PermissionGuard permission={PERMISSIONS.shippingManage}>
        <Card className="overflow-hidden">
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(row: ShippingZoneData) => row.zoneId}
            toolbar={{
              search: {
                value: search,
                placeholder: shipping.searchPlaceholder,
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
              render: (row: ShippingZoneData) => {
                const items: OptionsMenuItem[] = [
                  { label: MESSAGES.common.editExisting, onSelect: () => handleEdit(row) },
                  { label: row.isActive ? shipping.deactivate : shipping.activate, onSelect: () => void toggleShippingZoneStatus(row.zoneId, !row.isActive) },
                  { label: shipping.delete, intent: 'danger', onSelect: () => handleDelete(row) },
                ];
                return (
                  <OptionsMenu label={shipping.actionsLabel} items={items} className="flex justify-end" />
                );
              },
            }}
            isLoading={isLoading}
            error={error}
            onRetry={() => void refresh()}
            emptyTitle={shipping.empty}
            emptyDescription={activeFilterCount > 0 ? shipping.emptyFiltered : undefined}
            footer={
              <Pagination
                currentPage={data.currentPage || page}
                totalPage={data.totalPage}
                totalRecord={data.totalRecord}
                limit={data.limit || SHIPPING_ZONE_PAGE_SIZE}
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
          <FilterGroup label={shipping.columns.isActive}>
            <FilterOption
              key="all"
              label={shipping.statuses.all}
              selected={statusFilter === 'all'}
              onSelect={() => setStatusFilter('all')}
            />
            <FilterOption
              key="active"
              label={shipping.statuses.active}
              selected={statusFilter === 'active'}
              onSelect={() => setStatusFilter('active')}
            />
            <FilterOption
              key="inactive"
              label={shipping.statuses.inactive}
              selected={statusFilter === 'inactive'}
              onSelect={() => setStatusFilter('inactive')}
            />
          </FilterGroup>
        </FilterSheet>

        <EntityDialog
          open={dialogOpen}
          mode={dialogMode}
          title={dialogMode === 'add' ? shipping.createTitle : common.editExisting}
          submitLabel={dialogMode === 'add' ? MESSAGES.common.addNew : common.save}
          fields={shippingFields}
          defaultValues={defaultValues}
          key={dialogKey}
          isSubmitting={isActioning}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleSubmit}
        />

        <ConfirmDialog
          open={confirmOpen}
          title={shipping.delete}
          description={confirmRow ? shipping.deleteConfirm.replace('{name}', confirmRow.name) : ''}
          confirmLabel={MESSAGES.common.delete}
          isSubmitting={isActioning}
          onConfirm={() => void confirmDelete()}
          onClose={() => setConfirmOpen(false)}
        />
      </PermissionGuard>
    </div>
  );
}

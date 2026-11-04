'use client';

import { useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { DataTable } from '@/components/common/data-table';
import { FilterGroup, FilterOption, FilterSheet } from '@/components/common/filter-sheet';
import { Pagination } from '@/components/common/pagination';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { EntityDialog } from '@/components/common/entity-dialog';
import { OptionsMenu } from '@/components/ui/options-menu';
import { StatusBadge, catalogStatusMeta } from '@/components/common/status-badge';
import { PermissionGuard } from '@/components/auth/guards';
import { useDeliveryBoys } from '@/hooks/use-delivery-boys';
import type { DeliveryBoyData } from '@/lib/api/contract';
import { DELIVERY_BOY_PAGE_SIZE } from '@/constants';
import { PERMISSIONS } from '@/constants';
import { showSuccess } from '@/lib/utils/toast';
import { MESSAGES } from '@/messages';

const { deliveryBoys } = MESSAGES;
const df = deliveryBoys;

const STATUS_FILTERS = [
  { value: 'all', label: df.statuses.all },
  { value: 'active', label: df.statuses.active },
  { value: 'inactive', label: df.statuses.inactive },
] as const;

const columns = [
  {
    key: 'name',
    header: df.columns.name,
    cell: (row: DeliveryBoyData) => <span className="font-medium">{row.name}</span>,
  },
  {
    key: 'phone',
    header: df.columns.phone,
    hideBelow: 'lg',
    width: 'w-40',
    cell: (row: DeliveryBoyData) => <span className="text-sm truncate">{row.phone}</span>,
  },
  {
    key: 'email',
    header: df.columns.email,
    hideBelow: 'xl',
    width: 'w-48',
    cell: (row: DeliveryBoyData) => <span className="text-sm truncate">{row.email || df.dash}</span>,
  },
  {
    key: 'status',
    header: df.columns.status,
    align: 'center',
    hideBelow: '2xl',
    width: 'w-32',
    cell: (row: DeliveryBoyData) => <StatusBadge meta={catalogStatusMeta(row.isActive ? 'ACTIVE' : 'INACTIVE')} />,
  },
  {
    key: 'orders',
    header: df.columns.orders,
    align: 'center',
    hideBelow: 'xl',
    width: 'w-32',
    cell: (row: DeliveryBoyData) => <span className="text-sm">{row.currentOrderCount}</span>,
  },
  {
    key: 'maxOrders',
    header: df.columns.maxOrders,
    align: 'center',
    hideBelow: '2xl',
    width: 'w-32',
    cell: (row: DeliveryBoyData) => <span className="text-sm">{row.maxOrders}</span>,
  },
  {
    key: 'actions',
    header: df.columns.actions,
    align: 'center',
    width: 'w-32',
    cell: () => null,
  },
] as const;

const deliveryBoyFields = [
  { key: 'name', label: df.columns.name, type: 'text' as const, required: true, placeholder: df.namePlaceholder },
  { key: 'phone', label: df.columns.phone, type: 'text' as const, required: true, placeholder: df.phonePlaceholder },
  { key: 'email', label: df.columns.email, type: 'text' as const, placeholder: df.emailPlaceholder },
  { key: 'maxOrders', label: df.columns.maxOrders, type: 'number' as const, placeholder: df.maxOrdersPlaceholder },
];

export function DeliveryBoyPage() {
  const {
    data,
    isLoading,
    error,
    actionError,
    isActioning,
    page,
    search,
    status,
    setPage,
    setSearch,
    setStatus,
    refresh,
    createDeliveryBoy,
    updateDeliveryBoy,
    deleteDeliveryBoy,
    toggleDeliveryBoyStatus,
  } = useDeliveryBoys();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [defaultValues, setDefaultValues] = useState<Record<string, unknown>>({});
  const [dialogKey, setDialogKey] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmRow, setConfirmRow] = useState<DeliveryBoyData | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftStatus, setDraftStatus] = useState(status);
  const activeFilterCount = useMemo(() => (search ? 1 : 0) + (status !== 'all' ? 1 : 0), [search, status]);

  const rows = useMemo(() => data.itemList, [data.itemList]);

  const handleAdd = () => {
    setDialogMode('add');
    setEditingId(null);
    setDefaultValues({});
    setDialogKey((k) => k + 1);
    setDialogOpen(true);
  };

  const handleEdit = (row: DeliveryBoyData) => {
    setDialogMode('edit');
    setEditingId(row.deliveryBoyId);
    setDefaultValues({
      name: row.name,
      phone: row.phone,
      email: row.email,
      maxOrders: String(row.maxOrders),
    });
    setDialogKey((k) => k + 1);
    setDialogOpen(true);
  };

  const handleDelete = (row: DeliveryBoyData) => {
    setConfirmRow(row);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!confirmRow) return;
    setConfirmOpen(false);
    const id = confirmRow.deliveryBoyId;
    setConfirmRow(null);
    await deleteDeliveryBoy(id);
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    let ok = false;
    if (dialogMode === 'add') {
      ok = await createDeliveryBoy({
        name: String(values.name).trim(),
        phone: String(values.phone).trim(),
        email: String(values.email).trim() || undefined,
        maxOrders: Number(values.maxOrders) || 5,
      });
    } else if (editingId) {
      ok = await updateDeliveryBoy(editingId, {
        name: String(values.name).trim() || undefined,
        phone: String(values.phone).trim() || undefined,
        email: String(values.email).trim() || undefined,
        maxOrders: Number(values.maxOrders) || 5,
      });
    }
    if (ok) setDialogOpen(false);
  };

  const openFilters = () => {
    setDraftStatus(status);
    setFiltersOpen(true);
  };

  const resetDraft = () => setDraftStatus('all');

  const applyDraft = () => {
    setStatus(draftStatus);
    setFiltersOpen(false);
  };

  const handleToggle = async (id: string, currentIsActive: boolean) => {
    const done = await toggleDeliveryBoyStatus(id, !currentIsActive);
    if (done) {
      showSuccess(df.toggled);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={df.title}
        description={df.subtitle}
        action={
          <Button variant="primary" size="sm" onClick={handleAdd} disabled={isActioning}>
            {df.create}
          </Button>
        }
      />
      <PermissionGuard permission={PERMISSIONS.deliveryBoyManage}>
        <Card className="overflow-hidden">
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(row: DeliveryBoyData) => row.deliveryBoyId}
            toolbar={{
              search: {
                value: search,
                placeholder: df.searchPlaceholder,
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
                  <RefreshCw className="size-4" aria-hidden="true" />
                  {MESSAGES.dashboard.refresh}
                </Button>
              ),
            }}
            actions={{
              header: df.columns.actions,
              render: (row: DeliveryBoyData) => {
                const isActive = row.isActive;
                return (
                  <OptionsMenu label={df.actionsLabel} items={[
                    { label: MESSAGES.common.editExisting, onSelect: () => handleEdit(row) },
                    { label: isActive ? df.deactivate : df.activate, onSelect: () => void handleToggle(row.deliveryBoyId, isActive) },
                    { label: df.delete, intent: 'danger', onSelect: () => handleDelete(row) },
                  ]} className="flex justify-end" />
                );
              },
            }}
            isLoading={isLoading}
            error={error}
            onRetry={() => void refresh()}
            emptyTitle={df.empty}
            emptyDescription={activeFilterCount > 0 ? df.emptyFiltered : undefined}
            footer={
              <Pagination
                currentPage={data.currentPage || page}
                totalPage={data.totalPage}
                totalRecord={data.totalRecord}
                limit={data.limit || DELIVERY_BOY_PAGE_SIZE}
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
          <FilterGroup label={df.columns.status}>
            {STATUS_FILTERS.map((f) => (
              <FilterOption
                key={f.value}
                label={f.label}
                selected={draftStatus === f.value}
                onSelect={() => setDraftStatus(f.value)}
              />
            ))}
          </FilterGroup>
        </FilterSheet>

        <EntityDialog
          open={dialogOpen}
          mode={dialogMode}
          title={dialogMode === 'add' ? df.createTitle : df.update}
          submitLabel={dialogMode === 'add' ? MESSAGES.common.addNew : df.save}
          fields={deliveryBoyFields}
          defaultValues={defaultValues}
          key={dialogKey}
          isSubmitting={isActioning}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleSubmit}
        />

        <ConfirmDialog
          open={confirmOpen}
          title={df.delete}
          description={confirmRow ? df.deleteConfirm.replace('{name}', confirmRow.name) : ''}
          confirmLabel={MESSAGES.common.delete}
          isSubmitting={isActioning}
          onConfirm={() => void confirmDelete()}
          onClose={() => setConfirmOpen(false)}
        />
      </PermissionGuard>
    </div>
  );
}

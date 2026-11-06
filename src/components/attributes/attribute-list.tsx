'use client';

import { useState } from 'react';

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
import { useCatalog } from '@/hooks/use-catalog';
import type { AttributeData } from '@/lib/api/contract';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';
import { RefreshButton } from '@/components/common/refresh-button';

const { attributes, common } = MESSAGES;

const attributeFields = [
  { key: 'name', label: attributes.columns.attribute, type: 'text' as const, required: true },
  { key: 'slug', label: 'Slug', type: 'text' as const, placeholder: 'auto-generated from name' },
  { key: 'type', label: attributes.columns.type, type: 'select' as const, options: Object.entries(attributes.attributeTypes).map(([value, label]) => ({ label, value })) },
  { key: 'isVariant', label: attributes.columns.variant, type: 'switch' as const },
  { key: 'isFilterable', label: attributes.columns.filterable, type: 'switch' as const },
  { key: 'isActive', label: attributes.columns.status, type: 'switch' as const },
  { key: 'sortOrder', label: attributes.columns.sortOrder, type: 'number' as const, placeholder: '0' },
];

export function AttributeList() {
  const {
    data,
    isLoading,
    isFetching,
    error,
    page,
    search,
    setPage,
    setSearch,
    filters,
    setFilters,
    refresh,
    deleteItem,
    createItem,
    updateItem,
    isActioning,
  } = useCatalog({ kind: 'attributes' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmRow, setConfirmRow] = useState<AttributeData | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftIsActive, setDraftIsActive] = useState(filters.isActive ?? '');
  const activeFilterCount = (search ? 1 : 0) + (filters.isActive ? 1 : 0);

  const handleAdd = () => {
    setDialogMode('add');
    setEditingId(null);
    setDialogOpen(true);
  };

  const handleEdit = (row: AttributeData) => {
    setDialogMode('edit');
    setEditingId(row.attributeId);
    setDialogOpen(true);
  };

  const handleDelete = (row: AttributeData) => {
    setConfirmRow(row);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!confirmRow) return;
    setConfirmOpen(false);
    const id = confirmRow.attributeId;
    setConfirmRow(null);
    await deleteItem(id);
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    let ok = false;
    if (dialogMode === 'add') {
      ok = await createItem(values);
    } else if (editingId) {
      ok = await updateItem(editingId, values);
    }
    if (ok) setDialogOpen(false);
  };

  const openFilters = () => {
    setDraftIsActive(filters.isActive ?? '');
    setFiltersOpen(true);
  };

  const resetDraft = () => {
    setDraftIsActive('');
  };

  const applyDraft = () => {
    setFilters(draftIsActive ? { isActive: draftIsActive } : {});
    setFiltersOpen(false);
  };

  const columns = [
    {
      key: 'attribute',
      header: attributes.columns.attribute,
      cell: (row: AttributeData) => <span className="font-medium">{row.name}</span>,
    },
    {
      key: 'type',
      header: attributes.columns.type,
      hideBelow: 'lg',
      width: 'w-32',
      cell: (row: AttributeData) => <span className="text-sm truncate">{row.type}</span>,
    },
    {
      key: 'variant',
      header: attributes.columns.variant,
      align: 'center',
      hideBelow: 'xl',
      width: 'w-24',
      cell: (row: AttributeData) => <span className="block">{row.isVariant ? common.yes : common.no}</span>,
    },
    {
      key: 'filterable',
      header: attributes.columns.filterable,
      align: 'center',
      hideBelow: '2xl',
      width: 'w-28',
      cell: (row: AttributeData) => <span className="block">{row.isFilterable ? common.yes : common.no}</span>,
    },
    {
      key: 'sortOrder',
      header: attributes.columns.sortOrder,
      align: 'center',
      hideBelow: '2xl',
      width: 'w-24',
      numeric: true,
      cell: (row: AttributeData) => <span className="block">{row.sortOrder}</span>,
    },
    {
      key: 'usageCount',
      header: attributes.columns.usageCount,
      align: 'center',
      hideBelow: '2xl',
      width: 'w-24',
      numeric: true,
      cell: (row: AttributeData) => <span className="block">{row.usageCount}</span>,
    },
    {
      key: 'status',
      header: attributes.columns.status,
      align: 'center',
      hideBelow: 'lg',
      width: 'w-32',
      cell: (row: AttributeData) => <StatusBadge meta={catalogStatusMeta(row.isActive ? 'ACTIVE' : 'INACTIVE')} />,
    },
  ] as const;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={attributes.title}
        description={attributes.subtitle}
        action={
          <Button variant="primary" size="sm" onClick={handleAdd}>
            {MESSAGES.common.addNew}
          </Button>
        }
      />
      <PermissionGuard permission={PERMISSIONS.attributeManage}>
        <Card className="overflow-hidden">
          <DataTable
            columns={columns}
            rows={data.itemList as AttributeData[]}
            rowKey={(row: AttributeData) => row.attributeId}
            toolbar={{
              search: {
                value: search,
                placeholder: attributes.searchPlaceholder,
                onChange: setSearch,
              },
              filters: {
                label: MESSAGES.common.filters,
                count: activeFilterCount,
                onOpen: openFilters,
              },
              actions: (
                <RefreshButton onRefresh={() => void refresh()} size="sm" label={MESSAGES.dashboard.refresh} isRefreshing={isLoading || isFetching} />
              ),
            }}
            actions={{
              header: MESSAGES.common.actions,
              render: (row: AttributeData) => {
                const items: OptionsMenuItem[] = [
                  { label: MESSAGES.common.editExisting, onSelect: () => handleEdit(row) },
                  { label: attributes.delete, intent: 'danger', onSelect: () => handleDelete(row) },
                ];
                return (
                  <OptionsMenu label={attributes.actionsLabel} items={items} className="flex justify-end" />
                );
              },
            }}
            isLoading={isLoading}
            error={error}
            onRetry={() => void refresh()}
            emptyTitle={attributes.empty}
            emptyDescription={attributes.emptyFiltered}
            footer={
              <Pagination
                currentPage={data.currentPage || page}
                totalPage={data.totalPage}
                totalRecord={data.totalRecord}
                limit={data.limit || 10}
                onPageChange={setPage}
              />
            }
          />
        </Card>

        <FilterSheet
          open={filtersOpen}
          title={MESSAGES.common.filters}
          onClose={() => setFiltersOpen(false)}
          onReset={resetDraft}
          onDone={applyDraft}
        >
          <FilterGroup label={attributes.columns.status}>
            <FilterOption
              key="all"
              label={attributes.statuses.all}
              selected={draftIsActive === ''}
              onSelect={() => setDraftIsActive('')}
            />
            <FilterOption
              key="ACTIVE"
              label={attributes.statuses.active}
              selected={draftIsActive === 'true'}
              onSelect={() => setDraftIsActive('true')}
            />
            <FilterOption
              key="INACTIVE"
              label={attributes.statuses.inactive}
              selected={draftIsActive === 'false'}
              onSelect={() => setDraftIsActive('false')}
            />
          </FilterGroup>
        </FilterSheet>

        <EntityDialog
          open={dialogOpen}
          mode={dialogMode}
          title={dialogMode === 'add' ? attributes.title : attributes.editTitle}
          submitLabel={dialogMode === 'add' ? MESSAGES.common.addNew : MESSAGES.common.save}
          fields={attributeFields}
          defaultValues={{}}
          isSubmitting={isActioning}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleSubmit}
        />

        <ConfirmDialog
          open={confirmOpen}
          title={attributes.delete}
          description={confirmRow ? attributes.deleteConfirm.replace('{name}', confirmRow.name) : ''}
          confirmLabel={MESSAGES.common.delete}
          isSubmitting={isActioning}
          onConfirm={() => void confirmDelete()}
          onClose={() => setConfirmOpen(false)}
        />
      </PermissionGuard>
    </div>
  );
}

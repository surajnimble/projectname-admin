'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
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
import type { CollectionData } from '@/lib/api/contract';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';

const { collections } = MESSAGES;

const collectionFields = [
  { key: 'name', label: collections.columns.collection, type: 'text' as const, required: true },
  { key: 'slug', label: collections.columns.slug, type: 'text' as const, placeholder: 'auto-generated from name' },
  { key: 'description', label: collections.columns.description, type: 'textarea' as const },
  { key: 'type', label: collections.columns.type, type: 'select' as const, options: Object.entries(collections.collectionTypes).map(([value, label]) => ({ label, value })) },
  { key: 'isActive', label: collections.columns.status, type: 'switch' as const },
];

export function CollectionList() {
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
  } = useCatalog({ kind: 'collections' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmRow, setConfirmRow] = useState<CollectionData | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftIsActive, setDraftIsActive] = useState(filters.isActive ?? '');
  const activeFilterCount = (search ? 1 : 0) + (filters.isActive ? 1 : 0);

  const handleAdd = () => {
    setDialogMode('add');
    setEditingId(null);
    setDialogOpen(true);
  };

  const handleEdit = (row: CollectionData) => {
    setDialogMode('edit');
    setEditingId(row.collectionId);
    setDialogOpen(true);
  };

  const handleDelete = (row: CollectionData) => {
    setConfirmRow(row);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!confirmRow) return;
    setConfirmOpen(false);
    const id = confirmRow.collectionId;
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
      key: 'collection',
      header: collections.columns.collection,
      cell: (row: CollectionData) => <span className="font-medium">{row.name}</span>,
    },
    {
      key: 'slug',
      header: collections.columns.slug,
      hideBelow: 'lg',
      width: 'w-40',
      cell: (row: CollectionData) => <span className="text-sm truncate">{row.slug}</span>,
    },
    {
      key: 'description',
      header: collections.columns.description,
      hideBelow: 'xl',
      width: 'w-48',
      cell: (row: CollectionData) => <span className="block truncate">{row.description}</span>,
    },
    {
      key: 'type',
      header: collections.columns.type,
      hideBelow: 'xl',
      width: 'w-32',
      cell: (row: CollectionData) => <span className="text-sm truncate">{row.type}</span>,
    },
    {
      key: 'products',
      header: collections.columns.products,
      align: 'center',
      hideBelow: '2xl',
      width: 'w-24',
      numeric: true,
      cell: (row: CollectionData) => <span className="block">{row.productCount}</span>,
    },
    {
      key: 'status',
      header: collections.columns.status,
      align: 'center',
      hideBelow: 'lg',
      width: 'w-32',
      cell: (row: CollectionData) => <StatusBadge meta={catalogStatusMeta(row.isActive ? 'ACTIVE' : 'INACTIVE')} />,
    },
  ] as const;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={collections.title}
        description={collections.subtitle}
        action={
          <Button variant="primary" size="sm" onClick={handleAdd}>
            {MESSAGES.common.addNew}
          </Button>
        }
      />
      <PermissionGuard permission={PERMISSIONS.collectionManage}>
        <Card className="overflow-hidden">
          <DataTable
            columns={columns}
            rows={data.itemList as CollectionData[]}
            rowKey={(row: CollectionData) => row.collectionId}
            toolbar={{
              search: {
                value: search,
                placeholder: collections.searchPlaceholder,
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
                  {MESSAGES.dashboard.refresh}
                </Button>
              ),
            }}
            actions={{
              header: MESSAGES.common.actions,
              render: (row: CollectionData) => {
                const items: OptionsMenuItem[] = [
                  { label: MESSAGES.common.editExisting, onSelect: () => handleEdit(row) },
                  { label: collections.delete, intent: 'danger', onSelect: () => handleDelete(row) },
                ];
                return (
                  <OptionsMenu label={collections.actionsLabel} items={items} className="flex justify-end" />
                );
              },
            }}
            isLoading={isLoading}
            error={error}
            onRetry={() => void refresh()}
            emptyTitle={collections.empty}
            emptyDescription={collections.emptyFiltered}
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
          <FilterGroup label={collections.columns.status}>
            <FilterOption
              key="all"
              label={collections.statuses.all}
              selected={draftIsActive === ''}
              onSelect={() => setDraftIsActive('')}
            />
            <FilterOption
              key="ACTIVE"
              label={collections.statuses.active}
              selected={draftIsActive === 'true'}
              onSelect={() => setDraftIsActive('true')}
            />
            <FilterOption
              key="INACTIVE"
              label={collections.statuses.inactive}
              selected={draftIsActive === 'false'}
              onSelect={() => setDraftIsActive('false')}
            />
          </FilterGroup>
        </FilterSheet>

        <EntityDialog
          open={dialogOpen}
          mode={dialogMode}
          title={dialogMode === 'add' ? collections.title : collections.editTitle}
          submitLabel={dialogMode === 'add' ? MESSAGES.common.addNew : MESSAGES.common.save}
          fields={collectionFields}
          defaultValues={{}}
          isSubmitting={isActioning}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleSubmit}
        />

        <ConfirmDialog
          open={confirmOpen}
          title={collections.delete}
          description={confirmRow ? collections.deleteConfirm.replace('{name}', confirmRow.name) : ''}
          confirmLabel={MESSAGES.common.delete}
          isSubmitting={isActioning}
          onConfirm={() => void confirmDelete()}
          onClose={() => setConfirmOpen(false)}
        />
      </PermissionGuard>
    </div>
  );
}

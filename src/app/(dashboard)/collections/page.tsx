'use client';
import { useState } from 'react';
import { PermissionGuard } from '@/components/auth/guards';
import { PageHeader } from '@/components/common/page-header';
import { DataTable } from '@/components/common/data-table';
import { FilterGroup, FilterOption, FilterSheet } from '@/components/common/filter-sheet';
import { Pagination } from '@/components/common/pagination';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { OptionsMenu, type OptionsMenuItem } from '@/components/ui/options-menu';
import { StatusBadge, catalogStatusMeta } from '@/components/common/status-badge';
import { EntityDialog } from '@/components/common/entity-dialog';
import { useCatalog } from '@/hooks/use-catalog';
import type { CollectionData } from '@/lib/api/contract';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';

export default function CollectionsPage() {
  const {
    data,
    isLoading,
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

  const collectionFields = [
    { key: 'name', label: MESSAGES.collections.columns.collection, type: 'text' as const, required: true },
    { key: 'slug', label: 'Slug', type: 'text' as const, placeholder: 'auto-generated from name' },
    { key: 'description', label: 'Description', type: 'textarea' as const },
    { key: 'type', label: 'Type', type: 'select' as const, options: [
      { label: 'Manual', value: 'MANUAL' },
      { label: 'Dynamic', value: 'DYNAMIC' },
    ] },
    { key: 'isActive', label: 'Active', type: 'switch' as const },
  ];

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

  const activeFilterCount = (search ? 1 : 0) + (filters.isActive ? 1 : 0);

  const openFilters = () => {
    setDraftIsActive(filters.isActive ?? '');
    setFiltersOpen(true);
  };

  const resetFilters = () => {
    setDraftIsActive('');
  };

  const applyFilters = () => {
    setFilters(draftIsActive ? { isActive: draftIsActive } : {});
    setFiltersOpen(false);
  };

  const columns = [
    {
      key: 'collection',
      header: MESSAGES.collections.columns.collection,
      cell: (row: CollectionData) => <span className="font-medium">{row.name}</span>,
    },
    {
      key: 'slug',
      header: MESSAGES.collections.columns.slug,
      hideBelow: 'lg',
      width: 'w-40',
      cell: (row: CollectionData) => <span className="text-sm truncate">{row.slug}</span>,
    },
    {
      key: 'description',
      header: MESSAGES.collections.columns.description,
      hideBelow: 'xl',
      width: 'w-48',
      cell: (row: CollectionData) => <span className="block truncate">{row.description || '\u2014'}</span>,
    },
    {
      key: 'type',
      header: MESSAGES.collections.columns.type,
      hideBelow: 'xl',
      width: 'w-32',
      cell: (row: CollectionData) => <span className="text-sm truncate">{row.type}</span>,
    },
    {
      key: 'products',
      header: 'Products',
      align: 'center',
      hideBelow: '2xl',
      width: 'w-24',
      numeric: true,
      cell: (row: CollectionData) => <span className="block">{row.productCount}</span>,
    },
    {
      key: 'status',
      header: MESSAGES.collections.columns.status,
      align: 'center',
      hideBelow: 'lg',
      width: 'w-32',
      cell: (row: CollectionData) => <StatusBadge meta={catalogStatusMeta(row.isActive ? 'ACTIVE' : 'INACTIVE')} />,
    },
  ] as const;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={MESSAGES.sections.collections}
        description={MESSAGES.collections.subtitle}
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
                placeholder: MESSAGES.common.search,
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
                >
                  {MESSAGES.dashboard.refresh}
                </Button>
              ),
            }}
            actions={{
              header: MESSAGES.common.actions,
              render: (row: CollectionData) => {
                const items: OptionsMenuItem[] = [
                  {
                    label: 'Edit',
                    onSelect: () => handleEdit(row),
                  },
                  {
                    label: MESSAGES.collections.delete,
                    intent: 'danger',
                    onSelect: () => handleDelete(row),
                  },
                ];
                return (
                  <OptionsMenu label={MESSAGES.common.actions} items={items} className="flex justify-end" />
                );
              },
            }}
            isLoading={isLoading}
            error={error}
            onRetry={() => void refresh()}
            emptyTitle={MESSAGES.collections.empty}
            emptyDescription={MESSAGES.collections.emptyFiltered}
            footer={
              <Pagination
                currentPage={page}
                totalPage={data.totalPage}
                totalRecord={data.totalRecord}
                limit={data.limit}
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
          <FilterGroup label={MESSAGES.collections.columns.status}>
            <FilterOption
              key="all"
              label={MESSAGES.collections.statuses.all ?? 'All'}
              selected={draftIsActive === ''}
              onSelect={() => setDraftIsActive('')}
            />
            <FilterOption
              key="ACTIVE"
              label={MESSAGES.collections.statuses.active}
              selected={draftIsActive === 'true'}
              onSelect={() => setDraftIsActive('true')}
            />
            <FilterOption
              key="INACTIVE"
              label={MESSAGES.collections.statuses.inactive}
              selected={draftIsActive === 'false'}
              onSelect={() => setDraftIsActive('false')}
            />
          </FilterGroup>
        </FilterSheet>

        <EntityDialog
          open={dialogOpen}
          mode={dialogMode}
          title={dialogMode === 'add' ? MESSAGES.common.addNew : 'Edit Collection'}
          submitLabel={dialogMode === 'add' ? 'Create' : 'Save'}
          fields={collectionFields}
          defaultValues={{}}
          isSubmitting={isActioning}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleSubmit}
        />

        <Dialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          title={MESSAGES.collections.delete}
          description={confirmRow ? MESSAGES.collections.deleteConfirm.replace('{name}', confirmRow.name) : ''}
          closeLabel={MESSAGES.common.cancel}
          footer={
            <>
              <Button type="button" variant="outline" onClick={() => setConfirmOpen(false)}>
                {MESSAGES.common.cancel}
              </Button>
              <Button type="button" variant="destructive" onClick={confirmDelete}>
                {MESSAGES.common.delete}
              </Button>
            </>
          }
        />
      </PermissionGuard>
    </div>
  );
}

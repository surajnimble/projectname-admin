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
import type { BrandData } from '@/lib/api/contract';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';

export default function BrandsPage() {
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
  } = useCatalog({ kind: 'brands' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmRow, setConfirmRow] = useState<BrandData | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftIsActive, setDraftIsActive] = useState(filters.isActive ?? '');

  const brandFields = [
    { key: 'name', label: MESSAGES.brands.columns.brand, type: 'text' as const, required: true },
    { key: 'slug', label: 'Slug', type: 'text' as const, placeholder: 'auto-generated from name' },
    { key: 'description', label: 'Description', type: 'textarea' as const },
    { key: 'logo', label: 'Logo URL', type: 'text' as const, placeholder: 'https://...' },
    { key: 'isActive', label: 'Active', type: 'switch' as const },
  ];

  const handleAdd = () => {
    setDialogMode('add');
    setEditingId(null);
    setDialogOpen(true);
  };

  const handleEdit = (row: BrandData) => {
    setDialogMode('edit');
    setEditingId(row.brandId);
    setDialogOpen(true);
  };

  const handleDelete = (row: BrandData) => {
    setConfirmRow(row);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!confirmRow) return;
    setConfirmOpen(false);
    const id = confirmRow.brandId;
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
      key: 'brand',
      header: MESSAGES.brands.columns.brand,
      cell: (row: BrandData) => (
        <div className="flex items-center gap-3">
          {row.logo ? (
            <img src={row.logo} alt={row.name} className="size-6 rounded-md object-cover" />
          ) : (
            <div className="size-6 rounded-md bg-surface-muted flex items-center justify-center">
              {row.name?.slice(0, 2).toUpperCase()}
            </div>
          )}
          <span className="font-medium">{row.name}</span>
        </div>
      ),
    },
    {
      key: 'slug',
      header: MESSAGES.brands.columns.slug,
      hideBelow: 'lg',
      width: 'w-40',
      cell: (row: BrandData) => <span className="text-sm truncate">{row.slug}</span>,
    },
    {
      key: 'description',
      header: 'Description',
      hideBelow: 'xl',
      width: 'w-48',
      cell: (row: BrandData) => <span className="block truncate">{row.description || '\u2014'}</span>,
    },
    {
      key: 'products',
      header: 'Products',
      align: 'center',
      hideBelow: '2xl',
      width: 'w-24',
      numeric: true,
      cell: (row: BrandData) => <span className="block">{row.productCount}</span>,
    },
    {
      key: 'status',
      header: MESSAGES.brands.columns.status,
      align: 'center',
      hideBelow: 'lg',
      width: 'w-32',
      cell: (row: BrandData) => <StatusBadge meta={catalogStatusMeta(row.isActive ? 'ACTIVE' : 'INACTIVE')} />,
    },
  ] as const;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={MESSAGES.sections.brands}
        description={MESSAGES.brands.subtitle}
        action={
          <Button variant="primary" size="sm" onClick={handleAdd}>
            {MESSAGES.common.addNew}
          </Button>
        }
      />
      <PermissionGuard permission={PERMISSIONS.brandManage}>
        <Card className="overflow-hidden">
          <DataTable
            columns={columns}
            rows={data.itemList as BrandData[]}
            rowKey={(row: BrandData) => row.brandId}
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
              render: (row: BrandData) => {
                const items: OptionsMenuItem[] = [
                  {
                    label: 'Edit',
                    onSelect: () => handleEdit(row),
                  },
                  {
                    label: MESSAGES.brands.delete,
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
            emptyTitle={MESSAGES.brands.empty}
            emptyDescription={MESSAGES.brands.emptyFiltered}
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
          <FilterGroup label={MESSAGES.brands.columns.status}>
            <FilterOption
              key="all"
              label={MESSAGES.brands.statuses.all ?? 'All'}
              selected={draftIsActive === ''}
              onSelect={() => setDraftIsActive('')}
            />
            <FilterOption
              key="ACTIVE"
              label={MESSAGES.brands.statuses.active}
              selected={draftIsActive === 'true'}
              onSelect={() => setDraftIsActive('true')}
            />
            <FilterOption
              key="INACTIVE"
              label={MESSAGES.brands.statuses.inactive}
              selected={draftIsActive === 'false'}
              onSelect={() => setDraftIsActive('false')}
            />
          </FilterGroup>
        </FilterSheet>

        <EntityDialog
          open={dialogOpen}
          mode={dialogMode}
          title={dialogMode === 'add' ? MESSAGES.common.addNew : 'Edit Brand'}
          submitLabel={dialogMode === 'add' ? 'Create' : 'Save'}
          fields={brandFields}
          defaultValues={{}}
          isSubmitting={isActioning}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleSubmit}
        />

        <Dialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          title={MESSAGES.brands.delete}
          description={confirmRow ? MESSAGES.brands.deleteConfirm.replace('{name}', confirmRow.name) : ''}
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

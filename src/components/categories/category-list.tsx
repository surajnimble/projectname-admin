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
import type { CategoryData } from '@/lib/api/contract';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';

const { categories, common } = MESSAGES;

const categoryFields = [
  { key: 'name', label: categories.columns.category, type: 'text' as const, required: true },
  { key: 'slug', label: categories.columns.slug, type: 'text' as const, placeholder: 'auto-generated from name' },
  { key: 'description', label: categories.columns.description, type: 'textarea' as const },
  { key: 'parentId', label: categories.columns.parent, type: 'text' as const, placeholder: 'Leave empty for root' },
  { key: 'isActive', label: categories.columns.status, type: 'switch' as const },
  { key: 'sortOrder', label: categories.columns.sortOrder, type: 'number' as const, placeholder: '0' },
];

export function CategoryList() {
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
  } = useCatalog({ kind: 'categories' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmRow, setConfirmRow] = useState<CategoryData | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftIsActive, setDraftIsActive] = useState(filters.isActive ?? '');
  const activeFilterCount = (search ? 1 : 0) + (filters.isActive ? 1 : 0);

  const handleAdd = () => {
    setDialogMode('add');
    setEditingId(null);
    setDialogOpen(true);
  };

  const handleEdit = (row: CategoryData) => {
    setDialogMode('edit');
    setEditingId(row.categoryId);
    setDialogOpen(true);
  };

  const handleDelete = (row: CategoryData) => {
    setConfirmRow(row);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!confirmRow) return;
    setConfirmOpen(false);
    const id = confirmRow.categoryId;
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
      key: 'category',
      header: categories.columns.category,
      cell: (row: CategoryData) => (
        <div className="flex items-center gap-3">
          {row.image ? (
            <img src={row.image} alt={row.name} className="size-6 rounded-md object-cover" />
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
      header: categories.columns.slug,
      hideBelow: 'lg',
      width: 'w-40',
      cell: (row: CategoryData) => <span className="text-sm truncate">{row.slug}</span>,
    },
    {
      key: 'parent',
      header: categories.columns.parent,
      hideBelow: 'xl',
      width: 'w-32',
      cell: (row: CategoryData) => <span className="block truncate">{row.parentId || common.dash}</span>,
    },
    {
      key: 'products',
      header: categories.columns.products,
      align: 'center',
      hideBelow: '2xl',
      width: 'w-24',
      numeric: true,
      cell: (row: CategoryData) => <span className="block">{row.productCount}</span>,
    },
    {
      key: 'status',
      header: categories.columns.status,
      align: 'center',
      hideBelow: 'lg',
      width: 'w-32',
      cell: (row: CategoryData) => <StatusBadge meta={catalogStatusMeta(row.isActive ? 'ACTIVE' : 'INACTIVE')} />,
    },
  ] as const;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={categories.title}
        description={categories.subtitle}
        action={
          <Button variant="primary" size="sm" onClick={handleAdd}>
            {MESSAGES.common.addNew}
          </Button>
        }
      />
      <PermissionGuard permission={PERMISSIONS.categoryManage}>
        <Card className="overflow-hidden">
          <DataTable
            columns={columns}
            rows={data.itemList as CategoryData[]}
            rowKey={(row: CategoryData) => row.categoryId}
            toolbar={{
              search: {
                value: search,
                placeholder: categories.searchPlaceholder,
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
              header: MESSAGES.common.actions,
              render: (row: CategoryData) => {
                const items: OptionsMenuItem[] = [
                  { label: MESSAGES.common.editExisting, onSelect: () => handleEdit(row) },
                  { label: categories.delete, intent: 'danger', onSelect: () => handleDelete(row) },
                ];
                return (
                  <OptionsMenu label={categories.actionsLabel} items={items} className="flex justify-end" />
                );
              },
            }}
            isLoading={isLoading}
            error={error}
            onRetry={() => void refresh()}
            emptyTitle={categories.empty}
            emptyDescription={categories.emptyFiltered}
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
          <FilterGroup label={categories.columns.status}>
            <FilterOption
              key="all"
              label={categories.statuses.all}
              selected={draftIsActive === ''}
              onSelect={() => setDraftIsActive('')}
            />
            <FilterOption
              key="ACTIVE"
              label={categories.statuses.active}
              selected={draftIsActive === 'true'}
              onSelect={() => setDraftIsActive('true')}
            />
            <FilterOption
              key="INACTIVE"
              label={categories.statuses.inactive}
              selected={draftIsActive === 'false'}
              onSelect={() => setDraftIsActive('false')}
            />
          </FilterGroup>
        </FilterSheet>

        <EntityDialog
          open={dialogOpen}
          mode={dialogMode}
          title={dialogMode === 'add' ? categories.title : categories.editTitle}
          submitLabel={dialogMode === 'add' ? MESSAGES.common.addNew : common.save}
          fields={categoryFields}
          defaultValues={{}}
          isSubmitting={isActioning}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleSubmit}
        />

        <ConfirmDialog
          open={confirmOpen}
          title={categories.delete}
          description={confirmRow ? categories.deleteConfirm.replace('{name}', confirmRow.name) : ''}
          confirmLabel={MESSAGES.common.delete}
          isSubmitting={isActioning}
          onConfirm={() => void confirmDelete()}
          onClose={() => setConfirmOpen(false)}
        />
      </PermissionGuard>
    </div>
  );
}

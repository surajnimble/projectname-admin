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
import type { AttributeData } from '@/lib/api/contract';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';

export default function ClientAttributesPage() {
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
  } = useCatalog({ kind: 'attributes' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmRow, setConfirmRow] = useState<AttributeData | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftIsActive, setDraftIsActive] = useState(filters.isActive ?? '');
  const [draftIsVariant, setDraftIsVariant] = useState(filters.isVariant ?? '');
  const [draftIsFilterable, setDraftIsFilterable] = useState(filters.isFilterable ?? '');

  const attributeFields = [
    { key: 'name', label: MESSAGES.attributes.columns.attribute, type: 'text' as const, required: true },
    { key: 'slug', label: 'Slug', type: 'text' as const, placeholder: 'auto-generated from name' },
    { key: 'type', label: 'Type', type: 'select' as const, options: [
      { label: 'Text', value: 'TEXT' },
      { label: 'Number', value: 'NUMBER' },
      { label: 'Boolean', value: 'BOOLEAN' },
      { label: 'Select', value: 'SELECT' },
      { label: 'Multi Select', value: 'MULTI_SELECT' },
      { label: 'Color', value: 'COLOR' },
      { label: 'Size', value: 'SIZE' },
    ] },
    { key: 'isVariant', label: 'Is Variant', type: 'switch' as const },
    { key: 'isActive', label: 'Active', type: 'switch' as const },
  ];

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

  const activeFilterCount =
    (search ? 1 : 0) + (filters.isActive ? 1 : 0) + (filters.isVariant ? 1 : 0) + (filters.isFilterable ? 1 : 0);

  const openFilters = () => {
    setDraftIsActive(filters.isActive ?? '');
    setDraftIsVariant(filters.isVariant ?? '');
    setDraftIsFilterable(filters.isFilterable ?? '');
    setFiltersOpen(true);
  };

  const resetFilters = () => {
    setDraftIsActive('');
    setDraftIsVariant('');
    setDraftIsFilterable('');
  };

  const applyFilters = () => {
    setFilters({
      ...(draftIsActive ? { isActive: draftIsActive } : {}),
      ...(draftIsVariant ? { isVariant: draftIsVariant } : {}),
      ...(draftIsFilterable ? { isFilterable: draftIsFilterable } : {}),
    });
    setFiltersOpen(false);
  };

  const columns = [
    {
      key: 'attribute',
      header: MESSAGES.attributes.columns.attribute,
      cell: (row: AttributeData) => <span className="font-medium">{row.name}</span>,
    },
    {
      key: 'type',
      header: MESSAGES.attributes.columns.type,
      hideBelow: 'lg',
      width: 'w-32',
      cell: (row: AttributeData) => <span className="text-sm truncate">{row.type}</span>,
    },
    {
      key: 'variant',
      header: MESSAGES.attributes.columns.variant,
      align: 'center',
      hideBelow: 'xl',
      width: 'w-24',
      cell: (row: AttributeData) => (
        <StatusBadge meta={{ label: row.isVariant ? 'Yes' : 'No', intent: row.isVariant ? 'success' : 'neutral' }} />
      ),
    },
    {
      key: 'filterable',
      header: MESSAGES.attributes.columns.filterable,
      align: 'center',
      hideBelow: '2xl',
      width: 'w-28',
      cell: (row: AttributeData) => (
        <StatusBadge meta={{ label: row.isFilterable ? 'Yes' : 'No', intent: row.isFilterable ? 'success' : 'neutral' }} />
      ),
    },
    {
      key: 'sortOrder',
      header: 'Sort Order',
      align: 'center',
      hideBelow: '2xl',
      width: 'w-24',
      numeric: true,
      cell: (row: AttributeData) => <span className="block">{row.sortOrder}</span>,
    },
    {
      key: 'usageCount',
      header: 'Usage Count',
      align: 'center',
      hideBelow: '2xl',
      width: 'w-24',
      numeric: true,
      cell: (row: AttributeData) => <span className="block">{row.usageCount}</span>,
    },
    {
      key: 'status',
      header: MESSAGES.attributes.columns.status,
      align: 'center',
      hideBelow: 'lg',
      width: 'w-32',
      cell: (row: AttributeData) => <StatusBadge meta={catalogStatusMeta(row.isActive ? 'ACTIVE' : 'INACTIVE')} />,
    },
  ] as const;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={MESSAGES.sections.attributes}
        description={MESSAGES.attributes.subtitle}
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
              render: (row: AttributeData) => {
                const items: OptionsMenuItem[] = [
                  {
                    label: 'Edit',
                    onSelect: () => handleEdit(row),
                  },
                  {
                    label: MESSAGES.attributes.delete,
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
            emptyTitle={MESSAGES.attributes.empty}
            emptyDescription={MESSAGES.attributes.emptyFiltered}
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
          <FilterGroup label={MESSAGES.attributes.columns.status}>
            <FilterOption
              key="all"
              label={MESSAGES.attributes.statuses.all ?? 'All'}
              selected={draftIsActive === ''}
              onSelect={() => setDraftIsActive('')}
            />
            <FilterOption
              key="ACTIVE"
              label={MESSAGES.attributes.statuses.active}
              selected={draftIsActive === 'true'}
              onSelect={() => setDraftIsActive('true')}
            />
            <FilterOption
              key="INACTIVE"
              label={MESSAGES.attributes.statuses.inactive}
              selected={draftIsActive === 'false'}
              onSelect={() => setDraftIsActive('false')}
            />
          </FilterGroup>
          <FilterGroup label={MESSAGES.attributes.columns.variant}>
            <FilterOption
              key="all"
              label={MESSAGES.categories.statuses.all ?? 'All'}
              selected={draftIsVariant === ''}
              onSelect={() => setDraftIsVariant('')}
            />
            <FilterOption key="true" label="Yes" selected={draftIsVariant === 'true'} onSelect={() => setDraftIsVariant('true')} />
            <FilterOption key="false" label="No" selected={draftIsVariant === 'false'} onSelect={() => setDraftIsVariant('false')} />
          </FilterGroup>
          <FilterGroup label={MESSAGES.attributes.columns.filterable}>
            <FilterOption
              key="all"
              label={MESSAGES.categories.statuses.all ?? 'All'}
              selected={draftIsFilterable === ''}
              onSelect={() => setDraftIsFilterable('')}
            />
            <FilterOption key="true" label="Yes" selected={draftIsFilterable === 'true'} onSelect={() => setDraftIsFilterable('true')} />
            <FilterOption key="false" label="No" selected={draftIsFilterable === 'false'} onSelect={() => setDraftIsFilterable('false')} />
          </FilterGroup>
        </FilterSheet>

        <EntityDialog
          open={dialogOpen}
          mode={dialogMode}
          title={dialogMode === 'add' ? MESSAGES.common.addNew : 'Edit Attribute'}
          submitLabel={dialogMode === 'add' ? 'Create' : 'Save'}
          fields={attributeFields}
          defaultValues={{}}
          isSubmitting={isActioning}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleSubmit}
        />

        <Dialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          title={MESSAGES.attributes.delete}
          description={confirmRow ? MESSAGES.attributes.deleteConfirm.replace('{name}', confirmRow.name) : ''}
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

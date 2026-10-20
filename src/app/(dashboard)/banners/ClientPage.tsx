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
import { Input } from '@/components/ui/input';
import { OptionsMenu, type OptionsMenuItem } from '@/components/ui/options-menu';
import { StatusBadge, catalogStatusMeta } from '@/components/common/status-badge';
import { EntityDialog } from '@/components/common/entity-dialog';
import { useContent } from '@/hooks/use-content';
import type { BannerData } from '@/lib/api/contract';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';

export default function ClientBannersPage() {
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
  } = useContent({ kind: 'banners' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmRow, setConfirmRow] = useState<BannerData | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftType, setDraftType] = useState(filters.type ?? '');
  const [draftIsActive, setDraftIsActive] = useState(filters.isActive ?? '');

  const bannerFields = [
    { key: 'title', label: MESSAGES.banners.columns.banner, type: 'text' as const, required: true },
    { key: 'subtitle', label: 'Subtitle', type: 'text' as const },
    { key: 'image', label: 'Image URL', type: 'text' as const, placeholder: 'https://...' },
    { key: 'linkUrl', label: 'Link URL', type: 'text' as const, placeholder: 'https://...' },
    { key: 'position', label: 'Position', type: 'text' as const, placeholder: 'e.g. homepage-hero' },
    { key: 'startAt', label: 'Start Date', type: 'text' as const, placeholder: 'YYYY-MM-DD' },
    { key: 'endAt', label: 'End Date', type: 'text' as const, placeholder: 'YYYY-MM-DD' },
    { key: 'isActive', label: 'Active', type: 'switch' as const },
  ];

  const handleAdd = () => {
    setDialogMode('add');
    setEditingId(null);
    setDialogOpen(true);
  };

  const handleEdit = (row: BannerData) => {
    setDialogMode('edit');
    setEditingId(row.bannerId);
    setDialogOpen(true);
  };

  const handleDelete = (row: BannerData) => {
    setConfirmRow(row);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!confirmRow) return;
    setConfirmOpen(false);
    const id = confirmRow.bannerId;
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

  const activeFilterCount = (search ? 1 : 0) + (filters.type ? 1 : 0) + (filters.isActive ? 1 : 0);

  const openFilters = () => {
    setDraftType(filters.type ?? '');
    setDraftIsActive(filters.isActive ?? '');
    setFiltersOpen(true);
  };

  const resetFilters = () => {
    setDraftType('');
    setDraftIsActive('');
  };

  const applyFilters = () => {
    setFilters({
      ...(draftType ? { type: draftType } : {}),
      ...(draftIsActive ? { isActive: draftIsActive } : {}),
    });
    setFiltersOpen(false);
  };

  const columns = [
    {
      key: 'banner',
      header: MESSAGES.banners.columns.banner,
      cell: (row: BannerData) => (
        <div className="flex items-center gap-3">
          {row.image ? (
            <img src={row.image} alt={row.title} className="size-6 rounded-md object-cover" />
          ) : (
            <div className="size-6 rounded-md bg-surface-muted flex items-center justify-center">
              {row.title?.slice(0, 2).toUpperCase()}
            </div>
          )}
          <span className="font-medium">{row.title}</span>
        </div>
      ),
    },
    {
      key: 'subtitle',
      header: MESSAGES.banners.columns.subtitle,
      hideBelow: 'xl',
      width: 'w-48',
      cell: (row: BannerData) => <span className="block truncate">{row.subtitle || '\u2014'}</span>,
    },
    {
      key: 'position',
      header: MESSAGES.banners.columns.position,
      hideBelow: 'lg',
      width: 'w-32',
      cell: (row: BannerData) => <span className="text-sm truncate">{row.position}</span>,
    },
    {
      key: 'linkUrl',
      header: 'Link URL',
      hideBelow: '2xl',
      width: 'w-40',
      cell: (row: BannerData) => <span className="block truncate">{row.linkUrl}</span>,
    },
    {
      key: 'status',
      header: MESSAGES.banners.columns.status,
      align: 'center',
      hideBelow: 'lg',
      width: 'w-32',
      cell: (row: BannerData) => <StatusBadge meta={catalogStatusMeta(row.isActive ? 'ACTIVE' : 'INACTIVE')} />,
    },
  ] as const;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={MESSAGES.sections.banners}
        description={MESSAGES.banners.subtitle}
        action={
          <Button variant="primary" size="sm" onClick={handleAdd}>
            {MESSAGES.common.addNew}
          </Button>
        }
      />
      <PermissionGuard permission={PERMISSIONS.bannerManage}>
        <Card className="overflow-hidden">
          <DataTable
            columns={columns}
            rows={data.itemList as BannerData[]}
            rowKey={(row: BannerData) => row.bannerId}
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
              render: (row: BannerData) => {
                const items: OptionsMenuItem[] = [
                  {
                    label: 'Edit',
                    onSelect: () => handleEdit(row),
                  },
                  {
                    label: MESSAGES.banners.delete,
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
            emptyTitle={MESSAGES.banners.empty}
            emptyDescription={MESSAGES.banners.emptyFiltered}
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
          <FilterGroup label="Type">
            <Input
              value={draftType}
              onChange={(event) => setDraftType(event.target.value)}
              placeholder="Filter by type..."
            />
          </FilterGroup>
          <FilterGroup label={MESSAGES.banners.columns.status}>
            <FilterOption
              key="all"
              label={MESSAGES.banners.statuses.all ?? 'All'}
              selected={draftIsActive === ''}
              onSelect={() => setDraftIsActive('')}
            />
            <FilterOption
              key="ACTIVE"
              label={MESSAGES.banners.statuses.active}
              selected={draftIsActive === 'true'}
              onSelect={() => setDraftIsActive('true')}
            />
            <FilterOption
              key="INACTIVE"
              label={MESSAGES.banners.statuses.inactive}
              selected={draftIsActive === 'false'}
              onSelect={() => setDraftIsActive('false')}
            />
          </FilterGroup>
        </FilterSheet>

        <EntityDialog
          open={dialogOpen}
          mode={dialogMode}
          title={dialogMode === 'add' ? MESSAGES.common.addNew : 'Edit Banner'}
          submitLabel={dialogMode === 'add' ? 'Create' : 'Save'}
          fields={bannerFields}
          defaultValues={{}}
          isSubmitting={isActioning}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleSubmit}
        />

        <Dialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          title={MESSAGES.banners.delete}
          description={confirmRow ? MESSAGES.banners.deleteConfirm.replace('{title}', confirmRow.title) : ''}
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

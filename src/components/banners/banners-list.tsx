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
import { useContent } from '@/hooks/use-content';
import type { BannerData } from '@/lib/api/contract';
import { CONTENT_PAGE_SIZE, PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';

const { banners, common, dashboard } = MESSAGES;

const bannerFields = [
  { key: 'title', label: banners.columns.banner, type: 'text' as const, required: true },
  { key: 'subtitle', label: banners.columns.subtitle, type: 'text' as const },
  { key: 'image', label: banners.columns.image, type: 'text' as const },
  { key: 'linkUrl', label: banners.columns.link, type: 'text' as const },
  { key: 'position', label: banners.columns.priority, type: 'text' as const },
  { key: 'startAt', label: banners.columns.startDate, type: 'text' as const },
  { key: 'endAt', label: banners.columns.endDate, type: 'text' as const },
  { key: 'isActive', label: banners.columns.status, type: 'switch' as const },
];

export function BannersList() {
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
  const [draftIsActive, setDraftIsActive] = useState(filters.isActive ?? '');
  const activeFilterCount = (search ? 1 : 0) + (filters.isActive ? 1 : 0);

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
      key: 'banner',
      header: banners.columns.banner,
      cell: (row: BannerData) => (
        <div className="flex items-center gap-3">
          {row.image ? (
            <img src={row.image} alt={row.title} className="size-6 rounded-md object-cover" />
          ) : (
            <div className="size-6 rounded-md bg-surface-muted flex items-center justify-center">
              {row.title.slice(0, 2).toUpperCase()}
            </div>
          )}
          <span className="font-medium">{row.title}</span>
        </div>
      ),
    },
    {
      key: 'subtitle',
      header: banners.columns.subtitle,
      hideBelow: 'xl',
      width: 'w-48',
      cell: (row: BannerData) => <span className="block truncate">{row.subtitle || common.dash}</span>,
    },
    {
      key: 'link',
      header: banners.columns.link,
      hideBelow: '2xl',
      width: 'w-40',
      cell: (row: BannerData) => <span className="block truncate">{row.linkUrl || common.dash}</span>,
    },
    {
      key: 'startDate',
      header: banners.columns.startDate,
      hideBelow: 'xl',
      width: 'w-40',
      cell: (row: BannerData) => <span className="text-sm truncate">{row.startAt || common.dash}</span>,
    },
    {
      key: 'endDate',
      header: banners.columns.endDate,
      hideBelow: 'xl',
      width: 'w-40',
      cell: (row: BannerData) => <span className="text-sm truncate">{row.endAt || common.dash}</span>,
    },
    {
      key: 'priority',
      header: banners.columns.priority,
      align: 'center',
      hideBelow: '2xl',
      width: 'w-24',
      numeric: true,
      cell: (row: BannerData) => <span className="block">{row.position}</span>,
    },
    {
      key: 'status',
      header: banners.columns.status,
      align: 'center',
      hideBelow: 'lg',
      width: 'w-32',
      cell: (row: BannerData) => <StatusBadge meta={catalogStatusMeta(row.isActive ? 'ACTIVE' : 'INACTIVE')} />,
    },
  ] as const;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={banners.title}
        description={banners.subtitle}
        action={
          <Button variant="primary" size="sm" onClick={handleAdd}>
            {common.addNew}
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
                placeholder: common.search,
                onChange: setSearch,
              },
              filters: {
                label: common.filters,
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
                  {dashboard.refresh}
                </Button>
              ),
            }}
            actions={{
              header: common.actions,
              render: (row: BannerData) => {
                const items: OptionsMenuItem[] = [
                  { label: common.editExisting, onSelect: () => handleEdit(row) },
                  { label: banners.delete, intent: 'danger', onSelect: () => handleDelete(row) },
                ];
                return (
                  <OptionsMenu label={banners.actionsLabel} items={items} className="flex justify-end" />
                );
              },
            }}
            isLoading={isLoading}
            error={error}
            onRetry={() => void refresh()}
            emptyTitle={banners.empty}
            emptyDescription={banners.emptyFiltered}
            footer={
              <Pagination
                currentPage={data.currentPage || page}
                totalPage={data.totalPage}
                totalRecord={data.totalRecord}
                limit={data.limit || CONTENT_PAGE_SIZE}
                onPageChange={setPage}
              />
            }
          />
        </Card>

        <FilterSheet
          open={filtersOpen}
          title={common.filters}
          onClose={() => setFiltersOpen(false)}
          onReset={resetDraft}
          onDone={applyDraft}
        >
          <FilterGroup label={banners.columns.status}>
            <FilterOption
              key="all"
              label={banners.statuses.all}
              selected={draftIsActive === ''}
              onSelect={() => setDraftIsActive('')}
            />
            <FilterOption
              key="ACTIVE"
              label={banners.statuses.active}
              selected={draftIsActive === 'true'}
              onSelect={() => setDraftIsActive('true')}
            />
            <FilterOption
              key="INACTIVE"
              label={banners.statuses.inactive}
              selected={draftIsActive === 'false'}
              onSelect={() => setDraftIsActive('false')}
            />
          </FilterGroup>
        </FilterSheet>

        <EntityDialog
          open={dialogOpen}
          mode={dialogMode}
          title={dialogMode === 'add' ? banners.title : `Edit ${banners.title}`}
          submitLabel={dialogMode === 'add' ? common.addNew : common.save}
          fields={bannerFields}
          defaultValues={{}}
          isSubmitting={isActioning}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleSubmit}
        />

        <ConfirmDialog
          open={confirmOpen}
          title={banners.delete}
          description={confirmRow ? banners.deleteConfirm.replace('{title}', confirmRow.title) : ''}
          confirmLabel={common.delete}
          isSubmitting={isActioning}
          onConfirm={() => void confirmDelete()}
          onClose={() => setConfirmOpen(false)}
        />
      </PermissionGuard>
    </div>
  );
}

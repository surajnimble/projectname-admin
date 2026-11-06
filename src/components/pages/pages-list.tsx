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
import { useContent } from '@/hooks/use-content';
import type { PageContentData } from '@/lib/api/contract';
import { CONTENT_PAGE_SIZE, PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';
import { RefreshButton } from '@/components/common/refresh-button';

const { pages, common, dashboard } = MESSAGES;

const pageFields = [
  { key: 'title', label: pages.columns.page, type: 'text' as const, required: true },
  { key: 'slug', label: pages.columns.slug, type: 'text' as const },
  { key: 'content', label: pages.columns.content, type: 'textarea' as const },
  { key: 'isPublished', label: pages.columns.published, type: 'switch' as const },
];

export function PagesList() {
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
  } = useContent({ kind: 'pages' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmRow, setConfirmRow] = useState<PageContentData | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftIsPublished, setDraftIsPublished] = useState(filters.isPublished ?? '');
  const activeFilterCount = (search ? 1 : 0) + (filters.isPublished ? 1 : 0);

  const handleAdd = () => {
    setDialogMode('add');
    setEditingId(null);
    setDialogOpen(true);
  };

  const handleEdit = (row: PageContentData) => {
    setDialogMode('edit');
    setEditingId(row.pageId);
    setDialogOpen(true);
  };

  const handleDelete = (row: PageContentData) => {
    setConfirmRow(row);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!confirmRow) return;
    setConfirmOpen(false);
    const id = confirmRow.pageId;
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
    setDraftIsPublished(filters.isPublished ?? '');
    setFiltersOpen(true);
  };

  const resetDraft = () => {
    setDraftIsPublished('');
  };

  const applyDraft = () => {
    setFilters(draftIsPublished ? { isPublished: draftIsPublished } : {});
    setFiltersOpen(false);
  };

  const columns = [
    {
      key: 'page',
      header: pages.columns.page,
      cell: (row: PageContentData) => (
        <div className="flex flex-col gap-1">
          <span className="font-medium">{row.title}</span>
          <span className="text-fg-muted text-sm">{row.slug}</span>
        </div>
      ),
    },
    {
      key: 'slug',
      header: pages.columns.slug,
      hideBelow: 'lg',
      width: 'w-40',
      cell: (row: PageContentData) => <span className="text-sm truncate">{row.slug || common.dash}</span>,
    },
    {
      key: 'publishedDate',
      header: pages.columns.published,
      align: 'center',
      hideBelow: 'xl',
      width: 'w-40',
      cell: (row: PageContentData) => <span className="text-sm truncate">{row.createdAt || common.dash}</span>,
    },
    {
      key: 'status',
      header: pages.columns.status,
      align: 'center',
      hideBelow: 'lg',
      width: 'w-32',
      cell: (row: PageContentData) => <StatusBadge meta={catalogStatusMeta(row.isPublished ? 'ACTIVE' : 'INACTIVE')} />,
    },
  ] as const;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={pages.title}
        description={pages.subtitle}
        action={
          <Button variant="primary" size="sm" onClick={handleAdd}>
            {common.addNew}
          </Button>
        }
      />
      <PermissionGuard permission={PERMISSIONS.pageManage}>
        <Card className="overflow-hidden">
          <DataTable
            columns={columns}
            rows={data.itemList as PageContentData[]}
            rowKey={(row: PageContentData) => row.pageId}
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
                <RefreshButton onRefresh={() => void refresh()} size="sm" label={dashboard.refresh} isRefreshing={isLoading} />
              ),
            }}
            actions={{
              header: common.actions,
              render: (row: PageContentData) => {
                const items: OptionsMenuItem[] = [
                  { label: common.editExisting, onSelect: () => handleEdit(row) },
                  { label: pages.delete, intent: 'danger', onSelect: () => handleDelete(row) },
                ];
                return (
                  <OptionsMenu label={pages.actionsLabel} items={items} className="flex justify-end" />
                );
              },
            }}
            isLoading={isLoading}
            error={error}
            onRetry={() => void refresh()}
            emptyTitle={pages.empty}
            emptyDescription={pages.emptyFiltered}
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
          <FilterGroup label={pages.columns.status}>
            <FilterOption
              key="all"
              label={pages.statuses.all}
              selected={draftIsPublished === ''}
              onSelect={() => setDraftIsPublished('')}
            />
            <FilterOption
              key="PUBLISHED"
              label={pages.statuses.published}
              selected={draftIsPublished === 'true'}
              onSelect={() => setDraftIsPublished('true')}
            />
            <FilterOption
              key="UNPUBLISHED"
              label={pages.statuses.unpublished}
              selected={draftIsPublished === 'false'}
              onSelect={() => setDraftIsPublished('false')}
            />
          </FilterGroup>
        </FilterSheet>

        <EntityDialog
          open={dialogOpen}
          mode={dialogMode}
          title={dialogMode === 'add' ? pages.title : `Edit ${pages.title}`}
          submitLabel={dialogMode === 'add' ? common.addNew : common.save}
          fields={pageFields}
          defaultValues={{}}
          isSubmitting={isActioning}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleSubmit}
        />

        <ConfirmDialog
          open={confirmOpen}
          title={pages.delete}
          description={confirmRow ? pages.deleteConfirm.replace('{title}', confirmRow.title) : ''}
          confirmLabel={common.delete}
          isSubmitting={isActioning}
          onConfirm={() => void confirmDelete()}
          onClose={() => setConfirmOpen(false)}
        />
      </PermissionGuard>
    </div>
  );
}

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
import type { BlogData } from '@/lib/api/contract';
import { CONTENT_PAGE_SIZE, PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';

const { blogs, common, dashboard } = MESSAGES;

const blogFields = [
  { key: 'title', label: blogs.columns.blog, type: 'text' as const, required: true },
  { key: 'slug', label: blogs.columns.slug, type: 'text' as const },
  { key: 'excerpt', label: blogs.columns.excerpt, type: 'textarea' as const },
  { key: 'content', label: blogs.columns.content, type: 'textarea' as const },
  { key: 'isPublished', label: blogs.columns.published, type: 'switch' as const },
];

export function BlogsList() {
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
  } = useContent({ kind: 'blogs' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmRow, setConfirmRow] = useState<BlogData | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftIsPublished, setDraftIsPublished] = useState(filters.isPublished ?? '');
  const activeFilterCount = (search ? 1 : 0) + (filters.isPublished ? 1 : 0);

  const handleAdd = () => {
    setDialogMode('add');
    setEditingId(null);
    setDialogOpen(true);
  };

  const handleEdit = (row: BlogData) => {
    setDialogMode('edit');
    setEditingId(row.blogId);
    setDialogOpen(true);
  };

  const handleDelete = (row: BlogData) => {
    setConfirmRow(row);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!confirmRow) return;
    setConfirmOpen(false);
    const id = confirmRow.blogId;
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
      key: 'blog',
      header: blogs.columns.blog,
      cell: (row: BlogData) => (
        <div className="flex flex-col gap-1">
          <span className="font-medium">{row.title}</span>
          {row.excerpt && <span className="text-fg-muted text-sm">{row.excerpt}</span>}
        </div>
      ),
    },
    {
      key: 'slug',
      header: blogs.columns.slug,
      hideBelow: 'lg',
      width: 'w-40',
      cell: (row: BlogData) => <span className="text-sm truncate">{row.slug || common.dash}</span>,
    },
    {
      key: 'publishedDate',
      header: blogs.columns.published,
      align: 'center',
      hideBelow: 'xl',
      width: 'w-40',
      cell: (row: BlogData) => <span className="text-sm truncate">{row.createdAt || common.dash}</span>,
    },
    {
      key: 'status',
      header: blogs.columns.status,
      align: 'center',
      hideBelow: 'lg',
      width: 'w-32',
      cell: (row: BlogData) => <StatusBadge meta={catalogStatusMeta(row.isPublished ? 'ACTIVE' : 'INACTIVE')} />,
    },
  ] as const;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={blogs.title}
        description={blogs.subtitle}
        action={
          <Button variant="primary" size="sm" onClick={handleAdd}>
            {common.addNew}
          </Button>
        }
      />
      <PermissionGuard permission={PERMISSIONS.blogManage}>
        <Card className="overflow-hidden">
          <DataTable
            columns={columns}
            rows={data.itemList as BlogData[]}
            rowKey={(row: BlogData) => row.blogId}
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
              render: (row: BlogData) => {
                const items: OptionsMenuItem[] = [
                  { label: common.editExisting, onSelect: () => handleEdit(row) },
                  { label: blogs.delete, intent: 'danger', onSelect: () => handleDelete(row) },
                ];
                return (
                  <OptionsMenu label={blogs.actionsLabel} items={items} className="flex justify-end" />
                );
              },
            }}
            isLoading={isLoading}
            error={error}
            onRetry={() => void refresh()}
            emptyTitle={blogs.empty}
            emptyDescription={blogs.emptyFiltered}
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
          <FilterGroup label={blogs.columns.status}>
            <FilterOption
              key="all"
              label={blogs.statuses.all}
              selected={draftIsPublished === ''}
              onSelect={() => setDraftIsPublished('')}
            />
            <FilterOption
              key="PUBLISHED"
              label={blogs.statuses.published}
              selected={draftIsPublished === 'true'}
              onSelect={() => setDraftIsPublished('true')}
            />
            <FilterOption
              key="UNPUBLISHED"
              label={blogs.statuses.unpublished}
              selected={draftIsPublished === 'false'}
              onSelect={() => setDraftIsPublished('false')}
            />
          </FilterGroup>
        </FilterSheet>

        <EntityDialog
          open={dialogOpen}
          mode={dialogMode}
          title={dialogMode === 'add' ? blogs.title : `Edit ${blogs.title}`}
          submitLabel={dialogMode === 'add' ? common.addNew : common.save}
          fields={blogFields}
          defaultValues={{}}
          isSubmitting={isActioning}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleSubmit}
        />

        <ConfirmDialog
          open={confirmOpen}
          title={blogs.delete}
          description={confirmRow ? blogs.deleteConfirm.replace('{title}', confirmRow.title) : ''}
          confirmLabel={common.delete}
          isSubmitting={isActioning}
          onConfirm={() => void confirmDelete()}
          onClose={() => setConfirmOpen(false)}
        />
      </PermissionGuard>
    </div>
  );
}

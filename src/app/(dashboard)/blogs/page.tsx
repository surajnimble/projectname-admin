'use client';

import type { Metadata } from 'next';
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
import { StatusBadge, contentStatusMeta } from '@/components/common/status-badge';
import { EntityDialog } from '@/components/common/entity-dialog';
import { useContent } from '@/hooks/use-content';
import type { BlogData } from '@/lib/api/contract';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';

export const metadata: Metadata = { title: 'Blogs' };

export default function BlogsPage() {
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
  const [draftTag, setDraftTag] = useState(filters.tag ?? '');

  const blogFields = [
    { key: 'title', label: MESSAGES.blogs.columns.blog, type: 'text' as const, required: true },
    { key: 'slug', label: 'Slug', type: 'text' as const, placeholder: 'auto-generated from title' },
    { key: 'excerpt', label: 'Excerpt', type: 'textarea' as const },
    { key: 'content', label: 'Content', type: 'textarea' as const },
    { key: 'isPublished', label: 'Published', type: 'switch' as const },
  ];

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

  const activeFilterCount = (search ? 1 : 0) + (filters.isPublished ? 1 : 0) + (filters.tag ? 1 : 0);

  const openFilters = () => {
    setDraftIsPublished(filters.isPublished ?? '');
    setDraftTag(filters.tag ?? '');
    setFiltersOpen(true);
  };

  const resetFilters = () => {
    setDraftIsPublished('');
    setDraftTag('');
  };

  const applyFilters = () => {
    setFilters({
      ...(draftIsPublished ? { isPublished: draftIsPublished } : {}),
      ...(draftTag ? { tag: draftTag } : {}),
    });
    setFiltersOpen(false);
  };

  const columns = [
    {
      key: 'blog',
      header: MESSAGES.blogs.columns.blog,
      cell: (row: BlogData) => <span className="font-medium">{row.title}</span>,
    },
    {
      key: 'slug',
      header: MESSAGES.blogs.columns.slug,
      hideBelow: 'lg',
      width: 'w-40',
      cell: (row: BlogData) => <span className="text-sm truncate">{row.slug}</span>,
    },
    {
      key: 'excerpt',
      header: MESSAGES.blogs.columns.excerpt,
      hideBelow: 'xl',
      width: 'w-64',
      cell: (row: BlogData) => <span className="block truncate">{row.excerpt}</span>,
    },
    {
      key: 'status',
      header: MESSAGES.blogs.columns.status,
      align: 'center',
      hideBelow: 'lg',
      width: 'w-32',
      cell: (row: BlogData) => <StatusBadge meta={contentStatusMeta(row.isPublished ? 'PUBLISHED' : 'UNPUBLISHED')} />,
    },
  ] as const;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={MESSAGES.sections.blogs}
        description={MESSAGES.blogs.subtitle}
        action={
          <Button variant="primary" size="sm" onClick={handleAdd}>
            {MESSAGES.common.addNew}
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
              render: (row: BlogData) => {
                const items: OptionsMenuItem[] = [
                  {
                    label: 'Edit',
                    onSelect: () => handleEdit(row),
                  },
                  {
                    label: MESSAGES.blogs.delete,
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
            emptyTitle={MESSAGES.blogs.empty}
            emptyDescription={MESSAGES.blogs.emptyFiltered}
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
          <FilterGroup label={MESSAGES.blogs.columns.status}>
            <FilterOption
              key="all"
              label={MESSAGES.blogs.statuses.all ?? 'All'}
              selected={draftIsPublished === ''}
              onSelect={() => setDraftIsPublished('')}
            />
            <FilterOption
              key="PUBLISHED"
              label={MESSAGES.blogs.statuses.published}
              selected={draftIsPublished === 'true'}
              onSelect={() => setDraftIsPublished('true')}
            />
            <FilterOption
              key="UNPUBLISHED"
              label={MESSAGES.blogs.statuses.unpublished}
              selected={draftIsPublished === 'false'}
              onSelect={() => setDraftIsPublished('false')}
            />
          </FilterGroup>
          <FilterGroup label="Tag">
            <Input
              value={draftTag}
              onChange={(event) => setDraftTag(event.target.value)}
              placeholder="Filter by tag..."
            />
          </FilterGroup>
        </FilterSheet>

        <EntityDialog
          open={dialogOpen}
          mode={dialogMode}
          title={dialogMode === 'add' ? MESSAGES.common.addNew : 'Edit Blog'}
          submitLabel={dialogMode === 'add' ? 'Create' : 'Save'}
          fields={blogFields}
          defaultValues={{}}
          isSubmitting={isActioning}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleSubmit}
        />

        <Dialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          title={MESSAGES.blogs.delete}
          description={confirmRow ? MESSAGES.blogs.deleteConfirm.replace('{title}', confirmRow.title) : ''}
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

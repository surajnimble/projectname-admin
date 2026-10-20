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
import { StatusBadge, contentStatusMeta } from '@/components/common/status-badge';
import { EntityDialog } from '@/components/common/entity-dialog';
import { useContent } from '@/hooks/use-content';
import type { PageContentData } from '@/lib/api/contract';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';

export default function ClientPagesPage() {
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

  const pageFields = [
    { key: 'title', label: MESSAGES.pages.columns.page, type: 'text' as const, required: true },
    { key: 'slug', label: 'Slug', type: 'text' as const, placeholder: 'auto-generated from title' },
    { key: 'content', label: 'Content', type: 'textarea' as const },
    { key: 'isPublished', label: 'Published', type: 'switch' as const },
  ];

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

  const activeFilterCount = (search ? 1 : 0) + (filters.isPublished ? 1 : 0);

  const openFilters = () => {
    setDraftIsPublished(filters.isPublished ?? '');
    setFiltersOpen(true);
  };

  const resetFilters = () => {
    setDraftIsPublished('');
  };

  const applyFilters = () => {
    setFilters(draftIsPublished ? { isPublished: draftIsPublished } : {});
    setFiltersOpen(false);
  };

  const columns = [
    {
      key: 'page',
      header: MESSAGES.pages.columns.page,
      cell: (row: PageContentData) => <span className="font-medium">{row.title}</span>,
    },
    {
      key: 'slug',
      header: MESSAGES.pages.columns.slug,
      hideBelow: 'lg',
      width: 'w-40',
      cell: (row: PageContentData) => <span className="text-sm truncate">{row.slug}</span>,
    },
    {
      key: 'content',
      header: MESSAGES.pages.columns.content,
      hideBelow: 'xl',
      width: 'w-64',
      cell: (row: PageContentData) => (
        <span className="block truncate">{row.content?.slice(0, 60)}...</span>
      ),
    },
    {
      key: 'status',
      header: MESSAGES.pages.columns.status,
      align: 'center',
      hideBelow: 'lg',
      width: 'w-32',
      cell: (row: PageContentData) => <StatusBadge meta={contentStatusMeta(row.isPublished ? 'PUBLISHED' : 'UNPUBLISHED')} />,
    },
  ] as const;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={MESSAGES.sections.pages}
        description={MESSAGES.pages.subtitle}
        action={
          <Button variant="primary" size="sm" onClick={handleAdd}>
            {MESSAGES.common.addNew}
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
              render: (row: PageContentData) => {
                const items: OptionsMenuItem[] = [
                  {
                    label: 'Edit',
                    onSelect: () => handleEdit(row),
                  },
                  {
                    label: MESSAGES.pages.delete,
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
            emptyTitle={MESSAGES.pages.empty}
            emptyDescription={MESSAGES.pages.emptyFiltered}
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
          <FilterGroup label={MESSAGES.pages.columns.status}>
            <FilterOption
              key="all"
              label={MESSAGES.pages.statuses.all ?? 'All'}
              selected={draftIsPublished === ''}
              onSelect={() => setDraftIsPublished('')}
            />
            <FilterOption
              key="PUBLISHED"
              label={MESSAGES.pages.statuses.published}
              selected={draftIsPublished === 'true'}
              onSelect={() => setDraftIsPublished('true')}
            />
            <FilterOption
              key="UNPUBLISHED"
              label={MESSAGES.pages.statuses.unpublished}
              selected={draftIsPublished === 'false'}
              onSelect={() => setDraftIsPublished('false')}
            />
          </FilterGroup>
        </FilterSheet>

        <EntityDialog
          open={dialogOpen}
          mode={dialogMode}
          title={dialogMode === 'add' ? MESSAGES.common.addNew : 'Edit Page'}
          submitLabel={dialogMode === 'add' ? 'Create' : 'Save'}
          fields={pageFields}
          defaultValues={{}}
          isSubmitting={isActioning}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleSubmit}
        />

        <Dialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          title={MESSAGES.pages.delete}
          description={confirmRow ? MESSAGES.pages.deleteConfirm.replace('{title}', confirmRow.title) : ''}
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

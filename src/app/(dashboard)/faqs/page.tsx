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
import { StatusBadge, contentStatusMeta } from '@/components/common/status-badge';
import { EntityDialog } from '@/components/common/entity-dialog';
import { useContent } from '@/hooks/use-content';
import type { FaqData } from '@/lib/api/contract';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';

export default function FaqsPage() {
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
  } = useContent({ kind: 'faqs' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmRow, setConfirmRow] = useState<FaqData | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftCategory, setDraftCategory] = useState(filters.category ?? '');
  const [draftIsActive, setDraftIsActive] = useState(filters.isActive ?? '');

  const faqFields = [
    { key: 'question', label: MESSAGES.faqs.columns.faq, type: 'text' as const, required: true },
    { key: 'answer', label: MESSAGES.faqs.columns.answer, type: 'textarea' as const, required: true },
    { key: 'sortOrder', label: 'Sort Order', type: 'number' as const, placeholder: '0' },
    { key: 'isPublished', label: 'Published', type: 'switch' as const },
  ];

  const handleAdd = () => {
    setDialogMode('add');
    setEditingId(null);
    setDialogOpen(true);
  };

  const handleEdit = (row: FaqData) => {
    setDialogMode('edit');
    setEditingId(row.faqId);
    setDialogOpen(true);
  };

  const handleDelete = (row: FaqData) => {
    setConfirmRow(row);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!confirmRow) return;
    setConfirmOpen(false);
    const id = confirmRow.faqId;
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

  const activeFilterCount = (search ? 1 : 0) + (filters.category ? 1 : 0) + (filters.isActive ? 1 : 0);

  const openFilters = () => {
    setDraftCategory(filters.category ?? '');
    setDraftIsActive(filters.isActive ?? '');
    setFiltersOpen(true);
  };

  const resetFilters = () => {
    setDraftCategory('');
    setDraftIsActive('');
  };

  const applyFilters = () => {
    setFilters({
      ...(draftCategory ? { category: draftCategory } : {}),
      ...(draftIsActive ? { isActive: draftIsActive } : {}),
    });
    setFiltersOpen(false);
  };

  const columns = [
    {
      key: 'faq',
      header: MESSAGES.faqs.columns.faq,
      cell: (row: FaqData) => <span className="font-medium">{row.question}</span>,
    },
    {
      key: 'answer',
      header: MESSAGES.faqs.columns.answer,
      hideBelow: 'xl',
      width: 'w-64',
      cell: (row: FaqData) => <span className="block truncate">{row.answer}</span>,
    },
    {
      key: 'category',
      header: MESSAGES.faqs.columns.category,
      hideBelow: 'xl',
      width: 'w-32',
      cell: (row: FaqData) => <span className="block truncate">{row.category || '\u2014'}</span>,
    },
    {
      key: 'sortOrder',
      header: 'Sort Order',
      align: 'center',
      hideBelow: '2xl',
      width: 'w-24',
      numeric: true,
      cell: (row: FaqData) => <span className="block">{row.sortOrder}</span>,
    },
    {
      key: 'status',
      header: MESSAGES.faqs.columns.status,
      align: 'center',
      hideBelow: 'lg',
      width: 'w-32',
      cell: (row: FaqData) => <StatusBadge meta={contentStatusMeta(row.isPublished ? 'PUBLISHED' : 'UNPUBLISHED')} />,
    },
  ] as const;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={MESSAGES.sections.faqs}
        description={MESSAGES.faqs.subtitle}
        action={
          <Button variant="primary" size="sm" onClick={handleAdd}>
            {MESSAGES.common.addNew}
          </Button>
        }
      />
      <PermissionGuard permission={PERMISSIONS.faqManage}>
        <Card className="overflow-hidden">
          <DataTable
            columns={columns}
            rows={data.itemList as FaqData[]}
            rowKey={(row: FaqData) => row.faqId}
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
              render: (row: FaqData) => {
                const items: OptionsMenuItem[] = [
                  {
                    label: 'Edit',
                    onSelect: () => handleEdit(row),
                  },
                  {
                    label: MESSAGES.faqs.delete,
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
            emptyTitle={MESSAGES.faqs.empty}
            emptyDescription={MESSAGES.faqs.emptyFiltered}
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
          <FilterGroup label="Category">
            <Input
              value={draftCategory}
              onChange={(event) => setDraftCategory(event.target.value)}
              placeholder="Filter by category..."
            />
          </FilterGroup>
          <FilterGroup label={MESSAGES.faqs.columns.status}>
            <FilterOption
              key="all"
              label={MESSAGES.faqs.statuses.all ?? 'All'}
              selected={draftIsActive === ''}
              onSelect={() => setDraftIsActive('')}
            />
            <FilterOption
              key="PUBLISHED"
              label={MESSAGES.faqs.statuses.published}
              selected={draftIsActive === 'true'}
              onSelect={() => setDraftIsActive('true')}
            />
            <FilterOption
              key="UNPUBLISHED"
              label={MESSAGES.faqs.statuses.unpublished}
              selected={draftIsActive === 'false'}
              onSelect={() => setDraftIsActive('false')}
            />
          </FilterGroup>
        </FilterSheet>

        <EntityDialog
          open={dialogOpen}
          mode={dialogMode}
          title={dialogMode === 'add' ? MESSAGES.common.addNew : 'Edit FAQ'}
          submitLabel={dialogMode === 'add' ? 'Create' : 'Save'}
          fields={faqFields}
          defaultValues={{}}
          isSubmitting={isActioning}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleSubmit}
        />

        <Dialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          title={MESSAGES.faqs.delete}
          description={confirmRow ? MESSAGES.faqs.deleteConfirm.replace('{question}', confirmRow.question) : ''}
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

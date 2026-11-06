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
import type { FaqData } from '@/lib/api/contract';
import { CONTENT_PAGE_SIZE, PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';
import { RefreshButton } from '@/components/common/refresh-button';

const { faqs, common, dashboard } = MESSAGES;

const faqFields = [
  { key: 'question', label: faqs.columns.faq, type: 'text' as const, required: true },
  { key: 'answer', label: faqs.columns.answer, type: 'textarea' as const, required: true },
  { key: 'sortOrder', label: faqs.columns.sortOrder, type: 'number' as const },
  { key: 'isPublished', label: faqs.columns.published, type: 'switch' as const },
];

export function FaqsList() {
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
  const [draftIsActive, setDraftIsActive] = useState(filters.isActive ?? '');
  const activeFilterCount = (search ? 1 : 0) + (filters.isActive ? 1 : 0);

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
      key: 'faq',
      header: faqs.columns.faq,
      cell: (row: FaqData) => <span className="font-medium">{row.question}</span>,
    },
    {
      key: 'category',
      header: faqs.columns.category,
      hideBelow: 'xl',
      width: 'w-32',
      cell: (row: FaqData) => <span className="block truncate">{row.category || common.dash}</span>,
    },
    {
      key: 'answer',
      header: faqs.columns.answer,
      hideBelow: 'xl',
      width: 'w-64',
      cell: (row: FaqData) => <span className="block truncate">{row.answer}</span>,
    },
    {
      key: 'sortOrder',
      header: faqs.columns.sortOrder,
      align: 'center',
      hideBelow: '2xl',
      width: 'w-24',
      numeric: true,
      cell: (row: FaqData) => <span className="block">{row.sortOrder}</span>,
    },
    {
      key: 'status',
      header: faqs.columns.status,
      align: 'center',
      hideBelow: 'lg',
      width: 'w-32',
      cell: (row: FaqData) => <StatusBadge meta={catalogStatusMeta(row.isPublished ? 'ACTIVE' : 'INACTIVE')} />,
    },
  ] as const;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={faqs.title}
        description={faqs.subtitle}
        action={
          <Button variant="primary" size="sm" onClick={handleAdd}>
            {common.addNew}
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
              render: (row: FaqData) => {
                const items: OptionsMenuItem[] = [
                  { label: common.editExisting, onSelect: () => handleEdit(row) },
                  { label: faqs.delete, intent: 'danger', onSelect: () => handleDelete(row) },
                ];
                return (
                  <OptionsMenu label={faqs.actionsLabel} items={items} className="flex justify-end" />
                );
              },
            }}
            isLoading={isLoading}
            error={error}
            onRetry={() => void refresh()}
            emptyTitle={faqs.empty}
            emptyDescription={faqs.emptyFiltered}
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
          <FilterGroup label={faqs.columns.status}>
            <FilterOption
              key="all"
              label={faqs.statuses.all}
              selected={draftIsActive === ''}
              onSelect={() => setDraftIsActive('')}
            />
            <FilterOption
              key="PUBLISHED"
              label={faqs.statuses.published}
              selected={draftIsActive === 'true'}
              onSelect={() => setDraftIsActive('true')}
            />
            <FilterOption
              key="UNPUBLISHED"
              label={faqs.statuses.unpublished}
              selected={draftIsActive === 'false'}
              onSelect={() => setDraftIsActive('false')}
            />
          </FilterGroup>
        </FilterSheet>

        <EntityDialog
          open={dialogOpen}
          mode={dialogMode}
          title={dialogMode === 'add' ? faqs.title : `Edit ${faqs.title}`}
          submitLabel={dialogMode === 'add' ? common.addNew : common.save}
          fields={faqFields}
          defaultValues={{}}
          isSubmitting={isActioning}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleSubmit}
        />

        <ConfirmDialog
          open={confirmOpen}
          title={faqs.delete}
          description={confirmRow ? faqs.deleteConfirm.replace('{question}', confirmRow.question) : ''}
          confirmLabel={common.delete}
          isSubmitting={isActioning}
          onConfirm={() => void confirmDelete()}
          onClose={() => setConfirmOpen(false)}
        />
      </PermissionGuard>
    </div>
  );
}

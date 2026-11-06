'use client';

import { useMemo, useState } from 'react';

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
import { useQuestions } from '@/hooks/use-questions';
import type { QuestionData } from '@/lib/api/contract';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';
import { RefreshButton } from '@/components/common/refresh-button';

const { questions, common } = MESSAGES;

export function QuestionList() {
  const {
    data,
    isLoading,
    error,
    actionError,
    isActioning,
    page,
    search,
    setPage,
    setSearch,
    setFilters,
    refresh,
    approveQuestion,
    deleteQuestion,
    answerQuestion,
  } = useQuestions();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'answer'>('answer');
  const [questionId, setQuestionId] = useState<string | null>(null);
  const [defaultValues, setDefaultValues] = useState<Record<string, unknown>>({});
  const [dialogKey, setDialogKey] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftStatus, setDraftStatus] = useState<'all' | string>('all');
  const activeFilterCount = useMemo(() => (search ? 1 : 0) + (draftStatus !== 'all' ? 1 : 0), [search, draftStatus]);

  const statusOptions = useMemo(
    () =>
      Object.entries(questions.statuses)
        .filter(([key]) => key !== 'all')
        .map(([value, label]) => ({ label, value })),
    [],
  );

  const handleApprove = (id: string) => {
    void approveQuestion(id);
  };

  const handleAnswer = (id: string) => {
    setDialogMode('answer');
    setQuestionId(id);
    setDefaultValues({ answer: '' });
    setDialogKey((k) => k + 1);
    setDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!confirmId) return;
    setConfirmOpen(false);
    const id = confirmId;
    setConfirmId(null);
    await deleteQuestion(id);
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    if (!questionId) return;
    let ok = false;
    if (dialogMode === 'answer') {
      ok = await answerQuestion(questionId, String(values.answer).trim());
    }
    if (ok) setDialogOpen(false);
  };

  const openFilters = () => setFiltersOpen(true);
  const resetDraft = () => setDraftStatus('all');
  const applyDraft = () => {
    setFilters(draftStatus === 'all' ? {} : { status: String(draftStatus) });
    setFiltersOpen(false);
  };

  const columns = [
    {
      key: 'question',
      header: questions.columns.question,
      cell: (row: QuestionData) => <span className="font-medium">{row.question}</span>,
    },
    {
      key: 'product',
      header: questions.columns.product,
      hideBelow: 'lg',
      width: 'w-40',
      cell: (row: QuestionData) => <span className="text-sm truncate">{row.productName}</span>,
    },
    {
      key: 'customer',
      header: questions.columns.customer,
      hideBelow: 'xl',
      width: 'w-40',
      cell: (row: QuestionData) => <span className="text-sm truncate">{row.userName}</span>,
    },
    {
      key: 'status',
      header: questions.columns.status,
      align: 'center',
      hideBelow: 'lg',
      width: 'w-32',
      cell: (row: QuestionData) =>
        <StatusBadge meta={catalogStatusMeta(row.isApproved ? 'APPROVED' : 'PENDING')} />,
    },
    {
      key: 'actions',
      header: common.actions,
      align: 'center',
      width: 'w-32',
      cell: () => null,
    },
  ] as const;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={questions.title}
        description={questions.subtitle}
      />
      <PermissionGuard permission={PERMISSIONS.questionManage}>
        <Card className="overflow-hidden">
          <DataTable
            columns={columns}
            rows={data.itemList}
            rowKey={(row: QuestionData) => row.questionId}
            toolbar={{
              search: {
                value: search,
                placeholder: questions.searchPlaceholder,
                onChange: setSearch,
              },
              filters: {
                label: common.filters,
                count: activeFilterCount,
                onOpen: openFilters,
              },
              actions: (
                <RefreshButton onRefresh={() => void refresh()} size="sm" label={MESSAGES.dashboard.refresh} isRefreshing={isLoading} />
              ),
            }}
            actions={{
              header: common.actions,
              render: (row: QuestionData) => {
                const items: OptionsMenuItem[] = [
                  {
                    label: row.isApproved ? common.reject : common.approve,
                    onSelect: row.isApproved
                      ? () => { setConfirmId(row.questionId); setConfirmOpen(true); }
                      : () => handleApprove(row.questionId),
                  },
                  { label: questions.answer, onSelect: () => handleAnswer(row.questionId) },
                ];
                return (
                  <OptionsMenu label={questions.actionsLabel} items={items} className="flex justify-end" />
                );
              },
            }}
            isLoading={isLoading}
            error={error}
            onRetry={() => void refresh()}
            emptyTitle={questions.empty}
            emptyDescription={activeFilterCount > 0 ? questions.emptyFiltered : undefined}
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

        {actionError && <div className="p-4 text-destructive text-sm">{actionError}</div>}

        <FilterSheet
          open={filtersOpen}
          title={common.filters}
          onClose={() => setFiltersOpen(false)}
          onReset={resetDraft}
          onDone={applyDraft}
        >
          <FilterGroup label={questions.columns.status}>
            <FilterOption
              key="all"
              label={questions.statuses.all}
              selected={draftStatus === 'all'}
              onSelect={() => setDraftStatus('all')}
            />
            {statusOptions.map((option) => (
              <FilterOption
                key={option.value}
                label={option.label}
                selected={draftStatus === option.value}
                onSelect={() => setDraftStatus(option.value as 'all' | string)}
              />
            ))}
          </FilterGroup>
        </FilterSheet>

        <EntityDialog
          open={dialogOpen}
          mode="add"
          title={questions.answerTitle}
          submitLabel={questions.answer}
          fields={[{ key: 'answer', label: questions.answer, type: 'textarea' as const, required: true }]}
          defaultValues={defaultValues}
          key={dialogKey}
          isSubmitting={isActioning}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleSubmit}
        />

        <ConfirmDialog
          open={confirmOpen}
          title={common.delete}
          description={confirmId ? questions.deleteConfirm : ''}
          confirmLabel={common.delete}
          isSubmitting={isActioning}
          onConfirm={() => void confirmDelete()}
          onClose={() => setConfirmOpen(false)}
        />
      </PermissionGuard>
    </div>
  );
}

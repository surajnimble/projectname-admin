'use client';

import type { Metadata } from 'next';
import { useState } from 'react';
import { PermissionGuard } from '@/components/auth/guards';
import { PageHeader } from '@/components/common/page-header';
import { DataTable } from '@/components/common/data-table';
import type { DataTableColumn } from '@/components/common/data-table';
import { Pagination } from '@/components/common/pagination';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { OptionsMenu, type OptionsMenuItem } from '@/components/ui/options-menu';
import { StatusBadge } from '@/components/common/status-badge';
import type { QuestionListData } from '@/lib/api/contract';
import { useQuestions } from '@/hooks/use-questions';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';

export const metadata: Metadata = { title: 'Product Questions' };

export default function QuestionsPage() {
  const {
    data,
    isLoading,
    error,
    page,
    search,
    setPage,
    setSearch,
    setFilters,
    filters,
    refresh,
    approveQuestion,
    deleteQuestion,
    answerQuestion,
    isActioning,
  } = useQuestions();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'approve' | 'delete' | 'answer'>('approve');
  const [questionId, setQuestionId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');

  const filterStatus = filters.status || 'all';
  const activeFilterCount = (search ? 1 : 0) + (filterStatus !== 'all' ? 1 : 0);

  const handleApprove = (id: string) => {
    setQuestionId(id);
    setDialogMode('approve');
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setQuestionId(id);
    setDialogMode('delete');
    setDialogOpen(true);
  };

  const handleAnswer = (id: string) => {
    setQuestionId(id);
    setDialogMode('answer');
    setDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!questionId) return;
    setConfirmOpen(false);
    const id = questionId;
    setQuestionId(null);
    await deleteQuestion(id);
  };

  const handleSubmit = async () => {
    if (!questionId) return;
    let ok = false;
    if (dialogMode === 'approve') {
      ok = await approveQuestion(questionId);
    } else if (dialogMode === 'answer') {
      ok = await answerQuestion(questionId, answerText);
      if (ok) setAnswerText('');
    }
    if (ok) setDialogOpen(false);
  };

  const columns: DataTableColumn<QuestionListData['itemList'][number]>[] = [
    {
      key: 'question',
      header: MESSAGES.questions.question,
      cell: (row) => <span className="font-medium">{row.question}</span>,
    },
    {
      key: 'product',
      header: 'Product',
      hideBelow: 'lg',
      width: 'w-40',
      cell: (row) => <span className="text-sm truncate">{row.productName}</span>,
    },
    {
      key: 'customer',
      header: 'Customer',
      hideBelow: 'xl',
      width: 'w-40',
      cell: (row) => <span className="text-sm truncate">{row.userName}</span>,
    },
    {
      key: 'status',
      header: MESSAGES.reviews.columns.status,
      align: 'center',
      hideBelow: 'lg',
      width: 'w-32',
      cell: (row) => (
        <StatusBadge
          meta={{
            label: row.isApproved ? 'Approved' : 'Pending',
            intent: row.isApproved ? 'success' : 'warning',
          }}
        />
      ),
    },
    {
      key: 'actions',
      header: MESSAGES.common.actions,
      align: 'center',
      cell: (row) => {
        const items: OptionsMenuItem[] = [
          {
            label: row.isApproved ? 'Reject' : 'Approve',
            onSelect: row.isApproved ? () => deleteQuestion(row.questionId) : () => handleApprove(row.questionId),
          },
          {
            label: 'Answer',
            onSelect: () => handleAnswer(row.questionId),
          },
          {
            label: 'Delete',
            intent: 'danger',
            onSelect: () => handleDelete(row.questionId),
          },
        ];
        return (
          <OptionsMenu label={MESSAGES.common.actions} items={items} className="flex justify-end" />
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={MESSAGES.sections.questions}
        description={MESSAGES.questions.subtitle}
      />
      <PermissionGuard permission={PERMISSIONS.reviewModerate}>
        <Card className="overflow-hidden">
          <DataTable
            columns={columns}
            rows={data.itemList}
            rowKey={(row) => row.questionId}
            toolbar={{
              search: {
                value: search,
                placeholder: MESSAGES.questions.searchPlaceholder,
                onChange: setSearch,
              },
              filters: {
                label: MESSAGES.common.filters,
                count: activeFilterCount,
                onOpen: () => {},
              },
              actions: (
                <Button variant="outline" size="sm" loading={isLoading} onClick={() => void refresh()}>
                  {MESSAGES.dashboard.refresh}
                </Button>
              ),
            }}
            actions={{
              header: MESSAGES.common.actions,
              render: (row) => {
                const items: OptionsMenuItem[] = [
                  {
                    label: row.isApproved ? MESSAGES.common.reject : MESSAGES.common.approve,
                    onSelect: row.isApproved ? () => deleteQuestion(row.questionId) : () => handleApprove(row.questionId),
                  },
                  {
                    label: MESSAGES.questions.answer,
                    onSelect: () => handleAnswer(row.questionId),
                  },
                  {
                    label: MESSAGES.common.delete,
                    intent: 'danger',
                    onSelect: () => handleDelete(row.questionId),
                  },
                ];
                return <OptionsMenu label={MESSAGES.common.actions} items={items} className="flex justify-end" />;
              },
            }}
            isLoading={isLoading}
            error={error}
            onRetry={() => void refresh()}
            emptyTitle={MESSAGES.questions.empty}
            emptyDescription={MESSAGES.questions.emptyFiltered}
            footer={
              <Pagination
                currentPage={data.currentPage}
                totalPage={data.totalPage}
                totalRecord={data.totalRecord}
                limit={data.limit}
                onPageChange={setPage}
              />
            }
          />
        </Card>

        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          title={
            dialogMode === 'approve'
              ? MESSAGES.reviews.approveTitle
              : dialogMode === 'delete'
                ? 'Delete Question'
                : 'Answer Question'
          }
          description={
            dialogMode === 'approve'
              ? MESSAGES.reviews.approveDescription
              : dialogMode === 'delete'
                ? 'Are you sure you want to delete this question?'
                : 'Write an answer to the customer.'
          }
          closeLabel={MESSAGES.common.cancel}
          footer={
            <>
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isActioning}>
                {MESSAGES.common.cancel}
              </Button>
              <Button variant="primary" onClick={() => void handleSubmit()} disabled={isActioning} loading={isActioning}>
                {dialogMode === 'approve' ? 'Approve' : dialogMode === 'delete' ? 'Delete' : 'Answer'}
              </Button>
            </>
          }
        >
          {dialogMode === 'answer' && (
            <div className="flex flex-col gap-3 p-4">
              <label className="text-sm text-fg font-medium">Answer</label>
              <textarea
                className="border border-input rounded-md px-3 py-2 text-sm w-full"
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                rows={4}
                placeholder="Type your answer..."
              />
            </div>
          )}
        </Dialog>

        <Dialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          title='Delete Question'
          description={`Are you sure you want to delete this question?`}
          closeLabel={MESSAGES.common.cancel}
          footer={
            <>
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isActioning}>
                {MESSAGES.common.cancel}
              </Button>
              <Button variant="destructive" onClick={() => void handleConfirmDelete()} disabled={isActioning} loading={isActioning}>
                Delete
              </Button>
            </>
          }
        />
      </PermissionGuard>
    </div>
  );
}

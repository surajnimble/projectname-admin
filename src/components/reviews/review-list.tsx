'use client';

import { useMemo, useState } from 'react';

import { PageHeader } from '@/components/common/page-header';
import { DataTable } from '@/components/common/data-table';
import { FilterGroup, FilterOption, FilterSheet } from '@/components/common/filter-sheet';
import { Pagination } from '@/components/common/pagination';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EntityDialog } from '@/components/common/entity-dialog';
import { OptionsMenu, type OptionsMenuItem } from '@/components/ui/options-menu';
import { StatusBadge, catalogStatusMeta } from '@/components/common/status-badge';
import { PermissionGuard } from '@/components/auth/guards';
import { useReviews } from '@/hooks/use-reviews';
import type { ReviewData } from '@/lib/api/contract';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';
import { RefreshButton } from '@/components/common/refresh-button';

const { reviews, common } = MESSAGES;

export function ReviewList() {
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
    approveReview,
    rejectReview,
    replyReview,
  } = useReviews();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'reject' | 'reply'>('reject');
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [defaultValues, setDefaultValues] = useState<Record<string, unknown>>({});
  const [dialogKey, setDialogKey] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftStatus, setDraftStatus] = useState<'all' | string>('all');
  const activeFilterCount = useMemo(() => (search ? 1 : 0) + (draftStatus !== 'all' ? 1 : 0), [search, draftStatus]);

  const statusOptions = useMemo(
    () =>
      Object.entries(reviews.statuses)
        .filter(([key]) => key !== 'all')
        .map(([value, label]) => ({ label, value })),
    [],
  );

  const handleApprove = (id: string) => {
    void approveReview(id);
  };

  const handleReject = (id: string) => {
    setDialogMode('reject');
    setReviewId(id);
    setDefaultValues({ reason: '' });
    setDialogKey((k) => k + 1);
    setDialogOpen(true);
  };

  const handleReply = (id: string) => {
    setDialogMode('reply');
    setReviewId(id);
    setDefaultValues({ reply: '' });
    setDialogKey((k) => k + 1);
    setDialogOpen(true);
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    if (!reviewId) return;
    let ok = false;
    if (dialogMode === 'reject') {
      ok = await rejectReview(reviewId, String(values.reason).trim() || undefined);
    } else if (dialogMode === 'reply') {
      ok = await replyReview(reviewId, String(values.reply).trim());
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
      key: 'review',
      header: reviews.columns.review,
      cell: (row: ReviewData) => <span className="font-medium">{row.title || row.comment.slice(0, 50)}</span>,
    },
    {
      key: 'product',
      header: reviews.columns.product,
      hideBelow: 'lg',
      width: 'w-40',
      cell: (row: ReviewData) => <span className="text-sm truncate">{row.productName}</span>,
    },
    {
      key: 'customer',
      header: reviews.columns.customer,
      hideBelow: 'xl',
      width: 'w-40',
      cell: (row: ReviewData) => <span className="text-sm truncate">{row.userName}</span>,
    },
    {
      key: 'rating',
      header: reviews.columns.rating,
      align: 'center',
      hideBelow: 'lg',
      width: 'w-24',
      cell: (row: ReviewData) => (
        <span className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <span key={star} className={`text-xs ${star <= row.rating ? 'text-warning' : 'text-fg-muted'}`}>
              ★
            </span>
          ))}
        </span>
      ),
    },
    {
      key: 'status',
      header: reviews.columns.status,
      align: 'center',
      hideBelow: 'lg',
      width: 'w-32',
      cell: (row: ReviewData) =>
        <StatusBadge
          meta={catalogStatusMeta(row.isApproved ? 'APPROVED' : row.isRejected ? 'REJECTED' : 'PENDING')}
        />,
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
        title={reviews.title}
        description={reviews.subtitle}
      />
      <PermissionGuard permission={PERMISSIONS.reviewManage}>
        <Card className="overflow-hidden">
          <DataTable
            columns={columns}
            rows={data.itemList}
            rowKey={(row: ReviewData) => row.reviewId}
            toolbar={{
              search: {
                value: search,
                placeholder: reviews.searchPlaceholder,
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
              render: (row: ReviewData) => {
                const items: OptionsMenuItem[] = [
                  {
                    label: row.isApproved ? common.reject : common.approve,
                    onSelect: row.isApproved ? () => handleReject(row.reviewId) : () => handleApprove(row.reviewId),
                  },
                  { label: reviews.reply, onSelect: () => handleReply(row.reviewId) },
                ];
                return (
                  <OptionsMenu label={reviews.actionsLabel} items={items} className="flex justify-end" />
                );
              },
            }}
            isLoading={isLoading}
            error={error}
            onRetry={() => void refresh()}
            emptyTitle={reviews.empty}
            emptyDescription={activeFilterCount > 0 ? reviews.emptyFiltered : undefined}
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
          <FilterGroup label={reviews.columns.status}>
            <FilterOption
              key="all"
              label={reviews.statuses.all}
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
          title={dialogMode === 'reject' ? reviews.rejectTitle : reviews.replyTitle}
          submitLabel={dialogMode === 'reject' ? common.reject : reviews.reply}
          fields={
            dialogMode === 'reject'
              ? [{ key: 'reason', label: reviews.reasonLabel, type: 'textarea' as const, required: true }]
              : [{ key: 'reply', label: reviews.reply, type: 'textarea' as const, required: true }]
          }
          defaultValues={defaultValues}
          key={dialogKey}
          isSubmitting={isActioning}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleSubmit}
        />
      </PermissionGuard>
    </div>
  );
}

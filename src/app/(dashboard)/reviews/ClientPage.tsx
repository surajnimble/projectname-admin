'use client';

import { useState } from 'react';
import { PermissionGuard } from '@/components/auth/guards';
import { PageHeader } from '@/components/common/page-header';
import { DataTable } from '@/components/common/data-table';
import { Pagination } from '@/components/common/pagination';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { OptionsMenu, type OptionsMenuItem } from '@/components/ui/options-menu';
import { StatusBadge } from '@/components/common/status-badge';
import { useReviews } from '@/hooks/use-reviews';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';

export default function ClientReviewsPage() {
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
    approveReview,
    rejectReview,
    replyReview,
  } = useReviews();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'approve' | 'reject' | 'reply'>('approve');
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [replyText, setReplyText] = useState('');

  const activeFilterCount = (search ? 1 : 0) + (filters.status !== 'all' ? 1 : 0);

  const handleApprove = (id: string) => {
    setReviewId(id);
    setDialogMode('approve');
    setDialogOpen(true);
  };

  const handleReject = (id: string) => {
    setReviewId(id);
    setDialogMode('reject');
    setDialogOpen(true);
  };

  const handleReply = (id: string) => {
    setReviewId(id);
    setDialogMode('reply');
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setConfirmId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!confirmId) return;
    setConfirmOpen(false);
    const id = confirmId;
    setConfirmId(null);
    await rejectReview(id, 'Deleted by admin');
  };

  const handleSubmit = async () => {
    if (!reviewId) return;
    let ok = false;
    if (dialogMode === 'approve') {
      ok = await approveReview(reviewId);
    } else if (dialogMode === 'reject') {
      ok = await rejectReview(reviewId, rejectReason);
      if (ok) setRejectReason('');
    } else if (dialogMode === 'reply') {
      ok = await replyReview(reviewId, replyText);
      if (ok) setReplyText('');
    }
    if (ok) setDialogOpen(false);
  };

  const columns = [
    {
      key: 'review',
      header: 'Review',
      cell: (row: any) => <span className="font-medium">{row.title || row.comment?.slice(0, 50)}</span>,
    },
    {
      key: 'product',
      header: 'Product',
      hideBelow: 'lg',
      width: 'w-40',
      cell: (row: any) => <span className="text-sm truncate">{row.productName}</span>,
    },
    {
      key: 'customer',
      header: 'Customer',
      hideBelow: 'xl',
      width: 'w-40',
      cell: (row: any) => <span className="text-sm truncate">{row.userName}</span>,
    },
    {
      key: 'rating',
      header: 'Rating',
      align: 'center',
      hideBelow: 'lg',
      width: 'w-24',
      cell: (row: any) => (
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
      header: 'Status',
      align: 'center',
      cell: (row: any) => (
        <StatusBadge
          meta={{
            label: row.isApproved ? 'Approved' : row.isRejected ? 'Rejected' : 'Pending',
            intent: row.isApproved ? 'success' : row.isRejected ? 'danger' : 'warning',
          }}
        />
      ),
    },
    {
      key: 'actions',
      header: MESSAGES.common.actions,
      align: 'center',
      cell: (row: any) => {
        const items: OptionsMenuItem[] = [
          {
            label: row.isApproved ? 'Reject' : 'Approve',
            onSelect: row.isApproved ? () => handleReject(row.reviewId) : () => handleApprove(row.reviewId),
          },
          {
            label: 'Reply',
            onSelect: () => handleReply(row.reviewId),
          },
          {
            label: MESSAGES.reviews.reject,
            intent: 'danger',
            onSelect: () => handleDelete(row.reviewId),
          },
        ];
        return (
          <OptionsMenu label={MESSAGES.common.actions} items={items} className="flex justify-end" />
        );
      },
    },
  ] as const;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={MESSAGES.sections.reviews}
        description={MESSAGES.reviews.subtitle}
      />
      <PermissionGuard permission={PERMISSIONS.reviewModerate}>
        <Card className="overflow-hidden">
          <DataTable
            columns={columns}
            rows={data.itemList}
            rowKey={(row: any) => row.reviewId}
            toolbar={{
              search: {
                value: search,
                placeholder: MESSAGES.reviews.searchPlaceholder,
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
              render: (row: any) => {
                const items: OptionsMenuItem[] = [
                  {
                    label: row.isApproved ? 'Reject' : 'Approve',
                    onSelect: row.isApproved ? () => handleReject(row.reviewId) : () => handleApprove(row.reviewId),
                  },
                  {
                    label: 'Reply',
                    onSelect: () => handleReply(row.reviewId),
                  },
                  {
                    label: MESSAGES.reviews.reject,
                    intent: 'danger',
                    onSelect: () => handleDelete(row.reviewId),
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
            emptyTitle={MESSAGES.reviews.empty}
            emptyDescription={MESSAGES.reviews.emptyFiltered}
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
              : dialogMode === 'reject'
                ? MESSAGES.reviews.rejectTitle
                : 'Reply to Review'
          }
          description={
            dialogMode === 'approve'
              ? MESSAGES.reviews.approveDescription
              : dialogMode === 'reject'
                ? MESSAGES.reviews.rejectDescription
                : 'Write a reply to the customer.'
          }
          closeLabel={MESSAGES.common.cancel}
          footer={
            <>
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isActioning}>
                {MESSAGES.common.cancel}
              </Button>
              <Button variant="primary" onClick={() => void handleSubmit()} disabled={isActioning} loading={isActioning}>
                {dialogMode === 'approve' ? MESSAGES.reviews.approve : dialogMode === 'reject' ? MESSAGES.reviews.reject : 'Reply'}
              </Button>
            </>
          }
        >
          {dialogMode === 'reject' && (
            <div className="flex flex-col gap-3 p-4">
              <label className="text-sm text-fg font-medium">{MESSAGES.reviews.reasonLabel}</label>
              <textarea
                className="border border-input rounded-md px-3 py-2 text-sm w-full"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                placeholder="Enter rejection reason..."
              />
            </div>
          )}
          {dialogMode === 'reply' && (
            <div className="flex flex-col gap-3 p-4">
              <label className="text-sm text-fg font-medium">Reply</label>
              <textarea
                className="border border-input rounded-md px-3 py-2 text-sm w-full"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={4}
                placeholder="Type your reply..."
              />
            </div>
          )}
        </Dialog>

        <Dialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          title={MESSAGES.reviews.rejectTitle}
          description={`Are you sure you want to delete this review?`}
          closeLabel={MESSAGES.common.cancel}
          footer={
            <>
              <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={isActioning}>
                {MESSAGES.common.cancel}
              </Button>
              <Button variant="destructive" onClick={() => void confirmDelete()} disabled={isActioning} loading={isActioning}>
                Delete
              </Button>
            </>
          }
        />
      </PermissionGuard>
    </div>
  );
}

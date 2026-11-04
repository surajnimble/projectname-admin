'use client';
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
import type { TicketListData } from '@/lib/api/contract';
import { useTickets } from '@/hooks/use-tickets';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';

export default function TicketsPage() {
  const {
    data,
    categories,
    isLoading,
    error,
    page,
    search,
    setPage,
    setSearch,
    setFilters,
    filters,
    refresh,
    createTicket,
    replyTicket,
    updateTicketStatus,
    assignTicket,
    closeTicket,
    deleteTicket,
    isActioning,
  } = useTickets();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'reply' | 'status' | 'assign'>('create');
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [statusValue, setStatusValue] = useState('');

  const activeFilterCount = (search ? 1 : 0) + (filters.status !== 'all' ? 1 : 0);

  const handleCreate = () => {
    setDialogMode('create');
    setTicketId(null);
    setDialogOpen(true);
  };

  const handleReply = (id: string) => {
    setTicketId(id);
    setDialogMode('reply');
    setDialogOpen(true);
  };

  const handleStatus = (id: string) => {
    setTicketId(id);
    setDialogMode('status');
    setDialogOpen(true);
  };

  const handleAssign = (id: string) => {
    setTicketId(id);
    setDialogMode('assign');
    setDialogOpen(true);
  };

  const handleClose = (id: string) => {
    setConfirmId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!confirmId) return;
    setConfirmOpen(false);
    const id = confirmId;
    setConfirmId(null);
    await deleteTicket(id);
  };

  const handleSubmit = async () => {
    if (!ticketId) return;
    let ok = false;
    if (dialogMode === 'reply') {
      ok = await replyTicket(ticketId, replyText, false);
      if (ok) setReplyText('');
    } else if (dialogMode === 'status') {
      ok = await updateTicketStatus(ticketId, statusValue, '');
      if (ok) setStatusValue('');
    } else if (dialogMode === 'assign') {
      ok = await assignTicket(ticketId, ticketId);
      if (ok) setDialogOpen(false);
    }
    if (ok && dialogMode === 'create') setDialogOpen(false);
  };

  const columns: DataTableColumn<TicketListData['itemList'][number]>[] = [
    {
      key: 'ticket',
      header: 'Ticket',
      cell: (row) => <span className="font-medium">{row.ticketNumber}</span>,
    },
    {
      key: 'subject',
      header: 'Subject',
      cell: (row) => <span className="text-sm truncate">{row.subject}</span>,
    },
    {
      key: 'customer',
      header: 'Customer',
      hideBelow: 'xl',
      width: 'w-40',
      cell: (row) => <span className="text-sm truncate">{row.userName}</span>,
    },
    {
      key: 'priority',
      header: 'Priority',
      hideBelow: 'lg',
      width: 'w-32',
      cell: (row) => (
        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs ${row.priority === 'HIGH' ? 'border-danger/20 text-danger bg-danger/10' : row.priority === 'MEDIUM' ? 'border-warning/20 text-warning bg-warning/10' : 'border-success/20 text-success bg-success/10'}`}>
          {row.priority}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      hideBelow: 'lg',
      width: 'w-32',
      cell: (row) => (
        <StatusBadge
          meta={{
            label: row.status,
            intent: row.status === 'RESOLVED' || row.status === 'CLOSED' ? 'success' : row.status === 'IN_PROGRESS' ? 'warning' : 'neutral',
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
            label: 'Reply',
            onSelect: () => handleReply(row.ticketId),
          },
          {
            label: 'Assign',
            onSelect: () => handleAssign(row.ticketId),
          },
          {
            label: row.status === 'CLOSED' ? MESSAGES.tickets.reopen : MESSAGES.tickets.close,
            intent: row.status === 'CLOSED' ? 'default' : 'danger',
            onSelect: () => handleClose(row.ticketId),
          },
          {
            label: MESSAGES.common.delete,
            intent: 'danger',
            onSelect: () => deleteTicket(row.ticketId),
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
        title={MESSAGES.sections.tickets}
        description={MESSAGES.tickets.subtitle}
        action={
          <Button variant="primary" size="sm" onClick={handleCreate}>
            {MESSAGES.tickets.reply}
          </Button>
        }
      />
      <PermissionGuard permission={PERMISSIONS.ticketList}>
        <Card className="overflow-hidden">
          <DataTable
            columns={columns}
            rows={data.itemList}
            rowKey={(row) => row.ticketId}
            toolbar={{
              search: {
                value: search,
                placeholder: MESSAGES.tickets.searchPlaceholder,
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
                    label: 'Reply',
                    onSelect: () => handleReply(row.ticketId),
                  },
                  {
                    label: 'Assign',
                    onSelect: () => handleAssign(row.ticketId),
                  },
                  {
                    label: row.status === 'CLOSED' ? 'Reopen' : 'Close',
                    intent: row.status === 'CLOSED' ? 'default' : 'danger',
                    onSelect: () => handleClose(row.ticketId),
                  },
                  {
                    label: MESSAGES.common.delete,
                    intent: 'danger',
                    onSelect: () => deleteTicket(row.ticketId),
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
            emptyTitle={MESSAGES.tickets.empty}
            emptyDescription={MESSAGES.tickets.emptyFiltered}
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
          open={dialogOpen && dialogMode === 'create'}
          onClose={() => setDialogOpen(false)}
          title={MESSAGES.tickets.reply}
          closeLabel={MESSAGES.common.cancel}
          footer={
            <>
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isActioning}>
                {MESSAGES.common.cancel}
              </Button>
              <Button variant="primary" onClick={() => void handleSubmit()} disabled={isActioning} loading={isActioning}>
                {MESSAGES.tickets.reply}
              </Button>
            </>
          }
        >
          <form className="flex flex-col gap-4 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-fg font-medium">Subject</label>
                <input className="border border-input rounded-md px-3 py-2 text-sm w-full" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-fg font-medium">Category</label>
                <select className="border border-input rounded-md px-3 py-2 text-sm w-full">
                  {categories.itemList?.map((cat) => (
                    <option key={cat.categoryId} value={cat.categoryId}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-fg font-medium">Priority</label>
                <select className="border border-input rounded-md px-3 py-2 text-sm w-full">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-fg font-medium">Description</label>
              <textarea className="border border-input rounded-md px-3 py-2 text-sm w-full" rows={4} />
            </div>
          </form>
        </Dialog>

        <Dialog
          open={dialogOpen && dialogMode === 'reply'}
          onClose={() => setDialogOpen(false)}
          title='Reply to Ticket'
          closeLabel={MESSAGES.common.cancel}
          footer={
            <>
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isActioning}>
                {MESSAGES.common.cancel}
              </Button>
              <Button variant="primary" onClick={() => void handleSubmit()} disabled={isActioning} loading={isActioning}>
                Reply
              </Button>
            </>
          }
        >
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
        </Dialog>

        <Dialog
          open={dialogOpen && dialogMode === 'status'}
          onClose={() => setDialogOpen(false)}
          title='Update Ticket Status'
          closeLabel={MESSAGES.common.cancel}
          footer={
            <>
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isActioning}>
                {MESSAGES.common.cancel}
              </Button>
              <Button variant="primary" onClick={() => void handleSubmit()} disabled={isActioning} loading={isActioning}>
                Update
              </Button>
            </>
          }
        >
          <div className="flex flex-col gap-3 p-4">
            <label className="text-sm text-fg font-medium">Status</label>
            <select
              className="border border-input rounded-md px-3 py-2 text-sm w-full"
              value={statusValue}
              onChange={(e) => setStatusValue(e.target.value)}
            >
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </Dialog>

        <Dialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          title='Delete Ticket'
          description={`Are you sure you want to delete this ticket?`}
          closeLabel={MESSAGES.common.cancel}
          footer={
            <>
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isActioning}>
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

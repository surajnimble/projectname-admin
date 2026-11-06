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
import { StatusBadge, ticketStatusMeta } from '@/components/common/status-badge';
import { PermissionGuard } from '@/components/auth/guards';
import { useTickets } from '@/hooks/use-tickets';
import type { TicketData, TicketCategoryData } from '@/lib/api/contract';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';
import { RefreshButton } from '@/components/common/refresh-button';

const { tickets, common } = MESSAGES;

export function TicketList() {
  const {
    data,
    categories,
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
    createTicket,
    replyTicket,
    updateTicketStatus,
    assignTicket,
    closeTicket,
    deleteTicket,
  } = useTickets();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'reply' | 'status'>('create');
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [defaultValues, setDefaultValues] = useState<Record<string, unknown>>({});
  const [dialogKey, setDialogKey] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftStatus, setDraftStatus] = useState<'all' | string>('all');
  const activeFilterCount = useMemo(() => (search ? 1 : 0) + (draftStatus !== 'all' ? 1 : 0), [search, draftStatus]);

  const statusOptions = useMemo(
    () =>
      Object.entries(tickets.statuses)
        .filter(([key]) => key !== 'all')
        .map(([value, label]) => ({ label, value })),
    [],
  );
  const priorityOptions = useMemo(
    () =>
      Object.entries(tickets.priorities).map(([value, label]) => ({ label, value })),
    [],
  );
  const categoryOptions = useMemo(
    () => categories.itemList.map((cat: TicketCategoryData) => ({ label: cat.name, value: cat.categoryId })),
    [categories.itemList],
  );

  const createFields = [
    { key: 'subject', label: tickets.subjectLabel, type: 'text' as const, required: true },
    { key: 'categoryId', label: tickets.categoryLabel, type: 'select' as const, required: true, options: categoryOptions },
    { key: 'priority', label: tickets.priorityLabel, type: 'select' as const, required: true, options: priorityOptions },
    { key: 'description', label: tickets.descriptionLabel, type: 'textarea' as const },
  ];

  const handleAdd = () => {
    setDialogMode('create');
    setTicketId(null);
    setDefaultValues({});
    setDialogKey((k) => k + 1);
    setDialogOpen(true);
  };

  const handleReply = (id: string) => {
    setDialogMode('reply');
    setTicketId(id);
    setDefaultValues({ reply: '' });
    setDialogKey((k) => k + 1);
    setDialogOpen(true);
  };

  const handleStatus = (id: string) => {
    setDialogMode('status');
    setTicketId(id);
    setDefaultValues({ status: '' });
    setDialogKey((k) => k + 1);
    setDialogOpen(true);
  };

  const handleAssign = (id: string) => {
    void assignTicket(id, id);
  };

  const handleClose = (id: string) => {
    void closeTicket(id);
  };

  const confirmDelete = async () => {
    if (!confirmId) return;
    setConfirmOpen(false);
    const id = confirmId;
    setConfirmId(null);
    await deleteTicket(id);
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    let ok = false;
    if (dialogMode === 'create') {
      ok = await createTicket({
        subject: String(values.subject).trim(),
        categoryId: String(values.categoryId),
        priority: String(values.priority),
        description: String(values.description).trim() || undefined,
      });
    } else if (dialogMode === 'reply' && ticketId) {
      ok = await replyTicket(ticketId, String(values.reply), false);
    } else if (dialogMode === 'status' && ticketId) {
      ok = await updateTicketStatus(ticketId, String(values.status), '');
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
      key: 'ticket',
      header: tickets.columns.ticket,
      cell: (row: TicketData) => <span className="font-medium">{row.ticketNumber}</span>,
    },
    {
      key: 'subject',
      header: tickets.columns.subject,
      cell: (row: TicketData) => <span className="text-sm truncate">{row.subject}</span>,
    },
    {
      key: 'customer',
      header: tickets.columns.customer,
      hideBelow: 'xl',
      width: 'w-40',
      cell: (row: TicketData) => <span className="text-sm truncate">{row.userName}</span>,
    },
    {
      key: 'priority',
      header: tickets.columns.priority,
      hideBelow: 'lg',
      width: 'w-32',
      cell: (row: TicketData) => (
        <StatusBadge
          meta={{
            label: tickets.priorities[row.priority as keyof typeof tickets.priorities] ?? row.priority,
            intent: row.priority === 'HIGH' ? 'danger' : row.priority === 'MEDIUM' ? 'warning' : 'success',
          }}
        />
      ),
    },
    {
      key: 'status',
      header: tickets.columns.status,
      align: 'center',
      hideBelow: 'lg',
      width: 'w-32',
      cell: (row: TicketData) => <StatusBadge meta={ticketStatusMeta(row.status)} />,
    },
    {
      key: 'created',
      header: tickets.columns.created,
      hideBelow: '2xl',
      width: 'w-40',
      cell: (row: TicketData) => <span className="text-sm">{row.createdAt}</span>,
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
        title={tickets.title}
        description={tickets.subtitle}
        action={
          <Button variant="primary" size="sm" onClick={handleAdd} disabled={isActioning}>
            {MESSAGES.common.addNew}
          </Button>
        }
      />
      <PermissionGuard permission={PERMISSIONS.ticketManage}>
        <Card className="overflow-hidden">
          <DataTable
            columns={columns}
            rows={data.itemList}
            rowKey={(row: TicketData) => row.ticketId}
            toolbar={{
              search: {
                value: search,
                placeholder: tickets.searchPlaceholder,
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
              render: (row: TicketData) => {
                const items: OptionsMenuItem[] = [
                  { label: tickets.reply, onSelect: () => handleReply(row.ticketId) },
                  { label: tickets.assign, onSelect: () => handleAssign(row.ticketId) },
                  { label: tickets.statusLabel, onSelect: () => handleStatus(row.ticketId) },
                  { label: row.status === 'CLOSED' ? tickets.reopen : tickets.close, onSelect: () => handleClose(row.ticketId) },
                  { label: common.delete, intent: 'danger', onSelect: () => { setConfirmId(row.ticketId); setConfirmOpen(true); } },
                ];
                return (
                  <OptionsMenu label={tickets.actionsLabel} items={items} className="flex justify-end" />
                );
              },
            }}
            isLoading={isLoading}
            error={error}
            onRetry={() => void refresh()}
            emptyTitle={tickets.empty}
            emptyDescription={activeFilterCount > 0 ? tickets.emptyFiltered : undefined}
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
          <FilterGroup label={tickets.statusLabel}>
            <FilterOption
              key="all"
              label={tickets.statuses.all}
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
          title={dialogMode === 'create' ? tickets.createTitle : dialogMode === 'reply' ? tickets.replyTitle : tickets.statusLabel}
          submitLabel={dialogMode === 'create' ? common.addNew : dialogMode === 'reply' ? tickets.reply : common.save}
          fields={
            dialogMode === 'create'
              ? createFields
              : dialogMode === 'reply'
                ? [{ key: 'reply', label: tickets.reply, type: 'textarea' as const, required: true }]
                : [{ key: 'status', label: tickets.statusLabel, type: 'select' as const, required: true, options: statusOptions }]
          }
          defaultValues={defaultValues}
          key={dialogKey}
          isSubmitting={isActioning}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleSubmit}
        />

        <ConfirmDialog
          open={confirmOpen}
          title={common.delete}
          description={confirmId ? tickets.deleteConfirm : ''}
          confirmLabel={common.delete}
          isSubmitting={isActioning}
          onConfirm={() => void confirmDelete()}
          onClose={() => setConfirmOpen(false)}
        />
      </PermissionGuard>
    </div>
  );
}

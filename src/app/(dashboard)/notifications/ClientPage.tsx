'use client';

import { useState } from 'react';
import { PermissionGuard } from '@/components/auth/guards';
import { PageHeader } from '@/components/common/page-header';
import { DataTable } from '@/components/common/data-table';
import { Pagination } from '@/components/common/pagination';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { OptionsMenu, type OptionsMenuItem } from '@/components/ui/options-menu';
import { Badge } from '@/components/ui/badge';
import { StatusBadge, productStatusMeta } from '@/components/common/status-badge';
import { useNotifications } from '@/hooks/use-notifications';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';

export default function ClientNotificationsPage() {
  const {
    data,
    templates,
    isLoading,
    error,
    isActioning,
    page,
    search,
    setPage,
    setSearch,
    setFilters,
    unreadCount,
    refresh,
    markRead,
    markAllRead,
    deleteNotification,
    broadcastNotification,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  } = useNotifications();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'broadcast' | 'template'>('broadcast');
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [templateDialogMode, setTemplateDialogMode] = useState<'create' | 'edit'>('create');
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'read' | 'unread'>('all');

  const broadcastFields = [
    { key: 'title', label: MESSAGES.notifications.titleLabel, type: 'text' as const, required: true },
    { key: 'body', label: MESSAGES.notifications.bodyLabel, type: 'textarea' as const, required: true },
    { key: 'type', label: MESSAGES.notifications.typeLabel, type: 'select' as const, options: [
      { label: 'Info', value: 'INFO' },
      { label: 'Warning', value: 'WARNING' },
      { label: 'Alert', value: 'ALERT' },
      { label: 'Promo', value: 'PROMO' },
    ] },
    { key: 'channel', label: MESSAGES.notifications.channelLabel, type: 'select' as const, options: [
      { label: 'Push', value: 'PUSH' },
      { label: 'Email', value: 'EMAIL' },
      { label: 'SMS', value: 'SMS' },
    ] },
    { key: 'toAll', label: MESSAGES.notifications.toAllLabel, type: 'switch' as const },
  ];

  const templateFields = [
    { key: 'name', label: MESSAGES.notifications.templateTitle, type: 'text' as const, required: true },
    { key: 'key', label: MESSAGES.notifications.templateKeyLabel, type: 'text' as const, required: true },
    { key: 'title', label: MESSAGES.notifications.templateTitleLabel, type: 'text' as const },
    { key: 'body', label: MESSAGES.notifications.templateBodyLabel, type: 'textarea' as const },
    { key: 'channel', label: MESSAGES.notifications.channelLabel, type: 'select' as const, options: [
      { label: 'Push', value: 'PUSH' },
      { label: 'Email', value: 'EMAIL' },
      { label: 'SMS', value: 'SMS' },
    ] },
    { key: 'isActive', label: MESSAGES.notifications.templateActiveLabel, type: 'switch' as const },
  ];

  const handleAddBroadcast = () => {
    setDialogMode('broadcast');
    setDialogOpen(true);
  };

  const handleTemplateCreate = () => {
    setTemplateDialogMode('create');
    setEditingTemplateId(null);
    setTemplateDialogOpen(true);
  };

  const handleTemplateEdit = (item: any) => {
    setTemplateDialogMode('edit');
    setEditingTemplateId(item.templateId);
    setTemplateDialogOpen(true);
  };

  const handleDeleteNotification = (id: string) => {
    setConfirmId(id);
    setConfirmOpen(true);
  };

  const confirmDeleteNotification = async () => {
    if (!confirmId) return;
    setConfirmOpen(false);
    const id = confirmId;
    setConfirmId(null);
    await deleteNotification(id);
  };

  const handleBroadcastSubmit = async (values: Record<string, unknown>) => {
    const ok = await broadcastNotification(values);
    if (ok) setDialogOpen(false);
  };

  const handleTemplateSubmit = async (values: Record<string, unknown>) => {
    let ok = false;
    if (templateDialogMode === 'create') {
      ok = await createTemplate(values);
    } else if (editingTemplateId) {
      ok = await updateTemplate(editingTemplateId, values);
    }
    if (ok) setTemplateDialogOpen(false);
  };

  const activeFilterCount = (search ? 1 : 0) + (filterStatus !== 'all' ? 1 : 0);

  const columns = [
    {
      key: 'notification',
      header: 'Notification',
      cell: (row: any) => <span className="font-medium">{row.title}</span>,
    },
    {
      key: 'title',
      header: 'Title',
      cell: (row: any) => <span className="text-sm truncate">{row.title}</span>,
    },
    {
      key: 'type',
      header: 'Type',
      cell: (row: any) => <span className="text-xs capitalize">{row.type}</span>,
    },
    {
      key: 'channel',
      header: 'Channel',
      cell: (row: any) => <span className="text-xs capitalize">{row.channel}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      cell: (row: any) => (
        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs border ${row.isRead ? 'border-success/20 text-success bg-success/10' : 'border-neutral/20 text-fg-muted bg-surface-muted'}`}>
          {row.isRead ? MESSAGES.notifications.statuses.read : MESSAGES.notifications.statuses.unread}
        </span>
      ),
    },
    {
      key: 'created',
      header: 'Created',
      cell: (row: any) => <span className="text-sm">{row.createdAt}</span>,
    },
    {
      key: 'actions',
      header: MESSAGES.common.actions,
      align: 'center',
      cell: (row: any) => {
        const items: OptionsMenuItem[] = [
          {
            label: row.isRead ? 'Mark Unread' : 'Mark Read',
            onSelect: () => markRead(row.notificationId),
          },
                  {
                    label: MESSAGES.common.delete,
                    intent: 'danger',
                    onSelect: () => handleDeleteNotification(row.notificationId),
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
        title={MESSAGES.sections.notifications}
        description={MESSAGES.notifications.subtitle}
        action={
          <div className="flex items-center gap-2">
            <Badge
              intent={unreadCount > 0 ? 'warning' : 'neutral'}
              className={unreadCount > 0 ? 'animate-pulse' : ''}
            >
              {unreadCount} unread
            </Badge>
            <Button variant="outline" size="sm" onClick={() => void markAllRead()}>
              Mark all read
            </Button>
            <Button variant="primary" size="sm" onClick={handleAddBroadcast}>
              {MESSAGES.notifications.send}
            </Button>
          </div>
        }
      />
      <PermissionGuard permission={PERMISSIONS.notificationSend}>
        <Card className="overflow-hidden">
          <DataTable
            columns={columns}
            rows={data.itemList}
            rowKey={(row: any) => row.notificationId}
            toolbar={{
              search: {
                value: search,
                placeholder: MESSAGES.notifications.searchPlaceholder,
                onChange: setSearch,
              },
              filters: {
                label: MESSAGES.common.filters,
                count: activeFilterCount,
                onOpen: () => {},
              },
              actions: (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" loading={isLoading} onClick={() => void refresh()}>
                    {MESSAGES.dashboard.refresh}
                  </Button>
                  <Button variant="primary" size="sm" onClick={handleAddBroadcast}>
                    {MESSAGES.notifications.broadcast}
                  </Button>
                </div>
              ),
            }}
            actions={{
              header: MESSAGES.common.actions,
              render: (row: any) => {
                const items: OptionsMenuItem[] = [
                  {
                    label: row.isRead ? 'Mark Unread' : 'Mark Read',
                    onSelect: () => markRead(row.notificationId),
                  },
                  {
                    label: MESSAGES.common.delete,
                    intent: 'danger',
                    onSelect: () => handleDeleteNotification(row.notificationId),
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
            emptyTitle={MESSAGES.notifications.empty}
            emptyDescription={MESSAGES.notifications.emptyFiltered}
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

        {/* Broadcast Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          title={dialogMode === 'broadcast' ? MESSAGES.notifications.sendTitle : 'Edit Notification'}
          description={MESSAGES.notifications.sendDescription}
          closeLabel={MESSAGES.common.cancel}
          footer={
            <>
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isActioning}>
                {MESSAGES.common.cancel}
              </Button>
              <Button variant="primary" onClick={() => void handleBroadcastSubmit({})} disabled={isActioning} loading={isActioning}>
                {dialogMode === 'broadcast' ? MESSAGES.notifications.send : 'Save'}
              </Button>
            </>
          }
        >
          <form className="flex flex-col gap-4 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-fg font-medium">Title</label>
                <input className="border border-input rounded-md px-3 py-2 text-sm w-full" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-fg font-medium">Channel</label>
                <select className="border border-input rounded-md px-3 py-2 text-sm w-full">
                  <option value="PUSH">Push</option>
                  <option value="EMAIL">Email</option>
                  <option value="SMS">SMS</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-fg font-medium">Body / Message</label>
              <textarea className="border border-input rounded-md px-3 py-2 text-sm w-full" rows={4} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" className="rounded border-input text-success" />
              <label className="text-sm text-fg">Send to all active users</label>
            </div>
          </form>
        </Dialog>

        {/* Template Dialog */}
        <Dialog
          open={templateDialogOpen}
          onClose={() => setTemplateDialogOpen(false)}
          title={templateDialogMode === 'create' ? MESSAGES.notifications.templateCreate : MESSAGES.notifications.templateUpdate}
          closeLabel={MESSAGES.common.cancel}
          footer={
            <>
              <Button variant="outline" onClick={() => setTemplateDialogOpen(false)} disabled={isActioning}>
                {MESSAGES.common.cancel}
              </Button>
              <Button variant="primary" onClick={() => void handleTemplateSubmit({})} disabled={isActioning} loading={isActioning}>
                {templateDialogMode === 'create' ? MESSAGES.notifications.templateCreate : MESSAGES.notifications.templateUpdate}
              </Button>
            </>
          }
        >
          <form className="flex flex-col gap-4 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-fg font-medium">Template Name</label>
                <input className="border border-input rounded-md px-3 py-2 text-sm w-full" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-fg font-medium">Key</label>
                <input className="border border-input rounded-md px-3 py-2 text-sm w-full" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-fg font-medium">Title</label>
                <input className="border border-input rounded-md px-3 py-2 text-sm w-full" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-fg font-medium">Channel</label>
                <select className="border border-input rounded-md px-3 py-2 text-sm w-full">
                  <option value="PUSH">Push</option>
                  <option value="EMAIL">Email</option>
                  <option value="SMS">SMS</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-fg font-medium">Body</label>
              <textarea className="border border-input rounded-md px-3 py-2 text-sm w-full" rows={4} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-fg font-medium">Variables</label>
              <input className="border border-input rounded-md px-3 py-2 text-sm w-full" placeholder="e.g. {{userName}}, {{orderNumber}}" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" className="rounded border-input text-success" />
              <label className="text-sm text-fg">Active</label>
            </div>
          </form>
        </Dialog>

        {/* Templates List */}
        <Card className="overflow-hidden mt-6">
          <div className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">Templates</h3>
            <Button variant="outline" size="sm" onClick={handleTemplateCreate}>
              {MESSAGES.notifications.templateCreate}
            </Button>
          </div>
          <DataTable
            columns={[
              {
                key: 'name',
                header: MESSAGES.notifications.templateTitle,
                cell: (row: any) => <span className="font-medium">{row.name}</span>,
              },
              {
                key: 'key',
                header: MESSAGES.notifications.templateKeyLabel,
                cell: (row: any) => <span className="text-sm truncate">{row.key}</span>,
              },
              {
                key: 'channel',
                header: MESSAGES.notifications.channelLabel,
                cell: (row: any) => <span className="text-sm capitalize">{row.channel}</span>,
              },
              {
                key: 'status',
                header: MESSAGES.notifications.status,
                align: 'center',
                cell: (row: any) => (
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs border ${row.isActive ? 'border-success/20 text-success bg-success/10' : 'border-neutral/20 text-fg-muted bg-surface-muted'}`}>
                    {row.isActive ? 'Active' : 'Inactive'}
                  </span>
                ),
              },
              {
                key: 'actions',
                header: MESSAGES.common.actions,
                align: 'center',
                cell: (row: any) => {
                  const items: OptionsMenuItem[] = [
                    {
                      label: 'Edit',
                      onSelect: () => handleTemplateEdit(row),
                    },
                    {
                      label: MESSAGES.notifications.delete,
                      intent: 'danger',
                      onSelect: () => deleteTemplate(row.templateId),
                    },
                  ];
                  return (
                    <OptionsMenu label={MESSAGES.common.actions} items={items} className="flex justify-end" />
                  );
                },
              },
            ]}
            rows={templates.itemList}
            rowKey={(row: any) => row.templateId}
            emptyTitle={MESSAGES.notifications.empty}
            emptyDescription={MESSAGES.notifications.emptyFiltered}
            footer={
              <Pagination
                currentPage={templates.currentPage}
                totalPage={templates.totalPage}
                totalRecord={templates.totalRecord}
                limit={templates.limit}
                onPageChange={setPage}
              />
            }
          />
        </Card>
      </PermissionGuard>
    </div>
  );
}

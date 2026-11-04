'use client';

import { useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
import { useNotifications } from '@/hooks/use-notifications';
import type { NotificationData, NotificationTemplateData } from '@/lib/api/contract';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';

const { notifications, common } = MESSAGES;

const broadcastFields = [
  { key: 'title', label: notifications.titleLabel, type: 'text' as const, required: true },
  { key: 'body', label: notifications.bodyLabel, type: 'textarea' as const, required: true },
  { key: 'type', label: notifications.typeLabel, type: 'select' as const, required: true, options: [
    { label: notifications.types.INFO, value: 'INFO' },
    { label: notifications.types.WARNING, value: 'WARNING' },
    { label: notifications.types.ALERT, value: 'ALERT' },
    { label: notifications.types.PROMO, value: 'PROMO' },
  ] },
  { key: 'channel', label: notifications.channelLabel, type: 'select' as const, required: true, options: [
    { label: notifications.channels.PUSH, value: 'PUSH' },
    { label: notifications.channels.EMAIL, value: 'EMAIL' },
    { label: notifications.channels.SMS, value: 'SMS' },
  ] },
  { key: 'toAll', label: notifications.toAllLabel, type: 'switch' as const },
];

const templateFields = [
  { key: 'name', label: notifications.templateTitle, type: 'text' as const, required: true },
  { key: 'key', label: notifications.templateKeyLabel, type: 'text' as const, required: true },
  { key: 'title', label: notifications.templateTitleLabel, type: 'text' as const },
  { key: 'body', label: notifications.templateBodyLabel, type: 'textarea' as const },
  { key: 'channel', label: notifications.channelLabel, type: 'select' as const, options: [
    { label: notifications.channels.PUSH, value: 'PUSH' },
    { label: notifications.channels.EMAIL, value: 'EMAIL' },
    { label: notifications.channels.SMS, value: 'SMS' },
  ] },
  { key: 'isActive', label: notifications.templateActiveLabel, type: 'switch' as const },
];

export function NotificationList() {
  const {
    data,
    templates,
    isLoading,
    error,
    actionError,
    isActioning,
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
  const [dialogKind, setDialogKind] = useState<'broadcast' | 'template'>('broadcast');
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [defaultValues, setDefaultValues] = useState<Record<string, unknown>>({});
  const [dialogKey, setDialogKey] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmIsTemplate, setConfirmIsTemplate] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'read' | 'unread'>('all');
  const activeFilterCount = useMemo(() => (search ? 1 : 0) + (filterStatus !== 'all' ? 1 : 0), [search, filterStatus]);

  const handleAddBroadcast = () => {
    setDialogKind('broadcast');
    setDialogMode('add');
    setDefaultValues({});
    setDialogKey((k) => k + 1);
    setDialogOpen(true);
  };

  const handleTemplateCreate = () => {
    setDialogKind('template');
    setDialogMode('add');
    setEditingTemplateId(null);
    setDefaultValues({});
    setDialogKey((k) => k + 1);
    setDialogOpen(true);
  };

  const handleTemplateEdit = (row: NotificationTemplateData) => {
    setDialogKind('template');
    setDialogMode('edit');
    setEditingTemplateId(row.templateId);
    setDefaultValues({
      name: row.name,
      key: row.key,
      title: row.title,
      body: row.body,
      channel: row.channel,
      isActive: row.isActive,
    });
    setDialogKey((k) => k + 1);
    setDialogOpen(true);
  };

  const handleDeleteNotification = (id: string) => {
    setConfirmId(id);
    setConfirmIsTemplate(false);
    setConfirmOpen(true);
  };

  const handleDeleteTemplate = (id: string) => {
    setConfirmId(id);
    setConfirmIsTemplate(true);
    setConfirmOpen(true);
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    let ok = false;
    if (dialogKind === 'broadcast') {
      ok = await broadcastNotification(values);
    } else if (dialogMode === 'add') {
      ok = await createTemplate(values);
    } else if (editingTemplateId) {
      ok = await updateTemplate(editingTemplateId, values);
    }
    if (ok) setDialogOpen(false);
  };

  const confirmDelete = async () => {
    if (!confirmId) return;
    setConfirmOpen(false);
    const id = confirmId;
    setConfirmId(null);
    const wasTemplate = confirmIsTemplate;
    setConfirmIsTemplate(false);
    if (wasTemplate) {
      await deleteTemplate(id);
    } else {
      await deleteNotification(id);
    }
  };

  const openFilters = () => setFiltersOpen(true);
  const resetDraft = () => {
    setFilterStatus('all');
    setFilters({});
  };
  const applyDraft = () => {
    setFilters(filterStatus === 'all' ? {} : { status: filterStatus });
    setFiltersOpen(false);
  };

  const notificationColumns = [
    {
      key: 'notification',
      header: notifications.columns.notification,
      cell: (row: NotificationData) => <span className="font-medium">{row.title}</span>,
    },
    {
      key: 'type',
      header: notifications.columns.type,
      hideBelow: 'lg',
      width: 'w-32',
      cell: (row: NotificationData) => <span className="text-sm capitalize">{row.type}</span>,
    },
    {
      key: 'channel',
      header: notifications.columns.channel,
      hideBelow: 'xl',
      width: 'w-32',
      cell: (row: NotificationData) => <span className="text-sm capitalize">{row.channel}</span>,
    },
    {
      key: 'status',
      header: notifications.columns.status,
      align: 'center',
      hideBelow: 'lg',
      width: 'w-32',
      cell: (row: NotificationData) => <StatusBadge meta={catalogStatusMeta(row.isRead ? 'ACTIVE' : 'INACTIVE')} />,
    },
    {
      key: 'created',
      header: notifications.columns.created,
      hideBelow: '2xl',
      width: 'w-40',
      cell: (row: NotificationData) => <span className="text-sm">{row.createdAt}</span>,
    },
    {
      key: 'actions',
      header: common.actions,
      align: 'center',
      width: 'w-32',
      cell: (row: NotificationData) => {
        const items: OptionsMenuItem[] = [
          {
            label: row.isRead ? notifications.statuses.unread : notifications.statuses.read,
            onSelect: () => markRead(row.notificationId),
          },
          { label: common.delete, intent: 'danger', onSelect: () => handleDeleteNotification(row.notificationId) },
        ];
        return (
          <OptionsMenu label={notifications.actionsLabel} items={items} className="flex justify-end" />
        );
      },
    },
  ] as const;

  const templateColumns = [
    {
      key: 'name',
      header: notifications.templateTitle,
      cell: (row: NotificationTemplateData) => <span className="font-medium">{row.name}</span>,
    },
    {
      key: 'key',
      header: notifications.templateKeyLabel,
      hideBelow: 'lg',
      width: 'w-40',
      cell: (row: NotificationTemplateData) => <span className="text-sm truncate">{row.key}</span>,
    },
    {
      key: 'channel',
      header: notifications.columns.channel,
      hideBelow: 'xl',
      width: 'w-32',
      cell: (row: NotificationTemplateData) => <span className="text-sm capitalize">{row.channel}</span>,
    },
    {
      key: 'status',
      header: notifications.columns.status,
      align: 'center',
      hideBelow: 'xl',
      width: 'w-32',
      cell: (row: NotificationTemplateData) => <StatusBadge meta={catalogStatusMeta(row.isActive ? 'ACTIVE' : 'INACTIVE')} />,
    },
    {
      key: 'actions',
      header: common.actions,
      align: 'center',
      width: 'w-32',
      cell: (row: NotificationTemplateData) => {
        const items: OptionsMenuItem[] = [
          { label: common.editExisting, onSelect: () => handleTemplateEdit(row) },
          { label: common.delete, intent: 'danger', onSelect: () => handleDeleteTemplate(row.templateId) },
        ];
        return (
          <OptionsMenu label={common.actions} items={items} className="flex justify-end" />
        );
      },
    },
  ] as const;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={notifications.title}
        description={notifications.subtitle}
        action={
          <div className="flex items-center gap-2">
            <Badge
              intent={unreadCount > 0 ? 'warning' : 'neutral'}
              className={unreadCount > 0 ? 'animate-pulse' : ''}
            >
              {unreadCount} {notifications.statuses.unread}
            </Badge>
            <Button variant="outline" size="sm" onClick={() => void markAllRead()} disabled={isActioning}>
              {notifications.markAllRead}
            </Button>
            <Button variant="primary" size="sm" onClick={handleAddBroadcast} disabled={isActioning}>
              {notifications.send}
            </Button>
          </div>
        }
      />
      <PermissionGuard permission={PERMISSIONS.notificationSend}>
        <Card className="overflow-hidden">
          <DataTable
            columns={notificationColumns}
            rows={data.itemList}
            rowKey={(row: NotificationData) => row.notificationId}
            toolbar={{
              search: {
                value: search,
                placeholder: notifications.searchPlaceholder,
                onChange: setSearch,
              },
              filters: {
                label: common.filters,
                count: activeFilterCount,
                onOpen: openFilters,
              },
              actions: (
                <Button
                  variant="outline"
                  size="sm"
                  loading={isLoading}
                  onClick={() => void refresh()}
                  className="shrink-0"
                >
                  <RefreshCw className="size-4" aria-hidden="true" />
                  {MESSAGES.dashboard.refresh}
                </Button>
              ),
            }}
            actions={{
              header: common.actions,
              render: (row: NotificationData) => {
                const items: OptionsMenuItem[] = [
                  {
                    label: row.isRead ? notifications.statuses.unread : notifications.statuses.read,
                    onSelect: () => markRead(row.notificationId),
                  },
                  { label: common.delete, intent: 'danger', onSelect: () => handleDeleteNotification(row.notificationId) },
                ];
                return (
                  <OptionsMenu label={notifications.actionsLabel} items={items} className="flex justify-end" />
                );
              },
            }}
            isLoading={isLoading}
            error={error}
            onRetry={() => void refresh()}
            emptyTitle={notifications.empty}
            emptyDescription={activeFilterCount > 0 ? notifications.emptyFiltered : undefined}
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

        {actionError && <div className="p-4 text-destructive text-sm">{actionError}</div>}

        <FilterSheet
          open={filtersOpen}
          title={common.filters}
          onClose={() => setFiltersOpen(false)}
          onReset={resetDraft}
          onDone={applyDraft}
        >
          <FilterGroup label={notifications.columns.status}>
            <FilterOption
              key="all"
              label={notifications.statuses.all}
              selected={filterStatus === 'all'}
              onSelect={() => setFilterStatus('all')}
            />
            <FilterOption
              key="read"
              label={notifications.statuses.read}
              selected={filterStatus === 'read'}
              onSelect={() => setFilterStatus('read')}
            />
            <FilterOption
              key="unread"
              label={notifications.statuses.unread}
              selected={filterStatus === 'unread'}
              onSelect={() => setFilterStatus('unread')}
            />
          </FilterGroup>
        </FilterSheet>

        <EntityDialog
          open={dialogOpen}
          mode={dialogMode}
          title={dialogKind === 'broadcast' ? notifications.sendTitle : dialogMode === 'add' ? notifications.templateCreate : notifications.templateUpdate}
          submitLabel={dialogKind === 'broadcast' ? notifications.send : dialogMode === 'add' ? common.addNew : common.save}
          fields={dialogKind === 'broadcast' ? broadcastFields : templateFields}
          defaultValues={defaultValues}
          key={dialogKey}
          isSubmitting={isActioning}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleSubmit}
        />

        <ConfirmDialog
          open={confirmOpen}
          title={common.delete}
          description={confirmIsTemplate ? notifications.templateDeleted : notifications.deleteConfirm}
          confirmLabel={common.delete}
          isSubmitting={isActioning}
          onConfirm={() => void confirmDelete()}
          onClose={() => setConfirmOpen(false)}
        />

        <Card className="overflow-hidden mt-6">
          <div className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">{notifications.templateTitle}</h3>
            <Button variant="outline" size="sm" onClick={handleTemplateCreate} disabled={isActioning}>
              {notifications.templateCreate}
            </Button>
          </div>
          <DataTable
            columns={templateColumns}
            rows={templates.itemList}
            rowKey={(row: NotificationTemplateData) => row.templateId}
            toolbar={{
              actions: (
                <Button
                  variant="outline"
                  size="sm"
                  loading={isLoading}
                  onClick={() => void refresh()}
                  className="shrink-0"
                >
                  {MESSAGES.dashboard.refresh}
                </Button>
              ),
            }}
            actions={{
              header: common.actions,
              render: (row: NotificationTemplateData) => {
                const items: OptionsMenuItem[] = [
                  { label: common.editExisting, onSelect: () => handleTemplateEdit(row) },
                  { label: common.delete, intent: 'danger', onSelect: () => handleDeleteTemplate(row.templateId) },
                ];
                return (
                  <OptionsMenu label={common.actions} items={items} className="flex justify-end" />
                );
              },
            }}
            isLoading={isLoading}
            error={error}
            onRetry={() => void refresh()}
            emptyTitle={notifications.empty}
            emptyDescription={notifications.emptyFiltered}
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

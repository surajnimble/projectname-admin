'use client';
import { PermissionGuard } from '@/components/auth/guards';
import { DataTable } from '@/components/common/data-table';
import { Pagination } from '@/components/common/pagination';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AUDIT_LOG_PAGE_SIZE } from '@/constants';
import { PERMISSIONS } from '@/constants';
import { useAuditLogs } from '@/hooks/use-audit-logs';
import type { AuditLogData } from '@/lib/api/contract';
import { MESSAGES } from '@/messages';

const { auditLogs } = MESSAGES;
const df = auditLogs;

const columns = [
  {
    key: 'action',
    header: df.columns.action,
    cell: (row: AuditLogData) => <span className="font-medium">{row.action}</span>,
  },
  {
    key: 'entity',
    header: df.columns.entity,
    hideBelow: 'lg',
    width: 'w-32',
    cell: (row: AuditLogData) => <span className="text-sm capitalize">{row.entity}</span>,
  },
  {
    key: 'entityId',
    header: df.columns.entityId,
    hideBelow: 'xl',
    width: 'w-32',
    cell: (row: AuditLogData) => <span className="text-sm text-fg-muted truncate">{row.entityId}</span>,
  },
  {
    key: 'user',
    header: df.columns.user,
    hideBelow: '2xl',
    width: 'w-40',
    cell: (row: AuditLogData) => <span className="text-sm">{row.userData.name || df.fallback}</span>,
  },
  {
    key: 'ip',
    header: df.columns.ip,
    hideBelow: '2xl',
    width: 'w-32',
    cell: (row: AuditLogData) => <span className="text-sm text-fg-muted">{row.ip}</span>,
  },
  {
    key: 'created',
    header: df.columns.created,
    hideBelow: '2xl',
    width: 'w-40',
    cell: (row: AuditLogData) => <span className="text-sm">{row.createdAt}</span>,
  },
] as const;

export default function AuditLogsPage() {
  const {
    data,
    isLoading,
    error,
    page,
    search,
    setPage,
    setSearch,
    refresh,
  } = useAuditLogs();

  const hasFilters = search !== '';

  return (
    <div className="flex min-h-0 flex-col">
      <div className="flex flex-col gap-2 shrink-0">
        <h1 className="text-fg text-2xl font-semibold tracking-tight">{df.title}</h1>
        <p className="text-fg-muted text-sm">{df.subtitle}</p>
      </div>

      <PermissionGuard permission={PERMISSIONS.auditLogView}>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between p-4 border-b border-border bg-background/50">
              <div className="relative w-full sm:w-auto max-w-md">
                <Input
                  placeholder={df.searchPlaceholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void refresh()}
                  disabled={isLoading}
                  loading={isLoading}
                >
                  {MESSAGES.dashboard.refresh}
                </Button>
                <Button variant="outline" size="sm">{df.export}</Button>
              </div>
            </div>

            <DataTable
              columns={columns}
              rows={data.itemList}
              rowKey={(row: AuditLogData) => row.auditLogId}
              toolbar={{
                filters: {
                  label: MESSAGES.common.filters,
                  count: hasFilters ? 1 : 0,
                  onOpen: () => {},
                },
              }}
              isLoading={isLoading}
              error={error}
              onRetry={() => void refresh()}
              emptyTitle={df.empty}
              emptyDescription={hasFilters ? df.emptyFiltered : undefined}
              footer={
                <Pagination
                  currentPage={page}
                  totalPage={data.totalPage}
                  totalRecord={data.totalRecord}
                  limit={AUDIT_LOG_PAGE_SIZE}
                  onPageChange={setPage}
                />
              }
            />
          </div>
        </Card>
      </PermissionGuard>
    </div>
  );
}

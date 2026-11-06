'use client';


import { useState } from 'react';
import { PageHeader } from '@/components/common/page-header';
import { DataTable } from '@/components/common/data-table';
import { FilterGroup, FilterSheet } from '@/components/common/filter-sheet';
import { Pagination } from '@/components/common/pagination';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuditLogs } from '@/hooks/use-audit-logs';
import type { AuditLogData } from '@/lib/api/contract';
import { AUDIT_LOG_PAGE_SIZE } from '@/constants';
import { MESSAGES } from '@/messages';
import { RefreshButton } from '@/components/common/refresh-button';

const { auditLogs } = MESSAGES;

export function AuditLogList() {
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
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftSearch, setDraftSearch] = useState(search);
  const activeFilterCount = search ? 1 : 0;

  const openFilters = () => {
    setDraftSearch(search);
    setFiltersOpen(true);
  };

  const resetDraft = () => {
    setDraftSearch('');
  };

  const applyDraft = () => {
    setSearch(draftSearch);
    setFiltersOpen(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title={auditLogs.title} description={auditLogs.subtitle} />

      <Card className="overflow-hidden">
        <DataTable
          columns={[
            {
              key: 'action',
              header: auditLogs.columns.action,
              cell: (row: AuditLogData) => <span className="font-medium">{row.action}</span>,
            },
            {
              key: 'entity',
              header: auditLogs.columns.entity,
              hideBelow: 'lg',
              width: 'w-32',
              cell: (row: AuditLogData) => <span className="text-sm capitalize">{row.entity}</span>,
            },
            {
              key: 'entityId',
              header: auditLogs.columns.entityId,
              hideBelow: 'xl',
              width: 'w-32',
              cell: (row: AuditLogData) => <span className="text-sm text-fg-muted truncate">{row.entityId}</span>,
            },
            {
              key: 'user',
              header: auditLogs.columns.user,
              hideBelow: '2xl',
              width: 'w-40',
              cell: (row: AuditLogData) => (
                <span className="text-sm">
                  {row.actorData.name || row.actorData.email || auditLogs.fallback}
                  {row.actorRole && <span className="ml-1 text-xs text-fg-muted">({row.actorRole})</span>}
                </span>
              ),
            },
            {
              key: 'impersonatedBy',
              header: auditLogs.columns.impersonatedBy,
              hideBelow: '2xl',
              width: 'w-40',
              cell: (row: AuditLogData) => (
                <span className="text-sm">
                  {row.impersonatedByData.name || row.impersonatedByData.email || '—'}
                </span>
              ),
            },
            {
              key: 'ip',
              header: auditLogs.columns.ip,
              hideBelow: '2xl',
              width: 'w-32',
              cell: (row: AuditLogData) => <span className="text-sm text-fg-muted">{row.ip}</span>,
            },
            {
              key: 'created',
              header: auditLogs.columns.created,
              hideBelow: '2xl',
              width: 'w-40',
              cell: (row: AuditLogData) => <span className="text-sm">{row.createdAt}</span>,
            },
          ]}
          rows={data.itemList}
          rowKey={(row: AuditLogData) => row.auditLogId}
          toolbar={{
            search: {
              value: search,
              placeholder: auditLogs.searchPlaceholder,
              onChange: setSearch,
            },
            filters: {
              label: MESSAGES.common.filters,
              count: activeFilterCount,
              onOpen: openFilters,
            },
            actions: (
              <RefreshButton onRefresh={() => void refresh()} size="sm" label={MESSAGES.dashboard.refresh} isRefreshing={isLoading} />
            ),
          }}
          isLoading={isLoading}
          error={error}
          onRetry={() => void refresh()}
          emptyTitle={auditLogs.empty}
          emptyDescription={search ? auditLogs.emptyFiltered : undefined}
          footer={
            <Pagination
              currentPage={data.currentPage || page}
              totalPage={data.totalPage}
              totalRecord={data.totalRecord}
              limit={data.limit || AUDIT_LOG_PAGE_SIZE}
              onPageChange={setPage}
            />
          }
        />
      </Card>

      <FilterSheet
        open={filtersOpen}
        title={MESSAGES.common.filters}
        onClose={() => setFiltersOpen(false)}
        onReset={resetDraft}
        onDone={applyDraft}
      >
        <FilterGroup label={MESSAGES.common.search}>
          <Input
            value={draftSearch}
            onChange={(event) => setDraftSearch(event.target.value)}
            placeholder={auditLogs.searchPlaceholder}
          />
        </FilterGroup>
      </FilterSheet>
    </div>
  );
}

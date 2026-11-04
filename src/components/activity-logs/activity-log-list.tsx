'use client';

import { RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '@/components/common/page-header';
import { DataTable } from '@/components/common/data-table';
import { FilterGroup, FilterOption, FilterSheet } from '@/components/common/filter-sheet';
import { Pagination } from '@/components/common/pagination';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { activityLogColumns } from '@/components/activity-logs/activity-log-columns';
import { useActivityLogs } from '@/hooks/use-activity-logs';
import type { ActivityLogData } from '@/lib/api/contract';
import { MESSAGES } from '@/messages';

const { activityLogs } = MESSAGES;

const ACTION_FILTERS: readonly { value: string; label: string }[] = [
  { value: '', label: MESSAGES.common.viewAll },
  { value: 'CREATE', label: activityLogs.statuses.action },
  { value: 'UPDATE', label: activityLogs.statuses.action },
  { value: 'DELETE', label: activityLogs.statuses.action },
  { value: 'APPROVE', label: activityLogs.statuses.action },
  { value: 'REJECT', label: activityLogs.statuses.action },
  { value: 'SUSPEND', label: activityLogs.statuses.action },
  { value: 'LOGIN', label: activityLogs.statuses.action },
  { value: 'LOGOUT', label: activityLogs.statuses.action },
];

export function ActivityLogList() {
  const {
    data,
    isLoading,
    isFetching,
    error,
    page,
    search,
    action,
    setPage,
    setSearch,
    setAction,
    refresh,
  } = useActivityLogs();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftAction, setDraftAction] = useState(action);
  const activeFilterCount = (search ? 1 : 0) + (action ? 1 : 0);

  const openFilters = () => {
    setDraftAction(action);
    setFiltersOpen(true);
  };

  const resetDraft = () => {
    setDraftAction('');
  };

  const applyDraft = () => {
    setAction(draftAction);
    setFiltersOpen(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title={activityLogs.title} description={activityLogs.subtitle} />

      <Card className="overflow-hidden">
        <DataTable
          columns={activityLogColumns}
          rows={data.itemList}
          rowKey={(row: ActivityLogData) => row.activityLogId}
          toolbar={{
            search: {
              value: search,
              placeholder: activityLogs.searchPlaceholder,
              onChange: setSearch,
            },
            filters: {
              label: MESSAGES.common.filters,
              count: activeFilterCount,
              onOpen: openFilters,
            },
            actions: (
              <Button
                variant="outline"
                size="sm"
                loading={isLoading || isFetching}
                onClick={() => void refresh()}
                className="shrink-0"
              >
                <RefreshCw className="size-4" aria-hidden="true" />
                {MESSAGES.dashboard.refresh}
              </Button>
            ),
          }}
          isLoading={isLoading}
          error={error}
          onRetry={() => void refresh()}
          emptyTitle={activityLogs.empty}
          emptyDescription={search || action ? activityLogs.emptyFiltered : undefined}
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

      <FilterSheet
        open={filtersOpen}
        title={MESSAGES.common.filters}
        onClose={() => setFiltersOpen(false)}
        onReset={resetDraft}
        onDone={applyDraft}
      >
        <FilterGroup label={activityLogs.actionLabel}>
          {ACTION_FILTERS.map((option) => (
            <FilterOption
              key={option.value}
              label={option.label}
              selected={draftAction === option.value}
              onSelect={() => setDraftAction(option.value)}
            />
          ))}
        </FilterGroup>
      </FilterSheet>
    </div>
  );
}

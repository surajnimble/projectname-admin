'use client';

import { RefreshButton } from '@/components/common/refresh-button';

import { useState } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { PageHeader } from '@/components/common/page-header';
import { DataTable } from '@/components/common/data-table';
import { Pagination } from '@/components/common/pagination';
import { FilterGroup, FilterOption, FilterSheet } from '@/components/common/filter-sheet';
import { OptionsMenu, type OptionsMenuItem } from '@/components/ui/options-menu';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FAILED_JOB_PAGE_SIZE } from '@/constants';
import { useSystemHealth } from '@/hooks/use-system-health';
import type { CronJobData, FailedJobData } from '@/lib/api/contract';
import { MESSAGES } from '@/messages';
import { StatusBadge } from '@/components/common/status-badge';

const { systemHealth } = MESSAGES;
const df = systemHealth;

const healthBadge = (status: string) => {
  switch (status) {
    case 'healthy':
      return <StatusBadge meta={{ label: df.statusHealthy, intent: 'success' }} />;
    case 'degraded':
      return <StatusBadge meta={{ label: df.statusDegraded, intent: 'warning' }} />;
    default:
      return <StatusBadge meta={{ label: df.statusDown, intent: 'danger' }} />;
  }
};

const cronColumns = [
  {
    key: 'name',
    header: df.jobName,
    cell: (row: CronJobData) => <span className="font-medium">{row.name}</span>,
  },
  {
    key: 'queue',
    header: df.queue,
    hideBelow: 'lg',
    width: 'w-32',
    cell: (row: CronJobData) => <span className="text-sm">{row.queue}</span>,
  },
  {
    key: 'cron',
    header: df.cron,
    hideBelow: 'xl',
    width: 'w-40',
    cell: (row: CronJobData) => <span className="text-sm text-fg-muted">{row.cron}</span>,
  },
  {
    key: 'description',
    header: df.description,
    hideBelow: '2xl',
    cell: (row: CronJobData) => <span className="text-sm text-fg-muted">{row.description}</span>,
  },
  {
    key: 'registered',
    header: df.registered,
    align: 'center',
    hideBelow: '2xl',
    width: 'w-32',
    cell: (row: CronJobData) => (
      <StatusBadge
        meta={{
          label: row.isRegistered ? MESSAGES.common.yes : MESSAGES.common.no,
          intent: row.isRegistered ? 'success' : 'neutral',
        }}
      />
    ),
  },
] as const;

export function SystemHealthPage() {
  const {
    health,
    cronJobs,
    failedJobs,
    failedJobStats,
    failedJobPage,
    setFailedJobPage,
    isLoading,
    error,
    actionError,
    isActioning,
    clearCache,
    triggerJob,
    retryFailedJob,
    resolveFailedJob,
    deleteFailedJob,
    refresh,
  } = useSystemHealth();

  const failedJobColumns = [
    {
      key: 'jobName',
      header: df.jobName,
      cell: (row: FailedJobData) => <span className="font-medium">{row.jobName}</span>,
    },
    {
      key: 'queue',
      header: df.queue,
      hideBelow: 'lg',
      width: 'w-32',
      cell: (row: FailedJobData) => <span className="text-sm">{row.queue}</span>,
    },
    {
      key: 'attempt',
      header: df.attempt,
      align: 'center',
      hideBelow: 'xl',
      width: 'w-24',
      cell: (row: FailedJobData) => <span className="text-sm">{row.attempt}</span>,
    },
    {
      key: 'maxAttempts',
      header: df.maxAttempts,
      align: 'center',
      hideBelow: 'xl',
      width: 'w-32',
      cell: (row: FailedJobData) => <span className="text-sm">{row.maxAttempts}</span>,
    },
    {
      key: 'failedAt',
      header: df.failedAt,
      hideBelow: '2xl',
      width: 'w-40',
      cell: (row: FailedJobData) => <span className="text-sm">{row.failedAt}</span>,
    },
    {
      key: 'actions',
      header: MESSAGES.common.actions,
      align: 'center',
      width: 'w-32',
      cell: (row: FailedJobData) => {
        const items: OptionsMenuItem[] = [
          { label: df.retry, onSelect: () => void retryFailedJob(row.failedJobId) },
          { label: df.resolve, onSelect: () => void resolveFailedJob(row.failedJobId) },
          { label: df.delete, intent: 'danger', onSelect: () => void deleteFailedJob(row.failedJobId) },
        ];
        return (
          <OptionsMenu label={MESSAGES.common.actions} items={items} className="flex justify-end" />
        );
      },
    },
  ] as const;

  const [jobToTrigger, setJobToTrigger] = useState<string>('');
  const [cronFiltersOpen, setCronFiltersOpen] = useState(false);
  const [draftRegistered, setDraftRegistered] = useState<'all' | 'yes' | 'no'>('all');
  const [appliedRegistered, setAppliedRegistered] = useState<'all' | 'yes' | 'no'>('all');
  const activeCronFilterCount = appliedRegistered !== 'all' ? 1 : 0;

  const openCronFilters = () => {
    setDraftRegistered(appliedRegistered);
    setCronFiltersOpen(true);
  };

  const resetCronDraft = () => {
    setDraftRegistered('all');
  };

  const applyCronDraft = () => {
    setAppliedRegistered(draftRegistered);
    setCronFiltersOpen(false);
  };

  const filteredCronJobs = cronJobs.filter((job) => {
    if (appliedRegistered === 'all') return true;
    return appliedRegistered === 'yes' ? job.isRegistered : !job.isRegistered;
  });

  if (isLoading && !health) {
    return (
      <div className="flex min-h-0 flex-col">
        <PageHeader title={df.title} description={df.subtitle} />
        <div className="p-8 flex items-center justify-center">
          <span className="size-8"><Spinner /></span>
        </div>
      </div>
    );
  }

  if (error && !health) {
    return (
      <div className="flex min-h-0 flex-col">
        <PageHeader title={df.title} description={df.subtitle} />
        <div className="p-8 flex flex-col items-center justify-center gap-3">
          <p className="text-destructive">{error}</p>
          <RefreshButton onRefresh={() => void refresh()} label={MESSAGES.common.retry} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-col">
      <PageHeader
        title={df.title}
        description={df.subtitle}
        action={<RefreshButton onRefresh={() => void refresh()} isRefreshing={isActioning} label={MESSAGES.dashboard.refresh} />}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{df.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-fg">{df.database}</span>
              {healthBadge(health?.status || 'down')}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-fg-muted">{df.database}</span>
              <span className="text-sm">
                {health?.database.ok ? 'OK' : 'Error'}
                {health?.database.latencyMs && ` (${health.database.latencyMs}ms)`}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-fg-muted">{df.uptime}</span>
              <span className="text-sm">
                {Math.floor((health?.uptimeSeconds || 0) / 3600)}h{' '}
                {Math.floor(((health?.uptimeSeconds || 0) % 3600) / 60)}m
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-fg-muted">{df.memory}</span>
              <span className="text-sm">{health?.memoryMb} MB</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-fg-muted">{df.nodeVersion}</span>
              <span className="text-sm text-fg-muted">{health?.nodeVersion}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-fg-muted">{df.lastChecked}</span>
              <span className="text-sm text-fg-muted">{health?.checkedAt}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{MESSAGES.common.actions}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              onClick={() => void clearCache()}
              disabled={isActioning}
              loading={isActioning}
              className="w-full"
            >
              {df.clearCache}
            </Button>
            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-fg-muted">{df.cronJobs}</span>
              <Input
                value={jobToTrigger}
                onChange={(e) => setJobToTrigger(e.target.value)}
                placeholder="Job name"
                className="flex-1"
              />
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (jobToTrigger) void triggerJob(jobToTrigger);
              }}
              disabled={isActioning || !jobToTrigger}
              loading={isActioning}
              className="w-full"
            >
              {df.trigger}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>{df.cronJobs}</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <DataTable
            columns={cronColumns}
            rows={filteredCronJobs}
            rowKey={(row) => row.name}
            toolbar={{
              filters: {
                label: MESSAGES.common.filters,
                count: activeCronFilterCount,
                onOpen: openCronFilters,
              },
              actions: (
                <RefreshButton onRefresh={() => void refresh()} size="sm" label={MESSAGES.dashboard.refresh} isRefreshing={isLoading} />
              ),
            }}
            isLoading={isLoading}
            error={error}
            onRetry={() => void refresh()}
          />
        </CardContent>
      </Card>
      <FilterSheet
        open={cronFiltersOpen}
        title={MESSAGES.common.filters}
        onClose={() => setCronFiltersOpen(false)}
        onReset={resetCronDraft}
        onDone={applyCronDraft}
      >
        <FilterGroup label={df.registered}>
          <FilterOption
            label={MESSAGES.common.viewAll}
            selected={draftRegistered === 'all'}
            onSelect={() => setDraftRegistered('all')}
          />
          <FilterOption
            label={MESSAGES.common.yes}
            selected={draftRegistered === 'yes'}
            onSelect={() => setDraftRegistered('yes')}
          />
          <FilterOption
            label={MESSAGES.common.no}
            selected={draftRegistered === 'no'}
            onSelect={() => setDraftRegistered('no')}
          />
        </FilterGroup>
      </FilterSheet>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>{df.failedJobs}</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid gap-4 sm:grid-cols-3 text-center mb-4">
            <div className="p-3 border border-border rounded-lg bg-surface/30">
              <div className="text-xs text-fg-muted">{df.stats.pending}</div>
              <div className="text-lg font-semibold">{failedJobStats.pendingCount}</div>
            </div>
            <div className="p-3 border border-border rounded-lg bg-surface/30">
              <div className="text-xs text-fg-muted">{df.stats.resolved}</div>
              <div className="text-lg font-semibold">{failedJobStats.resolvedCount}</div>
            </div>
            <div className="p-3 border border-border rounded-lg bg-surface/30">
              <div className="text-xs text-fg-muted">{df.stats.abandoned}</div>
              <div className="text-lg font-semibold">{failedJobStats.abandonedCount}</div>
            </div>
          </div>
          <DataTable
            columns={failedJobColumns}
            rows={failedJobs}
            rowKey={(row) => row.failedJobId}
            toolbar={{
              actions: (
                <RefreshButton onRefresh={() => void refresh()} size="sm" label={MESSAGES.dashboard.refresh} isRefreshing={isLoading} />
              ),
            }}
            isLoading={isLoading}
            error={error}
            onRetry={() => void refresh()}
            footer={
              <Pagination
                currentPage={failedJobPage}
                totalPage={Math.ceil(failedJobStats.pendingCount / FAILED_JOB_PAGE_SIZE)}
                totalRecord={failedJobStats.pendingCount}
                limit={FAILED_JOB_PAGE_SIZE}
                onPageChange={setFailedJobPage}
              />
            }
          />
        </CardContent>
      </Card>

      {actionError && (
        <div className="p-4 text-destructive text-sm">{actionError}</div>
      )}
    </div>
  );
}

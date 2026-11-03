'use client';

import { RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '@/components/common/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ROUTES, FAILED_JOB_PAGE_SIZE } from '@/constants';
import { useSystemHealth } from '@/hooks/use-system-health';
import type { CronJobData, FailedJobData } from '@/lib/api/contract';
import { formatRelativeTime } from '@/lib/utils/datetime';
import { showSuccess } from '@/lib/utils/toast';
import { MESSAGES } from '@/messages';

const { systemHealth } = MESSAGES;
const df = systemHealth;

const healthBadge = (status: string) => {
  switch (status) {
    case 'healthy':
      return <Badge intent="success">{df.statusHealthy}</Badge>;
    case 'degraded':
      return <Badge intent="warning">{df.statusDegraded}</Badge>;
    default:
      return <Badge intent="danger">{df.statusDown}</Badge>;
  }
};

const cronColumns = [
  {
    key: 'name',
    header: 'Job',
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
      <Badge intent={row.isRegistered ? 'success' : 'neutral'}>
        {row.isRegistered ? 'Yes' : 'No'}
      </Badge>
    ),
  },
] as const;

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
    cell: (row: FailedJobData) => null,
  },
] as const;

export default function ClientSystemPage() {
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
    clearActionError,
  } = useSystemHealth();

  const [jobToTrigger, setJobToTrigger] = useState<string | null>(null);

  if (isLoading && !health) {
    return (
      <div className="flex min-h-0 flex-col">
        <PageHeader title={df.title} description={df.subtitle} />
        <div className="p-8 flex items-center justify-center">Loading…</div>
      </div>
    );
  }

  if (error && !health) {
    return (
      <div className="flex min-h-0 flex-col">
        <PageHeader title={df.title} description={df.subtitle} />
        <div className="p-8 flex flex-col items-center justify-center gap-3">
          <p className="text-destructive">{error}</p>
          <Button variant="outline" onClick={() => void refresh()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-col">
      <PageHeader title={df.title} description={df.subtitle} />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{df.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-fg">Status</span>
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
            <CardTitle>Actions</CardTitle>
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
              <span className="text-xs text-fg-muted">Cron Job</span>
              <Input
                value={jobToTrigger ?? ''}
                onChange={(e) => setJobToTrigger(e.target.value || null)}
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

      <Card>
        <CardHeader>
          <CardTitle>{df.cronJobs}</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  {cronColumns.map((col) => (
                    <th
                      key={col.key}
                      className="px-4 py-2 text-xs font-medium text-fg-muted border-b border-border bg-surface/30"
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cronJobs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={cronColumns.length}
                      className="px-4 py-4 text-center text-sm text-fg-muted"
                    >
                      No cron jobs found.
                    </td>
                  </tr>
                ) : (
                  cronJobs.map((job) => (
                    <tr key={job.name} className="border-b border-border hover:bg-surface/50">
                      {cronColumns.map((col) => (
                        <td key={col.key} className="px-4 py-2 text-sm">
                          {col.cell(job)}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
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
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  {failedJobColumns.map((col) => (
                    <th
                      key={col.key}
                      className="px-4 py-2 text-xs font-medium text-fg-muted border-b border-border bg-surface/30"
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {failedJobs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={failedJobColumns.length}
                      className="px-4 py-4 text-center text-sm text-fg-muted"
                    >
                      No failed jobs.
                    </td>
                  </tr>
                ) : (
                  failedJobs.map((job) => (
                    <tr key={job.failedJobId} className="border-b border-border hover:bg-surface/50">
                      <td className="px-4 py-2 text-sm">{job.jobName}</td>
                      <td className="px-4 py-2 text-sm">{job.queue}</td>
                      <td className="px-4 py-2 text-sm">{job.attempt}</td>
                      <td className="px-4 py-2 text-sm">{job.maxAttempts}</td>
                      <td className="px-4 py-2 text-sm">{job.failedAt}</td>
                      <td className="px-4 py-2 text-sm text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => void retryFailedJob(job.failedJobId)}
                          disabled={isActioning}
                        >
                          {df.retry}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => void resolveFailedJob(job.failedJobId)}
                          disabled={isActioning}
                        >
                          {df.resolve}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => void deleteFailedJob(job.failedJobId)}
                          disabled={isActioning}
                        >
                          {df.delete}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end mt-2">
            <button
              onClick={() => setFailedJobPage((p) => p + 1)}
              disabled={isActioning || failedJobs.length === 0}
              className="text-xs text-fg-muted hover:text-fg"
            >
              Next ›
            </button>
          </div>
        </CardContent>
      </Card>

      {actionError && (
        <div className="p-4 text-destructive text-sm">{actionError}</div>
      )}
    </div>
  );
}

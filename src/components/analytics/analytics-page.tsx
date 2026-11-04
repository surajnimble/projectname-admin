'use client';

import { PageHeader } from '@/components/common/page-header';
import { DataTable } from '@/components/common/data-table';
import { Pagination } from '@/components/common/pagination';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatusBadge, catalogStatusMeta } from '@/components/common/status-badge';
import { useAnalytics } from '@/hooks/use-analytics';
import { MESSAGES } from '@/messages';

export function AnalyticsPage() {
  const {
    overview,
    visitors,
    trafficSources,
    deviceBreakdown,
    sessions,
    sessionsList,
    isLoading,
    error,
    search,
    setSearch,
    refresh,
  } = useAnalytics();

  const a = MESSAGES.analytics;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={MESSAGES.sections.analytics}
        description={a.subtitle}
        action={
          <Button variant="primary" size="sm" onClick={() => void refresh()}>
            {MESSAGES.dashboard.refresh}
          </Button>
        }
      />
      {isLoading && !overview && (
        <div className="p-8 flex items-center justify-center">
          <span className="sr-only">{MESSAGES.common.loading}</span>
          <span className="flex flex-col items-center gap-2">
            <span className="h-9 w-36 animate-pulse rounded-lg bg-surface-muted" />
          </span>
        </div>
      )}
      {!isLoading && (
        <>
          {/* Overview stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-fg-muted text-sm">{a.totalRevenue}</p>
                  <h3 className="text-2xl font-bold">
                    {overview?.totalRevenue?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                  </h3>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-fg-muted text-sm">{a.totalOrders}</p>
                  <h3 className="text-2xl font-bold">{overview?.totalOrders?.toLocaleString()}</h3>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-fg-muted text-sm">{a.totalCustomers}</p>
                  <h3 className="text-2xl font-bold">{overview?.totalCustomers?.toLocaleString()}</h3>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-fg-muted text-sm">{a.totalProducts}</p>
                  <h3 className="text-2xl font-bold">{overview?.totalProducts?.toLocaleString()}</h3>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-fg-muted text-sm">{a.conversionRate}</p>
                  <h3 className="text-2xl font-bold">{overview?.conversionRate?.toFixed(2)}%</h3>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-fg-muted text-sm">{a.avgOrderValue}</p>
                  <h3 className="text-2xl font-bold">
                    {overview?.avgOrderValue?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                  </h3>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Visitors Chart */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{a.sections.visitors}</h3>
              </div>
              <div className="h-48 flex items-end justify-between gap-1">
                {visitors.map((v) => (
                  <div key={v.date} className="flex flex-col items-center gap-1">
                    <span className="w-3 bg-success/30" style={{ height: `${Math.min((v.visitors / 1000) * 100, 100)}%` }} />
                    <span className="text-xs text-fg-muted">{v.visitors}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-fg-muted mt-2">
                {visitors.length > 0 ? visitors[0]?.date : '-'}
                {visitors.length > 0 ? visitors[visitors.length - 1]?.date : '-'}
              </div>
            </Card>

            {/* Traffic Sources */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{a.sections.trafficSources}</h3>
              </div>
              <DataTable
                columns={[
                  {
                    key: 'source',
                    header: a.columns.source,
                    cell: (row) => <span className="font-medium">{row.source}</span>,
                  },
                  {
                    key: 'medium',
                    header: a.columns.medium,
                    cell: (row) => <span className="text-sm">{row.medium}</span>,
                  },
                  {
                    key: 'visits',
                    header: a.columns.visits,
                    align: 'right',
                    cell: (row) => <span className="text-sm">{row.visits}</span>,
                  },
                  {
                    key: 'conversions',
                    header: a.columns.conversions,
                    align: 'right',
                    cell: (row) => <span className="text-sm">{row.conversions}</span>,
                  },
                ]}
                rows={trafficSources}
                rowKey={(row) => row.source}
                emptyTitle={a.empty}
              />
            </Card>

            {/* Device Breakdown */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{a.sections.devices}</h3>
              </div>
              <DataTable
                columns={[
                  {
                    key: 'device',
                    header: a.columns.device,
                    cell: (row) => <span className="font-medium">{row.device}</span>,
                  },
                  {
                    key: 'os',
                    header: a.columns.os,
                    cell: (row) => <span className="text-sm">{row.os}</span>,
                  },
                  {
                    key: 'visitors',
                    header: a.columns.visits,
                    align: 'right',
                    cell: (row) => <span className="text-sm">{row.visitors}</span>,
                  },
                ]}
                rows={deviceBreakdown}
                rowKey={(row) => row.device}
                emptyTitle={a.empty}
              />
            </Card>
          </div>

          {/* Sessions List */}
          <Card className="overflow-hidden">
            <div className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <h3 className="text-lg font-semibold">{a.sections.sessions}</h3>
              <Button variant="outline" size="sm" loading={isLoading} onClick={() => void refresh()}>
                {MESSAGES.dashboard.refresh}
              </Button>
            </div>
            <DataTable
              columns={[
                {
                  key: 'session',
                  header: a.columns.session,
                  cell: (row) => (
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full {row.isActive ? 'bg-success/20 text-success' : 'bg-surface-muted text-fg-muted'} flex items-center justify-center text-xs font-bold">
                        {row.userName?.slice(0, 2).toUpperCase()}
                      </span>
                      <span className="font-medium">{row.userName}</span>
                    </div>
                  ),
                },
                {
                  key: 'device',
                  header: a.columns.device,
                  cell: (row) => <span className="text-sm">{row.device}</span>,
                },
                {
                  key: 'country',
                  header: a.columns.country,
                  cell: (row) => <span className="text-sm">{row.country}</span>,
                },
                {
                  key: 'pages',
                  header: a.columns.pages,
                  align: 'right',
                  cell: (row) => <span className="text-sm">{row.pagesViewed}</span>,
                },
                {
                  key: 'duration',
                  header: a.columns.duration,
                  align: 'right',
                  cell: (row) => <span className="text-sm">{Math.floor(row.duration / 60)}m {row.duration % 60}s</span>,
                },
                {
                  key: 'status',
                  header: a.columns.status,
                  align: 'center',
                  cell: (row) => <StatusBadge meta={catalogStatusMeta(row.isActive ? 'ACTIVE' : 'INACTIVE')} />,
                },
              ]}
              rows={sessions}
              rowKey={(row) => row.sessionId}
              toolbar={{
                search: {
                  value: search,
                  placeholder: MESSAGES.common.search,
                  onChange: setSearch,
                },
              }}
              isLoading={isLoading}
              error={error}
              onRetry={() => void refresh()}
              emptyTitle={a.empty}
              footer={
                <Pagination
                  currentPage={sessionsList.currentPage}
                  totalPage={sessionsList.totalPage}
                  totalRecord={sessionsList.totalRecord}
                  limit={sessionsList.limit}
                  onPageChange={() => {}}
                />
              }
            />
          </Card>
        </>
      )}
    </div>
  );
}

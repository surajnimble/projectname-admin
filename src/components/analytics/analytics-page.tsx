'use client';

import { RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { DataTable } from '@/components/common/data-table';
import { FilterGroup, FilterOption, FilterSheet } from '@/components/common/filter-sheet';
import { Pagination } from '@/components/common/pagination';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatusBadge, catalogStatusMeta } from '@/components/common/status-badge';
import { useAnalytics } from '@/hooks/use-analytics';
import { MESSAGES } from '@/messages';
import type { AnalyticsRevenueReportSeriesData } from '@/lib/api/contract';

export function AnalyticsPage() {
  const {
    overview,
    visitors,
    trafficSources,
    deviceBreakdown,
    sessions,
    sessionsList,
    vendorPerformance,
    customerCohorts,
    abandonedCarts,
    searchTerms,
    zeroResultSearches,
    crashes,
    appVersions,
    revenueReport,
    isLoading,
    isFetching,
    error,
    search,
    setSearch,
    setPage,
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
            <Card className="overflow-hidden">
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
                isLoading={isLoading || isFetching}
                error={error}
                onRetry={() => void refresh()}
                emptyTitle={a.empty}
              />
            </Card>

            {/* Device Breakdown */}
            <Card className="overflow-hidden">
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
                isLoading={isLoading || isFetching}
                error={error}
                onRetry={() => void refresh()}
                emptyTitle={a.empty}
              />
            </Card>
          </div>

          {/* Sessions List */}
          <Card className="overflow-hidden">
            <DataTable
              columns={[
                {
                  key: 'session',
                  header: a.columns.session,
                  cell: (row) => (
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
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
                filters: {
                  label: MESSAGES.common.filters,
                  count: search ? 1 : 0,
                  onOpen: () => {},
                },
                actions: (
                  <Button
                    variant="outline"
                    size="sm"
                    loading={isLoading || isFetching}
                    onClick={() => void refresh()}
                    className="shrink-0"
                  >
                    <span className="flex items-center gap-2">
                  <RefreshCw className="size-4" aria-hidden="true" />
                      {MESSAGES.dashboard.refresh}
                    </span>
                  </Button>
                ),
              }}
              isLoading={isLoading || isFetching}
              error={error}
              onRetry={() => void refresh()}
              emptyTitle={a.empty}
              footer={
                <Pagination
                  currentPage={sessionsList.currentPage}
                  totalPage={sessionsList.totalPage}
                  totalRecord={sessionsList.totalRecord}
                  limit={sessionsList.limit}
                  onPageChange={setPage}
                />
              }
            />
          </Card>

          {/* Vendor Performance */}
          <Card className="overflow-hidden">
            <DataTable
              columns={[
                {
                  key: 'shop',
                  header: a.sections.vendorPerformance,
                  cell: (row) => <span className="font-medium">{row.shopName}</span>,
                },
                {
                  key: 'revenue',
                  header: a.columns.revenue,
                  align: 'right',
                  cell: (row) => <span className="text-sm">{row.revenue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>,
                },
                {
                  key: 'commission',
                  header: a.columns.commission,
                  align: 'right',
                  cell: (row) => <span className="text-sm">{row.commission.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>,
                },
                {
                  key: 'orders',
                  header: a.columns.orders,
                  align: 'right',
                  cell: (row) => <span className="text-sm">{row.subOrderCount}</span>,
                },
                {
                  key: 'fulfilmentRate',
                  header: a.columns.fulfilmentRate,
                  align: 'right',
                  cell: (row) => <span className="text-sm">{row.fulfilmentRate.toFixed(0)}%</span>,
                },
              ]}
              rows={vendorPerformance}
              rowKey={(row) => row.vendorId}
              isLoading={isLoading || isFetching}
              error={error}
              onRetry={() => void refresh()}
              emptyTitle={a.empty}
            />
          </Card>

          {/* Customer Cohorts */}
          <Card className="overflow-hidden">
            <div className="p-4">
              <h3 className="text-lg font-semibold">{a.sections.customerCohorts}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr>
                      <th className="pb-2 text-fg-muted font-medium">{a.columns.period}</th>
                      <th className="pb-2 text-fg-muted font-medium">{a.columns.customers}</th>
                      <th className="pb-2 text-fg-muted font-medium">{a.columns.retained}</th>
                      <th className="pb-2 text-fg-muted font-medium">{a.columns.retentionRate}</th>
                      <th className="pb-2 text-fg-muted font-medium">{a.columns.revenue}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerCohorts.map((c) => (
                      <tr key={c.period} className="border-b border-border/50">
                        <td className="py-2">{c.period}</td>
                        <td className="py-2">{c.customers}</td>
                        <td className="py-2">{c.retained}</td>
                        <td className="py-2">{c.retentionRate.toFixed(0)}%</td>
                        <td className="py-2">{c.revenue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

          {/* Abandoned Carts */}
          <Card className="overflow-hidden">
            <DataTable
              columns={[
                {
                  key: 'customer',
                  header: a.columns.customers,
                  cell: (row) => <span className="font-medium">{row.customerName}</span>,
                },
                {
                  key: 'email',
                  header: 'Email',
                  cell: (row) => <span className="text-sm text-fg-muted">{row.email}</span>,
                },
                {
                  key: 'items',
                  header: 'Items',
                  align: 'right',
                  cell: (row) => <span className="text-sm">{row.items}</span>,
                },
                {
                  key: 'value',
                  header: a.columns.cartValue,
                  align: 'right',
                  cell: (row) => <span className="text-sm">{row.value.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>,
                },
                {
                  key: 'abandonedAt',
                  header: 'Abandoned At',
                  cell: (row) => <span className="text-sm text-fg-muted">{row.abandonedAt}</span>,
                },
              ]}
              rows={abandonedCarts}
              rowKey={(row) => row.cartId}
              isLoading={isLoading || isFetching}
              error={error}
              onRetry={() => void refresh()}
              emptyTitle={a.empty}
            />
          </Card>

          {/* Search Terms */}
          <Card className="overflow-hidden">
            <DataTable
              columns={[
                {
                  key: 'term',
                  header: a.columns.term,
                  cell: (row) => <span className="font-medium">{row.term}</span>,
                },
                {
                  key: 'searches',
                  header: a.columns.searches,
                  align: 'right',
                  cell: (row) => <span className="text-sm">{row.searches}</span>,
                },
                {
                  key: 'results',
                  header: a.columns.results,
                  align: 'right',
                  cell: (row) => <span className="text-sm">{row.results}</span>,
                },
                {
                  key: 'conversions',
                  header: a.columns.conversions,
                  align: 'right',
                  cell: (row) => <span className="text-sm">{row.conversions}</span>,
                },
                {
                  key: 'conversionRate',
                  header: a.columns.conversionRate,
                  align: 'right',
                  cell: (row) => <span className="text-sm">{row.conversionRate.toFixed(0)}%</span>,
                },
              ]}
              rows={searchTerms}
              rowKey={(row) => row.term}
              isLoading={isLoading || isFetching}
              error={error}
              onRetry={() => void refresh()}
              emptyTitle={a.empty}
            />
          </Card>

          {/* Zero Result Searches */}
          <Card className="overflow-hidden">
            <DataTable
              columns={[
                {
                  key: 'term',
                  header: a.columns.term,
                  cell: (row) => <span className="font-medium">{row.term}</span>,
                },
                {
                  key: 'searches',
                  header: a.columns.searches,
                  align: 'right',
                  cell: (row) => <span className="text-sm">{row.searches}</span>,
                },
              ]}
              rows={zeroResultSearches}
              rowKey={(row) => row.term}
              isLoading={isLoading || isFetching}
              error={error}
              onRetry={() => void refresh()}
              emptyTitle={a.empty}
            />
          </Card>

          {/* Crashes */}
          <Card className="overflow-hidden">
            <DataTable
              columns={[
                {
                  key: 'appVersion',
                  header: a.columns.appVersion,
                  cell: (row) => <span className="font-medium">{row.appVersion}</span>,
                },
                {
                  key: 'os',
                  header: a.columns.os,
                  cell: (row) => <span className="text-sm">{row.os}</span>,
                },
                {
                  key: 'device',
                  header: a.columns.device,
                  cell: (row) => <span className="text-sm">{row.device}</span>,
                },
                {
                  key: 'count',
                  header: a.columns.count,
                  align: 'right',
                  cell: (row) => <span className="text-sm">{row.count}</span>,
                },
                {
                  key: 'lastOccurred',
                  header: a.columns.lastOccurred,
                  cell: (row) => <span className="text-sm text-fg-muted">{row.lastOccurred}</span>,
                },
              ]}
              rows={crashes}
              rowKey={(row) => row.crashId}
              isLoading={isLoading || isFetching}
              error={error}
              onRetry={() => void refresh()}
              emptyTitle={a.empty}
            />
          </Card>

          {/* App Versions */}
          <Card className="overflow-hidden">
            <DataTable
              columns={[
                {
                  key: 'appVersion',
                  header: a.columns.appVersion,
                  cell: (row) => <span className="font-medium">{row.version}</span>,
                },
                {
                  key: 'users',
                  header: a.columns.devices,
                  align: 'right',
                  cell: (row) => <span className="text-sm">{row.users}</span>,
                },
                {
                  key: 'crashes',
                  header: a.columns.crashRate,
                  align: 'right',
                  cell: (row) => <span className="text-sm">{row.crashRate.toFixed(0)}%</span>,
                },
              ]}
              rows={appVersions}
              rowKey={(row) => row.version}
              isLoading={isLoading || isFetching}
              error={error}
              onRetry={() => void refresh()}
              emptyTitle={a.empty}
            />
          </Card>

          {/* Revenue Report */}
          <Card className="p-4">
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold">{a.sections.revenueReport}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-surface-muted rounded-lg">
                  <p className="text-fg-muted text-sm">{a.totalRevenue}</p>
                  <h3 className="text-2xl font-bold">{revenueReport.totalRevenue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</h3>
                </div>
                <div className="p-3 bg-surface-muted rounded-lg">
                  <p className="text-fg-muted text-sm">{a.totalOrders}</p>
                  <h3 className="text-2xl font-bold">{revenueReport.totalOrders}</h3>
                </div>
                <div className="p-3 bg-surface-muted rounded-lg">
                  <p className="text-fg-muted text-sm">{a.avgOrderValue}</p>
                  <h3 className="text-2xl font-bold">{revenueReport.averageOrderValue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</h3>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr>
                      <th className="pb-2 text-fg-muted font-medium">{a.columns.period}</th>
                      <th className="pb-2 text-fg-muted font-medium">{a.columns.revenue}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueReport.series.map((s: AnalyticsRevenueReportSeriesData) => (
                      <tr key={s.date} className="border-b border-border/50">
                        <td className="py-2">{s.date}</td>
                        <td className="py-2">{s.revenue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { PermissionGuard } from '@/components/auth/guards';
import { PageHeader } from '@/components/common/page-header';
import { DataTable } from '@/components/common/data-table';
import { Pagination } from '@/components/common/pagination';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { OptionsMenu, type OptionsMenuItem } from '@/components/ui/options-menu';
import { useAnalytics } from '@/hooks/use-analytics';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';

export default function ClientAnalyticsPage() {
  const {
    overview,
    visitors,
    uniqueVisitors,
    pageViews,
    topPages,
    trafficSources,
    deviceBreakdown,
    geoBreakdown,
    sessions,
    sessionsList,
    funnel,
    conversions,
    revenueReport,
    productPerformance,
    vendorPerformance,
    customerCohorts,
    abandonedCarts,
    searchTerms,
    zeroResultSearches,
    realtime,
    crashes,
    appVersions,
    funnelList,
    isLoading,
    error,
    page,
    search,
    setPage,
    setSearch,
    refresh,
  } = useAnalytics();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={MESSAGES.sections.analytics}
        description={MESSAGES.analytics.subtitle}
        action={
          <Button variant="primary" size="sm" onClick={() => void refresh()}>
            {MESSAGES.dashboard.refresh}
          </Button>
        }
      />
      <PermissionGuard permission={PERMISSIONS.analyticsView}>
        {/* Overview stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-fg-muted text-sm">{MESSAGES.analytics.totalRevenue}</p>
                <h3 className="text-2xl font-bold">{overview?.totalRevenue?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</h3>
              </div>
              <div className="text-success">{'+12.5% vs last month'}</div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-fg-muted text-sm">{MESSAGES.analytics.totalOrders}</p>
                <h3 className="text-2xl font-bold">{overview.totalOrders?.toLocaleString()}</h3>
              </div>
              <div className="text-success">{'+8.3% vs last month'}</div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-fg-muted text-sm">{MESSAGES.analytics.totalCustomers}</p>
                <h3 className="text-2xl font-bold">{overview.totalCustomers.toLocaleString()}</h3>
              </div>
              <div className="text-success">{'+5.2% vs last month'}</div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-fg-muted text-sm">{MESSAGES.analytics.totalProducts}</p>
                <h3 className="text-2xl font-bold">{overview.totalProducts.toLocaleString()}</h3>
              </div>
              <div className="text-muted">-1.2%</div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-fg-muted text-sm">{MESSAGES.analytics.conversionRate}</p>
                <h3 className="text-2xl font-bold">{overview.conversionRate.toFixed(2)}%</h3>
              </div>
              <div className="text-success">{'+0.3% vs last month'}</div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-fg-muted text-sm">{MESSAGES.analytics.avgOrderValue}</p>
                <h3 className="text-2xl font-bold">{overview.avgOrderValue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</h3>
              </div>
              <div className="text-success">{'+2.1% vs last month'}</div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Visitors Chart */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Visitors</h3>
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
              {visitors.length > 0 ? visitors[0].date : '-'}
              {visitors.length > 0 ? visitors[visitors.length - 1].date : '-'}
            </div>
          </Card>

          {/* Traffic Sources */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Traffic Sources</h3>
            </div>
            <DataTable
              columns={[
                {
                  key: 'source',
                  header: 'Source',
                  cell: (row: any) => <span className="font-medium">{row.source}</span>,
                },
                {
                  key: 'medium',
                  header: 'Medium',
                  cell: (row: any) => <span className="text-sm">{row.medium}</span>,
                },
                {
                  key: 'visits',
                  header: 'Visits',
                  align: 'right',
                  cell: (row: any) => <span className="text-sm">{row.visits}</span>,
                },
                {
                  key: 'conversions',
                  header: 'Conversions',
                  align: 'right',
                  cell: (row: any) => <span className="text-sm">{row.conversions}</span>,
                },
              ]}
              rows={trafficSources}
              rowKey={(row: any) => row.source}
              emptyTitle={MESSAGES.analytics.empty}
            />
          </Card>

          {/* Device Breakdown */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Devices</h3>
            </div>
            <DataTable
              columns={[
                {
                  key: 'device',
                  header: 'Device',
                  cell: (row: any) => <span className="font-medium">{row.device}</span>,
                },
                {
                  key: 'os',
                  header: 'OS',
                  cell: (row: any) => <span className="text-sm">{row.os}</span>,
                },
                {
                  key: 'visitors',
                  header: 'Visitors',
                  align: 'right',
                  cell: (row: any) => <span className="text-sm">{row.visitors}</span>,
                },
              ]}
              rows={deviceBreakdown}
              rowKey={(row: any) => row.device}
              emptyTitle={MESSAGES.analytics.empty}
            />
          </Card>
        </div>

        {/* Sessions List */}
        <Card className="overflow-hidden">
          <div className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">Sessions</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search sessions..."
                  className="w-64 pl-9 pr-3 py-2 border border-input rounded-md text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" loading={isLoading} onClick={() => void refresh()}>
                {MESSAGES.dashboard.refresh}
              </Button>
            </div>
          </div>
          <DataTable
            columns={[
              {
                key: 'session',
                header: 'Session',
                cell: (row: any) => (
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
                header: 'Device',
                cell: (row: any) => (
                  <span className="text-sm">{row.device}</span>
                ),
              },
              {
                key: 'country',
                header: 'Country',
                cell: (row: any) => <span className="text-sm">{row.country}</span>,
              },
              {
                key: 'pages',
                header: 'Pages',
                align: 'right',
                cell: (row: any) => <span className="text-sm">{row.pagesViewed}</span>,
              },
              {
                key: 'duration',
                header: 'Duration',
                align: 'right',
                cell: (row: any) => <span className="text-sm">{Math.floor(row.duration / 60)}m {row.duration % 60}s</span>,
              },
              {
                key: 'status',
                header: 'Status',
                align: 'center',
                cell: (row: any) => (
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs border ${row.isActive ? 'border-success/20 text-success bg-success/10' : 'border-neutral/20 text-fg-muted bg-surface-muted'}`}>
                    {row.isActive ? 'Active' : 'Idle'}
                  </span>
                ),
              },
            ]}
            rows={sessions}
            rowKey={(row: any) => row.sessionId}
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
            emptyTitle={MESSAGES.analytics.empty}
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
      </PermissionGuard>
    </div>
  );
}

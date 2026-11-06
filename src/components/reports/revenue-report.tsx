'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Download
} from 'lucide-react';
import { PermissionGuard } from '@/components/auth/guards';
import { DataTable } from '@/components/common/data-table';
import { PageHeader } from '@/components/common/page-header';
import { Pagination } from '@/components/common/pagination';
import { FormError } from '@/components/common/form-error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { apiService } from '@/lib/api/api.service';
import type {
  AnalyticsRevenuePointData,
  AnalyticsRevenueReportData,
  AnalyticsVendorPerformanceData,
  AnalyticsVendorPerformanceListData,
} from '@/lib/api/contract';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';
import { formatCurrency } from '@/lib/utils';
import { RefreshButton } from '@/components/common/refresh-button';

const m = MESSAGES.reports;
const PAGE_SIZE = 10;

const localDateValue = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const emptyRevenue = (): AnalyticsRevenueReportData => ({
  from: '', to: '', groupBy: 'day', totalRevenue: 0, totalOrders: 0, averageOrderValue: 0, series: [],
});

const emptyVendorPage = (): AnalyticsVendorPerformanceListData => ({
  totalRecord: 0, totalPage: 0, currentPage: 1, limit: PAGE_SIZE,
  hasNext: false, hasPrevious: false, nextPage: 0, previousPage: 0, itemList: [],
});

export function RevenueReportPage() {
  const today = new Date();
  const [to, setTo] = useState(() => localDateValue(today));
  const [from, setFrom] = useState(() => {
    const start = new Date(today);
    start.setDate(start.getDate() - 29);
    return localDateValue(start);
  });
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day');
  const [vendorPage, setVendorPage] = useState(1);
  const [revenue, setRevenue] = useState<AnalyticsRevenueReportData>(emptyRevenue);
  const [vendors, setVendors] = useState<AnalyticsVendorPerformanceListData>(emptyVendorPage);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const requestId = useRef(0);

  const invalidRange = Boolean(from && to && from > to);

  const load = useCallback(async () => {
    if (from && to && from > to) {
      setError(m.invalidRange);
      setIsLoading(false);
      setIsFetching(false);
      return;
    }

    const request = ++requestId.current;
    setError('');
    setIsFetching(true);
    const query = { ...(from ? { from } : {}), ...(to ? { to } : {}) };
    try {
      const [revenueResponse, vendorResponse] = await Promise.all([
        apiService.getAnalyticsRevenueReport({ ...query, groupBy }),
        apiService.getAnalyticsVendorPerformance({ ...query, page: vendorPage, limit: PAGE_SIZE }),
      ]);

      if (request !== requestId.current) return;
      const failures = [revenueResponse, vendorResponse].filter((response) => !response.status);
      if (failures.length) setError(failures.map((response) => response.message).join(' '));
      if (revenueResponse.status) setRevenue(revenueResponse.data);
      if (vendorResponse.status) setVendors(vendorResponse.data);
    } catch {
      if (request === requestId.current) setError(m.loadFailed);
    } finally {
      if (request === requestId.current) {
        setIsLoading(false);
        setIsFetching(false);
      }
    }
  }, [from, to, groupBy, vendorPage]);

  useEffect(() => {
    void load();
    return () => { requestId.current += 1; };
  }, [load]);

  const exportRevenue = async () => {
    if (invalidRange || isExporting) return;
    setActionError('');
    setIsExporting(true);
    try {
      const response = await apiService.exportAnalytics({ report: 'revenue', from, to, groupBy });
      if (!response.status) {
        setActionError(response.message || m.exportFailed);
        return;
      }
      const objectUrl = URL.createObjectURL(response.data);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = 'revenue-report.csv';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch {
      setActionError(m.exportFailed);
    } finally {
      setIsExporting(false);
    }
  };

  const revenueColumns = [
    { key: 'period', header: m.period, cell: (row: AnalyticsRevenuePointData) => row.bucket },
    { key: 'orders', header: m.orders, align: 'right' as const, cell: (row: AnalyticsRevenuePointData) => row.orders.toLocaleString() },
    { key: 'revenue', header: m.revenue, align: 'right' as const, numeric: true, cell: (row: AnalyticsRevenuePointData) => formatCurrency(row.revenue) },
  ];

  const vendorColumns = [
    { key: 'vendor', header: m.vendor, cell: (row: AnalyticsVendorPerformanceData) => <span className="font-medium">{row.shopName || row.vendorId}</span> },
    { key: 'orders', header: m.orders, align: 'right' as const, cell: (row: AnalyticsVendorPerformanceData) => row.subOrderCount.toLocaleString() },
    { key: 'revenue', header: m.revenue, align: 'right' as const, numeric: true, cell: (row: AnalyticsVendorPerformanceData) => formatCurrency(row.revenue) },
    { key: 'commission', header: m.commission, align: 'right' as const, numeric: true, cell: (row: AnalyticsVendorPerformanceData) => formatCurrency(row.commission) },
    { key: 'earnings', header: m.earnings, align: 'right' as const, numeric: true, cell: (row: AnalyticsVendorPerformanceData) => formatCurrency(row.earnings) },
    { key: 'fulfilment', header: m.fulfilment, align: 'right' as const, cell: (row: AnalyticsVendorPerformanceData) => `${row.fulfilmentRate}%` },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={m.title}
        description={m.subtitle}
        action={(
          <div className="flex flex-wrap items-center gap-2">
            <RefreshButton onRefresh={() => void load()} size="sm" label={MESSAGES.dashboard.refresh} isRefreshing={isFetching} />
            <PermissionGuard permission={PERMISSIONS.analyticsExport} fallback={null}>
              <Button variant="primary" size="sm" onClick={() => void exportRevenue()} loading={isExporting} disabled={invalidRange}>
                <Download className="size-4" aria-hidden="true" />{m.export}
              </Button>
            </PermissionGuard>
          </div>
        )}
      />

      <Card className="flex flex-wrap items-end gap-3 p-4">
        <label className="flex min-w-40 flex-1 flex-col gap-1 text-sm font-medium">{m.from}<Input type="date" value={from} max={to || undefined} onChange={(event) => { setFrom(event.target.value); setVendorPage(1); }} /></label>
        <label className="flex min-w-40 flex-1 flex-col gap-1 text-sm font-medium">{m.to}<Input type="date" value={to} min={from || undefined} onChange={(event) => { setTo(event.target.value); setVendorPage(1); }} /></label>
        <label className="flex min-w-36 flex-col gap-1 text-sm font-medium">{m.groupBy}<select value={groupBy} onChange={(event) => setGroupBy(event.target.value as typeof groupBy)} className="h-10 rounded-md border border-input bg-background px-3 text-sm text-fg"><option value="day">{m.day}</option><option value="week">{m.week}</option><option value="month">{m.month}</option></select></label>
      </Card>

      {error && <FormError message={error} />}
      {actionError && <FormError message={actionError} />}

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="p-4"><p className="text-sm text-fg-muted">{m.totalRevenue}</p><p className="mt-1 text-xl font-semibold">{formatCurrency(revenue.totalRevenue)}</p></Card>
        <Card className="p-4"><p className="text-sm text-fg-muted">{m.paidOrders}</p><p className="mt-1 text-xl font-semibold">{revenue.totalOrders.toLocaleString()}</p></Card>
        <Card className="p-4"><p className="text-sm text-fg-muted">{m.averageOrderValue}</p><p className="mt-1 text-xl font-semibold">{formatCurrency(revenue.averageOrderValue)}</p></Card>
      </div>

      <Card className="overflow-hidden">
        <div className="p-4"><h2 className="font-semibold">{m.revenueTrend}</h2></div>
        <DataTable columns={revenueColumns} rows={revenue.series} rowKey={(row) => row.bucket} isLoading={isLoading || isFetching} onRetry={() => void load()} emptyTitle={m.noData} />
      </Card>

      <Card className="overflow-hidden">
        <div className="p-4"><h2 className="font-semibold">{m.vendorSales}</h2></div>
        <DataTable
          columns={vendorColumns}
          rows={vendors.itemList}
          rowKey={(row) => row.vendorId}
          isLoading={isLoading || isFetching}
          onRetry={() => void load()}
          emptyTitle={m.noData}
          footer={<Pagination currentPage={vendors.currentPage || vendorPage} totalPage={vendors.totalPage} totalRecord={vendors.totalRecord} limit={vendors.limit || PAGE_SIZE} onPageChange={setVendorPage} />}
        />
      </Card>
    </div>
  );
}

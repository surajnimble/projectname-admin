'use client';

import { useState } from 'react';
import {
  Download
} from 'lucide-react';
import { DataTable } from '@/components/common/data-table';
import { EntityDialog } from '@/components/common/entity-dialog';
import { FormError } from '@/components/common/form-error';
import { Pagination } from '@/components/common/pagination';
import { OptionsMenu, type OptionsMenuItem } from '@/components/ui/options-menu';
import { StatusBadge, catalogStatusMeta } from '@/components/common/status-badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAnalyticsExtended } from '@/hooks/use-analytics-extended';
import type { AnalyticsFunnelData } from '@/lib/api/contract';
import { MESSAGES } from '@/messages';
import { PermissionGuard } from '@/components/auth/guards';
import { PERMISSIONS } from '@/constants';
import { RefreshButton } from '@/components/common/refresh-button';

const a = MESSAGES.analytics;
const common = MESSAGES.common;
const x = a.extended;

const funnelCreateFields = [
  { key: 'name', label: x.funnelName, type: 'text' as const, required: true },
  { key: 'description', label: x.description, type: 'textarea' as const },
  { key: 'steps', label: x.funnelStepsJson, type: 'textarea' as const, required: true, placeholder: x.defaultFunnelSteps },
];
const funnelEditFields = [
  { key: 'name', label: x.funnelName, type: 'text' as const, required: true },
  { key: 'description', label: x.description, type: 'textarea' as const },
  { key: 'isActive', label: x.active, type: 'switch' as const },
];

export function AnalyticsExtendedReports() {
  const {
    vendorPage, setVendorPage, abandonedPage, setAbandonedPage, searchPage, setSearchPage,
    zeroResultsPage, setZeroResultsPage, crashPage, setCrashPage,
    vendors, cohorts, abandoned, searchTerms, zeroResults, crashes, versions, conversions,
    revenue, funnels, funnelReport, isLoading, isFetching, isExporting, isMutating, error, actionError,
    refresh, exportCsv, createFunnel, updateFunnel,
  } = useAnalyticsExtended();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [editingFunnel, setEditingFunnel] = useState<AnalyticsFunnelData | null>(null);
  const [dialogKey, setDialogKey] = useState(0);
  const [dialogError, setDialogError] = useState('');
  const [dialogValues, setDialogValues] = useState<Record<string, unknown>>({});

  const openCreateFunnel = () => {
    setDialogMode('add');
    setEditingFunnel(null);
    setDialogError('');
    setDialogValues({
      steps: x.defaultFunnelSteps,
    });
    setDialogKey((value) => value + 1);
    setDialogOpen(true);
  };

  const openEditFunnel = (row: AnalyticsFunnelData) => {
    setDialogMode('edit');
    setEditingFunnel(row);
    setDialogError('');
    setDialogValues({ name: row.name, description: row.description, isActive: row.isActive });
    setDialogKey((value) => value + 1);
    setDialogOpen(true);
  };

  const submitFunnel = async (values: Record<string, unknown>) => {
    setDialogError('');
    const name = String(values.name ?? '').trim();
    const description = String(values.description ?? '').trim();
    if (name.length < 2) {
      setDialogError(x.invalidFunnelName);
      return;
    }
    if (dialogMode === 'add') {
      let steps: unknown;
      try {
        steps = JSON.parse(String(values.steps ?? ''));
      } catch {
        setDialogError(x.invalidFunnelJson);
        return;
      }
      if (!Array.isArray(steps) || steps.length < 2 || steps.length > 12 || steps.some((step) =>
        !step || typeof step !== 'object' || typeof (step as Record<string, unknown>).name !== 'string' ||
        typeof (step as Record<string, unknown>).eventName !== 'string' ||
        String((step as Record<string, unknown>).name).trim().length < 2 ||
        String((step as Record<string, unknown>).eventName).trim().length < 2
      )) {
        setDialogError(x.invalidFunnelSteps);
        return;
      }
      const ok = await createFunnel({ name, description, isActive: true, steps });
      if (ok) setDialogOpen(false);
      return;
    }
    if (!editingFunnel) return;
    const ok = await updateFunnel(editingFunnel.funnelId, {
      name,
      description,
      isActive: values.isActive === true,
    });
    if (ok) setDialogOpen(false);
  };

  const vendorColumns = [
    { key: 'shop', header: x.columns.vendor, cell: (row: typeof vendors.itemList[number]) => <span className="font-medium">{row.shopName}</span> },
    { key: 'status', header: x.columns.status, align: 'center' as const, cell: (row: typeof vendors.itemList[number]) => <StatusBadge meta={catalogStatusMeta(row.status)} /> },
    { key: 'orders', header: x.columns.subOrders, align: 'right' as const, cell: (row: typeof vendors.itemList[number]) => row.subOrderCount.toLocaleString() },
    { key: 'revenue', header: x.columns.revenue, align: 'right' as const, numeric: true, cell: (row: typeof vendors.itemList[number]) => row.revenue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }) },
    { key: 'commission', header: x.columns.commission, align: 'right' as const, numeric: true, cell: (row: typeof vendors.itemList[number]) => row.commission.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }) },
    { key: 'earnings', header: x.columns.vendorEarnings, align: 'right' as const, numeric: true, cell: (row: typeof vendors.itemList[number]) => row.earnings.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }) },
    { key: 'fulfilment', header: x.columns.fulfilment, align: 'right' as const, cell: (row: typeof vendors.itemList[number]) => `${row.fulfilmentRate}%` },
  ];

  const cohortColumns = [
    { key: 'date', header: x.columns.date, cell: (row: typeof cohorts.series[number]) => row.date },
    { key: 'carts', header: x.columns.carts, align: 'right' as const, cell: (row: typeof cohorts.series[number]) => row.carts.toLocaleString() },
    { key: 'orders', header: x.columns.orders, align: 'right' as const, cell: (row: typeof cohorts.series[number]) => row.orders.toLocaleString() },
    { key: 'conversion', header: x.columns.cartConversion, align: 'right' as const, cell: (row: typeof cohorts.series[number]) => `${row.conversionRate}%` },
    { key: 'revenue', header: x.columns.revenue, align: 'right' as const, numeric: true, cell: (row: typeof cohorts.series[number]) => row.revenue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }) },
  ];

  const abandonedColumns = [
    { key: 'customer', header: x.columns.customer, cell: (row: typeof abandoned.itemList[number]) => <div><span className="block font-medium">{row.userData.name || 'Guest'}</span><span className="text-xs text-fg-muted">{row.userData.email}</span></div> },
    { key: 'items', header: x.columns.items, align: 'right' as const, cell: (row: typeof abandoned.itemList[number]) => row.itemCount },
    { key: 'value', header: x.columns.cartValue, align: 'right' as const, numeric: true, cell: (row: typeof abandoned.itemList[number]) => row.value.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }) },
    { key: 'age', header: x.columns.abandonedFor, align: 'right' as const, cell: (row: typeof abandoned.itemList[number]) => `${row.abandonedForHours}h` },
  ];

  const searchColumns = [
    { key: 'term', header: x.columns.searchTerm, cell: (row: typeof searchTerms.itemList[number]) => <span className="font-medium">{row.term}</span> },
    { key: 'results', header: x.columns.results, align: 'right' as const, cell: (row: typeof searchTerms.itemList[number]) => row.resultCount },
    { key: 'status', header: x.columns.status, align: 'center' as const, cell: (row: typeof searchTerms.itemList[number]) => <StatusBadge meta={catalogStatusMeta(row.hasResults ? 'ACTIVE' : 'INACTIVE')} /> },
    { key: 'created', header: x.columns.searchedAt, cell: (row: typeof searchTerms.itemList[number]) => row.createdAt },
  ];

  const crashColumns = [
    { key: 'platform', header: x.columns.platform, cell: (row: typeof crashes.itemList[number]) => row.os },
    { key: 'version', header: x.columns.appVersion, cell: (row: typeof crashes.itemList[number]) => row.appVersion || '—' },
    { key: 'device', header: x.columns.device, cell: (row: typeof crashes.itemList[number]) => row.device || '—' },
    { key: 'error', header: x.columns.error, cell: (row: typeof crashes.itemList[number]) => <span className="block max-w-96 truncate" title={row.error}>{row.error}</span> },
    { key: 'at', header: x.columns.reportedAt, cell: (row: typeof crashes.itemList[number]) => row.lastOccurred },
  ];

  const versionColumns = [
    { key: 'platform', header: x.columns.platform, cell: (row: typeof versions.itemList[number]) => row.platform || '—' },
    { key: 'version', header: x.columns.appVersion, cell: (row: typeof versions.itemList[number]) => row.version || '—' },
    { key: 'devices', header: x.columns.devices, align: 'right' as const, cell: (row: typeof versions.itemList[number]) => row.users.toLocaleString() },
    { key: 'share', header: x.columns.deviceShare, align: 'right' as const, cell: (row: typeof versions.itemList[number]) => `${row.deviceShare}%` },
  ];

  const conversionColumns = [
    { key: 'date', header: x.columns.date, cell: (row: typeof conversions.itemList[number]) => row.date },
    { key: 'orders', header: x.columns.orders, align: 'right' as const, cell: (row: typeof conversions.itemList[number]) => row.conversions.toLocaleString() },
    { key: 'revenue', header: x.columns.revenue, align: 'right' as const, numeric: true, cell: (row: typeof conversions.itemList[number]) => row.revenue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }) },
  ];

  const revenueColumns = [
    { key: 'bucket', header: x.columns.period, cell: (row: typeof revenue.series[number]) => row.bucket },
    { key: 'orders', header: x.columns.orders, align: 'right' as const, cell: (row: typeof revenue.series[number]) => row.orders.toLocaleString() },
    { key: 'revenue', header: x.columns.revenue, align: 'right' as const, numeric: true, cell: (row: typeof revenue.series[number]) => row.revenue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }) },
  ];

  const funnelColumns = [
    { key: 'name', header: x.funnels, cell: (row: AnalyticsFunnelData) => <div><span className="block font-medium">{row.name}</span><span className="text-xs text-fg-muted">/{row.slug}</span></div> },
    { key: 'steps', header: x.columns.steps, align: 'right' as const, cell: (row: AnalyticsFunnelData) => row.stepCount },
    { key: 'status', header: x.columns.status, align: 'center' as const, cell: (row: AnalyticsFunnelData) => <StatusBadge meta={catalogStatusMeta(row.isActive ? 'ACTIVE' : 'INACTIVE')} /> },
  ];

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">{x.title}</h2>
          <p className="text-sm text-fg-muted">{x.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <RefreshButton onRefresh={() => void refresh()} size="sm" label={MESSAGES.common.refresh} isRefreshing={isFetching || isLoading} />
          <PermissionGuard permission={PERMISSIONS.analyticsExport} fallback={null}>
            <Button variant="primary" size="sm" onClick={() => void exportCsv()} loading={isExporting}>
              <Download className="size-4" aria-hidden="true" />{MESSAGES.common.export}
            </Button>
          </PermissionGuard>
        </div>
      </div>
      {error && <FormError message={error} />}
      {actionError && <FormError message={actionError} />}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="p-4"><p className="text-sm text-fg-muted">{x.revenue30Days}</p><p className="mt-1 text-xl font-semibold">{revenue.totalRevenue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p></Card>
        <Card className="p-4"><p className="text-sm text-fg-muted">{x.paidOrders}</p><p className="mt-1 text-xl font-semibold">{revenue.totalOrders.toLocaleString()}</p></Card>
        <Card className="p-4"><p className="text-sm text-fg-muted">{x.averageOrderValue}</p><p className="mt-1 text-xl font-semibold">{revenue.averageOrderValue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p></Card>
      </div>

      <Tabs defaultValue="revenue" className="min-w-0">
        <TabsList className="h-auto w-full flex-wrap justify-start overflow-x-auto">
          <TabsTrigger value="revenue">{x.revenue}</TabsTrigger>
          <TabsTrigger value="conversions">{x.conversions}</TabsTrigger>
          <TabsTrigger value="vendors">{x.vendors}</TabsTrigger>
          <TabsTrigger value="cohorts">{x.cohorts}</TabsTrigger>
          <TabsTrigger value="carts">{x.abandonedCarts}</TabsTrigger>
          <TabsTrigger value="search">{x.search}</TabsTrigger>
          <TabsTrigger value="crashes">{x.crashes}</TabsTrigger>
          <TabsTrigger value="versions">{x.appVersions}</TabsTrigger>
          <TabsTrigger value="funnels">{x.funnels}</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <Card className="overflow-hidden"><DataTable columns={revenueColumns} rows={revenue.series} rowKey={(row) => row.bucket} isLoading={isLoading} emptyTitle={x.empty.revenue} /></Card>
        </TabsContent>
        <TabsContent value="conversions">
          <Card className="overflow-hidden"><DataTable columns={conversionColumns} rows={conversions.itemList} rowKey={(row) => row.date} isLoading={isLoading} emptyTitle={x.empty.conversions} /></Card>
        </TabsContent>
        <TabsContent value="vendors">
          <Card className="overflow-hidden"><DataTable columns={vendorColumns} rows={vendors.itemList} rowKey={(row) => row.vendorId} isLoading={isLoading} emptyTitle={x.empty.vendors} footer={<Pagination currentPage={vendors.currentPage || vendorPage} totalPage={vendors.totalPage} totalRecord={vendors.totalRecord} limit={vendors.limit || 10} onPageChange={setVendorPage} />} /></Card>
        </TabsContent>
        <TabsContent value="cohorts">
          <Card className="overflow-hidden"><DataTable columns={cohortColumns} rows={cohorts.series} rowKey={(row) => row.date} isLoading={isLoading} emptyTitle={x.empty.cohorts} /></Card>
        </TabsContent>
        <TabsContent value="carts">
          <Card className="overflow-hidden"><div className="p-4 text-sm text-fg-muted">{x.estimatedCartValue}: {abandoned.totalValue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</div><DataTable columns={abandonedColumns} rows={abandoned.itemList} rowKey={(row) => row.cartId} isLoading={isLoading} emptyTitle={x.empty.carts} footer={<Pagination currentPage={abandoned.currentPage || abandonedPage} totalPage={abandoned.totalPage} totalRecord={abandoned.totalRecord} limit={abandoned.limit || 10} onPageChange={setAbandonedPage} />} /></Card>
        </TabsContent>
        <TabsContent value="search">
          <div className="grid gap-4 xl:grid-cols-2">
            <Card className="overflow-hidden"><div className="p-4 font-semibold">{x.allSearchTerms}</div><DataTable columns={searchColumns} rows={searchTerms.itemList} rowKey={(row) => row.searchLogId} isLoading={isLoading} emptyTitle={x.empty.searchTerms} footer={<Pagination currentPage={searchTerms.currentPage || searchPage} totalPage={searchTerms.totalPage} totalRecord={searchTerms.totalRecord} limit={searchTerms.limit || 10} onPageChange={setSearchPage} />} /></Card>
            <Card className="overflow-hidden"><div className="p-4 font-semibold">{x.zeroResultSearches}</div><DataTable columns={searchColumns} rows={zeroResults.itemList} rowKey={(row) => row.searchLogId} isLoading={isLoading} emptyTitle={x.empty.zeroResults} footer={<Pagination currentPage={zeroResults.currentPage || zeroResultsPage} totalPage={zeroResults.totalPage} totalRecord={zeroResults.totalRecord} limit={zeroResults.limit || 10} onPageChange={setZeroResultsPage} />} /></Card>
          </div>
        </TabsContent>
        <TabsContent value="crashes">
          <Card className="overflow-hidden"><DataTable columns={crashColumns} rows={crashes.itemList} rowKey={(row) => row.crashId} isLoading={isLoading} emptyTitle={x.empty.crashes} footer={<Pagination currentPage={crashes.currentPage || crashPage} totalPage={crashes.totalPage} totalRecord={crashes.totalRecord} limit={crashes.limit || 10} onPageChange={setCrashPage} />} /></Card>
        </TabsContent>
        <TabsContent value="versions">
          <Card className="overflow-hidden"><DataTable columns={versionColumns} rows={versions.itemList} rowKey={(row) => row.version} isLoading={isLoading} emptyTitle={x.empty.versions} /></Card>
        </TabsContent>
        <TabsContent value="funnels">
          <Card className="overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 p-4"><h3 className="font-semibold">{x.funnelManagement}</h3><Button size="sm" variant="primary" onClick={openCreateFunnel}>{x.createFunnel}</Button></div>
            <DataTable
              columns={funnelColumns}
              rows={funnels.funnelList}
              rowKey={(row) => row.funnelId}
              isLoading={isLoading}
              emptyTitle={x.empty.funnels}
              actions={{
                header: common.actions,
                render: (row) => {
                  const items: OptionsMenuItem[] = [
                    { label: common.editExisting, onSelect: () => openEditFunnel(row) },
                    { label: row.isActive ? 'Deactivate' : 'Activate', onSelect: () => void updateFunnel(row.funnelId, { isActive: !row.isActive }) },
                  ];
                  return <OptionsMenu label={common.actions} items={items} className="flex justify-end" />;
                },
              }}
            />
            {funnelReport.stepList.length > 0 && (
              <div className="border-t border-border p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><h4 className="font-semibold">{funnelReport.name} {x.conversion}</h4><p className="text-sm text-fg-muted">{x.overallConversion}: {funnelReport.overallConversionRate}%</p></div></div>
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">{funnelReport.stepList.map((step) => <div key={step.stepId} className="rounded-lg border border-border p-3"><p className="text-sm font-medium">{step.name}</p><p className="mt-1 text-xl font-semibold">{step.count.toLocaleString()}</p><p className="text-xs text-fg-muted">{step.conversionRate}% {x.previousStep} · {step.dropOff} {x.dropped}</p></div>)}</div>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <EntityDialog
        key={dialogKey}
        open={dialogOpen}
        mode={dialogMode}
        title={dialogMode === 'add' ? x.newFunnel : x.editFunnel}
        submitLabel={dialogMode === 'add' ? MESSAGES.common.create : common.save}
        fields={dialogMode === 'add' ? funnelCreateFields : funnelEditFields}
        defaultValues={dialogValues}
        isSubmitting={isFetching || isMutating}
        error={dialogError}
        onClose={() => setDialogOpen(false)}
        onSubmit={submitFunnel}
      />
    </section>
  );
}

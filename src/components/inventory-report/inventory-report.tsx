'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { AlertTriangle, Boxes, Download, History, Package, Plus, RefreshCw, XCircle } from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { DataTable, type DataTableColumn } from '@/components/common/data-table';
import { Pagination } from '@/components/common/pagination';
import { RefreshButton } from '@/components/common/refresh-button';
import { StatusBadge } from '@/components/common/status-badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/common/form-field';
import { FormError } from '@/components/common/form-error';
import { PermissionGuard } from '@/components/auth/guards';
import { PERMISSIONS } from '@/constants';
import { apiService } from '@/lib/api/api.service';
import type { InventoryListData, InventoryProductData, StockMovementData, StockMovementListData } from '@/lib/api/contract';
import { MESSAGES } from '@/messages';
import { showSuccess } from '@/lib/utils/toast';
import { useDebouncedValue } from '@/hooks/use-debounced-value';

const { inventoryReport: m } = MESSAGES;
const PAGE_SIZE = 10;
const HISTORY_PAGE_SIZE = 8;

type InventoryStatusFilter = 'all' | 'low' | 'out' | 'healthy';
type AdjustmentMode = 'set' | 'add' | 'remove';

const emptyInventoryList = (): InventoryListData => ({
  totalRecord: 0,
  totalPage: 0,
  currentPage: 1,
  limit: PAGE_SIZE,
  hasNext: false,
  hasPrevious: false,
  nextPage: 0,
  previousPage: 0,
  itemList: [],
  summary: { products: 0, units: 0, low: 0, out: 0 },
});

const emptyMovementList = (): StockMovementListData => ({
  totalRecord: 0,
  totalPage: 0,
  currentPage: 1,
  limit: HISTORY_PAGE_SIZE,
  hasNext: false,
  hasPrevious: false,
  nextPage: 0,
  previousPage: 0,
  itemList: [],
});

const formatDate = (value: string): string => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? MESSAGES.common.dash : date.toLocaleString();
};

const toApiStatus = (status: InventoryStatusFilter): 'ALL' | 'LOW' | 'OUT' | 'HEALTHY' => {
  switch (status) {
    case 'low': return 'LOW';
    case 'out': return 'OUT';
    case 'healthy': return 'HEALTHY';
    default: return 'ALL';
  }
};

export function InventoryReportPage() {
  const [inventoryData, setInventoryData] = useState<InventoryListData>(emptyInventoryList());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 350);
  const [statusFilter, setStatusFilter] = useState<InventoryStatusFilter>('all');
  const inventoryRequestId = useRef(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<InventoryProductData | null>(null);
  const [adjustmentMode, setAdjustmentMode] = useState<AdjustmentMode>('add');
  const [quantityValue, setQuantityValue] = useState('');
  const [thresholdValue, setThresholdValue] = useState('');
  const [reasonValue, setReasonValue] = useState('');
  const [isSavingAdjustment, setIsSavingAdjustment] = useState(false);
  const [adjustmentError, setAdjustmentError] = useState('');
  const [historyPage, setHistoryPage] = useState(1);
  const historyRequestId = useRef(0);
  const [historyData, setHistoryData] = useState<StockMovementListData>(emptyMovementList());
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState('');

  const fetchInventory = useCallback(async () => {
    const requestId = ++inventoryRequestId.current;
    setIsLoading(true);
    setError('');
    try {
      const response = await apiService.getProductInventory({
        page,
        limit: PAGE_SIZE,
        ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
        status: toApiStatus(statusFilter),
      });
      if (requestId !== inventoryRequestId.current) return;
      if (response.status) {
        const lastPage = Math.max(1, response.data.totalPage);
        if (page > lastPage) {
          setPage(lastPage);
          return;
        }
        setInventoryData(response.data);
      } else setError(response.message || m.loadFailed);
    } catch {
      if (requestId === inventoryRequestId.current) setError(m.loadFailed);
    } finally {
      if (requestId === inventoryRequestId.current) setIsLoading(false);
    }
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => {
    void fetchInventory();
  }, [fetchInventory]);

  const loadHistory = useCallback(async (targetPage: number) => {
    const requestId = ++historyRequestId.current;
    setIsHistoryLoading(true);
    setHistoryError('');
    try {
      const response = await apiService.getStockMovements({ page: targetPage, limit: HISTORY_PAGE_SIZE });
      if (requestId !== historyRequestId.current) return;
      if (response.status) setHistoryData(response.data);
      else setHistoryError(response.message || m.historyLoadFailed);
    } catch {
      if (requestId === historyRequestId.current) setHistoryError(m.historyLoadFailed);
    } finally {
      if (requestId === historyRequestId.current) setIsHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory(historyPage);
  }, [historyPage, loadHistory]);

  const exportInventory = async () => {
    if (isExporting) return;
    setExportError('');
    setIsExporting(true);
    try {
      const response = await apiService.exportReport('inventory', { format: 'csv' });
      if (!response.status) {
        setExportError(response.message);
        return;
      }
      const objectUrl = URL.createObjectURL(response.data);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = 'inventory-report.csv';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch {
      setExportError('Inventory report could not be exported.');
    } finally {
      setIsExporting(false);
    }
  };

  const openStockEditor = (product: InventoryProductData) => {
    setSelectedProduct(product);
    setAdjustmentMode('add');
    setQuantityValue('');
    setThresholdValue(String(product.threshold));
    setReasonValue('');
    setAdjustmentError('');
  };

  const parsedQuantity = Number(quantityValue);
  const currentStock = selectedProduct?.stock ?? 0;
  const projectedStock = !Number.isInteger(parsedQuantity) || parsedQuantity < 0
    ? currentStock
    : adjustmentMode === 'add'
      ? currentStock + parsedQuantity
      : adjustmentMode === 'remove'
        ? currentStock - parsedQuantity
        : parsedQuantity;

  const saveStockAdjustment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedProduct || isSavingAdjustment) return;

    const quantity = Number(quantityValue);
    const lowStockThreshold = Number(thresholdValue);
    const reason = reasonValue.trim();
    if (!Number.isInteger(quantity) || quantity < 0 || !Number.isInteger(lowStockThreshold) || lowStockThreshold < 0) {
      setAdjustmentError(m.invalidStock);
      return;
    }
    if (adjustmentMode !== 'set' && quantity < 1) {
      setAdjustmentError(m.invalidStock);
      return;
    }
    if (adjustmentMode === 'remove' && quantity > selectedProduct.stock) {
      setAdjustmentError(m.insufficientStock);
      return;
    }
    if (reason.length < 3) {
      setAdjustmentError(m.invalidReason);
      return;
    }

    const adjustment = adjustmentMode === 'add'
      ? quantity
      : adjustmentMode === 'remove'
        ? -quantity
        : quantity - selectedProduct.stock;
    const thresholdChanged = lowStockThreshold !== selectedProduct.threshold;
    if (adjustment === 0 && !thresholdChanged) {
      setAdjustmentError(m.noChanges);
      return;
    }

    setAdjustmentError('');
    setIsSavingAdjustment(true);
    try {
      const response = await apiService.adjustProductStock(selectedProduct.productId, {
        adjustment: adjustmentMode === 'set' ? 0 : adjustment,
        ...(adjustmentMode === 'set'
          ? { setStockTo: quantity, expectedStock: selectedProduct.stock }
          : {}),
        ...(selectedProduct.variantId ? { variantId: selectedProduct.variantId } : {}),
        lowStockThreshold,
        reason,
      });
      if (!response.status) {
        setAdjustmentError(response.message || m.stockSaveFailed);
        return;
      }
      setSelectedProduct(null);
      showSuccess(m.stockSaved);
      await fetchInventory();
      if (historyPage !== 1) setHistoryPage(1);
      else await loadHistory(1);
    } catch {
      setAdjustmentError(m.stockSaveFailed);
    } finally {
      setIsSavingAdjustment(false);
    }
  };

  const inventoryColumns: readonly DataTableColumn<InventoryProductData>[] = [
    {
      key: 'product',
      header: m.columns.product,
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.name || MESSAGES.common.dash}</p>
          <p className="text-fg-muted text-xs">{row.sku || MESSAGES.common.dash}</p>
          {row.isVariant && <p className="text-primary text-xs">{row.variantTitle || m.variantLabel}</p>}
          {!row.isVariant && row.hasVariants && <p className="text-fg-muted text-xs">{m.baseStockLabel}</p>}
        </div>
      ),
    },
    {
      key: 'vendor',
      header: m.columns.shop,
      hideBelow: 'lg',
      width: 'w-44',
      cell: (row) => <span className="truncate text-sm">{row.shop || MESSAGES.common.dash}</span>,
    },
    {
      key: 'stock',
      header: m.columns.stock,
      align: 'center',
      numeric: true,
      width: 'w-28',
      cell: (row) => <span className="font-semibold tabular-nums">{row.stock.toLocaleString()}</span>,
    },
    {
      key: 'threshold',
      header: m.columns.threshold,
      align: 'center',
      hideBelow: 'xl',
      width: 'w-28',
      numeric: true,
      cell: (row) => <span className="text-fg-muted tabular-nums">{row.threshold.toLocaleString()}</span>,
    },
    {
      key: 'status',
      header: m.columns.status,
      align: 'center',
      width: 'w-36',
      cell: (row) => (
        <StatusBadge meta={{
          label: row.stock <= 0 ? m.statuses.out : row.stock <= row.threshold ? m.statuses.low : m.statuses.ok,
          intent: row.stock <= 0 ? 'danger' : row.stock <= row.threshold ? 'warning' : 'success',
        }} />
      ),
    },
  ];

  const historyColumns: readonly DataTableColumn<StockMovementData>[] = [
    {
      key: 'product',
      header: m.columns.product,
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.productName || MESSAGES.common.dash}</p>
          <p className="text-fg-muted text-xs">{row.sku || MESSAGES.common.dash}</p>
        </div>
      ),
    },
    {
      key: 'change',
      header: m.adjustment,
      align: 'center',
      numeric: true,
      width: 'w-24',
      cell: (row) => (
        <span className={`font-semibold tabular-nums ${row.adjustment > 0 ? 'text-success' : row.adjustment < 0 ? 'text-danger' : 'text-fg-muted'}`}>
          {row.adjustment > 0 ? '+' : ''}{row.adjustment}
        </span>
      ),
    },
    {
      key: 'result',
      header: m.columns.stock,
      align: 'center',
      width: 'w-28',
      cell: (row) => <span className="tabular-nums">{row.previousStock} → {row.stock}</span>,
    },
    {
      key: 'reason',
      header: m.reason,
      hideBelow: 'lg',
      cell: (row) => <span className="text-sm">{row.reason || MESSAGES.common.dash}</span>,
    },
    {
      key: 'actor',
      header: m.changedBy,
      hideBelow: 'xl',
      width: 'w-32',
      cell: (row) => <span className="text-sm">{row.actorName || MESSAGES.common.dash}</span>,
    },
    {
      key: 'date',
      header: m.changedAt,
      hideBelow: 'xl',
      width: 'w-44',
      cell: (row) => <span className="text-fg-muted text-xs">{formatDate(row.createdAt)}</span>,
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={m.title}
        description={m.subtitle}
        action={
          <div className="flex items-center gap-2">
            <RefreshButton onRefresh={() => { void fetchInventory(); void loadHistory(historyPage); }} isRefreshing={isLoading || isHistoryLoading} />
            <PermissionGuard permission={PERMISSIONS.reportExport} fallback={null}>
              <Button variant="primary" size="sm" loading={isExporting} onClick={() => void exportInventory()}>
                <Download className="size-4" aria-hidden="true" />{MESSAGES.common.export}
              </Button>
            </PermissionGuard>
          </div>
        }
      />

      {exportError && <p role="alert" className="text-danger text-sm">{exportError}</p>}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Package className="size-5 text-primary" />} title={m.stats.products} value={inventoryData.summary.products.toLocaleString()} />
        <StatCard icon={<Boxes className="size-5 text-primary" />} title={m.stats.units} value={inventoryData.summary.units.toLocaleString()} />
        <StatCard icon={<AlertTriangle className="size-5 text-warning" />} title={m.stats.low} value={inventoryData.summary.low.toLocaleString()} />
        <StatCard icon={<XCircle className="size-5 text-danger" />} title={m.stats.out} value={inventoryData.summary.out.toLocaleString()} />
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="gap-1">
          <CardTitle>{m.allProducts}</CardTitle>
          <CardDescription>{m.subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={inventoryColumns}
            rows={inventoryData.itemList}
            rowKey={(row) => `${row.productId}-${row.variantId || 'base'}`}
            toolbar={{
              search: {
                value: search,
                placeholder: m.searchPlaceholder,
                onChange: (value) => { setSearch(value); setPage(1); },
              },
              select: {
                value: statusFilter,
                ariaLabel: m.columns.status,
                options: [
                  { value: 'all', label: m.allProducts },
                  { value: 'low', label: m.lowProducts },
                  { value: 'out', label: m.outProducts },
                  { value: 'healthy', label: m.healthyProducts },
                ],
                onChange: (value) => { setStatusFilter(value as InventoryStatusFilter); setPage(1); },
              },
            }}
            actions={{
              header: MESSAGES.common.actions,
              render: (row) => (
                <PermissionGuard permission={PERMISSIONS.productUpdate} fallback={null}>
                  <Button size="sm" variant="outline" onClick={() => openStockEditor(row)}>
                    <Plus className="size-4" aria-hidden="true" />{m.manageStock}
                  </Button>
                </PermissionGuard>
              ),
            }}
            isLoading={isLoading}
            error={error}
            onRetry={() => void fetchInventory()}
            emptyTitle={m.emptyTitle}
            emptyDescription={m.emptyBody}
            footer={
              <Pagination
                currentPage={inventoryData.currentPage || page}
                totalPage={Math.max(1, inventoryData.totalPage)}
                totalRecord={inventoryData.totalRecord}
                limit={PAGE_SIZE}
                onPageChange={setPage}
              />
            }
          />
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <History className="size-5 text-primary" aria-hidden="true" />
            <div className="flex flex-col gap-1">
              <CardTitle>{m.historyTitle}</CardTitle>
              <CardDescription>{m.historyEmptyBody}</CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => void loadHistory(historyPage)} disabled={isHistoryLoading}>
            <RefreshCw className="size-4" aria-hidden="true" />{MESSAGES.dashboard.refresh}
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={historyColumns}
            rows={historyData.itemList}
            rowKey={(row) => row.movementId}
            isLoading={isHistoryLoading}
            error={historyError}
            onRetry={() => void loadHistory(historyPage)}
            emptyTitle={m.historyEmptyTitle}
            emptyDescription={m.historyEmptyBody}
            footer={
              <Pagination
                currentPage={historyPage}
                totalPage={Math.max(1, historyData.totalPage)}
                totalRecord={historyData.totalRecord}
                limit={HISTORY_PAGE_SIZE}
                onPageChange={setHistoryPage}
              />
            }
          />
        </CardContent>
      </Card>

      {/*
       * Do not mount the stock editor until a product has been selected.
       * Dialog children are evaluated during render even while the dialog is closed;
       * keeping the whole dialog behind this guard prevents null product access and
       * ensures the form always receives a valid stock-keeping unit.
       */}
      {selectedProduct && (
        <Dialog
          open
          onClose={() => !isSavingAdjustment && setSelectedProduct(null)}
          title={m.updateStockTitle}
          description={m.updateStockDescription(selectedProduct.name)}
          closeLabel={MESSAGES.common.close}
          footer={
            <>
              <Button type="button" variant="outline" disabled={isSavingAdjustment} onClick={() => setSelectedProduct(null)}>
                {MESSAGES.common.cancel}
              </Button>
              <Button type="submit" form="inventory-adjustment-form" loading={isSavingAdjustment}>
                {m.manageStock}
              </Button>
            </>
          }
        >
          <form id="inventory-adjustment-form" onSubmit={(event) => void saveStockAdjustment(event)} className="flex flex-col gap-4">
            {adjustmentError && <FormError message={adjustmentError} />}
            <div className="grid grid-cols-3 gap-2">
              {(['add', 'remove', 'set'] as const).map((mode) => (
                <Button
                  key={mode}
                  type="button"
                  size="sm"
                  variant={adjustmentMode === mode ? 'primary' : 'outline'}
                  onClick={() => { setAdjustmentMode(mode); setQuantityValue(''); setAdjustmentError(''); }}
                >
                  {m.modes[mode]}
                </Button>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label={m.quantityToChange}>
                <Input
                  type="number"
                  min={adjustmentMode === 'set' ? 0 : 1}
                  step={1}
                  required
                  value={quantityValue}
                  onChange={(event) => setQuantityValue(event.target.value)}
                  placeholder={adjustmentMode === 'set' ? String(currentStock) : '0'}
                />
              </FormField>
              <FormField
                label={m.thresholdLabel}
                hint={selectedProduct.hasVariants ? m.thresholdSharedHint : undefined}
              >
                <Input type="number" min={0} step={1} required value={thresholdValue} onChange={(event) => setThresholdValue(event.target.value)} />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3 rounded-md border border-border bg-muted/30 p-3">
              <div>
                <p className="text-fg-muted text-xs">{m.currentStock}</p>
                <p className="text-lg font-semibold tabular-nums">{currentStock.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-fg-muted text-xs">{m.resultingStock}</p>
                <p className={`text-lg font-semibold tabular-nums ${projectedStock < 0 ? 'text-danger' : 'text-foreground'}`}>
                  {projectedStock.toLocaleString()}
                </p>
              </div>
            </div>
            <FormField label={m.reasonLabel}>
              <Textarea value={reasonValue} onChange={(event) => setReasonValue(event.target.value)} placeholder={m.reasonPlaceholder} rows={3} required />
            </FormField>
          </form>
        </Dialog>
      )}
    </div>
  );
}

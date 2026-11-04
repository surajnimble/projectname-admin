'use client';

import type { Metadata } from 'next';
import { PermissionGuard } from '@/components/auth/guards';
import { PageHeader } from '@/components/common/page-header';
import { DataTable } from '@/components/common/data-table';
import { Pagination } from '@/components/common/pagination';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/status-badge';
import { useLowStock } from '@/hooks/use-low-stock';
import { PERMISSIONS } from '@/constants';
import type { LowStockProductData } from '@/lib/api/contract';
import { MESSAGES } from '@/messages';

export const metadata: Metadata = { title: MESSAGES.inventoryReport.title };

const { inventoryReport } = MESSAGES;

const columns = [
  {
    key: 'product',
    header: inventoryReport.columns.product,
    cell: (row: LowStockProductData) => <span className="font-medium">{row.name || '-'}</span>,
  },
  {
    key: 'sku',
    header: inventoryReport.columns.sku,
    hideBelow: 'lg',
    width: 'w-32',
    cell: (row: LowStockProductData) => <span className="text-sm text-fg-muted">{row.sku}</span>,
  },
  {
    key: 'shop',
    header: inventoryReport.columns.shop,
    hideBelow: 'xl',
    width: 'w-40',
    cell: (row: LowStockProductData) => <span className="text-sm truncate">{row.shop}</span>,
  },
  {
    key: 'stock',
    header: inventoryReport.columns.stock,
    align: 'center',
    hideBelow: '2xl',
    width: 'w-24',
    numeric: true,
    cell: (row: LowStockProductData) => <span className="block">{row.stock}</span>,
  },
  {
    key: 'threshold',
    header: inventoryReport.columns.threshold,
    align: 'center',
    hideBelow: '2xl',
    width: 'w-28',
    numeric: true,
    cell: (row: LowStockProductData) => <span className="block text-fg-muted">{row.threshold}</span>,
  },
  {
    key: 'status',
    header: inventoryReport.columns.status,
    align: 'center',
    hideBelow: '2xl',
    width: 'w-32',
    cell: (row: LowStockProductData) => (
      <StatusBadge
        meta={{
          label: row.isLow ? inventoryReport.statuses.low : inventoryReport.statuses.ok,
          intent: row.isLow ? 'warning' : 'success',
        }}
      />
    ),
  },
] as const;

export default function InventoryReportPage() {
  const {
    data,
    isLoading,
    error,
    refresh,
  } = useLowStock();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={MESSAGES.sections.inventory}
        description={MESSAGES.inventoryReport.subtitle}
        action={
          <button
            className="text-xs bg-surface-muted rounded-md px-2.5 py-1 text-fg hover:bg-surface/30 focus:outline-none focus:ring-2 focus:ring-ring"
            onClick={() => void refresh()}
          >
            Refresh
          </button>
        }
      />
      <PermissionGuard permission={PERMISSIONS.reportView}>
        <Card className="overflow-hidden">
          <DataTable
            columns={columns}
            rows={data.itemList}
            rowKey={(row: LowStockProductData) => `${row.sku}-${row.shop}`}
            toolbar={{}}
            isLoading={isLoading}
            error={error}
            emptyTitle={inventoryReport.emptyTitle}
            emptyDescription={inventoryReport.emptyBody}
            footer={
              <Pagination
                currentPage={1}
                totalPage={1}
                totalRecord={data.totalRecord}
                limit={10}
                onPageChange={() => {}}
              />
            }
          />
        </Card>
      </PermissionGuard>
    </div>
  );
}

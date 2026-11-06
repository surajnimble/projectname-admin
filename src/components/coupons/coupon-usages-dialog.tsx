'use client';

import { Dialog } from '@/components/ui/dialog';
import { COUPON_PAGE_SIZE } from '@/constants';
import { DataTable } from '@/components/common/data-table';
import { Pagination } from '@/components/common/pagination';
import { Button } from '@/components/ui/button';
import { useCouponUsages } from '@/hooks/use-coupon-usages';
import type { CouponData, CouponUsageData } from '@/lib/api/contract';
import { formatCurrency } from '@/lib/utils';
import { MESSAGES } from '@/messages';
import { RefreshButton } from '@/components/common/refresh-button';

interface CouponUsagesDialogProps {
  coupon: CouponData | null;
  open: boolean;
  onClose: () => void;
}

const { coupons, common } = MESSAGES;

export function CouponUsagesDialog({ coupon, open, onClose }: CouponUsagesDialogProps) {
  const { data, isLoading, error, refresh, setPage } = useCouponUsages(
    coupon?.couponId ?? null,
    open,
  );

  const columns = [
    {
      key: 'customer',
      header: coupons.usageUser,
      cell: (row: CouponUsageData) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.userData.name || common.dash}</p>
          <p className="truncate text-xs text-fg-muted">{row.userData.email || common.dash}</p>
        </div>
      ),
    },
    {
      key: 'order',
      header: coupons.usageOrder,
      cell: (row: CouponUsageData) => <span className="font-mono text-xs">{row.orderId || common.dash}</span>,
    },
    {
      key: 'amount',
      header: coupons.usageAmount,
      align: 'right',
      cell: (row: CouponUsageData) => <span className="font-medium">{formatCurrency(row.amount)}</span>,
    },
    {
      key: 'date',
      header: coupons.usageDate,
      cell: (row: CouponUsageData) => <span className="text-sm">{row.createdAt || common.dash}</span>,
    },
  ] as const;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`${coupons.usageHistory}${coupon ? ` — ${coupon.code}` : ''}`}
      description={coupons.usageDescription}
      size="xl"
      footer={
        <Button type="button" variant="outline" onClick={onClose}>
          {common.close}
        </Button>
      }
    >
      <DataTable
        columns={columns}
        rows={data.itemList}
        rowKey={(row: CouponUsageData) => row.usageId}
        toolbar={{ actions: <RefreshButton onRefresh={refresh} isRefreshing={isLoading} label={MESSAGES.dashboard.refresh} /> }}
        isLoading={isLoading}
        error={error}
        onRetry={() => void refresh()}
        emptyTitle={coupons.usageEmpty}
        footer={
          <Pagination
            currentPage={data.currentPage || 1}
            totalPage={data.totalPage}
            totalRecord={data.totalRecord}
            limit={data.limit || COUPON_PAGE_SIZE}
            onPageChange={setPage}
          />
        }
      />
    </Dialog>
  );
}

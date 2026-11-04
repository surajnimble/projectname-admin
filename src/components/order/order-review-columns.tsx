'use client';

import { DataTableColumn } from '@/components/common/data-table';
import { DataTableIdentity } from '@/components/common/data-table-media';
import { orderStatusMeta, StatusBadge } from '@/components/common/status-badge';
import type { OrderReviewData } from '@/lib/api/contract';
import { formatCurrency } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils/datetime';
import { MESSAGES } from '@/messages';

const { orderReviews } = MESSAGES;

export const orderReviewColumns: readonly DataTableColumn<OrderReviewData>[] = [
  {
    key: 'order',
    header: orderReviews.columns.order,
    cell: (order) => (
      <DataTableIdentity title={order.orderNumber || orderReviews.fallback} />
    ),
  },
  {
    key: 'customer',
    header: orderReviews.columns.customer,
    hideBelow: 'xl',
    width: 'w-48',
    cell: (order) => (
      <span className="block truncate">
        {order.customerData.name || order.customerData.email || orderReviews.dash}
      </span>
    ),
  },
  {
    key: 'vendor',
    header: orderReviews.columns.vendor,
    hideBelow: 'xl',
    width: 'w-40',
    cell: (order) => <span className="block truncate">{order.shopName || orderReviews.dash}</span>,
  },
  {
    key: 'total',
    header: orderReviews.columns.total,
    hideBelow: 'lg',
    align: 'right',
    width: 'w-32',
    numeric: true,
    cell: (order) => (
      <span className="block whitespace-nowrap">{formatCurrency(order.total)}</span>
    ),
  },
  {
    key: 'status',
    header: orderReviews.columns.status,
    hideBelow: 'lg',
    width: 'w-28',
    cell: (order) => <StatusBadge meta={orderStatusMeta(order.status)} />,
  },
  {
    key: 'placed',
    header: orderReviews.columns.placed,
    hideBelow: '2xl',
    width: 'w-32',
    cell: (order) => (
      <span className="text-fg-muted block whitespace-nowrap">
        {formatRelativeTime(order.placedAt)}
      </span>
    ),
  },
];

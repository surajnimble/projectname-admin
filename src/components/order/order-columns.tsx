'use client';

import { DataTableColumn } from '@/components/common/data-table';
import { DataTableIdentity } from '@/components/common/data-table-media';
import { orderStatusMeta, StatusBadge } from '@/components/common/status-badge';
import type { OrderSummaryData } from '@/lib/api/contract';
import { formatCurrency } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils/datetime';
import { MESSAGES } from '@/messages';

const { orders } = MESSAGES;

export const orderColumns: readonly DataTableColumn<OrderSummaryData>[] = [
  {
    key: 'order',
    header: orders.columns.order,
    cell: (order) => (
      <DataTableIdentity title={order.orderNumber || orders.fallback} />
    ),
  },
  {
    key: 'customer',
    header: orders.columns.customer,
    hideBelow: 'md',
    cell: (order) => (
      <span className="block truncate">
        {order.userData.name || order.userData.email || orders.dash}
      </span>
    ),
  },
  {
    key: 'items',
    header: orders.columns.items,
    hideBelow: 'lg',
    align: 'right',
    numeric: true,
    cell: (order) => <span className="block">{order.itemCount}</span>,
  },
  {
    key: 'total',
    header: orders.columns.total,
    align: 'right',
    numeric: true,
    cell: (order) => (
      <span className="block whitespace-nowrap">{formatCurrency(order.total)}</span>
    ),
  },
  {
    key: 'status',
    header: orders.columns.status,
    cell: (order) => <StatusBadge meta={orderStatusMeta(order.status)} />,
  },
  {
    key: 'date',
    header: orders.columns.date,
    hideBelow: 'lg',
    cell: (order) => (
      <span className="text-fg-muted block whitespace-nowrap">
        {formatRelativeTime(order.createdAt)}
      </span>
    ),
  },
];

'use client';

import { DataTableColumn } from '@/components/common/data-table';
import { DataTableIdentity } from '@/components/common/data-table-media';
import { formatRelativeTime } from '@/lib/utils/datetime';
import { MESSAGES } from '@/messages';
import type { ActivityLogData } from '@/lib/api/contract';

const { activityLogs, common } = MESSAGES;

export const activityLogColumns: readonly DataTableColumn<ActivityLogData>[] = [
  {
    key: 'action',
    header: activityLogs.columns.action,
    cell: (row) => <span className="font-medium">{row.action}</span>,
  },
  {
    key: 'entity',
    header: activityLogs.columns.entity,
    hideBelow: 'lg',
    width: 'w-32',
    cell: (row) => <span className="text-sm truncate">{row.entity || common.dash}</span>,
  },
  {
    key: 'entityId',
    header: activityLogs.statuses.entityId,
    hideBelow: 'xl',
    width: 'w-32',
    cell: (row) => <span className="text-sm text-fg-muted truncate">{row.entityId || common.dash}</span>,
  },
  {
    key: 'user',
    header: activityLogs.columns.user,
    hideBelow: 'lg',
    width: 'w-40',
    cell: (row) => (
      <DataTableIdentity title={row.userData.name || common.dash} meta={row.userData.email} />
    ),
  },
  {
    key: 'ip',
    header: activityLogs.statuses.ip,
    hideBelow: 'xl',
    width: 'w-32',
    cell: (row) => <span className="text-sm text-fg-muted">{row.ip || common.dash}</span>,
  },
  {
    key: 'created',
    header: activityLogs.columns.created,
    hideBelow: '2xl',
    width: 'w-32',
    cell: (row) => (
      <span className="text-fg-muted block whitespace-nowrap">
        {formatRelativeTime(row.createdAt)}
      </span>
    ),
  },
];

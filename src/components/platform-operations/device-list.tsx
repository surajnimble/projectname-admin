'use client';

import { RefreshButton } from '@/components/common/refresh-button';
import { useCallback, useEffect, useState } from 'react';
import { DataTable, type DataTableColumn } from '@/components/common/data-table';
import { PageHeader } from '@/components/common/page-header';
import { Pagination } from '@/components/common/pagination';
import { StatusBadge } from '@/components/common/status-badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { apiService } from '@/lib/api/api.service';
import type { AdminDeviceData, AdminDeviceListData } from '@/lib/api/contract';
import { formatRelativeTime } from '@/lib/utils/datetime';
import { showSuccess } from '@/lib/utils/toast';
import { MESSAGES } from '@/messages';
import { usePermission } from '@/hooks/use-permission';
import { PERMISSIONS } from '@/constants';

const m = MESSAGES.platformOperations.devices;
const PAGE_SIZE = 10;
const emptyPage = (): AdminDeviceListData => ({
  totalRecord: 0, totalPage: 0, currentPage: 1, limit: PAGE_SIZE,
  hasNext: false, hasPrevious: false, nextPage: 0, previousPage: 0, itemList: [],
});

export function DeviceList() {
  const { can } = usePermission();
  const canBlock = can(PERMISSIONS.deviceBlock);
  const [data, setData] = useState<AdminDeviceListData>(emptyPage);
  const [page, setPage] = useState(1);
  const [platform, setPlatform] = useState('ALL');
  const [blocked, setBlocked] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    const response = await apiService.getAdminDevices({
      page, limit: PAGE_SIZE,
      ...(platform !== 'ALL' ? { platform } : {}),
      ...(blocked !== 'ALL' ? { isBlocked: blocked === 'BLOCKED' ? 'true' : 'false' } : {}),
    });
    if (response.status) setData(response.data); else setError(response.message);
    setLoading(false);
  }, [page, platform, blocked]);
  useEffect(() => { void load(); }, [load]);

  const toggle = async (row: AdminDeviceData) => {
    const response = row.isBlocked
      ? await apiService.unblockAdminDevice(row.deviceId)
      : await apiService.blockAdminDevice(row.deviceId);
    if (!response.status) { setError(response.message); return; }
    showSuccess(row.isBlocked ? m.unblocked : m.blocked);
    await load();
  };
  const remove = async (row: AdminDeviceData) => {
    if (!window.confirm(m.confirmDelete)) return;
    const response = await apiService.deleteAdminDevice(row.deviceId);
    if (!response.status) { setError(response.message); return; }
    showSuccess(m.deleted); await load();
  };

  const columns: DataTableColumn<AdminDeviceData>[] = [
    { key: 'device', header: m.device, cell: (row) => <div className="min-w-40"><p className="font-medium">{row.model || row.manufacturer || row.platform}</p><p className="text-fg-muted text-xs">{row.os} {row.osVersion}</p></div> },
    { key: 'user', header: m.user, cell: (row) => <span className="font-mono text-xs">{row.userId || '—'}</span> },
    { key: 'platform', header: m.platform, cell: (row) => <span>{row.platform}</span> },
    { key: 'app', header: m.appVersion, hideBelow: 'lg', cell: (row) => <span>{row.appVersion || '—'}</span> },
    { key: 'network', header: m.ip, hideBelow: 'xl', cell: (row) => <span className="font-mono text-xs">{row.ip || '—'}</span> },
    { key: 'lastSeen', header: m.lastSeen, cell: (row) => <span>{row.lastSeenAt ? formatRelativeTime(row.lastSeenAt) : '—'}</span> },
    { key: 'status', header: m.status, cell: (row) => <div className="flex flex-wrap gap-1"><StatusBadge meta={{ label: row.isBlocked ? m.blockedLabel : m.activeLabel, intent: row.isBlocked ? 'danger' : 'success' }} />{row.isTrusted && <StatusBadge meta={{ label: m.trusted, intent: 'info' }} />}</div> },
  ];

  return <div className="flex min-h-0 flex-col gap-6">
    <PageHeader title={m.title} description={m.subtitle} action={<RefreshButton onRefresh={() => void load()} isRefreshing={loading} label={MESSAGES.common.retry} />} />
    <Card className="overflow-hidden"><DataTable
      columns={columns} rows={data.itemList} rowKey={(row) => row.deviceId}
      isLoading={loading} error={error} onRetry={() => void load()} emptyTitle={m.empty}
      toolbar={{
        select: { value: platform, ariaLabel: m.platform, options: [
          { value: 'ALL', label: m.allPlatforms }, { value: 'ANDROID', label: 'Android' }, { value: 'IOS', label: 'iOS' }, { value: 'WEB', label: 'Web' }, { value: 'OTHER', label: m.other },
        ], onChange: (value) => { setPlatform(value); setPage(1); } },
        actions: <div className="flex gap-2"><select className="h-9 rounded-md border border-input bg-background px-2 text-sm" aria-label={m.status} value={blocked} onChange={(event) => { setBlocked(event.target.value); setPage(1); }}><option value="ALL">{m.allStatuses}</option><option value="BLOCKED">{m.blockedLabel}</option><option value="ACTIVE">{m.activeLabel}</option></select></div>,
      }}
      actions={canBlock ? { header: MESSAGES.common.actions, render: (row) => <div className="flex justify-end gap-1"><Button size="sm" variant="outline" onClick={() => void toggle(row)}>{row.isBlocked ? m.unblock : m.block}</Button><Button size="sm" variant="ghostDestructive" onClick={() => void remove(row)}>{MESSAGES.common.delete}</Button></div> } : undefined}
      footer={<Pagination currentPage={page} totalPage={Math.max(1, data.totalPage)} totalRecord={data.totalRecord} limit={PAGE_SIZE} onPageChange={setPage} />}
    /></Card>
  </div>;
}

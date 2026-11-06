'use client';

import { RefreshButton } from '@/components/common/refresh-button';
import { useCallback, useEffect, useState } from 'react';
import { PageHeader } from '@/components/common/page-header';
import { DataTable, type DataTableColumn } from '@/components/common/data-table';
import { Pagination } from '@/components/common/pagination';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { FormError } from '@/components/common/form-error';
import { StatusBadge } from '@/components/common/status-badge';
import { apiService } from '@/lib/api/api.service';
import type { ReferralData, ReferralListData } from '@/lib/api/contract';
import { formatCurrency } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils/datetime';
import { showSuccess } from '@/lib/utils/toast';
import { MESSAGES } from '@/messages';

const m = MESSAGES.referrals;
const PAGE_SIZE = 10;
const emptyPage = (): ReferralListData => ({
  totalRecord: 0, totalPage: 0, currentPage: 1, limit: PAGE_SIZE, hasNext: false,
  hasPrevious: false, nextPage: 0, previousPage: 0, itemList: [],
});

export function ReferralList() {
  const [data, setData] = useState<ReferralListData>(emptyPage);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingAction, setPendingAction] = useState<{ row: ReferralData; action: 'complete' | 'reject' | 'expire' } | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    const response = await apiService.getAdminReferrals({ page, limit: PAGE_SIZE, ...(status ? { status } : {}) });
    if (response.status) setData(response.data); else setError(response.message);
    setLoading(false);
  }, [page, status]);
  useEffect(() => { void load(); }, [load]);

  const executeAction = async () => {
    if (!pendingAction) return;
    setSaving(true); setActionError('');
    const response = pendingAction.action === 'complete'
      ? await apiService.completeReferral(pendingAction.row.referralId)
      : await apiService.updateReferralStatus(pendingAction.row.referralId, { status: pendingAction.action === 'reject' ? 'REJECTED' : 'EXPIRED' });
    setSaving(false);
    if (!response.status) { setActionError(response.message); return; }
    showSuccess(pendingAction.action === 'complete' ? m.completedSuccess : m.updated);
    setPendingAction(null); await load();
  };

  const columns: DataTableColumn<ReferralData>[] = [
    { key: 'customer', header: m.customer, cell: (row) => <div><p className="font-medium">{row.userData.name || '—'}</p><p className="text-xs text-fg-muted">{row.userData.email}</p></div> },
    { key: 'code', header: m.code, hideBelow: 'lg', cell: (row) => <span className="font-mono">{row.referralCode}</span> },
    { key: 'referrerReward', header: m.referrerReward, align: 'right', numeric: true, cell: (row) => <span>{formatCurrency(row.referrerReward)}</span> },
    { key: 'refereeReward', header: m.refereeReward, align: 'right', numeric: true, cell: (row) => <span>{formatCurrency(row.refereeReward)}</span> },
    { key: 'status', header: m.status, cell: (row) => <StatusBadge meta={{ label: row.status, intent: row.status === 'COMPLETED' ? 'success' : row.status === 'PENDING' ? 'warning' : 'danger' }} /> },
    { key: 'expires', header: m.expires, hideBelow: 'xl', cell: (row) => <span>{row.expiresAt ? formatRelativeTime(row.expiresAt) : '—'}</span> },
    { key: 'created', header: m.created, hideBelow: '2xl', cell: (row) => <span>{formatRelativeTime(row.createdAt)}</span> },
  ];

  return (
    <div className="flex min-h-0 flex-col gap-6">
      <PageHeader title={m.title} description={m.subtitle} />
      <Card className="overflow-hidden">
        <DataTable
          columns={columns} rows={data.itemList} rowKey={(row) => row.referralId}
          isLoading={loading} error={error} onRetry={() => void load()} emptyTitle={m.empty}
          toolbar={{
            select: { value: status || 'ALL', ariaLabel: m.status, placeholder: m.allStatuses,
              options: [
                { value: 'ALL', label: m.allStatuses }, { value: 'PENDING', label: m.pending },
                { value: 'COMPLETED', label: m.completed }, { value: 'EXPIRED', label: m.expired },
                { value: 'REJECTED', label: m.rejected },
              ], onChange: (value) => { setStatus(value === 'ALL' ? '' : value); setPage(1); },
            },
            actions: <RefreshButton onRefresh={() => void load()} isRefreshing={loading} label="Refresh" />,
          }}
          actions={{ header: 'Actions', render: (row) => row.status === 'PENDING' ? (
            <div className="flex flex-wrap justify-end gap-1">
              <Button size="sm" variant="outline" onClick={() => { setActionError(''); setPendingAction({ row, action: 'complete' }); }}>{m.complete}</Button>
              <Button size="sm" variant="ghostDestructive" onClick={() => { setActionError(''); setPendingAction({ row, action: 'reject' }); }}>{m.reject}</Button>
            </div>
          ) : null }}
          footer={<Pagination currentPage={page} totalPage={Math.ceil(data.totalRecord / PAGE_SIZE)} totalRecord={data.totalRecord} limit={PAGE_SIZE} onPageChange={setPage} />}
        />
      </Card>
      <Dialog open={pendingAction !== null} onClose={() => !saving && setPendingAction(null)}
        title={pendingAction?.action === 'complete' ? m.complete : pendingAction?.action === 'reject' ? m.reject : m.expire}
        description={pendingAction?.action === 'complete' ? m.confirmComplete : 'This will update the pending referral status.'}
        footer={<><Button variant="outline" disabled={saving} onClick={() => setPendingAction(null)}>Cancel</Button><Button loading={saving} disabled={saving} variant={pendingAction?.action === 'reject' ? 'destructive' : 'default'} onClick={() => void executeAction()}>Confirm</Button></>}>
        {actionError && <FormError message={actionError} />}
      </Dialog>
    </div>
  );
}

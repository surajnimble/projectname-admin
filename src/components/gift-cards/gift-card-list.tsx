'use client';

import { RefreshButton } from '@/components/common/refresh-button';
import { useCallback, useEffect, useState } from 'react';
import { PageHeader } from '@/components/common/page-header';
import { DataTable, type DataTableColumn } from '@/components/common/data-table';
import { Pagination } from '@/components/common/pagination';
import { FormField } from '@/components/common/form-field';
import { FormError } from '@/components/common/form-error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/common/status-badge';
import { apiService } from '@/lib/api/api.service';
import type { GiftCardData, GiftCardListData } from '@/lib/api/contract';
import { formatCurrency } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils/datetime';
import { showSuccess } from '@/lib/utils/toast';
import { MESSAGES } from '@/messages';

const m = MESSAGES.giftCards;
const PAGE_SIZE = 10;
const emptyPage = (): GiftCardListData => ({
  totalRecord: 0, totalPage: 0, currentPage: 1, limit: PAGE_SIZE, hasNext: false,
  hasPrevious: false, nextPage: 0, previousPage: 0, itemList: [],
});

export function GiftCardList() {
  const [data, setData] = useState<GiftCardListData>(emptyPage);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GiftCardData | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');
  const [form, setForm] = useState({ title: '', description: '', value: '', code: '', userId: '', expiresInDays: '' });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const response = await apiService.getGiftCards({ page, limit: PAGE_SIZE, ...(status ? { status } : {}) });
    if (response.status) setData(response.data);
    else setError(response.message);
    setLoading(false);
  }, [page, status]);

  useEffect(() => { void load(); }, [load]);

  const issue = async () => {
    const value = Number(form.value);
    if (!Number.isFinite(value) || value <= 0) { setActionError('Enter a positive gift card value.'); return; }
    setSaving(true); setActionError('');
    const response = await apiService.createGiftCard({
      value,
      ...(form.title.trim() ? { title: form.title.trim() } : {}),
      ...(form.description.trim() ? { description: form.description.trim() } : {}),
      ...(form.code.trim() ? { code: form.code.trim() } : {}),
      ...(form.userId.trim() ? { userId: form.userId.trim() } : {}),
      ...(form.expiresInDays.trim() ? { expiresInDays: Number(form.expiresInDays) } : {}),
    });
    setSaving(false);
    if (!response.status) { setActionError(response.message); return; }
    showSuccess(m.created); setCreateOpen(false); setForm({ title: '', description: '', value: '', code: '', userId: '', expiresInDays: '' });
    await load();
  };

  const disable = async (row: GiftCardData) => {
    const response = await apiService.disableGiftCard(row.giftCardId);
    if (response.status) { showSuccess(m.disabledSuccess); await load(); }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    const response = await apiService.deleteGiftCard(deleteTarget.giftCardId);
    setSaving(false);
    if (!response.status) { setActionError(response.message); return; }
    showSuccess(m.deleted); setDeleteTarget(null); setActionError(''); await load();
  };

  const columns: DataTableColumn<GiftCardData>[] = [
    { key: 'code', header: m.code, cell: (row) => <span className="font-mono font-medium">{row.code}</span> },
    { key: 'title', header: m.titleColumn, cell: (row) => <span>{row.title || '—'}</span> },
    { key: 'value', header: m.value, align: 'right', numeric: true, cell: (row) => <span>{formatCurrency(row.value)}</span> },
    { key: 'status', header: m.status, cell: (row) => <StatusBadge meta={{ label: row.status, intent: row.status === 'ACTIVE' ? 'success' : row.status === 'DISABLED' ? 'danger' : 'neutral' }} /> },
    { key: 'owner', header: m.owner, hideBelow: 'lg', cell: (row) => <span className="text-sm">{row.userId || '—'}</span> },
    { key: 'expires', header: m.expires, hideBelow: 'xl', cell: (row) => <span>{row.expiresAt ? formatRelativeTime(row.expiresAt) : '—'}</span> },
    { key: 'issued', header: m.issued, hideBelow: '2xl', cell: (row) => <span>{formatRelativeTime(row.createdAt)}</span> },
  ];

  return (
    <div className="flex min-h-0 flex-col gap-6">
      <PageHeader title={m.title} description={m.subtitle} action={<Button onClick={() => { setActionError(''); setCreateOpen(true); }}>{m.create}</Button>} />
      <Card className="overflow-hidden">
        <DataTable
          columns={columns}
          rows={data.itemList}
          rowKey={(row) => row.giftCardId}
          isLoading={loading}
          error={error}
          onRetry={() => void load()}
          emptyTitle={m.empty}
          toolbar={{
            select: {
              value: status || 'ALL', ariaLabel: m.status, placeholder: m.allStatuses,
              options: [
                { value: 'ALL', label: m.allStatuses }, { value: 'ACTIVE', label: m.active },
                { value: 'REDEEMED', label: m.redeemed }, { value: 'EXPIRED', label: m.expired },
                { value: 'DISABLED', label: m.disabled },
              ], onChange: (value) => { setStatus(value === 'ALL' ? '' : value); setPage(1); },
            },
            actions: <RefreshButton onRefresh={() => void load()} isRefreshing={loading} label="Refresh" />,
          }}
          actions={{
            header: 'Actions',
            render: (row) => (
              <div className="flex flex-wrap justify-end gap-1">
                {row.status === 'ACTIVE' && <Button size="sm" variant="outline" onClick={() => void disable(row)}>{m.disable}</Button>}
                {row.status !== 'REDEEMED' && <Button size="sm" variant="ghostDestructive" onClick={() => { setActionError(''); setDeleteTarget(row); }}>{m.delete}</Button>}
              </div>
            ),
          }}
          footer={<Pagination currentPage={page} totalPage={Math.ceil(data.totalRecord / PAGE_SIZE)} totalRecord={data.totalRecord} limit={PAGE_SIZE} onPageChange={setPage} />}
        />
      </Card>

      <Dialog open={createOpen} onClose={() => !saving && setCreateOpen(false)} title={m.createTitle} description={m.createDescription}
        footer={<><Button variant="outline" onClick={() => setCreateOpen(false)} disabled={saving}>Cancel</Button><Button onClick={() => void issue()} loading={saving} disabled={saving || !form.value}>Issue gift card</Button></>}>
        <div className="space-y-4">
          {actionError && <FormError message={actionError} />}
          <FormField label={m.titleLabel}><Input value={form.title} onChange={(e) => setForm((v) => ({ ...v, title: e.target.value }))} maxLength={120} /></FormField>
          <FormField label={m.descriptionLabel}><Textarea value={form.description} onChange={(e) => setForm((v) => ({ ...v, description: e.target.value }))} maxLength={500} rows={2} /></FormField>
          <FormField label={m.valueLabel}><Input type="number" min="0.01" step="0.01" value={form.value} onChange={(e) => setForm((v) => ({ ...v, value: e.target.value }))} /></FormField>
          <FormField label={m.codeLabel}><Input value={form.code} onChange={(e) => setForm((v) => ({ ...v, code: e.target.value.toUpperCase() }))} maxLength={24} /></FormField>
          <FormField label={m.userIdLabel}><Input value={form.userId} onChange={(e) => setForm((v) => ({ ...v, userId: e.target.value }))} /></FormField>
          <FormField label={m.expiryLabel}><Input type="number" min="1" max="3650" value={form.expiresInDays} onChange={(e) => setForm((v) => ({ ...v, expiresInDays: e.target.value }))} /></FormField>
        </div>
      </Dialog>

      <Dialog open={deleteTarget !== null} onClose={() => !saving && setDeleteTarget(null)} title={m.delete} description={m.confirmDelete}
        footer={<><Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={saving}>Cancel</Button><Button variant="ghostDestructive" onClick={() => void remove()} loading={saving} disabled={saving}>Delete</Button></>}>
        {actionError && <FormError message={actionError} />}
      </Dialog>
    </div>
  );
}

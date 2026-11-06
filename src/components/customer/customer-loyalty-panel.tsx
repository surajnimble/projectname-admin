'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/common/form-field';
import { FormError } from '@/components/common/form-error';
import { Pagination } from '@/components/common/pagination';
import { RefreshButton } from '@/components/common/refresh-button';
import { apiService } from '@/lib/api/api.service';
import type { LoyaltySummaryData, LoyaltyTransactionListData } from '@/lib/api/contract';
import { showSuccess } from '@/lib/utils/toast';
import { formatRelativeTime } from '@/lib/utils/datetime';
import { MESSAGES } from '@/messages';

const m = MESSAGES.customers.detail.loyalty;
const PAGE_SIZE = 10;
const emptySummary = (): LoyaltySummaryData => ({
  userId: '', isEnabled: false, balance: 0, tier: '', multiplier: 0, pointsToNextTier: 0, nextTier: '',
  totalEarned: 0, totalRedeemed: 0, totalExpired: 0, transactionCount: 0, pointValue: 0,
  redeemableAmount: 0, minRedeemPoints: 0, tierList: [],
});
const emptyHistory = (): LoyaltyTransactionListData => ({
  totalRecord: 0, totalPage: 0, currentPage: 1, limit: PAGE_SIZE, hasNext: false,
  hasPrevious: false, nextPage: 0, previousPage: 0, itemList: [],
});

export function CustomerLoyaltyPanel({ userId }: { userId: string }) {
  const [summary, setSummary] = useState<LoyaltySummaryData>(emptySummary);
  const [history, setHistory] = useState<LoyaltyTransactionListData>(emptyHistory);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [points, setPoints] = useState('');
  const [reason, setReason] = useState('');
  const [actionError, setActionError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [summaryResponse, historyResponse] = await Promise.all([
        apiService.getCustomerLoyaltySummary(userId),
        apiService.getCustomerLoyaltyHistory(userId, { page, limit: PAGE_SIZE }),
      ]);
      if (!summaryResponse.status) throw new Error(summaryResponse.message);
      if (!historyResponse.status) throw new Error(historyResponse.message);
      setSummary(summaryResponse.data); setHistory(historyResponse.data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : m.loadError);
    } finally { setLoading(false); }
  }, [userId, page]);

  useEffect(() => { void load(); }, [load]);

  const adjust = async () => {
    const value = Number(points);
    if (!Number.isInteger(value) || value === 0) { setActionError(m.invalidPoints); return; }
    if (reason.trim().length < 3) { setActionError(m.invalidReason); return; }
    setSaving(true); setActionError('');
    const response = await apiService.adjustCustomerLoyaltyPoints(userId, { points: value, description: reason.trim() });
    setSaving(false);
    if (!response.status) { setActionError(response.message || m.adjustError); return; }
    showSuccess(m.success); setDialogOpen(false); setPoints(''); setReason(''); await load();
  };

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div><CardTitle>{m.title}</CardTitle><p className="mt-1 text-sm text-fg-muted">{m.description}</p></div>
        <div className="flex items-center gap-2">
          <RefreshButton onRefresh={load} isRefreshing={loading} label={MESSAGES.dashboard.refresh} />
          <Button size="sm" variant="outline" onClick={() => { setActionError(''); setDialogOpen(true); }} disabled={!summary.isEnabled || loading}>{m.adjust}</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {error && <FormError message={error} />}
        {!summary.isEnabled && !loading && <p className="text-sm text-fg-muted">Loyalty points are disabled in settings.</p>}
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-border p-4"><p className="text-xs text-fg-muted">{m.balance}</p><p className="mt-1 text-xl font-semibold">{summary.balance.toLocaleString()}</p></div>
          <div className="rounded-lg border border-border p-4"><p className="text-xs text-fg-muted">{m.tier}</p><p className="mt-1 text-lg font-semibold">{summary.tier || '—'}</p></div>
          <div className="rounded-lg border border-border p-4"><p className="text-xs text-fg-muted">{m.totalEarned}</p><p className="mt-1 text-lg font-semibold">{summary.totalEarned.toLocaleString()}</p></div>
          <div className="rounded-lg border border-border p-4"><p className="text-xs text-fg-muted">{m.totalRedeemed}</p><p className="mt-1 text-lg font-semibold">{summary.totalRedeemed.toLocaleString()}</p></div>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">{m.transactions}</h3>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-customer-loyalty text-sm">
              <thead className="bg-surface-muted text-left text-fg-muted"><tr>
                <th className="px-3 py-2 font-medium">{m.type}</th><th className="px-3 py-2 font-medium">{m.reason}</th>
                <th className="px-3 py-2 text-right font-medium">{m.points}</th><th className="px-3 py-2 text-right font-medium">{m.balanceAfter}</th><th className="px-3 py-2 font-medium">{m.date}</th>
              </tr></thead>
              <tbody>
                {history.itemList.map((row) => <tr key={row.transactionId} className="border-t border-border">
                  <td className="px-3 py-2">{row.type}</td><td className="max-w-loyalty-description truncate px-3 py-2" title={row.description}>{row.description || '—'}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{row.points > 0 ? '+' : ''}{row.points.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{row.balanceAfter.toLocaleString()}</td><td className="px-3 py-2">{row.createdAt ? formatRelativeTime(row.createdAt) : '—'}</td>
                </tr>)}
                {!loading && history.itemList.length === 0 && <tr><td colSpan={5} className="px-3 py-8 text-center text-fg-muted">{m.empty}</td></tr>}
              </tbody>
            </table>
          </div>
          {history.totalRecord > PAGE_SIZE && <div className="mt-3"><Pagination currentPage={page} totalPage={Math.ceil(history.totalRecord / PAGE_SIZE)} totalRecord={history.totalRecord} limit={PAGE_SIZE} onPageChange={setPage} /></div>}
        </div>
      </CardContent>
      <Dialog open={dialogOpen} onClose={() => !saving && setDialogOpen(false)} title={m.adjustTitle} description={m.adjustDescription}
        footer={<><Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button><Button onClick={() => void adjust()} loading={saving} disabled={saving || !points || reason.trim().length < 3}>{m.confirm}</Button></>}>
        <div className="space-y-4">
          {actionError && <FormError message={actionError} />}
          <FormField label={m.pointsLabel}><Input type="number" step="1" value={points} onChange={(event) => setPoints(event.target.value)} placeholder="e.g. 250 or -100" /></FormField>
          <FormField label={m.reason} hint={m.reasonHint}><Textarea value={reason} onChange={(event) => setReason(event.target.value)} maxLength={300} rows={3} placeholder={m.reasonPlaceholder} /></FormField>
        </div>
      </Dialog>
    </Card>
  );
}

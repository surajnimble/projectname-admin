'use client';

import { RefreshButton } from '@/components/common/refresh-button';
import { useCallback, useEffect, useState } from 'react';
import { DataTable, type DataTableColumn } from '@/components/common/data-table';
import { FormError } from '@/components/common/form-error';
import { FormField } from '@/components/common/form-field';
import { PageHeader } from '@/components/common/page-header';
import { Pagination } from '@/components/common/pagination';
import { StatusBadge } from '@/components/common/status-badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { apiService } from '@/lib/api/api.service';
import type { AdminWebhookData, AdminWebhookListData, AdminWebhookLogListData, AdminWebhookLogData } from '@/lib/api/contract';
import { formatRelativeTime } from '@/lib/utils/datetime';
import { showSuccess } from '@/lib/utils/toast';
import { MESSAGES } from '@/messages';

const m = MESSAGES.platformOperations.webhooks;
const PAGE_SIZE = 10;
const emptyWebhooks = (): AdminWebhookListData => ({ totalRecord: 0, totalPage: 0, currentPage: 1, limit: PAGE_SIZE, hasNext: false, hasPrevious: false, nextPage: 0, previousPage: 0, itemList: [] });
const emptyLogs = (): AdminWebhookLogListData => ({ ...emptyWebhooks(), itemList: [] });

export function WebhookManager() {
  const [tab, setTab] = useState<'endpoints' | 'logs'>('endpoints');
  const [data, setData] = useState<AdminWebhookListData>(emptyWebhooks);
  const [logs, setLogs] = useState<AdminWebhookLogListData>(emptyLogs);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');
  const [secret, setSecret] = useState('');
  const [form, setForm] = useState({ url: '', provider: 'CUSTOM', events: '' });
  const [selectedLog, setSelectedLog] = useState<AdminWebhookLogData | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    if (tab === 'endpoints') {
      const response = await apiService.getAdminWebhooks({ page, limit: PAGE_SIZE });
      if (response.status) setData(response.data); else setError(response.message);
    } else {
      const response = await apiService.getAdminWebhookLogs({ page, limit: PAGE_SIZE });
      if (response.status) setLogs(response.data); else setError(response.message);
    }
    setLoading(false);
  }, [page, tab]);
  useEffect(() => { void load(); }, [load]);

  const create = async () => {
    const events = form.events.split(/[\n,]/).map((item) => item.trim()).filter(Boolean);
    if (!/^https:\/\//i.test(form.url.trim())) { setActionError(m.httpsRequired); return; }
    if (!events.length) { setActionError(m.eventsRequired); return; }
    setSaving(true); setActionError('');
    const response = await apiService.createAdminWebhook({ url: form.url.trim(), provider: form.provider, events, isActive: true });
    setSaving(false);
    if (!response.status) { setActionError(response.message); return; }
    setCreateOpen(false); setForm({ url: '', provider: 'CUSTOM', events: '' }); setSecret(response.data.secret || '');
    showSuccess(m.created); await load();
  };
  const toggle = async (row: AdminWebhookData) => {
    const response = await apiService.updateAdminWebhook(row.webhookId, { isActive: !row.isActive });
    if (response.status) { showSuccess(row.isActive ? m.disabled : m.enabled); await load(); } else setError(response.message);
  };
  const rotate = async (row: AdminWebhookData) => {
    if (!window.confirm(m.confirmRotate)) return;
    const response = await apiService.rotateAdminWebhookSecret(row.webhookId);
    if (response.status) { setSecret(response.data.secret || ''); showSuccess(m.rotated); } else setError(response.message);
  };
  const remove = async (row: AdminWebhookData) => {
    if (!window.confirm(m.confirmDelete)) return;
    const response = await apiService.deleteAdminWebhook(row.webhookId);
    if (response.status) { showSuccess(m.deleted); await load(); } else setError(response.message);
  };

  const endpointColumns: DataTableColumn<AdminWebhookData>[] = [
    { key: 'url', header: m.endpoint, cell: (row) => <div className="max-w-72"><p className="break-all font-medium">{row.url}</p><p className="text-fg-muted text-xs">{row.provider}</p></div> },
    { key: 'events', header: m.events, hideBelow: 'lg', cell: (row) => <span className="text-xs">{row.events.join(', ')}</span> },
    { key: 'failures', header: m.failures, align: 'right', numeric: true, cell: (row) => <span>{row.failureCount}</span> },
    { key: 'lastFired', header: m.lastFired, hideBelow: 'xl', cell: (row) => <span>{row.lastFiredAt ? formatRelativeTime(row.lastFiredAt) : m.never}</span> },
    { key: 'status', header: m.status, cell: (row) => <StatusBadge meta={{ label: row.isActive ? m.active : m.inactive, intent: row.isActive ? 'success' : 'neutral' }} /> },
  ];
  const logColumns: DataTableColumn<AdminWebhookLogData>[] = [
    { key: 'event', header: m.event, cell: (row) => <span className="font-medium">{row.event || '—'}</span> },
    { key: 'direction', header: m.direction, cell: (row) => <span>{row.direction}</span> },
    { key: 'provider', header: m.provider, cell: (row) => <span>{row.provider || '—'}</span> },
    { key: 'status', header: m.result, cell: (row) => <StatusBadge meta={{ label: row.isProcessed ? m.processed : m.failed, intent: row.isProcessed ? 'success' : 'danger' }} /> },
    { key: 'date', header: m.date, cell: (row) => <span>{formatRelativeTime(row.createdAt)}</span> },
  ];

  return <div className="flex min-h-0 flex-col gap-6">
    <PageHeader title={m.title} description={m.subtitle} action={tab === 'endpoints' ? <Button onClick={() => { setActionError(''); setCreateOpen(true); }}>{m.register}</Button> : undefined} />
    <div className="flex gap-2"><Button size="sm" variant={tab === 'endpoints' ? 'default' : 'outline'} onClick={() => { setTab('endpoints'); setPage(1); }}>{m.endpointsTab}</Button><Button size="sm" variant={tab === 'logs' ? 'default' : 'outline'} onClick={() => { setTab('logs'); setPage(1); }}>{m.logsTab}</Button></div>
    <Card className="overflow-hidden">
      {tab === 'endpoints' ? <DataTable columns={endpointColumns} rows={data.itemList} rowKey={(row) => row.webhookId} isLoading={loading} error={error} onRetry={() => void load()} emptyTitle={m.emptyEndpoints}
        toolbar={{ actions: <RefreshButton onRefresh={() => void load()} isRefreshing={loading} label={m.refresh} /> }}
        actions={{ header: MESSAGES.common.actions, render: (row) => <div className="flex flex-wrap justify-end gap-1"><Button size="sm" variant="outline" onClick={() => void toggle(row)}>{row.isActive ? m.disable : m.enable}</Button><Button size="sm" variant="outline" onClick={() => void rotate(row)}>{m.rotateSecret}</Button><Button size="sm" variant="ghostDestructive" onClick={() => void remove(row)}>{MESSAGES.common.delete}</Button></div> }}
        footer={<Pagination currentPage={page} totalPage={Math.max(1, data.totalPage)} totalRecord={data.totalRecord} limit={PAGE_SIZE} onPageChange={setPage} />}
      /> : <DataTable columns={logColumns} rows={logs.itemList} rowKey={(row) => row.webhookLogId} isLoading={loading} error={error} onRetry={() => void load()} emptyTitle={m.emptyLogs}
        onRowClick={setSelectedLog} toolbar={{ actions: <RefreshButton onRefresh={() => void load()} isRefreshing={loading} label={m.refresh} /> }}
        footer={<Pagination currentPage={page} totalPage={Math.max(1, logs.totalPage)} totalRecord={logs.totalRecord} limit={PAGE_SIZE} onPageChange={setPage} />}
      />}
    </Card>

    <Dialog open={createOpen} onClose={() => !saving && setCreateOpen(false)} title={m.registerTitle} description={m.registerDescription} footer={<><Button variant="outline" onClick={() => setCreateOpen(false)} disabled={saving}>{MESSAGES.common.cancel}</Button><Button onClick={() => void create()} loading={saving} disabled={saving}>{m.register}</Button></>}>
      <div className="space-y-4">{actionError && <FormError message={actionError} />}
        <FormField label={m.endpoint}><Input type="url" value={form.url} onChange={(event) => setForm((old) => ({ ...old, url: event.target.value }))} placeholder="https://example.com/webhooks" /></FormField>
        <FormField label={m.provider}><select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.provider} onChange={(event) => setForm((old) => ({ ...old, provider: event.target.value }))}><option value="CUSTOM">CUSTOM</option><option value="RAZORPAY">RAZORPAY</option><option value="STRIPE">STRIPE</option><option value="SHIPPING">SHIPPING</option></select></FormField>
        <FormField label={m.events} hint={m.eventsHint}><textarea className="min-h-24 w-full rounded-md border border-input bg-background p-3 text-sm" value={form.events} onChange={(event) => setForm((old) => ({ ...old, events: event.target.value }))} placeholder="order.created, payment.completed" /></FormField>
      </div>
    </Dialog>
    <Dialog open={!!secret} onClose={() => setSecret('')} title={m.secretTitle} description={m.secretDescription} footer={<Button onClick={() => setSecret('')}>{MESSAGES.common.done}</Button>}>
      <div className="space-y-3"><p className="text-sm text-danger">{m.secretWarning}</p><code className="block break-all rounded-md border bg-muted p-3 text-sm">{secret}</code><Button size="sm" variant="outline" onClick={() => void navigator.clipboard.writeText(secret)}>{m.copySecret}</Button></div>
    </Dialog>
    <Dialog open={!!selectedLog} onClose={() => setSelectedLog(null)} title={m.logDetails} description={selectedLog?.event}>
      {selectedLog && <pre className="max-h-80 overflow-auto rounded-md border bg-muted p-3 text-xs">{JSON.stringify(selectedLog.payload, null, 2)}</pre>}
    </Dialog>
  </div>;
}

'use client';

import { RefreshButton } from '@/components/common/refresh-button';
import { useCallback, useEffect, useState } from 'react';
import { DataTable, type DataTableColumn } from '@/components/common/data-table';
import { FormError } from '@/components/common/form-error';
import { FormField } from '@/components/common/form-field';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/common/status-badge';
import { apiService } from '@/lib/api/api.service';
import type { AdminApiKeyData, AdminApiKeyListData } from '@/lib/api/contract';
import { formatRelativeTime } from '@/lib/utils/datetime';
import { showSuccess } from '@/lib/utils/toast';
import { MESSAGES } from '@/messages';
import { usePermission } from '@/hooks/use-permission';
import { PERMISSIONS } from '@/constants';
import { useAuth } from '@/providers/auth-provider';
import { isSuperAdmin } from '@/lib/api/auth';

const m = MESSAGES.platformOperations.apiKeys;
const emptyData = (): AdminApiKeyListData => ({ itemCount: 0, apiKeyList: [] });

export function ApiKeyList() {
  const { user } = useAuth();
  const { can } = usePermission();
  const superAdmin = isSuperAdmin(user?.roles ?? []);
  const [data, setData] = useState<AdminApiKeyListData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({ name: '', scopes: '', expiresInDays: '' });
  const [secret, setSecret] = useState<AdminApiKeyData | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    const response = await apiService.getAdminApiKeys();
    if (response.status) setData(response.data); else setError(response.message);
    setLoading(false);
  }, []);
  useEffect(() => { void load(); }, [load]);

  const create = async () => {
    if (form.name.trim().length < 2) { setFormError(m.invalidName); return; }
    const scopes = form.scopes.split(',').map((item) => item.trim()).filter(Boolean);
    setSaving(true); setFormError('');
    const response = await apiService.createAdminApiKey({
      name: form.name.trim(), scopes,
      ...(form.expiresInDays ? { expiresInDays: Number(form.expiresInDays) } : {}),
    });
    setSaving(false);
    if (!response.status) { setFormError(response.message); return; }
    setSecret(response.data);
    setCreateOpen(false);
    setForm({ name: '', scopes: '', expiresInDays: '' });
    showSuccess(m.created);
    await load();
  };
  const revoke = async (row: AdminApiKeyData) => {
    if (!window.confirm(m.confirmRevoke)) return;
    const response = await apiService.revokeAdminApiKey(row.apiKeyId);
    if (response.status) { showSuccess(m.revoked); await load(); } else setError(response.message);
  };
  const remove = async (row: AdminApiKeyData) => {
    if (!window.confirm(m.confirmDelete)) return;
    const response = await apiService.deleteAdminApiKey(row.apiKeyId);
    if (response.status) { showSuccess(m.deleted); await load(); } else setError(response.message);
  };

  const columns: DataTableColumn<AdminApiKeyData>[] = [
    { key: 'name', header: m.name, cell: (row) => <span className="font-medium">{row.name}</span> },
    { key: 'prefix', header: m.prefix, cell: (row) => <code className="text-xs">{row.prefix}••••••</code> },
    { key: 'scopes', header: m.scopes, hideBelow: 'lg', cell: (row) => <span className="text-xs">{row.scopes.length ? row.scopes.join(', ') : m.allScopes}</span> },
    { key: 'usage', header: m.usage, align: 'right', numeric: true, cell: (row) => <span>{row.usageCount.toLocaleString()}</span> },
    { key: 'expires', header: m.expires, hideBelow: 'xl', cell: (row) => <span>{row.expiresAt ? formatRelativeTime(row.expiresAt) : m.never}</span> },
    { key: 'status', header: m.status, cell: (row) => <StatusBadge meta={{ label: row.isActive ? m.active : m.revokedLabel, intent: row.isActive ? 'success' : 'danger' }} /> },
  ];

  return <div className="flex min-h-0 flex-col gap-6">
    <PageHeader title={m.title} description={m.subtitle} action={superAdmin ? <Button onClick={() => { setFormError(''); setCreateOpen(true); }}>{m.create}</Button> : undefined} />
    {!can(PERMISSIONS.apiKeyManage) && <FormError message={MESSAGES.errors.forbidden} />}
    <Card className="overflow-hidden"><DataTable columns={columns} rows={data.apiKeyList} rowKey={(row) => row.apiKeyId} isLoading={loading} error={error} onRetry={() => void load()} emptyTitle={m.empty}
      toolbar={{ actions: <RefreshButton onRefresh={() => void load()} isRefreshing={loading} label={m.refresh} /> }}
      actions={{ header: MESSAGES.common.actions, render: (row) => <div className="flex justify-end gap-1">{row.isActive && <Button size="sm" variant="outline" onClick={() => void revoke(row)}>{m.revoke}</Button>}{superAdmin && <Button size="sm" variant="ghostDestructive" onClick={() => void remove(row)}>{MESSAGES.common.delete}</Button>}</div> }}
    /></Card>

    <Dialog open={createOpen} onClose={() => !saving && setCreateOpen(false)} title={m.createTitle} description={m.createDescription} footer={<><Button variant="outline" onClick={() => setCreateOpen(false)} disabled={saving}>{MESSAGES.common.cancel}</Button><Button onClick={() => void create()} loading={saving} disabled={saving || !form.name.trim()}>{m.create}</Button></>}>
      <div className="space-y-4">{formError && <FormError message={formError} />}
        <FormField label={m.name}><Input value={form.name} onChange={(event) => setForm((old) => ({ ...old, name: event.target.value }))} maxLength={120} /></FormField>
        <FormField label={m.scopes} hint={m.scopesHint}><Input value={form.scopes} onChange={(event) => setForm((old) => ({ ...old, scopes: event.target.value }))} placeholder="orders:read, products:read" /></FormField>
        <FormField label={m.expiryDays}><Input type="number" min="1" max="3650" value={form.expiresInDays} onChange={(event) => setForm((old) => ({ ...old, expiresInDays: event.target.value }))} /></FormField>
      </div>
    </Dialog>
    <Dialog open={!!secret} onClose={() => setSecret(null)} title={m.secretTitle} description={m.secretDescription} footer={<Button onClick={() => setSecret(null)}>{MESSAGES.common.done}</Button>}>
      {secret && <div className="space-y-3"><p className="text-sm text-fg-muted">{secret.note || m.secretWarning}</p><code className="block break-all rounded-md border bg-muted p-3 text-sm">{secret.secret || secret.key}</code><Button size="sm" variant="outline" onClick={() => void navigator.clipboard.writeText(secret.secret || secret.key)}>{m.copySecret}</Button></div>}
    </Dialog>
  </div>;
}

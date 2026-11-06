'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/common/form-field';
import { FormError } from '@/components/common/form-error';
import { apiService } from '@/lib/api/api.service';
import type { UserImpersonationData } from '@/lib/api/contract';
import { isSuperAdmin } from '@/lib/api/auth';
import { useAuth } from '@/providers/auth-provider';
import { usePermission } from '@/hooks/use-permission';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';
import { showSuccess } from '@/lib/utils/toast';

const m = MESSAGES.customers.impersonation;

interface CustomerImpersonationActionProps {
  userId: string;
  userName: string;
}

export function CustomerImpersonationAction({ userId, userName }: CustomerImpersonationActionProps) {
  const { user: actor } = useAuth();
  const { can } = usePermission();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [durationMin, setDurationMin] = useState('30');
  const [result, setResult] = useState<UserImpersonationData | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const isAllowed = isSuperAdmin(actor?.roles ?? []) && can(PERMISSIONS.userImpersonate);

  const close = () => {
    if (saving) return;
    setOpen(false);
    setReason('');
    setDurationMin('30');
    setResult(null);
    setError('');
  };

  const issueToken = async () => {
    const trimmedReason = reason.trim();
    const duration = Number(durationMin);

    if (trimmedReason.length < 3) {
      setError(m.invalidReason);
      return;
    }
    if (!Number.isInteger(duration) || duration < 1 || duration > 480) {
      setError(m.invalidDuration);
      return;
    }

    setSaving(true);
    setError('');
    try {
      const response = await apiService.impersonateUser(userId, {
        reason: trimmedReason,
        durationMin: duration,
      });
      if (!response.status || !response.data.accessToken || !response.data.isImpersonating) {
        setError(response.message || m.issueError);
        return;
      }
      setResult(response.data);
      showSuccess(m.success);
    } catch (issueError) {
      setError(issueError instanceof Error ? issueError.message : m.issueError);
    } finally {
      setSaving(false);
    }
  };

  const copyToken = async () => {
    if (!result?.accessToken) return;
    try {
      await navigator.clipboard.writeText(result.accessToken);
      showSuccess(m.copied);
    } catch {
      setError(m.issueError);
    }
  };

  if (!isAllowed) return null;

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => { setError(''); setOpen(true); }}>
        {m.action}
      </Button>
      <Dialog
        open={open}
        onClose={close}
        title={result ? m.tokenTitle : m.title}
        description={result ? m.tokenDescription : m.description}
        footer={result ? (
          <Button onClick={close}>{MESSAGES.common.done}</Button>
        ) : (
          <>
            <Button size="sm" variant="outline" onClick={close} disabled={saving}>
              {MESSAGES.common.cancel}
            </Button>
            <Button size="sm" onClick={() => void issueToken()} loading={saving} disabled={saving}>
              {m.issue}
            </Button>
          </>
        )}
      >
        {error && <FormError message={error} />}
        {result ? (
          <div className="space-y-4">
            <div className="grid gap-2 rounded-md border border-border p-3 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs text-fg-muted">{m.target}</p>
                <p className="font-medium">{result.userData.name || userName}</p>
                <p className="text-fg-muted">{result.userData.email}</p>
              </div>
              <div>
                <p className="text-xs text-fg-muted">{m.expiresAt}</p>
                <p className="font-medium">{result.expiresAt ? new Date(result.expiresAt).toLocaleString() : '—'}</p>
                <p className="text-xs text-fg-muted">{Math.ceil(result.expiresIn / 60)} min</p>
              </div>
            </div>
            <p className="text-xs text-fg-muted">{m.tokenWarning}</p>
            <code className="block max-h-32 overflow-auto break-all rounded-md border border-border bg-surface-muted p-3 text-xs">
              {result.accessToken}
            </code>
            <Button size="sm" variant="outline" onClick={() => void copyToken()}>
              {m.copy}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <FormField label={m.reason} hint={m.reasonHint}>
              <Textarea value={reason} onChange={(event) => setReason(event.target.value)} maxLength={500} rows={3} placeholder={m.reasonPlaceholder} />
            </FormField>
            <FormField label={m.duration} hint={m.durationHint}>
              <Input type="number" min="1" max="480" step="1" value={durationMin} onChange={(event) => setDurationMin(event.target.value)} />
            </FormField>
          </div>
        )}
      </Dialog>
    </>
  );
}

'use client';

import { MESSAGES } from '@/messages';
import { useHealth } from '@/hooks/use-health';
import { cn } from '@/lib/utils';

export function ApiStatus({ className }: { className?: string }) {
  const health = useHealth();
  const { auth, dashboard } = MESSAGES;
  const label =
    health.status === 'checking'
      ? auth.checkingApi
      : health.status === 'online'
        ? auth.apiOnline
        : auth.apiOffline;

  return (
    <p role="status" className={cn('flex items-center gap-2 text-sm', className)}>
      <span
        aria-hidden="true"
        className={cn(
          'size-2 rounded-full',
          health.status === 'checking'
            ? 'bg-warning'
            : health.status === 'online'
              ? 'bg-success'
              : 'bg-danger',
        )}
      />
      <span>{label}</span>
      {health.status === 'online' && (
        <span className="opacity-70">{dashboard.apiLatency(health.latencyMs)}</span>
      )}
    </p>
  );
}

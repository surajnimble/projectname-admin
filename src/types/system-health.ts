import type { SystemHealthData } from '@/lib/api/contract';

const toNumber = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

const toString = (value: unknown): string => (typeof value === 'string' ? value : '');

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const toSystemHealth = (raw: Record<string, unknown> = {}): SystemHealthData => ({
  status: toString(raw.status),
  database: isObject(raw.database)
    ? {
        ok: raw.database.ok === true,
        latencyMs: toNumber(raw.database.latencyMs),
      }
    : { ok: false, latencyMs: 0 },
  uptimeSeconds: toNumber(raw.uptimeSeconds),
  memoryMb: toNumber(raw.memoryMb),
  nodeVersion: toString(raw.nodeVersion),
  checkedAt: toString(raw.checkedAt),
});

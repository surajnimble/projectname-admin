import { useEffect, useSyncExternalStore } from 'react';
import { TIMING } from '@/constants';
import { apiService } from '@/lib/api/api.service';

export type HealthState =
  | { status: 'checking'; latencyMs: 0 }
  | { status: 'online'; latencyMs: number }
  | { status: 'offline'; latencyMs: 0 };

const CHECKING: HealthState = { status: 'checking', latencyMs: 0 };
const OFFLINE: HealthState = { status: 'offline', latencyMs: 0 };

// One shared check for the whole app: every ApiStatus on screen (and strict mode's double effect)
// reads the same state, and a request already in flight is never repeated.
let current: HealthState = CHECKING;
let lastCheckedAt = 0;
let inFlight = false;
const listeners = new Set<() => void>();

const publish = (next: HealthState) => {
  current = next;
  lastCheckedAt = Date.now();
  inFlight = false;
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

type HealthCheck = typeof apiService.checkHealth;

const defaultCheck: HealthCheck = () => apiService.checkHealth();

const runCheck = (check: HealthCheck) => {
  if (inFlight) return;
  if (current.status !== 'checking' && Date.now() - lastCheckedAt < TIMING.healthFreshMs) return;
  inFlight = true;
  const startedAt = performance.now();
  void check().then((response) =>
    publish(
      response.status
        ? { status: 'online', latencyMs: Math.round(performance.now() - startedAt) }
        : OFFLINE,
    ),
  );
};

export const resetHealthStore = () => {
  current = CHECKING;
  lastCheckedAt = 0;
  inFlight = false;
  listeners.clear();
};

export function useHealth(check: HealthCheck = defaultCheck) {
  const health = useSyncExternalStore(
    subscribe,
    () => current,
    () => CHECKING,
  );

  useEffect(() => {
    const run = () => runCheck(check);
    run();
    const timer = window.setInterval(run, TIMING.healthPollMs);
    return () => window.clearInterval(timer);
  }, [check]);

  return health;
}

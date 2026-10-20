import { COOKIES, STORAGE_KEYS, TIMING } from '@/constants';

// The access token lives in memory only. The refresh token is an HttpOnly cookie owned by the
// backend, so JS never sees it. The hint cookie holds no secret; it only lets proxy.ts redirect.
let accessToken = '';
const clearListeners = new Set<() => void>();

export const getAccessToken = () => accessToken;

export const setAccessToken = (token: string) => {
  accessToken = token;
};

export const setSignedInHint = (signedIn: boolean) => {
  if (typeof document === 'undefined') return;
  document.cookie = signedIn
    ? `${COOKIES.sessionHint}=1; Path=/; Max-Age=${TIMING.sessionCookieMaxAgeSec}; SameSite=Lax`
    : `${COOKIES.sessionHint}=; Path=/; Max-Age=0; SameSite=Lax`;
};

export const hasSignedInHint = () =>
  typeof document !== 'undefined' &&
  document.cookie.split('; ').some((c) => c.startsWith(`${COOKIES.sessionHint}=`));

export function getDeviceId(): string {
  if (typeof window === 'undefined') return 'server';
  try {
    const existing = window.localStorage.getItem(STORAGE_KEYS.deviceId);
    if (existing) return existing;
    const id = crypto.randomUUID();
    window.localStorage.setItem(STORAGE_KEYS.deviceId, id);
    return id;
  } catch {
    return 'unknown-device';
  }
}

export const clearSession = () => {
  accessToken = '';
  setSignedInHint(false);
  clearListeners.forEach((listener) => listener());
};

export const onSessionCleared = (listener: () => void) => {
  clearListeners.add(listener);
  return () => {
    clearListeners.delete(listener);
  };
};

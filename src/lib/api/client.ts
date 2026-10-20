import { env } from '@/config/env';
import { EVENTS } from '@/constants';
import { MESSAGES } from '@/messages';
import { failure, parseResponse, type BaseResponse, type Mapper } from '@/types/api';
import { API_URLS } from './api-urls';
import { buildDeviceHeaders } from './device';
import { clearSession, getAccessToken, setAccessToken } from './session';
import { showError } from '../utils/toast';

type Method = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
type Query = Record<string, string | number | boolean | undefined | null>;

export interface RequestOptions<T> {
  mapper: Mapper<T>;
  query?: Query;
  body?: unknown;
  auth?: boolean;
  idempotencyKey?: string;
  signal?: AbortSignal;
}

const buildUrl = (path: string, query?: Query) => {
  const search = new URLSearchParams();
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value));
  });
  const qs = search.toString();
  return `${env.apiPrefix}${path}${qs ? `?${qs}` : ''}`;
};

let refreshing: Promise<boolean> | null = null;

function refreshAccessToken(): Promise<boolean> {
  refreshing ??= (async () => {
    try {
      const res = await fetch(buildUrl(API_URLS.refreshToken), {
        method: 'POST',
        headers: { Accept: 'application/json', ...buildDeviceHeaders() },
        credentials: 'include',
      });
      const json = (await res.json().catch(() => null)) as {
        status?: boolean;
        result?: { accessToken?: string };
      } | null;
      const token = json?.result?.accessToken;
      if (res.ok && json?.status && token) {
        setAccessToken(token);
        return true;
      }
    } catch {}
    clearSession();
    return false;
  })().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

async function execute<T>(
  method: Method,
  path: string,
  options: RequestOptions<T>,
  retried: boolean,
): Promise<BaseResponse<T>> {
  const { mapper, query, body, auth = true, idempotencyKey, signal } = options;

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    showError(MESSAGES.errors.offline);
    return failure(MESSAGES.errors.offline, mapper);
  }

  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...buildDeviceHeaders(),
  };
  if (!isForm && body !== undefined) headers['Content-Type'] = 'application/json';
  const token = getAccessToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;

  let res: Response;
  let text: string;
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      headers,
      credentials: 'include',
      signal,
      body: body === undefined ? undefined : isForm ? (body as FormData) : JSON.stringify(body),
    });
    text = await res.text();
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    return failure(MESSAGES.errors.serverWaking, mapper);
  }

  const response = parseResponse(text, mapper);

  // Maintenance is detected from the status alone, so it still fires when the
  // envelope arrives unusable and the code cannot be parsed out of the message.
  if (res.status === 503 && typeof window !== 'undefined') {
    window.dispatchEvent(new Event(EVENTS.maintenance));
  }

  if (res.status === 401 && auth && !retried) {
    if (await refreshAccessToken()) return execute(method, path, options, true);
  }

  if (!res.ok && (!response.message || response.message === MESSAGES.errors.invalidResponse)) {
    const gateway = [502, 503, 504].includes(res.status);
    return failure(gateway ? MESSAGES.errors.serverWaking : MESSAGES.errors.unknown, mapper);
  }

  if (!response.status && response.message) {
    showError(response.message);
  }

  return response;
}

export const apiClient = {
  get: <T>(path: string, options: RequestOptions<T>) => execute('GET', path, options, false),
  post: <T>(path: string, options: RequestOptions<T>) => execute('POST', path, options, false),
  patch: <T>(path: string, options: RequestOptions<T>) => execute('PATCH', path, options, false),
  put: <T>(path: string, options: RequestOptions<T>) => execute('PUT', path, options, false),
  delete: <T>(path: string, options: RequestOptions<T>) => execute('DELETE', path, options, false),
};

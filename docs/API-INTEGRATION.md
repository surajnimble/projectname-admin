# API Integration

How the app talks to `projectname-api`. If the backend spec and this document disagree, the spec (`GET /api/v1/docs.json`) wins.

## Contents

1. [Contract in one page](#1-contract-in-one-page)
2. [The flow](#2-the-flow)
3. [Types: ApiRequest, BaseResponse, mappers](#3-types-apirequest-baseresponse-mappers)
4. [apiClient](#4-apiclient)
5. [API service](#5-api-service)
6. [Hooks and components](#6-hooks-and-components)
7. [Auth and tokens](#7-auth-and-tokens)
8. [Errors](#8-errors)
9. [Special cases](#9-special-cases)
10. [Testing](#10-testing)

---

## 1. Contract in one page

| Topic | Rule |
| --- | --- |
| Base path | `/api/v1` — the browser calls this app's origin, Next.js rewrites to the backend |
| Envelope | `{ status: boolean, message: string, result: object }` |
| Error | `status: false`, `result: {}`, message ends with `Error Code (CODE)` — displayed verbatim, never parsed |
| Nulls | Never: `""`, `0`, `false`, `[]`, `{}` |
| Suffixes | `xxxData` object · `xxxList` array · no suffix single value |
| Pagination | inside `result`, first: `totalRecord, totalPage, currentPage, limit, hasNext, hasPrevious, nextPage, previousPage` (`0` = none), then `filterData`, then `xxxList` |
| List query | `?page=1&limit=20&sort=-createdAt&search=` (max limit 100) |
| Auth | access token in the body (15 min, memory); refresh token in an HttpOnly cookie (7 days, path `/api/v1/auth`, SameSite=Strict) |
| Device | `x-device-id` on every request; `deviceData` in login-type bodies |
| Roles used here | `SUPER_ADMIN`, `SUB_ADMIN` (backend tables: `ADMIN` = either staff role) |
| Status codes | 200/201, 400 validation, 401 auth, 403 permission, 404, 409 conflict, 413/415, 422 business rule, 429, 500, 503 maintenance |

---

## 2. The flow

```
LoginForm ─▶ useLogin ─▶ apiService.login(body) ─▶ apiClient.post(API_URLS.login, { body, mapper })
                                                         │ headers, token, offline check,
                                                         │ refresh-on-expiry, parseResponse
                                                         ▼
                                                    fetch (/api/v1/auth/login → rewritten to the backend)
BaseResponse<AuthData> { status, message, data } ─▶ hook state ─▶ component
```

Files: `lib/api/api-urls.ts` (`API_URLS`), `types/api.ts`, `types/<domain>.ts`, `lib/api/client.ts`, `lib/api/api.service.ts`, `hooks/use-*.ts`.

---

## 3. Types: ApiRequest, BaseResponse, mappers

`src/lib/api/contract/` — the whole request/response contract, re-exported from `src/types/api.ts`:

- `ApiRequest` (class, `api-request.ts`) — the one request-body type. Every field is optional; a call sets only what it needs (the backend rejects unknown fields). Add a field here when a new API needs one.
- `BaseResponse<T>` (class, `base-response.ts`) — `{ status, message, data: T }`. `data` is **always** a fully defaulted `T` (also on failures).
- Response data interfaces (same `base-response.ts`) — every payload the backend returns (`AuthData`, `UserData`, `EmptyData`, …), all alongside the envelope.
- Static models (`api-models.ts`) — standalone shapes that belong to no envelope (`SessionUser`).
- `PageData<T>` — the paginated shape every list endpoint uses. The backend names the array differently per endpoint (`itemList`, `productList`, `vendorList`); the mapper normalises it to `itemList` so the UI always reads `data.itemList`.
- `parseResponse(json, mapper)` (in `types/api.ts`) — parses the envelope, keeps `message` verbatim (the backend appends ` Error Code (CODE)`), and runs the mapper over `result`; invalid JSON becomes a failed response. `failure(message, mapper)` builds a failed response.

Mappers stay next to their domain in `types/` and fill the contract interface's defaults:

```ts
import type { AuthData } from '@/lib/api/contract';

export const toAuthData = (raw: RawAuth = {}): AuthData => ({ accessToken: raw.accessToken ?? '', … });
```

New response → add the interface in `base-response.ts` and a `toXxx` mapper in `types/<domain>.ts` (lists default to `[]`, numbers to `0`, booleans to `false`, objects to their own mapper's defaults).

---

## 4. apiClient

`src/lib/api/client.ts` is the only file that calls `fetch`.

```ts
apiClient.get<T>(path, { mapper, query?, auth?, signal? })
apiClient.post<T>(path, { mapper, body?, auth?, idempotencyKey? })   // also patch, put, delete
```

It: checks `navigator.onLine` (toast + failed response when offline) → builds the URL (`/api/v1` + path + query, empty values skipped) → adds `Accept`, the `x-device-id` / `x-platform` / `x-app-version` / `x-device-model` / `x-locale` / `x-timezone` device headers, `Authorization: Bearer <token>` (unless `auth: false`), `Idempotency-Key`, JSON or `FormData` body, `credentials: 'include'` → parses with `parseResponse` → on `401` refreshes once (single-flight, concurrent calls share one `POST /auth/refreshToken`) and retries; a failed refresh clears the session → dispatches `app:maintenance` on HTTP `503`.

| Outcome | Result |
| --- | --- |
| 2xx envelope | `{ status: true, data }` |
| 4xx envelope | `{ status: false, message }` — the backend's own message, verbatim |
| 5xx with a JSON body | `{ status: false, message }` — the backend's own message (503 shows the maintenance text) |
| non-JSON / empty body / network failure | `{ status: false }` with a friendly message (gateway errors say the server may be waking up) |

It never throws for API or network errors (only for an aborted request).

---

## 5. API service

One class in `src/lib/api/api.service.ts` (`ApiService`), one method per endpoint; no logic.

```ts
export const login = (body: ApiRequest) =>
  apiClient.post(API_URLS.login, { body, auth: false, mapper: toAuthData });
export const getMe = () => apiClient.get(API_URLS.getMe, { mapper: toAuthData });
```

Public calls pass `auth: false`. Lists pass `query: { page, limit, sort, search }`.

---

## 6. Hooks and components

```ts
export function useLogin() {
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const login = useCallback(async (identifier: string, password: string) => {
    setIsLoading(true); setError('');
    const response = await apiService.login({ ...identifierToCredentials(identifier), password, deviceData: buildDeviceData() });
    if (!response.status) { setError(response.message); setIsLoading(false); return false; }
    signIn(response.data); setIsLoading(false); return true;
  }, [signIn]);

  return { login, isLoading, error };
}
```

```tsx
// components/auth/login-form.tsx
const result = validateLogin(identifier, password);     // inline errors from result.field / result.message
if (!result.isValid) return;
if (await login(identifier, password)) router.replace(next);
<FormError message={error} />
```

Shared polling or caches use a small module store with `useSyncExternalStore` (see `hooks/use-health.ts`), so several components share one request.

---

## 7. Auth and tokens

| Item | Where |
| --- | --- |
| Access token | memory, `lib/api/session.ts` (`setAccessToken`) |
| Refresh token | backend HttpOnly cookie |
| Session hint | `admin_session=1` cookie, `setSignedInHint(true)` |
| Device id | `localStorage` `device_id`, `getDeviceId()` |
| Session state | `useAuth()` from `providers/auth-provider` |

| Flow | Calls |
| --- | --- |
| Sign in | `login` → `{ email \| phone, password }` (the body is strict; device facts travel as `x-device-*` headers); `useLogin` rejects non-staff accounts (signs them out) and reports `twoFactorRequired` as unsupported |
| Restore session | hint cookie → `refreshToken` → `getMe` (shared promise) |
| Sign out | `logout`, then `clearSession()` |
| Vendors | `apiService.getVendors` → `GET /vendors/getAll?page&limit&search&status`; `apiService.getVendorById` → `GET /vendors/getById/:id`; `apiService.updateVendorCommission` → `PATCH /vendors/updateCommission/:id` (`{ commissionRate }`); `apiService.getVendorDocuments` → `GET /vendors/getDocuments?page&limit&isVerified`; `apiService.verifyVendorDocument` → `PATCH /vendors/verifyDocuments/:id` (`{ isVerified, remark? }`); `apiService.getVendorProducts` → `GET /vendors/getProducts/:id?page&limit`; `apiService.approveVendor` → `PATCH /vendors/approveVendor/:id` (`{ commissionRate?, remark? }`); `apiService.rejectVendor` → `PATCH /vendors/rejectVendor/:id` (`{ reason }`); `apiService.suspendVendor` → `PATCH /vendors/suspendVendor/:id` (`{ reason }`) — the list result arrives as `vendorList` and the mapper normalises it to `itemList` |

Never put tokens in web storage; never log them; clear the session on sign-out.

---

## 8. Errors

Show `response.message` exactly as the backend sent it; branch on the **HTTP status**, never on message text.

| Status | UX |
| --- | --- |
| 400 | form-level message |
| 401 (sign-in) | form-level message; never say which field was wrong |
| 401 (signed in) | `apiClient` refreshes once and retries silently; a failed refresh clears the session → `/login?next=…` |
| 403 | 403 view for a page, toast for an action; sign out when the session is refused |
| 404 | not-found view |
| 409 / 422 | message next to the action; refetch the affected row |
| 429 | message; disable the control briefly |
| 5xx / offline | `ErrorState` with retry |
| 503 (maintenance, always this status now) | `SUB_ADMIN` → `/maintenance`; `SUPER_ADMIN` not blocked |

---

## 9. Special cases

- **Idempotency:** money-moving admin calls (`confirmPayment`, `refund`, `markCodCollected`, `verifyUpi`, `verifyBank`) pass `idempotencyKey` (one `crypto.randomUUID()` per user intent, reused on retries).
- **Uploads:** pass `FormData` as `body` (the client leaves `Content-Type` to the browser); respect the backend limits (images ≤ 5 MB, video ≤ 50 MB, documents ≤ 10 MB, CSV ≤ 20 MB).
- **Pagination:** `query: { page, limit, sort, search }`, state kept in the URL, list model in `types/`.
- **Realtime:** Socket.io on `/ws` (token at handshake) is added as its own module when a page needs it.
- **Two-step verification:** not supported; `useLogin` reports it. Add the form, API method and `ApiRequest` fields when it is needed.

---

## 10. Testing

- **ApiService / apiClient:** stub `fetch`, call the method, assert URL, body, headers and the `BaseResponse` (`lib/api/api.service.test.ts`).
- **Types:** `parseResponse` with success, error envelope and invalid JSON; mappers with partial input.
- **Hooks:** `vi.mock('@/lib/api/api.service')` and `vi.mock('@/providers/auth-provider')`, then `renderHook` (`hooks/use-login.test.tsx`).
- **Validation:** one test per rule.

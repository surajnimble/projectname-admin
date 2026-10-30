# Workflows — step-by-step recipes

Each recipe lists the exact files to touch, in order. Follow it literally; do not create files it does not mention. Rules behind the steps are in [`../AGENTS.md`](../AGENTS.md).

| # | Recipe |
| --- | --- |
| 1 | [Add an API call](#1-add-an-api-call) |
| 2 | [Add a page](#2-add-a-page) |
| 3 | [Add a list page (pagination, search)](#3-add-a-list-page-pagination-search) |
| 4 | [Add validation](#4-add-validation) |
| 5 | [Add a reusable component](#5-add-a-reusable-component) |
| 6 | [Gate a page or action by role / permission](#6-gate-a-page-or-action-by-role--permission) |
| 7 | [Add or change a design token](#7-add-or-change-a-design-token) |
| 8 | [Add a constant or UI message](#8-add-a-constant-or-ui-message) |
| 9 | [Handle a new API error code](#9-handle-a-new-api-error-code) |
| 10 | [Worked example — users list](#10-worked-example--users-list) |

---

## 1. Add an API call

**Inputs:** the endpoint from `GET /api/v1/docs.json` or backend `FEATURES.md` (Part E table + Part F sample). Confirm its Role column allows `ADMIN` / `SUPER_ADMIN`.

| # | File | What to add |
| --- | --- | --- |
| 1 | `src/lib/api/api-urls.ts` | `API_URLS.getUsers = '/users/getAll'` |
| 2 | `src/lib/api/contract/api-request.ts` | an optional `ApiRequest` field only if the call needs one that does not exist (re-exported from `src/types/api.ts`) |
| 3 | `src/lib/api/contract/base-response.ts` | response interface, plus its `toXxx` mapper in `src/types/<domain>.ts` (defaults, no nulls) |
| 4 | `src/lib/api/api.service.ts` | a method on `ApiService`: `getUsers = (query) => apiClient.get(API_URLS.getUsers, { query, mapper: toUserList })` |
| 5 | `src/hooks/use-<name>.ts` | `useState` for `isLoading` / `error` / data, calls `apiService`, returns actions |
| 6 | `src/components/<feature>/…` | validate, call the hook, render loading / error / empty / success |
| 7 | tests | api.service (URL/body/headers/response) and hook (success + failure) |

Never: `fetch` outside `lib/api/client.ts` · import `lib/api/api.service` in a component · inline URL · parse JSON by hand (`parseResponse`) · put a URL outside `constants.ts` or UI copy outside `messages/en.ts`.

---

## 2. Add a page

**Inputs:** the URL, the data (recipe 1), who may open it.

1. **Route:** `src/app/(dashboard)/<path>/page.tsx` (kebab-case) rendering `<FeatureComponent />` with a `metadata` title. Add the path to `ROUTES` and an entry to `NAV_ITEMS` in `src/constants.ts` (with `roles` / `permission` if limited).
2. **Component:** `src/components/<feature>/<name>.tsx` (`'use client'`), composed from `components/common` + `components/ui`.
3. **State:** a hook in `src/hooks/` owns API state; the component owns form fields.
4. **States:** loading (`Spinner`/`Skeleton`, button `loading`), error (`ErrorState` / `FormError` from `message`), empty (`EmptyState`), success.
5. **Constants** in `constants.ts`, **UI copy** in `messages/en.ts` (recipe 8); **validation** in `lib/utils/validations.ts` (recipe 4).
6. **Gate** if limited (recipe 6). Check both themes and 360 px width.
7. **Tests** for new hooks / API methods / validators. `npm run verify`.

A page that needs its own shell (different from `(dashboard)`) gets its own route group with its own `layout.tsx`.

---

## 3. Add a list page (pagination, search)

1. The API method takes `query: { page, limit, sort, search }` (fields exist on `ApiRequest`).
2. `types/<domain>.ts`: model the page, e.g. `UserList` with `totalRecord, totalPage, currentPage, limit, hasNext, hasPrevious, nextPage, previousPage, filterData` and `userList: User[]`, all defaulted by `toUserList`.
3. Hook `use-users.ts`: `getUsers(params)` sets `isLoading`, `error`, `data`.
4. Component: read `page`, `limit`, `sort`, `search` from `useSearchParams`; changing a filter resets `page` to 1 and updates the URL (`router.replace`); debounce the search input (300 ms); call the hook in an effect on those values.
5. Layout: `PageHeader` → search/filters → table → pagination controls (`hasNext` / `hasPrevious`; `nextPage` / `previousPage` of `0` mean none).
6. States: skeleton while loading (keep previous rows to avoid flashing), `ErrorState` with retry, `EmptyState` (different copy for "no data" and "no results").
7. Never fetch "all" and paginate in the browser.
8. Rows that open a detail page: `onClick` + `router.push` on `TableRow`, with `stopPropagation()` on the name link and the actions cell (`common/data-table.tsx`). Add `data-ripple=""` to the row so the global `RippleProvider` gives it the same press/click feedback as every other clickable element. Never use a stretched `after:absolute after:inset-0` link on a `<tr>` — mobile browsers ignore `position: relative` on table rows and the overlay captures taps for the whole page.

---

## 4. Add validation

1. Open `src/lib/utils/validations.ts` — the only place for rules.
2. Reuse the primitives (`isEmail`, `isPhone`, `isEmpty`, `isEmailOrPhone`); add a primitive only if none fits.
3. Add `validateXxx(...)` returning the first problem as `{ isValid: false, message, field }` (extend `ValidationField` with new field names).
4. Add the messages to `MESSAGES.validation` in `src/messages/en.ts`.
5. In the component: `const result = validateXxx(…)`; show `result.message` under `result.field`; stop if `!result.isValid`.
6. Add a test per rule in `validations.test.ts`.

Mirror documented backend limits (e.g. password 8–64 with upper, lower, number and special character), but the server stays authoritative.

---

## 5. Add a reusable component

1. **Search first** (AGENTS §6). Can an existing component do it with a prop or variant?
2. **Place:** no app knowledge → `components/ui`; generic composition → `components/common`; one feature → `components/<feature>`; chrome → `components/layout`.
3. `kebab-case.tsx`, named `PascalCase` export, `<Name>Props`, accepts `className`, tokens + `cva` variants only; interactive behaviour via Radix.
4. No API, routing or message strings inside `ui/` / `common/` — pass them in.
5. Cover states: hover, `focus-visible`, disabled, loading where relevant.
6. If promoted from a feature (second use): move, make generic, update both call sites, keep the diff minimal.
7. Test render + interaction. `npm run verify`.

---

## 6. Gate a page or action by role / permission

| Need | Do |
| --- | --- |
| Any staff member | place the route under `(dashboard)` — the layout already gates it |
| `SUB_ADMIN` permission | wrap the page/action in a permission guard (extend `components/auth/guards.tsx` once the backend permission shape is confirmed); set `permission` on the `NAV_ITEMS` entry; `SUPER_ADMIN` always passes |
| `SUPER_ADMIN` only | `<RoleGuard roles={[ROLES.superAdmin]} fallback={…}>`; put whole sections under a `super-admin/` route folder |

Permission names come from the backend; never invent them. Guards are for experience only — handle a 403 `FORBIDDEN` from the API too.

---

## 7. Add or change a design token

Follow `DESIGN-SYSTEM.md` §10: `tokens.css` (both themes) → `theme.css` mapping → use → verify both themes and contrast → `npm run tokens:check`.

---

## 8. Add a constant or UI message

Constants go into `src/constants.ts`; UI copy goes into `src/messages/en.ts`:

- UI copy → `MESSAGES.<group>` in `src/messages/en.ts` (dynamic text as small functions); errors the app generates → `MESSAGES.errors`; validation text → `MESSAGES.validation`.
- Paths → `ROUTES`; endpoint paths → `API_URLS` (`lib/api/api-urls.ts`); keys → `COOKIES` / `STORAGE_KEYS` / `QUERY_PARAMS` / `EVENTS`; timings → `TIMING`; patterns → `REGEX`; roles → `ROLES` / `STAFF_ROLES`; sidebar → `NAV_ITEMS`.
- A new locale is a new file `src/messages/<locale>.ts` exporting a catalog named after the locale and satisfying `Messages`; `src/messages/index.ts` selects which catalog is exposed as `MESSAGES`. English only for now.
- API messages are shown as-is from `BaseResponse.message`; do not duplicate them.

---

## 9. Handle a new API error status

1. Confirm the HTTP status in backend `FEATURES.md` (Part B rule or Part D).
2. Branch on the HTTP status, never on message text: field-level → set the field error; action-level → `showError(response.message)`; state change → refetch the row.
3. Cross-cutting statuses (affect every request) belong in `lib/api/client.ts`, not per page.
4. Add the row to `API-INTEGRATION.md` §8 if it is a new UX rule; test with a mocked API method returning that status.

---

## 10. Worked example — users list

**Task:** "Staff can see all users in a paginated, searchable table."

**Analysis:** route `/users` in `(dashboard)`; any staff member; endpoint `GET /users/getAll` (confirm in the spec); result = pagination numbers + `filterData` + `userList`.

**Files**

```
src/constants.ts                         + ROUTES.users · ROUTES.users · NAV_ITEMS entry
src/messages/en.ts                       + MESSAGES.users
src/types/user.ts                        User, UserList, toUserList
src/lib/api/api-urls.ts                   API_URLS.getUsers = '/users/getAll'
src/hooks/use-users.ts                   isLoading, error, data, fetchUsers(params)
src/components/users/users-table.tsx     search + table + pagination, four states
src/app/(dashboard)/users/page.tsx       <UsersTable /> + metadata
tests                                    api.service URL/query · hook success/failure
```

**Hook**

```ts
export function useUsers() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<UserList>(toUserList());

  const fetchUsers = useCallback(async (query: ApiRequest) => {
    setIsLoading(true);
    const response = await apiService.getUsers(query);
    setError(response.status ? '' : response.message);
    if (response.status) setData(response.data);
    setIsLoading(false);
  }, []);

  return { data, isLoading, error, fetchUsers };
}
```

**Page**

```tsx
export const metadata = { title: 'Users' };
export default function UsersPage() { return <UsersTable />; }
```

**Done when:** the table renders from a mocked API method in tests, empty/error states work, search and page live in the URL, it works in dark theme and at 360 px, and `npm run verify` passes. Untouched: layouts, other features, shared components.

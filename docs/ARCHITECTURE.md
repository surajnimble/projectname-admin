# Architecture

How the admin panel is organised and why. [`../AGENTS.md`](../AGENTS.md) holds the rules; this document explains the structure.

## Contents

1. [Principles](#1-principles)
2. [Folder structure](#2-folder-structure)
3. [Layers and imports](#3-layers-and-imports)
4. [Route groups, layouts and roles](#4-route-groups-layouts-and-roles)
5. [Feature anatomy](#5-feature-anatomy)
6. [Shared components](#6-shared-components)
7. [Rendering and state](#7-rendering-and-state)
8. [Auth, roles and permissions](#8-auth-roles-and-permissions)
9. [Environment and config](#9-environment-and-config)
10. [Backend module → page areas](#10-backend-module--page-areas)

---

## 1. Principles

- **Standard Next.js layout:** shells live in `layout.tsx`, pages stay thin, features are `components/<feature>` + `hooks/use-*` + a method on `lib/api/api.service.ts`.
- **One flow for the network:** component → hook → `apiService` → `apiClient`, identical for every API call.
- **One place per concern:** one `constants.ts`, one message catalog per locale, one `validations.ts`, one `api/client.ts`, one `api/session.ts`.
- **Tokens, not values:** visual decisions live in design tokens; components use semantics.
- **Predictable:** the same task is always done in the same place in the same way.
- **Two roles only:** every page is for `SUPER_ADMIN` and/or `SUB_ADMIN`.

---

## 2. Folder structure

```
projectname-admin/
├── AGENTS.md  README.md
├── docs/                    ARCHITECTURE · API-INTEGRATION · DESIGN-SYSTEM · WORKFLOWS
├── scripts/                 tokens-check.ts, api-types.ts
├── src/
│   ├── app/
│   │   ├── layout.tsx  globals.css  error.tsx  not-found.tsx
│   │   ├── maintenance/page.tsx
│   │   ├── (auth)/          layout.tsx · login/page.tsx
│   │   └── (dashboard)/     layout.tsx · page.tsx · vendors/page.tsx
│   │   │                        vendors/[vendorId]/page.tsx
│   │   │                        vendors/[vendorId]/products/[productId]/page.tsx
│   ├── components/
│   │   ├── ui/              button, input, textarea, label, card, badge, table, dialog,
│   │   │                    options-menu, select, status-dot, thumbnail, skeleton, spinner
│   │   ├── common/          form-field, form-error, password-input, error-state,
│   │   │                    empty-state, page-header, pagination, filter-sheet,
│   │   │                    data-table, data-table-media, theme-toggle
│   │   ├── layout/          sidebar, header, mobile-nav, logo, api-status
│   │   ├── auth/            login-form, guards
│   │   └── dashboard/       overview
│   │   └── vendor/         vendor-page, vendor-list, vendor-columns, vendor-details,
│   │   │                    vendor-documents, vendor-action-dialog, vendor-document-dialog
│   │   │                    product/         product-list, product-columns, product-details, product-action-dialog
│   │   │                                    product-detail-dialog
│   ├── config/env.ts
│   ├── constants.ts
│   ├── hooks/               use-login, use-health, use-mounted, use-vendors,
│   │   │                    use-vendor-detail, use-vendor-documents, use-vendor-products,
│   │   │                    use-product-detail
│   ├── lib/
│   │   ├── api/              client, api.service (the ApiService), api-urls (API_URLS), session, auth, device
│   │   │   └── contract/     api-request, base-response, api-models (the whole contract)
│   │   └── utils/            index (cn, format), validations, activity, datetime, toast
│   ├── messages/            en.ts (English UI copy) · index.ts (exports MESSAGES)
│   ├── providers/           auth-provider, theme-provider, toast-provider, app-providers
│   ├── styles/              tokens.css, theme.css, base.css
│   ├── types/               api.ts (re-exports the API contract), auth.ts
│   └── proxy.ts
├── next.config.ts  eslint.config.mjs  vitest.config.mts  tsconfig.json
├── .env.local  .env.example
└── package.json
```

Create only what a task needs; do not pre-create empty folders.

---

## 3. Layers and imports

```
app → components → hooks → lib/api/api.service → lib/api/client → lib · constants · messages · types
```

| Layer | Responsibility | May import |
| --- | --- | --- |
| `app` | routes, `layout.tsx` shells, metadata | `components`, `constants`, `messages` |
| `components/<feature>`, `layout`, `dashboard` | feature UI | `ui`, `common`, `hooks`, `providers`, `lib`, `constants`, `messages` |
| `components/common`, `ui` | reusable UI | `lib`, `constants`, `messages` (never api/service, api/client, providers) |
| `hooks` | state + actions for a feature | `lib/api/api.service`, `providers`, `lib`, `constants`, `messages`, `types` |
| `providers` | session, theme, toast | `lib/api/api.service`, `lib`, `constants`, `messages`, `types` |
| `lib/api/api.service` | one method per endpoint | `lib/api/client`, `constants`, `types` |
| `lib/api/contract/*` | framework-free contract (`ApiRequest`, `BaseResponse`, every response data + static model) | nothing (leaf; reusable outside this app) |
| `lib`, `types`, `constants`, `messages` | leaf modules | each other only; never components/hooks/providers |

Lint-enforced: components/pages never import `lib/api/api.service` or `lib/api/client`; `ui/` and `common/` never import providers; `fetch` only in `lib/api/client.ts`; `process.env` only in `config/env.ts`.

---

## 4. Route groups, layouts and roles

| Group | `layout.tsx` | Guard |
| --- | --- | --- |
| `(auth)` | split brand panel + form area, theme toggle, `ApiStatus` | `GuestGuard` in the page: signed-in staff are redirected in |
| `(dashboard)` | `AuthGuard` → `Sidebar` + `Header` + `RoleGuard` around `{children}` | session + staff role |

| Level | Mechanism |
| --- | --- |
| Any staff member | the `(dashboard)` layout |
| Permission-limited (`SUB_ADMIN` needs the permission; `SUPER_ADMIN` always passes) | a guard around the page/action (extend `components/auth/guards.tsx` once the backend permission shape is confirmed) |
| `SUPER_ADMIN` only | `<RoleGuard roles={[ROLES.superAdmin]}>` on a `super-admin/` route folder or action |

The sidebar renders `NAV_ITEMS` from `constants.ts`; items declare `roles` / `permission` and unavailable ones are hidden.

---

## 5. Feature anatomy

A feature (e.g. login, users list) is spread over the standard folders:

```
lib/api/api.service.ts          login, refreshToken, logout, getMe
types/auth.ts                     SessionUser + toAuthData/toUserData mappers
hooks/use-login.ts                isLoading, error, login(identifier, password)
lib/utils/validations.ts                validateLogin
components/auth/login-form.tsx    fields, validation, calls the hook, renders states
app/(auth)/login/page.tsx         <LoginForm /> + metadata
constants.ts                      ROUTES . used by all of the above
lib/api/api-urls.ts               API_URLS (every endpoint path)
messages/en.ts                    MESSAGES (UI copy) used by all of the above
```

- **Component:** owns form fields (`useState`), calls the validator, calls the hook, navigates on success.
- **Hook:** `useState` for `isLoading` / `error` / data, calls `apiService`, maps the `BaseResponse` to UI state, applies feature rules (e.g. staff-only sign-in).
- **API method:** `apiClient.<verb>(API_URLS.x, { body | query, auth?, mapper })` inside `ApiService`.

---

## 6. Shared components

| Layer | What belongs | Examples |
| --- | --- | --- |
| `ui/` | token-styled primitives with a `cva` variant API, no app knowledge | `Button`, `Input`, `Label`, `Card`, `Badge`, `Skeleton`, `Spinner` |
| `common/` | generic compositions of `ui` | `FormField`, `FormError`, `PasswordInput`, `EmptyState`, `ErrorState`, `PageHeader`, `ThemeToggle` |
| `layout/` | app chrome | `Sidebar`, `Header`, `MobileNav`, `Logo`, `ApiStatus` |
| `components/<feature>/` | UI for one feature | `LoginForm`, `DashboardOverview` |

Promotion: a feature component needed by a second feature is moved to `common/` (made generic) at the second use.

---

## 7. Rendering and state

The app sits behind staff sign-in and the access token lives in memory, so every dashboard page is **client-driven**: `page.tsx` / `layout.tsx` are server components that render `'use client'` components.

| State | Where |
| --- | --- |
| API data, loading, errors | the feature hook (`useState`) |
| Session (user, roles, status) | `providers/auth-provider` (`useAuth`) backed by `lib/api/session.ts` |
| Form fields | `useState` in the component |
| URL state (filters, page, sort, search) | search params (`useSearchParams`) |
| Theme | `next-themes` |
| Shared polling | module store read with `useSyncExternalStore` (`use-health`) |

---

## 8. Auth, roles and permissions

Three layers: (1) `src/proxy.ts` redirects visitors without the non-secret `admin_session` hint cookie to `/login?next=…` — it never sees a token or a role; (2) `AuthGuard` / `RoleGuard` use the real session from `useAuth`; (3) the backend is the real enforcement (403 `FORBIDDEN`).

The refresh cookie is HttpOnly and scoped to `/api/v1/auth`, so page requests never carry it — hence the hint cookie. Session restore after a reload: if the hint exists → `refreshToken` → `getMe` (one shared promise, so React strict mode cannot refresh twice). Permission names come from the backend; never invent them.

---

## 9. Environment and config

| Variable | Purpose |
| --- | --- |
| `API_BASE_URL` | Backend origin for the `/api/v1` rewrite (read by `next.config.ts` at build/dev start) |
| `NEXT_PUBLIC_API_PREFIX` | Default `/api/v1` |
| `NEXT_PUBLIC_ENCRYPTION_ENABLED` | Reserved; transport encryption is not implemented |

The browser only talks to this app's `/api/v1/*`, which Next.js rewrites to the backend: the `SameSite=Strict` refresh cookie works and no CORS setup is needed.

---

## 10. Backend module → page areas

Suggested homes for future pages (the backend Role column decides what the admin may call):

| Area | Backend prefixes |
| --- | --- |
| Users | `/users` |
| Vendors | `/vendors` |
| Products & catalog | `/products`, `/categories`, `/brands`, `/tags`, `/attributes`, `/collections` |
| Orders | `/orders` |
| Payments | `/payments`, `/payouts`, `/returns`, `/wallet` |
| Marketing | `/coupons`, `/flashSales`, `/banners`, `/referral`, `/giftCards`, `/loyalty` |
| Reviews | `/reviews`, `/questions` |
| Support | `/tickets`, `/chat`, `/notifications` |
| Shipping | `/shipping`, `/deliveryBoys` |
| Content | `/pages`, `/blogs`, `/faqs`, `/contact`, `/newsletter`, `/content` |
| Analytics & reports | `/analytics`, `/reports`, `/devices`, `/bulk` |
| Settings | `/settings`, `/currencies`, `/tax`, `/countries`, `/templates`, `/apiKeys`, `/webhooks`, `/i18n` |
| Logs | `/auditLogs`, `/activityLogs` |
| Super-admin tools | `/admin` (sub-admins, permissions, jobs, health, cache) |

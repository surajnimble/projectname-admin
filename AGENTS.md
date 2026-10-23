# AGENTS — Admin Panel Development Guide

The single entry point for any AI agent or developer working on this project. Read it completely before your first edit, then open the linked document for your task.

| If you are… | Read |
| --- | --- |
| Adding an API call, page, form, validation, component, token | [`docs/WORKFLOWS.md`](docs/WORKFLOWS.md) |
| Deciding where a file belongs or what may import what | [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) |
| Touching the request/response flow, auth, errors | [`docs/API-INTEGRATION.md`](docs/API-INTEGRATION.md) |
| Touching colours, spacing, dark mode, UI primitives | [`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md) |
| Needing to know what an endpoint or rule does | Backend `FEATURES.md` and `GET /api/v1/docs.json` (the spec wins over any doc) |

---

## 1. Project at a glance

- **What:** the admin panel (back-office web app) for the marketplace REST API (`/api/v1`). Staff only.
- **Users:** exactly two roles — `SUPER_ADMIN` (everything, incl. sub-admin management, health, jobs, maintenance) and `SUB_ADMIN` (only what a super admin permitted).
- **Stack:** Next.js 16 (App Router, `proxy.ts` instead of `middleware.ts`), React 19, TypeScript 5.9 (strict), Tailwind CSS 4 with centralized design tokens (light + dark).
- **Libraries (fixed — do not add alternatives):** `next-themes`, Radix UI, `class-variance-authority` + `tailwind-merge` + `clsx`, `lucide-react`, Sonner, Zod (env only), Vitest + Testing Library.
- **Conventions:** standard Next.js layout — `app/` routes with `layout.tsx` / `page.tsx`, `components/`, `hooks/`, `lib/`, `types/`, `providers/`, one `constants.ts`, UI copy in `messages/`, kebab-case file names.

| Area | URLs | Route group |
| --- | --- | --- |
| Staff sign-in | `/login` | `(auth)` |
| Dashboard | `/`, and every page you add | `(dashboard)` |

Staff accounts are created by a super admin; there is no registration page.

---

## 2. Golden rules

Non-negotiable. If a task seems to require breaking one, stop and ask.

1. **Read before you write.** Open the files you are about to touch. Match their style.
2. **Reuse before you create** (§6).
3. **Change only what you were asked to change.** No refactors, renames, moves, dependency swaps or formatting sweeps outside the task. Propose them in your report instead.
4. **Pages are thin.** `page.tsx` renders a component (plus metadata). Shells live in `layout.tsx`.
5. **One way to reach the API (§5).** Only `lib/api/client.ts` calls `fetch`. Components never import the API layer; they use hooks.
6. **All app constants live in `src/constants.ts`:** routes, roles, cookie/storage keys, timings, regex, nav items. **Endpoint paths live in `src/lib/api/api-urls.ts`** (`API_URLS`). **All UI copy lives in `src/messages/en.ts`** (imported as `MESSAGES` from `@/messages`). Never define a constant, message or magic value inside another file.
7. **All validation lives in `src/lib/utils/validations.ts`** (rules; messages come from `src/messages/en.ts`).
8. **Responses are parsed with `parseResponse(json, mapper)`;** mappers in `types/` fill defaults so UI data never has `null`.
9. **Never hand-write a colour, spacing or radius.** Semantic tokens via Tailwind utilities only: no hex/rgb, palette classes (`bg-blue-500`), arbitrary values (`w-[137px]`), or `dark:` colour overrides.
10. **No `any`, no `@ts-ignore`, no non-null `!`.**
11. **Tokens never touch web storage.** The access token is in memory (`lib/api/session.ts`); the refresh token is a backend HttpOnly cookie.
12. **Every async UI has four states:** loading, error, empty, success.
13. **Comments only when the why is not obvious** (a non-trivial constraint or gotcha). No narration, no section banners, no JSDoc that repeats the signature.
14. **Accessibility is part of done:** semantic elements, labels, focus, keyboard.
15. **Definition of done = `npm run verify` passes** (typecheck + lint + tokens + tests). Never claim a check you did not run.
16. **Clickable table rows never use an absolute link overlay.** Never put `after:absolute after:inset-0` on a link inside a `<tr>`: mobile browsers ignore `position: relative` on table rows, so the overlay escapes and captures taps for the whole page. Use `onClick` + `router.push` on the row, with `stopPropagation()` on the name link and the actions cell (see `vendor-table.tsx` / `product-table.tsx`), and mark the row with `data-ripple=""` for the shared click effect.

---

## 3. Where does this code go?

| You are writing… | Put it in | Notes |
| --- | --- | --- |
| A URL | `src/app/(dashboard)/<route>/page.tsx` (`(auth)` for sign-in pages) | Renders a component |
| App shell / layout of a route group | that group's `layout.tsx` | Compose `components/layout/*` |
| Page content for one feature | `src/components/<feature>/` (e.g. `components/auth/login-form.tsx`) | Client components that use hooks |
| State + API calls for a feature | `src/hooks/use-<name>.ts` | Calls `apiService`, returns state and actions |
| One API call | `src/lib/api/api.service.ts` | One method per endpoint on `ApiService` |
| Endpoint path | `API_URLS` in `src/lib/api/api-urls.ts` | |
| Request fields | `ApiRequest` in `src/lib/api/contract/api-request.ts` | Optional field |
| Response envelope | `BaseResponse<T>` in `src/lib/api/contract/base-response.ts` | `{ status, message, data }` |
| Response model | `src/lib/api/contract/base-response.ts` (interface) + `toXxx` mapper in `src/types/<domain>.ts` | Defaults so UI data is never `null` |
| Static model (not in an envelope) | `src/lib/api/contract/api-models.ts` | |
| Validation rule | `src/lib/utils/validations.ts` | Message in `MESSAGES.validation` |
| UI copy / message | `src/messages/en.ts` | Imported as `MESSAGES` from `@/messages`; English only for now |
| Any constant / route / role / key / nav item | `src/constants.ts` | |
| Session, token, device id | `src/lib/api/session.ts` | |
| Toast | `src/lib/utils/toast.ts` | |
| Pure helper | `src/lib/utils/` | |
| Primitive UI | `src/components/ui/` | No app knowledge |
| Reusable composed UI | `src/components/common/` | Promote on the **second** use |
| App chrome (sidebar, header, logo) | `src/components/layout/` | |
| Route / role guard | `src/components/auth/guards.tsx` | |
| Provider | `src/providers/` | |
| Env config | `src/config/env.ts` | Only place that reads `process.env` |
| Design token | `src/styles/tokens.css` + `theme.css` | Both themes |
| Test | beside the file (`*.test.ts[x]`) | |

If a case is missing, use the closest row and say so in your report; do not invent a new top-level folder.

---

## 4. Folder structure

```
src/
  app/                routes: layout.tsx, page.tsx, error.tsx, not-found.tsx
    (auth)/           layout.tsx (brand panel) · login/page.tsx
    (dashboard)/      layout.tsx (sidebar + header) · page.tsx · vendors/page.tsx · vendors/[vendorId]/page.tsx · vendors/[vendorId]/products/[productId]/page.tsx · payments/page.tsx
    maintenance/
  components/
    ui/               button, input, textarea, label, card, badge, table, dialog, options-menu, select, status-dot, thumbnail, skeleton, spinner
    common/           form-field, form-error, password-input, error-state, empty-state, page-header, pagination, filter-sheet, detail-grid, status-badge, table-skeleton, confirm-dialog, reason-dialog, theme-toggle
    layout/           sidebar, header, mobile-nav, logo, api-status
    auth/             login-form, guards (AuthGuard, GuestGuard, RoleGuard)
    dashboard/        overview
    vendor/           vendor-page, vendor-list, vendor-filters, vendor-table, vendor-details, vendor-documents, vendor-action-dialog, vendor-document-dialog
    product/          product-list, product-table, product-details, product-action-dialog
    payment/          payment-list
  config/             env.ts
  constants.ts        ← every non-copy app constant (routes, roles, keys, timings, regex, nav items)
  hooks/              use-login, use-health, use-mounted, use-vendors, use-vendor-detail, use-vendor-documents, use-vendor-products, use-vendor-payouts, use-vendor-returns, use-product-detail, use-payments
  lib/
    api/              client, api.service (the ApiService), api-urls (API_URLS), session, auth, device
      contract/       api-request, base-response, api-models (the request/response contract)
    utils/            index (cn, format), validations, activity, datetime, toast
  messages/           en.ts (English UI copy) · index.ts (exports MESSAGES + Messages type)
  providers/          auth-provider, theme-provider, toast-provider, ripple-provider, app-providers

  styles/             tokens.css, theme.css, base.css
  types/              api.ts (re-exports the API contract, parseResponse), auth.ts (mappers)
  proxy.ts            Next.js 16 proxy (formerly middleware)
```

---

## 5. The API flow (follow it for every call)

```
Component ──▶ hook ──▶ apiService ──▶ apiClient ──▶ fetch
 (UI)         (state)  (one method    (headers, token,
                       per API)       refresh, parse)
```

1. `lib/api/api-urls.ts` — the path (`API_URLS`).
2. `lib/api/contract/api-request.ts` — add the field to `ApiRequest` if the call needs a new one (`types/api.ts` re-exports it).
3. `lib/api/contract/base-response.ts` — the response interface, plus its `toXxx` mapper in `types/<domain>.ts`.
4. `lib/api/api.service.ts` — a method on `ApiService`: `getUsers = (query) => apiClient.get(API_URLS.getUsers, { query, mapper: toUserList })`.
5. `hooks/use-<name>.ts` — calls `apiService`, owns `isLoading`/`error`/data, returns actions.
6. `components/<feature>/…` — validates (`lib/utils/validations.ts`), calls the hook, renders the four states.

Every `ApiService` method returns `BaseResponse<T>` (`status`, `message`, `data`) and never throws for API or network errors; `data` is always a fully defaulted object.

---

## 6. Reuse before you create

1. **Search** `components/ui`, `components/common`, the feature's folder, `lib`, `hooks`, `constants.ts`, `messages/`, `lib/utils/validations.ts`, `types/`.
2. **Can an existing one do it with a prop, variant or extra function?** Extend it additively instead of forking.
3. **Needed by a second feature?** Move it to `common/` (or `lib/`) in a minimal separate commit and update both call sites.
4. **Only then create it**, in the narrowest place §3 allows.

State in your report what you searched and what you reused.

---

## 7. Dependency direction

```
app → components → hooks → lib/api/api.service → lib/api/client → lib · constants · messages · types
```

- `components/ui` and `components/common` never import `lib/api/api.service`, `lib/api/client` or providers (lint-enforced).
- Components and pages never import `lib/api/api.service` or `lib/api/client`; hooks do (lint-enforced).
- `fetch` only in `lib/api/client.ts`; `process.env` only in `config/env.ts` (lint-enforced).
- `constants.ts`, `messages/*`, `types/` and `lib/` never import components, hooks or providers; `messages/*` is plain data.
- Locale files export a catalog named after the locale (`en`, later `hi`) and must satisfy the `Messages` type from `messages/en.ts`; only `messages/index.ts` picks which one is exposed as `MESSAGES`.
- `lib/api/contract/*` is framework-free, contains the whole request/response contract (`ApiRequest`, `BaseResponse`, every response data + static model), and imports nothing else from the app; it may be lifted into its own package later.
- No circular imports.

---

## 8. Naming

| Thing | Convention | Example |
| --- | --- | --- |
| Files | `kebab-case` | `login-form.tsx`, `use-login.ts`, `api.service.ts` |
| Components | `PascalCase`, named export | `LoginForm` |
| Hooks | `useCamelCase` | `useLogin` |
| API methods | camelCase verb, one per endpoint | `login`, `getMe`, `logout` |
| Constants | `UPPER_SNAKE_CASE` objects | `API_URLS`, `ROUTES` |
| Message groups / keys | camelCase; locale file named after the locale | `MESSAGES.auth.loginTitle`, `en` |
| Types / mappers | `PascalCase` interface, `toPascalCase` mapper | `AuthData`, `toAuthData` |
| Route folders | `kebab-case` | `forgot-password` |
| Default exports | only Next.js special files (`page`, `layout`, `error`, `not-found`) | |

Mirror the API vocabulary: `xxxData` = object, `xxxList` = array, no suffix = single value. Do not rename API fields. Imports use the `@/` alias.

---

## 9. Validation

One file: `src/lib/utils/validations.ts`.

- One exported function per form (`validateLogin`) returning `{ isValid, message, field }` for the **first** problem.
- Primitives (`isEmail`, `isPhone`, `isEmpty`) are reused by the form validators.
- Messages live in `MESSAGES.validation` (`src/messages/en.ts`).
- Components call the validator and render `message` under `field`. API errors come from `BaseResponse.message` (the backend returns one message, not a field map).

---

## 10. Styling

Full rules in [`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md). Semantic tokens only; dark mode is a token swap; variants via `cva`, merging via `cn()`; mobile-first; a new token is added for **both** themes in the same change. `npm run tokens:check` enforces it.

---

## 11. Standard states and errors

| Situation | Use |
| --- | --- |
| Loading | `isLoading` from the hook → `Spinner` / `Skeleton`, button `loading` prop |
| API failure | `response.status === false` → show `response.message` (`FormError` in forms, `ErrorState` for a section) |
| Empty list | `EmptyState` |
| Success feedback | `showSuccess` / `showToast` from `lib/utils/toast.ts` |
| Route crash | `error.tsx`; 404 → `not-found.tsx` |
| 503 maintenance | `SUB_ADMIN` → `/maintenance`; `SUPER_ADMIN` keeps working |

Branch on the HTTP status (`response.status` plus the HTTP status the call came back with), never on message text.

---

## 12. Verify and finish

```bash
npm run verify      # typecheck + lint + tokens:check + test
```

- [ ] Code is where §3 says; searched and reused existing pieces.
- [ ] Network only via the §5 flow; nothing hard-coded outside `constants.ts` / `lib/api/api-urls.ts` / `messages/en.ts`.
- [ ] Validation in `lib/utils/validations.ts`.
- [ ] Loading, error, empty and success states; both themes; mobile width.
- [ ] Tests for new hook / API method / validation logic.
- [ ] No unnecessary comments.
- [ ] Docs updated if a rule, route or endpoint mapping changed.
- [ ] `npm run verify` passes.

---

## 13. How to work a task (agent loop)

1. Restate the task, the page, and the minimum role that may see it.
2. Open the matching recipe in `docs/WORKFLOWS.md`; follow its file list literally.
3. Read the existing files and the backend `FEATURES.md` / OpenAPI entry for the endpoint.
4. Make the smallest change that satisfies the task.
5. Run `npm run verify`.
6. Report: files changed, what was reused, what was verified, and any out-of-scope improvement you noticed but did **not** make.

---

## 14. Don't

- Don't call `fetch`/`axios` outside `lib/api/client.ts`, or import `lib/api/api.service` in a component.
- Don't define constants, routes or keys outside `constants.ts`, endpoint paths outside `lib/api/api-urls.ts`, or UI copy outside `messages/en.ts`.
- Don't validate inline in a component.
- Don't put business logic in a `page.tsx` or `layout.tsx`.
- Don't store tokens in `localStorage` / `sessionStorage`.
- Don't add a library when one in §1 covers the need; ask first.
- Don't create folders outside §4, or move/rename/reformat existing files "while you are there".
- Don't make a row clickable with a stretched `after:absolute after:inset-0` link on a `<tr>` (mobile taps escape the row and every tap opens a detail page). Use the row `onClick` + `router.push` pattern in `vendor-table.tsx` / `product-table.tsx`.
- Don't add comments that restate the code.
- Don't commit or push unless asked.

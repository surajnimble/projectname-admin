# projectname-admin

Admin panel (Next.js) for the `projectname-api` marketplace backend. Staff only: `SUPER_ADMIN` and `SUB_ADMIN`.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS 4 · centralized design tokens (light + dark).

It talks to the **real API** at `https://projectname-api.onrender.com/api/v1`. There are no mocks in the app.

## Run it

Requires Node.js 20.9+ (`.nvmrc` pins 22).

```bash
unzip projectname-admin.zip
cd projectname-admin
npm install
npm run dev
```

Open <http://localhost:3000> → you land on `/login` → sign in → you arrive on the Overview (home) page.

`.env.local` is included and points at the live API. To use another backend, change `API_BASE_URL` there and restart `npm run dev` (for a production build, set it **before** `npm run build`: the `/api/v1` rewrite is fixed at build time).

> The backend runs on Render's free tier, so the first request after a quiet period can take up to a minute. The login form shows a hint after 6 seconds, and the API status indicator on the sign-in page wakes the server as soon as the page opens.

## Deploy to Cloudflare Workers

The app ships as one Cloudflare Worker plus static assets, built with `@opennextjs/cloudflare`. Config lives in `wrangler.jsonc` and `open-next.config.ts`.

`API_BASE_URL` and `NEXT_PUBLIC_API_PREFIX` are inlined during the build, so set them for the build that produces the Worker. Changing either needs a rebuild, not a restart.

From the CLI (Linux, macOS or WSL):

```bash
npx wrangler login
npm run preview   # build and run the Worker locally
npm run deploy    # build and deploy to Cloudflare
```

Put `API_BASE_URL` in `.env.production` (or the shell) before deploying if production uses a different API.

From the Cloudflare dashboard (Workers Builds), connect the repository and use:

- Build command: `npx opennextjs-cloudflare build`
- Deploy command: `npx wrangler deploy`
- Build variables: `API_BASE_URL`, `NEXT_PUBLIC_API_PREFIX` (plus `NODE_VERSION=22` if the build image ignores `.nvmrc`)

Local Worker preview reads `.dev.vars` (copy `.dev.vars.example`); Next.js `.env` files still apply. OpenNext's Windows support is not guaranteed, so use WSL or CI for the deploy build.

## Structure

Standard Next.js layout. Every API call follows one flow:

```
component ─▶ hook ─▶ apiService ─▶ apiClient ─▶ fetch
(login-form) (use-login) (api.service) (lib/api/client.ts)
```

```
src/
  app/            routes — (auth)/layout.tsx + login, (dashboard)/layout.tsx + page, error pages
  components/     ui · common · layout · auth · dashboard · vendor
  constants.ts    every non-copy constant: ROUTES, ROLES, keys, timings, regex, NAV_ITEMS
  hooks/          use-login, use-health, use-mounted
  lib/
    api/            client, api.service (the ApiService), api-urls (API_URLS), session, auth, device
      contract/     api-request, base-response, api-models (request/response contract)
    utils/          index (cn, format), validations, activity, datetime, toast
  messages/       en.ts UI copy · index.ts exports MESSAGES (one file per locale later)
  providers/      auth, theme, toast
  types/          api.ts (re-exports the API contract, parseResponse), auth.ts
  proxy.ts        Next.js 16 proxy (redirects signed-out visitors)
```

## What is in the box

| Area | What exists |
| --- | --- |
| Login | `/login` — email **or** phone + password, validation, server messages, "server waking up" hint, live API status |
| Home | `/` — signed-in staff details, roles, API status/latency, dashboard stats, recent activity, orders, payments, product performance, top selling and low stock widgets |
| Vendors | `/vendors` — vendor list with search, status filter and pagination; approve (optional commission + remark), reject, suspend and reactivate actions; `/vendors/[vendorId]` details page (shop, owner, performance, payout, KYC documents, products); KYC documents tab with verify and reject |
| Navigation | `(auth)` and `(dashboard)` route groups with their own `layout.tsx`, sidebar from `NAV_ITEMS`, mobile drawer, theme toggle, sign out |
| Auth | access token in memory, refresh cookie via the backend, single-flight silent refresh on `TOKEN_EXPIRED`, session restored on reload, staff-role check |
| Design system | tokens in `src/styles/tokens.css`, `ui/` primitives, `common/` components, `npm run tokens:check` |
| Tests | Vitest — apiService/apiClient (URL, body, headers, refresh), response parsing, validation, `useLogin`, `useHealth` |

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` / `npm start` | Production build / run |
| `npm run verify` | **The gate:** typecheck + lint + tokens:check + tests |
| `npm run typecheck` / `lint` / `test` | Individual checks |
| `npm run tokens:check` | Rejects hard-coded colours, palette utilities, arbitrary values |
| `npm run api:types` | Generates `src/types/schema.d.ts` from the backend's OpenAPI JSON (optional) |
| `npm run format` | Prettier |
| `npm run preview` / `deploy` | Build the Worker and preview it locally / deploy to Cloudflare |
| `npm run cf-typegen` | Regenerates `cloudflare-env.d.ts` from the bindings in `wrangler.jsonc` |

## How login works

1. `LoginForm` validates with `validateLogin` (`lib/utils/validations.ts`) and calls `useLogin().login(identifier, password)`.
2. The hook calls `apiService.login({ email | phone, password })` → `apiClient.post` → this app's `/api/v1/auth/login`, which Next.js rewrites to the backend (keeps the `SameSite=Strict` refresh cookie working, no CORS setup).
3. The response is parsed into `BaseResponse<AuthData>`; non-staff accounts are signed out with a clear message; `twoFactorRequired` is reported as unsupported.
4. `signIn` stores the token in memory, sets the non-secret `admin_session` hint cookie (for `src/proxy.ts`) and the form navigates to `/` (or `?next=`).
5. After a reload, `AuthProvider` runs `refreshToken` (cookie) → `getMe` to restore the session.

## Things to verify against your API

Built from the documented contract; not exercised against your live server from the build environment:

- **Response fields:** `toAuthData` (`types/auth.ts`) reads `accessToken`, `userData`, `rolesList` (result level or inside `userData`, or a single `role`). If your response differs, adjust the mapper.
- **Two-step verification:** not supported in this panel yet; accounts with it enabled see an explanatory message.
- **Cookies on `http://localhost`:** the backend marks the refresh cookie `Secure`; Chrome, Edge and Firefox accept it on localhost, Safari does not.

## Documentation

| Document | Purpose |
| --- | --- |
| [`AGENTS.md`](AGENTS.md) | **Start here.** Rules, "where does this code go?" table, the API flow, agent workflow |
| [`docs/WORKFLOWS.md`](docs/WORKFLOWS.md) | Recipes: add an API call, page, list page, validation, component, guard |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Folder structure, layers, layouts, roles, state, env |
| [`docs/API-INTEGRATION.md`](docs/API-INTEGRATION.md) | The flow, types, apiClient, apiService, hooks, tokens, errors, testing |
| [`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md) | Tokens, theming, component conventions |

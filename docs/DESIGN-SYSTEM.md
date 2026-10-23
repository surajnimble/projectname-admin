# Design System

Centralised design tokens with light and dark themes, consumed through Tailwind CSS. The goal: a colour, space, radius or shadow is decided **once**, in one file, and every screen inherits it — including dark mode.

## Contents

1. [Token architecture](#1-token-architecture)
2. [`tokens.css` template](#2-tokenscss-template)
3. [Tailwind mapping](#3-tailwind-mapping)
4. [Theme switching](#4-theme-switching)
5. [Using tokens in components](#5-using-tokens-in-components)
6. [Component API conventions](#6-component-api-conventions)
7. [Primitive and pattern inventory](#7-primitive-and-pattern-inventory)
8. [Layout, spacing, responsiveness](#8-layout-spacing-responsiveness)
9. [Accessibility](#9-accessibility)
10. [Adding or changing a token](#10-adding-or-changing-a-token)
11. [Enforcement](#11-enforcement)

---

## 1. Token architecture

Three layers; only the middle one is used by components.

| Layer | Example | Defined in | Used by |
| --- | --- | --- | --- |
| **Primitive** (raw scale) | `--palette-indigo-600`, `--palette-neutral-50` | `tokens.css` | only the semantic layer |
| **Semantic** (meaning) | `--surface`, `--fg-muted`, `--primary`, `--danger-bg` | `tokens.css` — values differ per theme | Tailwind theme → components |
| **Component** (optional) | `--button-radius`, `--card-padding` | `tokens.css` | only when a component needs an override knob |

Dark mode is nothing more than the semantic layer re-pointing to different primitives under `.dark`. Components never know which theme is active.

Naming: `--<role>` for backgrounds/surfaces, `--fg-<level>` for text, `--border-<level>`, `--<intent>` + `--<intent>-fg` (+ `-bg`, `-border` for soft variants). Intents: `primary`, `secondary`, `accent`, `success`, `warning`, `danger`, `info`.

---

## 2. `tokens.css` template

`src/styles/tokens.css` — the **only** file where raw colour values may appear.

```css
:root {
  /* ── Primitives ───────────────────────────── */
  --palette-neutral-0:   #ffffff;
  --palette-neutral-50:  #f8fafc;
  --palette-neutral-100: #f1f5f9;
  --palette-neutral-200: #e2e8f0;
  --palette-neutral-300: #cbd5e1;
  --palette-neutral-500: #64748b;
  --palette-neutral-700: #334155;
  --palette-neutral-800: #1e293b;
  --palette-neutral-900: #0f172a;
  --palette-neutral-950: #020617;

  --palette-brand-50:  #eef2ff;
  --palette-brand-500: #6366f1;
  --palette-brand-600: #4f46e5;
  --palette-brand-700: #4338ca;

  --palette-green-600: #16a34a;  --palette-green-100: #dcfce7;
  --palette-amber-600: #d97706;  --palette-amber-100: #fef3c7;
  --palette-red-600:   #dc2626;  --palette-red-100:   #fee2e2;
  --palette-blue-600:  #2563eb;  --palette-blue-100:  #dbeafe;

  /* ── Semantic: light (default) ────────────── */
  --background:       var(--palette-neutral-50);
  --surface:          var(--palette-neutral-0);
  --surface-muted:    var(--palette-neutral-100);
  --surface-raised:   var(--palette-neutral-0);
  --overlay:          rgb(15 23 42 / 0.5);

  --fg:               var(--palette-neutral-900);
  --fg-muted:         var(--palette-neutral-500);
  --fg-subtle:        var(--palette-neutral-300);
  --fg-inverse:       var(--palette-neutral-0);

  --border:           var(--palette-neutral-200);
  --border-strong:    var(--palette-neutral-300);
  --ring:             var(--palette-brand-500);

  --primary:          var(--palette-brand-600);
  --primary-hover:    var(--palette-brand-700);
  --primary-fg:       var(--palette-neutral-0);
  --primary-soft:     var(--palette-brand-50);

  --secondary:        var(--palette-neutral-100);
  --secondary-hover:  var(--palette-neutral-200);
  --secondary-fg:     var(--palette-neutral-900);

  --success:          var(--palette-green-600);  --success-bg: var(--palette-green-100);
  --warning:          var(--palette-amber-600);  --warning-bg: var(--palette-amber-100);
  --danger:           var(--palette-red-600);    --danger-bg:  var(--palette-red-100);
  --info:             var(--palette-blue-600);   --info-bg:    var(--palette-blue-100);

  /* ── Shape, depth, motion ─────────────────── */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-full: 9999px;

  --shadow-sm: 0 1px 2px rgb(15 23 42 / 0.06);
  --shadow-md: 0 4px 12px rgb(15 23 42 / 0.08);
  --shadow-lg: 0 12px 32px rgb(15 23 42 / 0.12);

  --duration-fast: 120ms;
  --duration-base: 200ms;
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);

  --z-dropdown: 40;
  --z-sticky: 50;
  --z-overlay: 60;
  --z-modal: 70;
  --z-toast: 80;
}

.dark {
  --background:       var(--palette-neutral-950);
  --surface:          var(--palette-neutral-900);
  --surface-muted:    var(--palette-neutral-800);
  --surface-raised:   var(--palette-neutral-800);
  --overlay:          rgb(0 0 0 / 0.65);

  --fg:               var(--palette-neutral-50);
  --fg-muted:         var(--palette-neutral-300);
  --fg-subtle:        var(--palette-neutral-500);
  --fg-inverse:       var(--palette-neutral-900);

  --border:           var(--palette-neutral-800);
  --border-strong:    var(--palette-neutral-700);
  --ring:             var(--palette-brand-500);

  --primary:          var(--palette-brand-500);
  --primary-hover:    var(--palette-brand-600);
  --primary-fg:       var(--palette-neutral-0);
  --primary-soft:     var(--palette-brand-700);

  --secondary:        var(--palette-neutral-800);
  --secondary-hover:  var(--palette-neutral-700);
  --secondary-fg:     var(--palette-neutral-50);

  --success-bg: rgb(22 163 74 / 0.18);
  --warning-bg: rgb(217 119 6 / 0.18);
  --danger-bg:  rgb(220 38 38 / 0.18);
  --info-bg:    rgb(37 99 235 / 0.18);

  --shadow-sm: 0 1px 2px rgb(0 0 0 / 0.4);
  --shadow-md: 0 4px 12px rgb(0 0 0 / 0.45);
  --shadow-lg: 0 12px 32px rgb(0 0 0 / 0.5);
}
```

The brand palette above is a starting point — replace the primitive values once the brand is decided; no component changes are needed.

---

## 3. Tailwind mapping

`src/styles/theme.css` exposes only **semantic** tokens as Tailwind utilities (Tailwind v4 `@theme inline`; on v3 the same mapping goes in `theme.extend.colors` as `var(--token)`).

```css
@import "tailwindcss";
@import "./tokens.css";
@import "./base.css";

@custom-variant dark (&:where(.dark, .dark *));

@theme inline {
  --color-background: var(--background);
  --color-surface: var(--surface);
  --color-surface-muted: var(--surface-muted);
  --color-surface-raised: var(--surface-raised);
  --color-overlay: var(--overlay);

  --color-fg: var(--fg);
  --color-fg-muted: var(--fg-muted);
  --color-fg-subtle: var(--fg-subtle);
  --color-fg-inverse: var(--fg-inverse);

  --color-border: var(--border);
  --color-border-strong: var(--border-strong);
  --color-ring: var(--ring);

  --color-primary: var(--primary);
  --color-primary-hover: var(--primary-hover);
  --color-primary-fg: var(--primary-fg);
  --color-primary-soft: var(--primary-soft);
  --color-secondary: var(--secondary);
  --color-secondary-hover: var(--secondary-hover);
  --color-secondary-fg: var(--secondary-fg);

  --color-success: var(--success);   --color-success-bg: var(--success-bg);
  --color-warning: var(--warning);   --color-warning-bg: var(--warning-bg);
  --color-danger:  var(--danger);    --color-danger-bg:  var(--danger-bg);
  --color-info:    var(--info);      --color-info-bg:    var(--info-bg);

  --radius-sm: var(--radius-sm);  --radius-md: var(--radius-md);
  --radius-lg: var(--radius-lg);  --radius-xl: var(--radius-xl);
  --shadow-sm: var(--shadow-sm);  --shadow-md: var(--shadow-md);  --shadow-lg: var(--shadow-lg);
}
```

Raw palette variables (`--palette-*`) are intentionally **not** mapped, so `bg-palette-…` cannot exist.

`src/styles/base.css` sets `body { background: var(--background); color: var(--fg); }`, a global `:focus-visible` ring (`outline: 2px solid var(--ring); outline-offset: 2px`), `color-scheme: light` / `dark` per theme, and typography defaults.

---

## 4. Theme switching

- `next-themes` `ThemeProvider` with `attribute="class"`, `defaultTheme="system"`, `enableSystem`, `disableTransitionOnChange`. The root `<html>` carries `suppressHydrationWarning`.
- `ThemeToggle` (light / dark / system) lives in `components/common` and is placed by the layouts.
- The choice is persisted by `next-themes`; nothing else stores theme state.
- Images/illustrations that must differ per theme use two assets switched with `dark:hidden` / `hidden dark:block` — the only permitted use of `dark:` in components (layout visibility, never colour).

---

## 5. Using tokens in components

```tsx
// right
<div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
  <h3 className="text-fg">Orders</h3>
  <p className="text-fg-muted">Last 30 days</p>
</div>

// wrong — each line breaks a rule
<div className="bg-white border-gray-200 dark:bg-slate-900" />   // palette + dark: pair
<div className="bg-[#fafafa] w-[137px]" />                        // arbitrary values
<div style={{ color: '#333' }} />                                  // inline literal
```

| Need | Token utility |
| --- | --- |
| Page background | `bg-background` |
| Card / panel | `bg-surface border border-border rounded-lg shadow-sm` |
| Secondary panel / table header | `bg-surface-muted` |
| Body text / secondary text / hint | `text-fg` / `text-fg-muted` / `text-fg-subtle` |
| Primary action | `bg-primary text-primary-fg hover:bg-primary-hover` |
| Neutral action | `bg-secondary text-secondary-fg hover:bg-secondary-hover` |
| Status chip | `bg-success-bg text-success` (same for warning/danger/info) |
| Destructive action | `bg-danger text-primary-fg` |
| Focus | inherited global ring; add `focus-visible:ring-2 ring-ring` only on custom controls |

Order statuses map to intents through one constant (`features/order/constants`): `PENDING → warning`, `CONFIRMED/SHIPPED/OUT_FOR_DELIVERY → info`, `DELIVERED → success`, `CANCELLED/RETURNED → danger`. `StatusBadge` takes an intent, not a colour.

---

## 6. Component API conventions

- Variants with `cva`; the class merger is `cn()` (`twMerge(clsx(...))`) from `lib/utils/index.ts`; every component accepts and merges `className`.
- Props: `variant`, `size`, `disabled`, `loading` (when relevant), `asChild` for polymorphism (Radix `Slot`). Pass through native element props with `React.ComponentProps<'button'>`.
- Accessible behaviour (focus trap, keyboard, ARIA) comes from Radix UI primitives wrapped in `components/ui`; do not hand-roll dialogs, menus, tabs or selects.
- Primitives are **presentational**: no API calls, no routing, no auth, no copy strings (labels arrive as props/children).
- Every interactive primitive implements: default, hover, `focus-visible`, active, disabled, and (if async) loading.
- Press/click feedback is global: `RippleProvider` (`src/providers/ripple-provider.tsx`) applies the shared ripple to every `button`, `a[href]`, ARIA widget role (`button`, `menuitem`, `option`, `tab`, `switch`, `radio`) and any `[data-ripple]` element. Mark non-semantic clickables such as clickable table rows with `data-ripple=""`; use `data-ripple="off"` for full-screen overlays such as the mobile-nav backdrop. The ripple and button hover tint use the theme `primary`; primary/danger buttons set `--ripple-color: var(--primary-fg)` so their ripple stays visible. A quick release accelerates to the click timing; holding keeps the slow press expansion. Ripples are cleared on route or query changes and as soon as their target leaves the DOM, is hidden, or is covered by a newly opened dialog. Timing lives in the `TIMING.ripple*` values, visuals in `theme.css`.
- Sizes use the shared scale `sm | md | lg` mapping to fixed heights/padding; do not invent per-component sizes.

```tsx
const button = cva(
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-fg hover:bg-primary-hover',
        secondary: 'bg-secondary text-secondary-fg hover:bg-secondary-hover',
        outline: 'border border-border bg-surface text-fg hover:bg-surface-muted',
        ghost: 'text-fg hover:bg-surface-muted',
        danger: 'bg-danger text-primary-fg hover:opacity-90',
      },
      size: { sm: 'h-8 px-3 text-sm', md: 'h-10 px-4 text-sm', lg: 'h-12 px-6 text-base' },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);
```

---

## 7. Primitive and pattern inventory

Add new ones only through the reuse procedure (AGENTS §6).

**`components/ui`:** present: Button, Input, Label, Card, Badge, Skeleton, Spinner. Add when a page needs them (via the reuse procedure): Textarea, Select, Checkbox, Switch, Tabs, Tooltip, Popover, Dialog, Sheet, DropdownMenu, Table, Breadcrumb, Avatar.

**`components/common`:** present: FormField (label + control + hint + error), FormError, PasswordInput, PageHeader, EmptyState, ErrorState, ThemeToggle. Add when needed: SearchInput, DataTable, Pagination, FilterBar, ConfirmDialog, StatCard, StatusBadge, PriceText, DateText, FileDropzone, skeleton variants.

---

## 8. Layout, spacing, responsiveness

- Mobile-first: write the base style for the smallest screen, add `sm: md: lg: xl:` upward. Test at 360 px, 768 px, 1280 px.
- Spacing uses the Tailwind scale (multiples of 4 px): `p-4`, `gap-6`. Page gutters and section rhythm are set once in the shell, not per page.
- Layout: the `(dashboard)/layout.tsx` is a fixed sidebar (collapsible to a drawer below `lg`) + topbar + a scrolling content area; content uses full width with page gutters set once in the shell; forms and detail views cap their width (`max-w-3xl`) for readability.
- Tables on mobile collapse to stacked cards (DataTable `responsive` mode) or scroll inside their own `overflow-x-auto` container — the page body never scrolls sideways.
- Clickable table rows keep a real `Link` on the name (keyboard path) and navigate with `onClick` + `router.push` on the row; never use a stretched `after:absolute after:inset-0` link on a `<tr>` — mobile browsers ignore `position: relative` on table rows and the invisible link captures taps for the whole page.
- Use `next/image` with explicit sizes for thumbnails and logos; reserve aspect ratio to avoid layout shift.
- Z-index uses the `--z-*` tokens only.

---

## 9. Accessibility

- Semantic elements first (`button`, `a`, `nav`, `main`, `table`, headings in order).
- Every input has a visible label (`FormField`); errors are associated via `aria-describedby` and announced.
- Colour is never the only signal (status badges also carry text).
- Contrast: token pairs (`fg`/`surface`, `primary-fg`/`primary`, intent fg/bg) must meet WCAG AA in **both** themes — verify when changing primitives.
- Keyboard: all interactive elements reachable and operable; dialogs trap and restore focus; focus ring never removed.
- Respect `prefers-reduced-motion` (transitions off via a global rule).

---

## 10. Adding or changing a token

1. Need a new meaning (e.g. `--surface-sunken`)? Check the existing semantic tokens first — most needs are covered.
2. Add the primitive (if a new raw value is required) and the semantic token in `tokens.css` for **both** `:root` and `.dark`.
3. Expose it in `theme.css` (`--color-…`).
4. Use it in the component; add it to the table in §5.
5. Verify both themes visually and the contrast pair.

Never add a token for a single component's one-off look; use a component-level variable or choose an existing token.

---

## 11. Enforcement

`npm run tokens:check` (`scripts/tokens-check.ts`) fails the build when, outside `src/styles/`, it finds:

- hex / `rgb()` / `hsl()` / `oklch()` colour literals;
- Tailwind palette colour utilities (`(bg|text|border|ring|fill|stroke|from|to|via)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black)(-\d+)?`);
- arbitrary values for colour, spacing, radius or font size (`-\[\d`, `-\[#`);
- `dark:` combined with a colour utility;
- inline `style={{ color/background/border… }}`.

It is part of `npm run verify`. A genuine exception (for example a third-party embed) is whitelisted by file in the script with a comment explaining why — never by disabling the check.

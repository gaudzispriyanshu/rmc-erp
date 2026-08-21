# RMC ERP — Frontend

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · TanStack Query v5.

## Run it

```bash
cp .env.example .env.local   # then point NEXT_PUBLIC_API_URL at the backend
npm run dev                  # http://localhost:3000 -> redirects to /login
```

| script | what it does |
| --- | --- |
| `npm run dev` | dev server (Turbopack) |
| `npm run build` | production build + typecheck |
| `npm run lint` | eslint (next + typescript + tanstack query rules) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run format` | prettier, incl. class sorting |

Verified: `build` and `lint` both pass, all 34 routes render, auth guard redirects
correctly in both directions.

## Layout

```
frontend/
├── public/                     icons/ images/ fonts/
├── tests/                      e2e/ + setup/  (empty — pick a runner later)
├── next.config.ts              typedRoutes on, index-route redirects
├── tailwind.config.ts          content globs + plugins ONLY (see note below)
├── eslint.config.mjs           flat config
└── src/
    ├── proxy.ts                edge auth guard (Next 16 renamed middleware -> proxy)
    ├── app/                    folder-based routing ONLY — thin pages
    │   ├── layout.tsx          html/body, font, AppProviders
    │   ├── error.tsx  loading.tsx  not-found.tsx
    │   ├── (auth)/             login, register, forgot-password  + centred shell
    │   ├── (app)/              sidebar + topbar shell
    │   │   ├── dashboard/
    │   │   ├── orders/ new/ [orderId]/ [orderId]/edit/
    │   │   ├── trips/ dispatch/ invoices/          <- the spine
    │   │   ├── inventory/items/ inventory/movements/
    │   │   ├── customers/ vehicles/ drivers/ mix-designs/   <- master data
    │   │   ├── quality/ reports/
    │   │   └── settings/profile|users|roles/
    │   └── api/health/         liveness probe
    │
    ├── components/             GLOBAL reusable components (domain-agnostic)
    │   ├── ui/                 button, badge + StatusBadge, input
    │   ├── layout/             sidebar, topbar, page-header
    │   ├── form/               form-field
    │   ├── data/               (empty — DataTable, toolbar, KpiCard go here)
    │   ├── feedback/           empty-state
    │   ├── providers/          app-providers, query-provider
    │   └── icons/
    │
    ├── features/               one folder per domain, each: api/ hooks/
    │   │                       components/ schemas/ types/
    │   └── auth dashboard orders trips dispatch invoices inventory
    │       customers drivers vehicles mix-designs quality reports
    │
    ├── lib/
    │   ├── api/  client.ts     axios + JWT interceptor + 401 bounce + http helpers
    │   │         errors.ts     ApiError, mirrors the backend errorHandler payload
    │   │         endpoints.ts  every backend path, one map
    │   ├── query/ queryClient.ts (defaults, no-retry on 4xx) + queryKeys.ts
    │   ├── auth/ constants.ts token.ts rbac.ts
    │   ├── utils/ cn.ts
    │   └── format/ index.ts    INR, m³, dates
    │
    ├── config/ env.ts (zod-validated) · site.ts · nav.ts
    ├── hooks/  store/  types/  test-utils/     (scaffolded, empty)
    └── styles/
        ├── tokens.css          variables only
        └── globals.css         every class in the app
```

## Rules of the house

1. **`app/` is routing, not logic.** A page composes a feature component; that's all.
2. **`components/` is domain-blind.** If it says "order" or "challan", it belongs in
   `features/<module>/components/`.
3. **Server state = TanStack Query. Client state = Zustand.** Never copy server data
   into a store.
4. **Query keys only from `lib/query/queryKeys.ts`.** No inline arrays.
5. **URLs only from `lib/api/endpoints.ts`.**
6. **Styling: no per-component CSS, no `style={{}}`, no utility soup in JSX.**
7. Types flow one way: backend Zod schema -> `features/*/schemas` -> inferred TS.

## Styling

- **`tokens.css`** — variables only. Primitives (brand/ink ramps, radii, shadows,
  layout dimensions, z-scale) live in `@theme` so Tailwind generates utilities from
  them. Semantic roles (`--color-surface`, `--color-content-muted`, `--color-danger`…)
  map to `--role-*` vars declared once for `:root` and once for `.dark`. That's the
  only place light and dark differ.
- **`globals.css`** — imports Tailwind, imports the tokens, then declares every class
  in `@layer base` and `@layer components`: `.app-shell`, `.sidebar-link`, `.card`,
  `.btn` + variants, `.input`, `.table`, `.badge`, `.modal`, `.menu`, `.tabs`,
  `.empty-state`, `.skeleton`, and so on. Components reference these names; `cn()` is
  for toggling between them, not for assembling styles.
- **Adding a colour or size:** token in `tokens.css` first, then use it in
  `globals.css`. Never a raw hex in a class.
- **Dark mode:** `next-themes` puts `.dark` on `<html>`; the `@custom-variant dark`
  in globals.css makes `dark:` work off that class.

One honest flag, unchanged from the first pass: a single global stylesheet is not the
mainstream Tailwind idiom, and it grows into its own mini-framework. It's already at
~510 lines. When it gets uncomfortable, split into `styles/base.css`,
`styles/components.css`, `styles/utilities.css` and `@import` them from `globals.css` —
the rule ("classes live in styles/, not in components") survives the split intact.

**Why `tailwind.config.ts` is nearly empty:** Tailwind v4 is CSS-first, so the theme
belongs in `@theme`. The config is loaded via `@config` from globals.css and holds only
content globs and plugins. Do not put colours or spacing there — two sources of truth
is the failure mode.

## What's wired vs. scaffolded

**Working:** app shell (sidebar with active-route highlighting, topbar with theme
toggle + sign out), auth shell, edge route guard, providers (Query + devtools, theme,
nuqs, sonner), axios client with JWT/401/timeout handling and an
`Idempotency-Key` helper matching the backend's middleware, error normalisation, env
validation, formatters, status→tone mapping.

**Placeholders:** every route renders `PageHeader` + an "not built yet" empty state, and
the login form is markup with no submit handler. All 13 `features/` folders are empty.
Nothing calls the backend yet.

## Notable decisions

- **JWT in a readable cookie**, not localStorage, so `proxy.ts` can gate routes before
  any JS runs. A readable cookie is still XSS-reachable — the hardened version is an
  httpOnly cookie set by the backend or by a Next route handler proxying login. Worth
  doing before this faces the internet.
- **Statuses stay free-form strings** (matching the DB). `src/types/status.ts` maps a
  status to a badge *tone*, so no lookup tables and no domain names in CSS.
- **Index routes redirect in `next.config.ts`**, not via `redirect()` in a page — a
  statically prerendered `redirect()` ships an HTML shell that redirects client-side and
  returns 200, which breaks anything reading status codes.
- **`TOKEN_KEY` lives in `lib/auth/constants.ts`**, not in the `"use client"` token
  module. Importing a client module from `proxy.ts` yields a client-reference proxy
  instead of the string, and the cookie check silently never matches.

## Dependencies

Runtime: `next` `react` `react-dom` · `@tanstack/react-query` `@tanstack/react-query-devtools`
`@tanstack/react-table` · `axios` · `zod` (same major as the backend, so schemas port
over) · `react-hook-form` `@hookform/resolvers` · `zustand` · `nuqs` (filters in the URL)
· `clsx` `tailwind-merge` · `lucide-react` · `sonner` · `date-fns` · `recharts` ·
`next-themes`.

Dev: `typescript` · `tailwindcss` `@tailwindcss/postcss` `postcss` · `eslint`
`eslint-config-next` `@tanstack/eslint-plugin-query` · `prettier`
`prettier-plugin-tailwindcss`.

**Not installed yet, add when you need it:** a test runner (`vitest` +
`@testing-library/react`, `@playwright/test`, `msw`), `husky` + `lint-staged`, Radix
primitives or shadcn/ui for accessible dialog/select internals.

**Deliberately skipped:** GraphQL, i18n, Redux, and any component library that owns its
own styling — it would fight the tokens/globals rule above.

# RMC ERP — Ready-Mix Concrete Enterprise Resource Planning

**Run your entire Ready-Mix Concrete operation — orders, production, dispatch, quality and inventory — on one cloud platform.**

RMC ERP manages the full lifecycle of concrete dispatch: from order capture and mix-design recipes, through production consumption and vehicle dispatch, to quality testing and live operational dashboards. It is built to compete with established products in the market, and differentiates on two things competitors don't offer out of the box: **fully configurable status workflows** and a **granular role-based permission matrix**.

> **Version 1.0.0** · © 2026 **SMS Engineering**. All rights reserved.

---

## Table of Contents

- [For Buyers — What You Get](#for-buyers--what-you-get)
  - [Why RMC ERP](#why-rmc-erp)
  - [What Makes Us Different](#what-makes-us-different)
  - [Feature Overview](#feature-overview)
  - [Screenshots](#screenshots)
- [For Engineers — How It Works](#for-engineers--how-it-works)
  - [Architecture](#architecture)
  - [The Workflow Engine](#the-workflow-engine-core-concept)
  - [Data Model](#data-model)
  - [API Surface](#api-surface)
  - [Project Structure](#project-structure)
  - [Getting Started](#getting-started)
  - [Database Migrations](#database-migrations)
  - [Testing & QA](#testing--qa)
- [Roadmap](#roadmap)
- [License](#license)

---

# For Buyers — What You Get

## Why RMC ERP

Ready-Mix Concrete operations lose money to the same recurring problems: manual dispatch errors, poor vehicle visibility, untracked material wastage, production planning gaps, and slow billing. RMC ERP brings orders, production, dispatch, fleet, inventory and quality onto **one centralized platform** so nothing falls through the cracks — with real-time visibility for every role, from the plant manager to the dispatch desk to management.

**The promise: smarter processes, fewer errors, higher profitability.**

## What Makes Us Different

| Differentiator | What it means for you |
|---|---|
| 🔀 **Configurable status workflows** | Every order and trip moves through a status lifecycle *you* define — add states, set colors, and control exactly which status can move to which. No developer needed; it's edited in the Administration screen. Competing products ship fixed, unchangeable statuses. |
| 🔒 **Role-based permission matrix** | Decide precisely which roles can view, create, update or delete in each module, from a visual matrix. Give your dispatch team dispatch, your finance team billing — nothing more. |
| 🧾 **Auditable by design** | Trip status changes are recorded as an append-only history. Inventory moves through a stock ledger, never silent edits. You can always answer "who changed what, when." |

## Feature Overview

Legend: 🟢 **Live in v1** · 🟡 **Planned** · ⚪ **Future**

### Sales & Orders
- 🟢 Customer directory (master data)
- 🟢 Order capture — customer, mix design, quantity, delivery address & date
- 🟢 Configurable order status workflow (pending → confirmed → in-production → dispatched → delivered → closed)
- 🟡 Quotations & pricing · 🟡 Delivery scheduling

### Production
- 🟢 Mix designs (concrete grade recipes) with approval status
- 🟢 Bill of materials (per-m³ material requirements)
- 🟡 Batch processing · 🟡 Production planning & yield · ⚪ Multi-plant & shift management

### Dispatch & Logistics
- 🟢 Trip assignment (vehicle + driver, ETA)
- 🟢 Trip status workflow with audit trail
- 🟢 Auto-numbered delivery challans
- 🟢 Dispatch board (trips grouped by status)
- 🟡 Route management & optimization · ⚪ GPS / live tracking

### Fleet
- 🟢 Vehicle master · 🟢 Driver master (licence, salary, per-trip rate)
- 🟡 Fuel management · ⚪ Maintenance & insurance

### Inventory & Procurement
- 🟢 Inventory items with min-stock levels
- 🟢 Stock movement ledger (append-only)
- 🟢 Automatic material deduction from the mix BOM on production
- 🟢 Low-stock alerts on the dashboard
- 🟡 Stock transfer · 🟡 Procurement (vendor, PO, GRN, supplier payments)

### Quality Control
- 🟢 Mix-design approval · 🟢 Cube tests · 🟢 Slump tests · 🟢 Non-conformance tracking
- 🟡 Lab & quality-audit reports

### Administration & Security
- 🟢 RBAC roles & permission matrix
- 🟢 Configurable workflow engine
- 🟡 User management UI · 🟡 System settings

### Analytics & Reporting
- 🟢 Live operational dashboard
- 🟡 Role-based dashboards · 🟡 MIS reports · 🟡 **Excel (XLSX) import / export** · ⚪ Executive analytics

### Not yet covered
Weighbridge, Finance/GST invoicing & daybook are on the roadmap (see [Roadmap](#roadmap)).

## Screenshots

![Dashboard](docs/images/dashboard.png)
![Orders Page](docs/images/orders.png)
![Security Roles](docs/images/security-roles.png)

> 📄 A full **Project Scope & Release Plan** PDF (all modules, v1 cut, and roadmap) is available at [`RMC_ERP_Project_Scope.pdf`](RMC_ERP_Project_Scope.pdf).

---

# For Engineers — How It Works

## Architecture

Full-stack TypeScript monorepo, PostgreSQL on Supabase.

| Layer | Technology |
|---|---|
| **Frontend** | React 19 + TypeScript, Vite, React Router 7, Axios. Custom CSS design system (no UI library). |
| **Backend** | Node.js + Express 5, TypeScript. Raw parameterized SQL via `node-postgres` (no ORM). |
| **Database** | PostgreSQL (Supabase, cloud-hosted). |
| **Auth** | JWT authentication + RBAC authorization middleware (`authenticate`, `authorize('slug')`). |
| **Migrations** | Versioned SQL files under `supabase/migrations/`, applied via the Supabase CLI. |
| **Testing** | Backend unit tests with Jest; integration/system QA via Google Jules. |

**Request flow:** `route` (auth + permission guard) → `controller` (validate, map HTTP) → `service` (SQL, business logic) → PostgreSQL.

## The Workflow Engine (core concept)

Instead of a hardcoded `status` string, statuses are a **configurable state machine**:

- **`workflows`** — a named machine for an entity type (`order`, `trip`, …).
- **`workflow_states`** — the nodes: name, slug, color, sort order, `is_initial`, `is_terminal`.
- **`workflow_transitions`** — the edges: `from_state_id → to_state_id`. A `NULL` from-state marks a valid entry point (record creation).

Orders and trips carry a `workflow_state_id` FK. When a status change is requested, `workflowService.isTransitionAllowed()` checks the transitions table — **illegal jumps are rejected with HTTP 400**. The transition lookup uses `IS NOT DISTINCT FROM` so a `NULL` from-state (entry point) and normal transitions share one query. States and transitions are edited from **Administration → Workflows** (a visual transition matrix), and trip status changes write an audit row to `trip_updates`.

## Data Model

Key tables (see `supabase/migrations/`):

- **Auth/RBAC:** `users` (→ `role_id`), `roles`, `permissions` (`action_slug` like `orders:read`), `role_permissions`.
- **Workflow:** `workflows`, `workflow_states`, `workflow_transitions`.
- **Core:** `customers`, `orders` (→ `workflow_state_id`), `trips` (→ `workflow_state_id`), `trip_updates`, `delivery_challans`.
- **Production/inventory:** `mix_designs`, `mix_requirements` (BOM), `inventory_items`, `stock_movements`.
- **Quality:** `cube_tests`, `slump_tests`, `non_conformance`.
- **Fleet:** `vehicles`, `drivers`.

## API Surface

All routes are under `/api`, JWT-protected, and guarded by a permission slug.

| Resource | Routes |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/verify` |
| Orders | `GET /orders`, `GET /orders/:id`, `POST /orders`, `PUT /orders/:id`, `PATCH /orders/:id/status`, `DELETE /orders/:id`, `GET /orders/stats`, `GET /orders/recent`, `GET /orders/mix-designs` |
| Trips | `GET /trips`, `GET /trips/:id`, `GET /trips/:id/updates`, `POST /trips`, `PUT /trips/:id`, `PATCH /trips/:id/status`, `DELETE /trips/:id` |
| Workflows | `GET /workflows`, `GET /workflows/:id`, `POST /workflows`, `PUT /workflows/:id`, `POST /workflows/:id/states`, `PUT /workflows/states/:stateId`, `DELETE /workflows/states/:stateId`, `PUT /workflows/:id/transitions` |
| Dispatch | `GET /dispatch/board`, `GET /dispatch/challans`, `GET /dispatch/challans/:id`, `POST /dispatch/challans` |
| Inventory | `GET /inventory`, CRUD, `GET /inventory/low-stock`, `GET/POST /inventory/movements`, `POST /inventory/consume/:orderId` |
| Quality | `/quality/cube-tests`, `/quality/slump-tests`, `/quality/non-conformance` |
| Masters | `/customers`, `/drivers`, `/vehicles`, `/mix-designs` (+ `/:id/requirements`) |
| Roles | `/roles`, `/roles/matrix`, `/roles/permissions`, `PUT /roles/:id/permissions` |

## Project Structure

```text
rmc-erp/
├── backend/                 # Node.js / Express API
│   └── src/
│       ├── controllers/     # HTTP handlers (validate, map status codes)
│       ├── services/        # SQL + business logic (workflow, inventory, …)
│       ├── routes/          # Route definitions + auth/permission guards
│       ├── middleware/       # authenticate + authorize(slug)
│       └── services/__tests__/  # Jest unit tests
├── frontend/                # React / Vite app
│   └── src/
│       ├── components/common/   # DataTable, CrudModule, WorkflowStatus (reusable)
│       ├── components/layout/   # Sidebar, TopBar, Layout
│       ├── context/             # AuthContext (JWT, API_URL)
│       └── pages/               # dashboard, orders, trips, dispatch, quality,
│                                #   masters/*, system/administartion/*
├── supabase/
│   ├── migrations/          # Versioned SQL schema migrations
│   └── seed.sql             # Local dev seed (permissions, admin user, demo data)
└── RMC_ERP_Project_Scope.pdf
```

## Getting Started

### Prerequisites
- Node.js v18+
- A Supabase project (cloud) **or** the Supabase CLI with local Docker
- Supabase CLI (`brew install supabase/tap/supabase`)

### 1. Backend
```bash
cd backend
npm install
# create .env:
#   DATABASE_URL=postgresql://<user>:<pass>@<host>:5432/postgres
#   JWT_SECRET=<a-long-random-string>
#   PORT=5001
npm run dev        # starts on http://localhost:5001
npm test           # run unit tests
```

### 2. Frontend
```bash
cd frontend
npm install
# create .env:
#   VITE_API_URL=http://localhost:5001/api
npm run dev        # starts on http://localhost:5173
npm run build      # production build
```

### 3. Log in
On a **local** database, the seed creates an admin: `admin@rmc.local` / `admin123`.
On your **cloud** database, use your existing admin account.

## Database Migrations

Schema lives in `supabase/migrations/` as timestamped SQL files — **the single source of truth**. Never hand-edit schema in the dashboard (it causes drift); change a migration and re-apply.

**Cloud database (linked project):**
```bash
supabase db push --dry-run --db-url "postgresql://...:5432/postgres"   # preview
supabase db push          --db-url "postgresql://...:5432/postgres"   # apply
```
> Use the **session pooler** connection string (port `5432`), not the transaction pooler (`6543`). `seed.sql` does **not** run on cloud — permission slugs ship as a migration instead.

**Local database (Docker):**
```bash
supabase db reset   # rebuilds from migrations, then runs seed.sql
```

Migrations are written **defensively** (`ADD COLUMN IF NOT EXISTS`, existence-guarded backfills, `ON CONFLICT DO NOTHING`) so they run safely against a fresh or an already-populated database.

## Testing & QA

- **Unit tests (in-house):** `cd backend && npm test` — covers workflow transition enforcement, transactional rollback, and inventory auto-deduct math. Strict TypeScript typechecking on both tiers.
- **Integration & system QA:** handled by **Google Jules** across end-to-end flows.

---

## Roadmap

Candidate increments beyond v1 (final ordering TBD by product):

| Increment | Theme | Contents |
|---|---|---|
| **A** | Billing & cash flow | GST invoicing from delivered orders, receivables & collection tracking |
| **B** | Procurement & stock depth | Vendor master, purchase orders, GRN, supplier payments, stock transfer |
| **C** | Fleet & fuel | Fuel/mileage tracking, maintenance schedules, insurance/document expiry |
| **D** | Insight & data | Role-based dashboards, MIS reports, **Excel (XLSX) import/export** |
| **E** | Plant operations | Batch processing, production planning & yield, weighbridge, multi-plant & shifts |

---

## License

© 2026 **SMS Engineering**. All rights reserved.

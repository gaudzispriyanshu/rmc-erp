# RMC ERP — Ready-Mix Concrete Enterprise Resource Planning

**Run your entire Ready-Mix Concrete operation — orders, production, dispatch, quality, and inventory — on one platform.**

RMC ERP manages the full lifecycle of concrete dispatch: from customer order capture and mix-design recipes, through production consumption and transit mixer dispatch, to quality testing and live operational dashboards.

> **Version 1.2.0** · © 2026 **SMS Engineering**. All rights reserved.

---

## What Makes Us Different

| Differentiator | Business Value |
|---|---|
| 🔀 **Configurable Status Workflows** | Custom status lifestages for orders and trips. Add states, customize colors, and define transition paths dynamically via Administration screens. |
| 🔒 **Role-Based Permission Matrix** | Fine-grained access control. Granular visual matrix mapping roles directly to individual module action permissions. |
| 🧾 **Auditable Ledger Architecture** | Trip status changes record append-only audit histories. Inventory movements follow an append-only stock ledger for complete material traceability. |

---

## Feature Overview

Legend: 🟢 **Live in v1** · 🟡 **Planned** · ⚪ **Future**

- 🟢 **Sales & Orders**: Master customer directory, order capture, mix design assignment, configurable workflow transitions.
- 🟢 **Production & BOM**: Mix design recipes, Bill of Materials (BOM) per m³, automatic material deduction upon production.
- 🟢 **Dispatch & Logistics**: Transit mixer trip assignment, driver/vehicle allocation, auto-numbered delivery challans, live dispatch board.
- 🟢 **Fleet Management**: Driver master data (salary, per-trip rate), transit mixer vehicle tracking.
- 🟢 **Inventory & Procurement**: Material stock management, minimum safety alerts, append-only stock movement ledger.
- 🟢 **Quality Control**: Slump testing, 7-day/28-day cube strength testing, non-conformance tracking.
- 🟢 **Administration & Security**: Visual RBAC permission matrix, configurable workflow state machine editor.

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19 + TypeScript 5, Vite, React Router 7, Axios, Vanilla CSS design system. |
| **Backend** | Node.js + Express 5, TypeScript, Zod validation, JWT authentication, Winston dual logger. |
| **Database** | PostgreSQL 14+, `node-postgres` (`pg` Pool), Parameterized SQL, Versioned SQL migrations. |

---

## Developer Guides & Documentation

Detailed technical documentation, architectural standards, request pipelines, and setup procedures are split into dedicated guides:

- 📘 [**Frontend Developer Guide**](developers-guide/FRONTEND_GUIDE.md): Component structure (`DataTable`, `CrudModule`), `AuthContext`, design system tokens, and Vite build configuration.
- 📙 [**Backend Developer Guide**](developers-guide/BACKEND_GUIDE.md): 4-layer architecture, Zod validation, Idempotency engine, RBAC middleware, error handling, and API reference table.
- 📗 [**Database Developer Guide**](developers-guide/DATABASE_GUIDE.md): Schema relationships, migration workflows (`npm run db:migrate`), seeding (`npm run db:seed`), reset workflows (`npm run db:reset`), and default admin login.
- 📕 [**Deployment & Versioning Guide**](developers-guide/DEPLOYMENT_AND_VERSIONING_GUIDE.md): SemVer strategy, single-command versioning (`npm run version:set`), GitHub tag release workflow, and production build/deployment guidelines.

---

## Quick Start & Project Versioning

### 1. Database Setup
```bash
createdb rmc_erp
```

### 2. Backend Setup & Database Migrations
```bash
cd backend
npm install
# Configure backend/.env (DATABASE_URL, JWT_SECRET, PORT)
npm run db:migrate    # Run schema migrations
npm run db:seed       # Seed initial admin user & master data
npm run dev           # Start backend server on http://localhost:5001
```

### 3. Frontend Setup
```bash
cd frontend
npm install
# Configure frontend/.env (VITE_API_URL)
npm run dev           # Start frontend server on http://localhost:5173
```

### 4. Single-Command Project Versioning
To update the project version across `package.json`, `backend/package.json`, `frontend/package.json`, and `README.md` simultaneously:
```bash
npm run version:set 1.2.0
```

---

## Default Administrator Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@rmc.local` | `admin123` |

---

## License

© 2026 **SMS Engineering**. All rights reserved.

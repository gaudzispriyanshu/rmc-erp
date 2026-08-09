# Database Developer Guide — RMC ERP

Welcome to the Database Developer Guide for **RMC ERP**. This document explains the PostgreSQL data model, connection pooling, migration rules, seeding procedures, and database execution commands.

---

## 1. Technical Overview

- **Database Engine**: PostgreSQL (v14+)
- **Connection Driver**: `node-postgres` (`pg`) with pooled connections (`backend/src/config/db.ts`)
- **Schema Directory**: `database/migrations/` (Versioned timestamped SQL files)
- **Seeding Directory**: `database/seeding/` (`01_initial_seed.sql`)

---

## 2. Core Data Model & Schema Relationships

```text
               ┌───────────┐         ┌────────────────────┐
               │   roles   │─────────│  role_permissions  │
               └─────┬─────┘         └─────────┬──────────┘
                     │                         │
                     ▼                         ▼
               ┌───────────┐         ┌────────────────────┐
               │   users   │         │    permissions     │
               └───────────┘         └────────────────────┘

 ┌───────────────┐     ┌───────────────┐     ┌─────────────────────┐
 │   customers   │────►│    orders     │────►│  delivery_challans  │
 └───────────────┘     └───────┬───────┘     └─────────────────────┘
                               │
                               ▼
 ┌───────────────┐     ┌───────────────┐     ┌─────────────────────┐
 │   vehicles    │────►│     trips     │────►│    trip_updates     │
 └───────────────┘     └───────┬───────┘     └─────────────────────┘
                               │
 ┌───────────────┐             │             ┌─────────────────────┐
 │    drivers    │─────────────┴────────────►│  idempotency_keys   │
 └───────────────┘                           └─────────────────────┘

 ┌─────────────────────┐       ┌──────────────────────┐
 │     workflows       │──────►│   workflow_states    │
 └─────────────────────┘       └──────────┬───────────┘
                                          │
                                          ▼
                               ┌──────────────────────┐
                               │ workflow_transitions │
                               └──────────────────────┘

 ┌─────────────────────┐       ┌──────────────────────┐
 │   inventory_items   │──────►│   stock_movements    │
 └─────────────────────┘       └──────────────────────┘
```

### Table Categories

1. **Security & RBAC**:
   - `roles`: Role definitions (Admin, Dispatch, Plant Manager, Finance).
   - `permissions`: Granular action slugs (`orders:read`, `trips:write`, `inventory:update`).
   - `role_permissions`: Join table linking roles to allowed permissions.
   - `users`: User profiles containing password hash (`bcrypt`), email, and assigned `role_id`.

2. **Workflows Engine (Configurable State Machine)**:
   - `workflows`: Entities using configurable statuses (`order`, `trip`).
   - `workflow_states`: States per entity (name, slug, color badge, sort order, `is_initial`, `is_terminal`).
   - `workflow_transitions`: Valid status transitions (`from_state_id → to_state_id`).

3. **Core Logistics & Orders**:
   - `customers`: Customer master data (name, email, phone, GST number).
   - `orders`: Order entries referencing `customer_id`, `mix_design_id`, delivery date, and `workflow_state_id`.
   - `trips`: Transit mixer dispatches referencing `order_id`, `vehicle_id`, `driver_id`, and `workflow_state_id`.
   - `trip_updates`: Append-only audit history of trip status changes.
   - `delivery_challans`: Auto-numbered delivery receipts.
   - `idempotency_keys`: Stores request keys and responses to guarantee idempotent creation operations.

4. **Production, BOM & Inventory**:
   - `mix_designs`: Recipe master data (concrete grade recipes).
   - `mix_requirements`: Bill of Materials (BOM) specifying material quantities required per m³.
   - `inventory_items`: Raw materials (cement, aggregates, admixtures) with current stock and minimum safety levels.
   - `stock_movements`: Append-only stock ledger recording stock adjustments and automatic BOM deductions.

5. **Quality Control & Fleet**:
   - `cube_tests` & `slump_tests`: Quality test records for concrete batches.
   - `non_conformance`: Deficiency tracking and corrective actions.
   - `vehicles` & `drivers`: Fleet and driver master data.

---

## 3. Database Execution Commands

All database management scripts are executed from the `backend/` directory using `npm run`:

### 1. Database Creation
Ensure PostgreSQL is running locally, then create the database:
```bash
createdb rmc_erp
```
*(Or in psql: `CREATE DATABASE rmc_erp;`)*

### 2. Running Schema Migrations (`npm run db:migrate`)
```bash
cd backend
npm run db:migrate
```
*Executes all versioned `.sql` files in `database/migrations/` in sorted chronological order against PostgreSQL.*

### 3. Running Database Seeding (`npm run db:seed`)
```bash
cd backend
npm run db:seed
```
*Executes `database/seeding/01_initial_seed.sql` to populate default roles, permissions, admin user, and demo master data.*

### 4. Full Database Reset (`npm run db:reset`)
```bash
cd backend
npm run db:reset
```
*Completely drops `rmc_erp`, re-creates the database, applies all schema migrations, and seeds initial data.*

---

## 4. Default Seed Credentials

After running `npm run db:seed` or `npm run db:reset`, log in using:

- **Email**: `admin@rmc.local`
- **Password**: `admin123`
- **Role**: `Admin` (Has full access across all permissions and modules)

---

## 5. Migration Writing Guidelines for Developers

### Rule 1: Single Source of Truth
Never modify the database structure directly using GUI tools (DBeaver, pgAdmin) or manual SQL queries in psql without a migration. All schema changes MUST be committed as timestamped `.sql` files in `database/migrations/`.

### Rule 2: Timestamp Naming Convention
Name new migration files using the format:
```text
database/migrations/YYYYMMDDHHMMSS_short_description.sql
```
*Example: `20260810100000_add_customer_credit_limit.sql`*

### Rule 3: Defensive & Idempotent SQL
Every migration script MUST be written defensively so it can run safely against a fresh database or an existing database without crashing:
- Use `CREATE TABLE IF NOT EXISTS ...`
- Use `ALTER TABLE ... ADD COLUMN IF NOT EXISTS ...`
- Use `INSERT INTO ... ON CONFLICT (...) DO NOTHING;`
- Guard index creation: `CREATE INDEX IF NOT EXISTS ...`

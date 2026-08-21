# Changelog

All notable changes to RMC ERP are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/); this project follows [Semantic Versioning](https://semver.org/).

## [1.2.0] — 2026-08-21

**Dynamic Lookups API, Centralized Logging & Developer Infrastructure.** This release introduces dynamic entity lookup endpoints with granular RBAC permissions, centralized structured logging with Winston, streamlined database migration scripts, and comprehensive developer documentation.

### Added
- **Dynamic Lookups API (`/api/lookups`).** Fast, standardized endpoints to fetch lightweight lookup collections for UI dropdowns and references.
  - Single entity lookup: `GET /api/lookups/:entity` (supports `customers`, `drivers`, `vehicles`, `mix_designs`, `materials`, `roles`, `order_statuses`, `trip_statuses`).
  - Batch entity lookup: `GET /api/lookups?entities=customers,drivers,vehicles` to fetch multiple lookup dictionaries in a single HTTP round-trip.
  - Entity-level RBAC authorization via `requireEntityLookupPermission`, ensuring users only access lookups for modules they have permission to view.
  - Zod validation for single and batch entity query parameters.
  - Unit test suite covering authorization, single entity retrieval, batch queries, and error cases.
- **Centralized Structured Logging.**
  - Added Winston-based dual logger (`backend/src/utils/logger.ts`) supporting formatted console output and persistent file logging (`logs/app.log`, `logs/error.log`).
  - Added HTTP request logging middleware (`backend/src/middleware/requestLogger.ts`) capturing request method, endpoint, status code, response time, client IP, and user-agent.
  - Replaced ad-hoc `console.log`/`console.error` calls across database connectors, error handlers, and business services.
- **Version Management Script.** Added `scripts/bump-version.js` with `npm run version:set <version>` to synchronize SemVer versioning across `package.json`, `backend/package.json`, `frontend/package.json`, `frontend/src/version.ts`, and `README.md`.
- **Modular Developer Guides.** Reorganized project documentation into dedicated guides in `developers-guide/`:
  - `developers-guide/FRONTEND_GUIDE.md`
  - `developers-guide/BACKEND_GUIDE.md`
  - `developers-guide/DATABASE_GUIDE.md`
  - `developers-guide/DEPLOYMENT_AND_VERSIONING_GUIDE.md`

### Changed
- **Database Directory Structure.** Relocated database migrations and seed scripts from legacy `supabase/` to a standard PostgreSQL folder hierarchy: `database/migrations/` and `database/seeding/`.
- **Database Management CLI Scripts.** Added streamlined database scripts to `backend/package.json`: `npm run db:migrate`, `npm run db:seed`, and `npm run db:reset`.
- **Cleaned up Legacy Files.** Removed deprecated `backend/src/types/supabase.ts` and legacy Supabase configuration files.

### Upgrade notes
- **API consumers:** UI components can migrate from calling individual entity listing endpoints for dropdowns to the unified `GET /api/lookups/:entity` or batch `GET /api/lookups?entities=...` endpoint for reduced network latency.
- **Operators:** Database migration and seeding scripts are now located under `database/migrations/` and `database/seeding/` and can be executed using `npm run db:migrate` and `npm run db:seed` in the `backend/` directory.

## [1.1.0] — 2026-07-13

**API Hardening & Data Integrity.** This release makes the backend resilient to bad input, duplicate submissions, and error leakage. No breaking changes to existing success responses; error responses are now more consistent and correctly classified.

### Added
- **Centralized request validation (Zod).** Every endpoint now validates its body, URL params, and query string against a schema before any database work. Bad input — negative or zero quantities, wrong types, oversized text, malformed dates, non-numeric IDs — is rejected with a clear `400` instead of reaching the database. Unknown fields are stripped, closing a mass-assignment gap on update endpoints.
- **Idempotency keys on all create operations.** Clients may send an `Idempotency-Key` header; the server executes the first request and replays the stored response for any duplicate, so a double-click or network retry can no longer create two records. Wired end-to-end (UI → API) for orders, trips, delivery challans, customers, drivers, vehicles, mix designs, inventory items, and quality tests.
- **Unique constraints** on `drivers.license_number` and a new `customers.gst_number` column, enforced at the database level so duplicates cannot be created even under concurrent requests.

### Changed
- **Unified error handling.** All errors now flow through a single middleware that returns consistent responses. Foreign-key, type, not-null, and check-constraint violations are translated into graceful `400 Bad Request` messages; duplicate-key violations return `409 Conflict` with a human-readable message. Validation failures return `{ error, details }` (the `error` string is unchanged from before; `details` is a new additive array).
- Controllers were simplified to a single responsibility (the happy path); error classification is now handled in one place.

### Fixed / Security
- **Database schema details no longer leak to clients.** Raw PostgreSQL error text (table names, column names, constraint names) was previously exposed in some `500` and auth responses. Unexpected errors now return a generic `Internal server error.` while the full detail is logged server-side only.
- Bad input that used to be mislabelled as `500 Internal Server Error` is now correctly reported as `400`/`409`, so clients and monitoring can distinguish "your request was invalid" from "the server failed."

### Database migrations
Run both before deploying this release:
- `20260713100000_add_unique_constraints.sql` — adds `customers.gst_number`, adds unique constraints on driver licence and customer GST, and de-duplicates any existing duplicate licence numbers (older duplicates get a visible `-DUP-<id>` suffix; nothing is deleted).
- `20260713110000_create_idempotency_keys.sql` — creates the `idempotency_keys` table.

### Upgrade notes
- **API consumers:** validation errors now include a `details` array alongside the existing `error` string — no change required, but you may surface `details` for field-level messages. To benefit from idempotency, send a unique `Idempotency-Key` header (a UUID) per submission intent.
- **Operators:** apply the two migrations above. Consider a periodic purge of old `idempotency_keys` rows (they only need to outlive a client retry window).

## [1.0.0]

Initial release — orders, dispatch, trips, inventory, quality control, mix designs, master data, workflow engine, and role-based access control.

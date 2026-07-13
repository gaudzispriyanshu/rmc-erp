# Changelog

All notable changes to RMC ERP are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/); this project follows [Semantic Versioning](https://semver.org/).

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

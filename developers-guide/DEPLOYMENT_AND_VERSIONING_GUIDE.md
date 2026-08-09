# Deployment & Versioning Guide — RMC ERP

This guide documents the release management lifecycle, Semantic Versioning standards, GitHub git tagging workflow, and the production deployment procedures for **RMC ERP**.

---

## 1. Project Versioning Strategy

RMC ERP follows [Semantic Versioning 2.0.0 (SemVer)](https://semver.org/):

$$\text{Version Format: } \mathbf{MAJOR.MINOR.PATCH}$$

- **MAJOR**: Breaking changes or major architectural overhauls.
- **MINOR**: New features, additive API endpoints, or database schema additions (backward-compatible).
- **PATCH**: Bug fixes, security patches, or minor performance tweaks.

---

## 2. Release & Versioning Workflow

A new release version (e.g., `1.2.0`) is created only after all assigned issues/tickets for that release increment have passed QA and testing.

```text
[1. Issue Resolution & QA] ──► All tickets & backend tests pass (npm test)
                                        │
                                        ▼
[2. Version Bump Command]   ──► Run `npm run version:set X.Y.Z`
                                        │
                                        ▼
[3. Manual Verification]    ──► Verify CHANGELOG.md & package manifests
                                        │
                                        ▼
[4. Git Commit & Tagging]   ──► `git tag -a vX.Y.Z` & push to GitHub
                                        │
                                        ▼
[5. GitHub Release]         ──► Publish GitHub Release from tag vX.Y.Z
```

### Step 1: Automated Version Bump Command
To bump the version across all project files simultaneously, run:
```bash
npm run version:set 1.2.0
```
This single command automatically updates:
1. `package.json` (Root)
2. `backend/package.json`
3. `frontend/package.json`
4. `README.md` (Version badge)

### Step 2: Manual Version Files Check
If you ever need to manually inspect or update version numbers, verify the following files:
- `package.json` -> `"version": "1.2.0"`
- `backend/package.json` -> `"version": "1.2.0"`
- `frontend/package.json` -> `"version": "1.2.0"`
- `README.md` -> `> **Version 1.2.0**`

### Step 3: Maintain `CHANGELOG.md` at Project Root
All version history, release notes, added features, breaking changes, and migration requirements MUST be recorded in [CHANGELOG.md](file:///Users/openemis/Desktop/rmc-erp/CHANGELOG.md) located at the root of the repository.

- Format based on [Keep a Changelog](https://keepachangelog.com/).
- Structured into standard sections: `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`, and `Database migrations`.

Example entry structure in `CHANGELOG.md`:
```markdown
## [1.2.0] — YYYY-MM-DD

### Added
- Feature description...

### Changed
- Refactored items...

### Fixed
- Bug fixes...

### Database migrations
- List of migration scripts required before deploying...
```

### Step 4: Git Tagging & GitHub Release
Once testing passes and changes are committed:
```bash
# 1. Commit release changes
git add .
git commit -m "chore(release): bump version to 1.2.0"

# 2. Create annotated Git tag
git tag -a v1.2.0 -m "Release v1.2.0"

# 3. Push commit and tag to GitHub
git push origin main --tags
```

On GitHub, navigate to **Releases** → **Draft a new release**, select tag `v1.2.0`, paste the release notes from `CHANGELOG.md`, and publish.

---

## 3. Production Deployment (TBD / Placeholder)

> **Status**: Currently Empty / TBD for target Cloud Infrastructure.

### Standard Build Pipeline (Pre-deployment check)

Before deploying to staging or production environments, verify that both tiers build without errors:

1. **Backend Build**:
```bash
cd backend
npm install
npm run build     # Runs `tsc` to verify TypeScript compilation to dist/
```

2. **Frontend Build**:
```bash
cd frontend
npm install
npm run build     # Compiles Vite production bundle into dist/
```

3. **Database Migrations on Production**:
Run schema migrations against the production database **before** releasing new backend code:
```bash
# Set production DATABASE_URL env variable
cd backend
DATABASE_URL="postgresql://user:password@prod-db-host:5432/rmc_erp" npm run db:migrate
```

*(Detailed production cloud hosting instructions, CI/CD pipelines, and environment provisioning will be documented here once cloud infrastructure is finalized).*

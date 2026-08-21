# Backend Developer Guide — RMC ERP

Welcome to the Backend Developer Guide for **RMC ERP**. This guide documents backend architecture, request execution flow, error handling, Zod validation, security, and coding standards for all backend services.

---

## 1. Technical Stack

- **Runtime**: Node.js v18+
- **Framework**: Express 5 (TypeScript)
- **Database Access**: Parameterized SQL via `node-postgres` (`pg` Pool) — *No heavy ORM*
- **Validation**: Zod (`zod`)
- **Authentication**: JSON Web Tokens (`jsonwebtoken`, `bcrypt` / `bcryptjs`)
- **Logging**: Dual-destination logger (`utils/logger.ts`) writing to terminal, `logs/app.log`, and `logs/db.log`
- **Testing**: Jest & `ts-jest`

---

## 2. Directory Layout (`backend/src/`)

```text
backend/src/
├── config/                  # Database pool & environment variables
│   └── db.ts                # PostgreSQL connection pool with SQL query logging
├── controllers/             # Thin HTTP request handlers (Validate & map status)
│   ├── orderController.ts
│   ├── tripController.ts
│   ├── authController.ts
│   └── ...
├── errors/                  # Custom error classes (AppError, ValidationError)
├── middleware/              # Express middlewares
│   ├── auth.ts              # authenticate JWT & authorize('permission_slug')
│   ├── errorHandler.ts      # Terminal error handler (no DB detail leaks)
│   └── requestLogger.ts     # HTTP request logging middleware
├── routes/                  # Route definitions with auth & permission guards
│   ├── orders.ts
│   ├── trips.ts
│   └── ...
├── schemas/                 # Zod validation schemas for request bodies/params
│   └── orderSchemas.ts
├── services/                # Business logic & SQL data access layer
│   ├── orderService.ts
│   ├── workflowService.ts   # Configurable workflow state machine checks
│   ├── inventoryService.ts  # Material BOM auto-deduction math & stock ledger
│   └── ...
├── types/                   # Shared TypeScript interfaces & types
├── utils/                   # Helpers (logger, idempotency utility)
└── server.ts                # Express app initialization & route mounting
```

---

## 3. Architecture & Request Execution Flow

All incoming HTTP requests follow a strict 4-layer unidirectional pipeline:

```text
HTTP Request
   │
   ▼
[1. Route Layer]      ── Auth & RBAC Guards (authenticate, authorize('slug'))
   │
   ▼
[2. Controller Layer] ── Input Validation (Zod Schemas) & Status Code Mapping
   │
   ▼
[3. Service Layer]    ── Parameterized SQL & Business Rules (Workflow, BOM, Ledger)
   │
   ▼
[4. Database Layer]   ── PostgreSQL Transaction Execution (BEGIN / COMMIT / ROLLBACK)
```

---

## 4. Backend Coding Standards & Rules

### Rule 1: Routes Only Guard and Delegate
Routes MUST only declare endpoint paths, attach authentication (`authenticate`), permission guards (`authorize('orders:write')`), and call controller functions. Business logic in route files is strictly prohibited.

```typescript
// Example: src/routes/orders.ts
import { Router } from 'express';
import { createOrder, getOrders } from '../controllers/orderController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', authorize('orders:read'), getOrders);
router.post('/', authorize('orders:write'), createOrder);

export default router;
```

### Rule 2: Controllers Must Stay Thin
Controllers handle HTTP context:
1. Parse and validate `req.body`, `req.params`, and `req.query` using Zod schemas.
2. Call the corresponding Service function.
3. Return clean JSON responses with proper HTTP status codes (`200`, `201`, `400`, `401`, `403`, `404`, `409`).

```typescript
// Example: src/controllers/orderController.ts
import { Request, Response, NextFunction } from 'express';
import { createOrderSchema } from '../schemas/orderSchemas';
import * as orderService from '../services/orderService';

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = createOrderSchema.parse(req.body);
    const idempotencyKey = req.headers['idempotency-key'] as string;
    const newOrder = await orderService.createOrder(validatedData, idempotencyKey);
    res.status(201).json(newOrder);
  } catch (err) {
    next(err); // Handled by centralized errorHandler
  }
};
```

### Rule 3: Services Handle All SQL & Business Rules
- Use parameterized queries (`$1`, `$2`) with `pool.query()` to prevent SQL injection.
- When performing multi-table writes (e.g. creating an order and updating stock), wrap operations in an explicit PostgreSQL transaction (`BEGIN`, `COMMIT`, `ROLLBACK`).
- Check workflow state transitions via `workflowService.isTransitionAllowed()` before allowing status updates. Illegal jumps must fail with `400 Bad Request`.

### Rule 4: Idempotency Protection on Create Operations
All entity creation services check for an `Idempotency-Key` header. If a duplicate key is presented within the retention window, the server replays the existing saved response without executing duplicate database writes.

### Rule 5: Zero DB Detail Leakage
All unhandled errors pass to `middleware/errorHandler.ts`. Database error detail (PostgreSQL constraint names, raw SQL, table names) must NEVER be returned in response payloads. They are logged to `logs/app.log` / `logs/db.log` for backend debugging, while clients receive clean HTTP error messages.

---

## 5. API Surface Reference

All endpoints are mounted under `/api` and require a valid JWT token:

| Module | Method | Endpoint | Permission Required | Description |
|---|---|---|---|---|
| **Auth** | `POST` | `/api/auth/login` | None | User authentication & JWT issuance |
| **Auth** | `GET` | `/api/auth/verify` | `authenticate` | Token verification & current profile |
| **Orders** | `GET` | `/api/orders` | `orders:read` | List orders with filtering & stats |
| **Orders** | `POST` | `/api/orders` | `orders:write` | Create new concrete order |
| **Orders** | `PATCH` | `/api/orders/:id/status` | `orders:update` | Transition order workflow status |
| **Trips** | `GET` | `/api/trips` | `trips:read` | List transit mixer trips |
| **Trips** | `POST` | `/api/trips` | `trips:write` | Assign vehicle + driver & dispatch trip |
| **Trips** | `PATCH` | `/api/trips/:id/status` | `trips:update` | Update trip status & write audit log |
| **Dispatch**| `GET` | `/api/dispatch/board` | `dispatch:read` | Live operational dispatch board |
| **Dispatch**| `POST` | `/api/dispatch/challans` | `dispatch:write` | Generate auto-numbered delivery challan |
| **Inventory**| `GET` | `/api/inventory` | `inventory:read` | Stock levels & low-stock alerts |
| **Inventory**| `POST` | `/api/inventory/movements` | `inventory:update` | Append stock ledger movement |
| **Quality** | `GET/POST` | `/api/quality/cube-tests` | `quality:read`/`write` | Quality cube strength tests |
| **Workflows**| `GET/PUT` | `/api/workflows` | `workflows:read`/`write` | State machine workflow configuration |
| **Roles** | `GET/PUT` | `/api/roles/matrix` | `admin:read`/`write` | Visual RBAC permission matrix |

---

## 6. Local Setup & Testing

### 1. Environment Configuration
Create `backend/.env`:
```env
PORT=5001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/rmc_erp
JWT_SECRET=super_secret_jwt_key_rmc_2026
```

### 2. Run Server
```bash
cd backend
npm install
npm run dev     # Launches ts-node-dev server on http://localhost:5001
```

### 3. Running Unit Tests
```bash
npm test        # Runs Jest test suite covering workflow, inventory, and logic
```

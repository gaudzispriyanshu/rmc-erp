# Frontend Developer Guide — RMC ERP

Welcome to the Frontend Developer Guide for **RMC ERP**. This document details the frontend architecture, component patterns, state management, design rules, and setup instructions so all developers maintain a unified code style.

---

## 1. Technical Stack

- **Framework**: React 19 (via Vite)
- **Language**: TypeScript 5.x
- **Routing**: React Router 7 (`react-router-dom`)
- **HTTP Client**: Axios
- **Styling**: Modular Vanilla CSS system with CSS variables (No external UI frameworks like Tailwind or Material UI)

---

## 2. Directory Layout (`frontend/src/`)

```text
frontend/src/
├── assets/                  # Static assets (images, icons, global SVGs)
├── components/
│   ├── common/              # Shared reusable UI primitives (MUST be reused)
│   │   ├── DataTable.tsx    # Standard table with sorting, search, pagination
│   │   ├── CrudModule.tsx   # Generic CRUD container for master data screens
│   │   ├── WorkflowStatus.tsx# Workflow state pill badge renderer
│   │   ├── Modal.tsx        # Accessible dialog wrapper
│   │   └── FormInput.tsx    # Styled form controls with validation states
│   └── layout/              # Application layout shell
│       ├── Layout.tsx       # Main page container (Sidebar + TopBar + Outlet)
│       ├── Sidebar.tsx      # Navigation drawer with RBAC route filtering
│       └── TopBar.tsx       # Header with user profile & logout
├── context/
│   └── AuthContext.tsx      # Global JWT auth, user info & permissions matrix state
├── pages/                   # Application pages (1-to-1 route mapping)
│   ├── dashboard/           # Operational analytics & low-stock alerts
│   ├── orders/              # Order management & status workflow transitions
│   ├── trips/               # Dispatch trips & status update audit logs
│   ├── dispatch/            # Delivery challans & dispatch board
│   ├── quality/             # Cube tests, slump tests, non-conformance tracking
│   ├── inventory/           # Stock management & movement ledger
│   ├── masters/             # Customers, drivers, vehicles, mix designs
│   └── system/              # Workflows & RBAC roles administration
├── services/
│   └── api.ts               # Axios instance configured with JWT & Idempotency headers
├── index.css                # Global CSS tokens, reset, and utility classes
├── App.tsx                  # App routes & AuthProvider wrapper
└── main.tsx                 # Vite entry point
```

---

## 3. Architecture & Coding Conventions

### Rule 1: Always Reuse Core Components (`components/common/`)
Do **not** re-invent table views, CRUD forms, or status badges.
- Use `DataTable` for all tabular data displays (handles search, sorting, and pagination out of the box).
- Use `CrudModule` for standard master data screens (Customers, Drivers, Vehicles, Items).
- Use `WorkflowStatus` for rendering entity status pills (applies workflow state colors dynamically).

### Rule 2: Single Source of Truth for Authentication & Permissions
Access user state and permissions exclusively via `useAuth()` hook provided by `AuthContext`:
```tsx
import { useAuth } from '../../context/AuthContext';

const MyComponent = () => {
  const { user, hasPermission } = useAuth();
  
  if (!hasPermission('orders:write')) {
    return <p>Access Denied</p>;
  }

  return <button>Create Order</button>;
};
```

### Rule 3: Centralized API Interaction & Idempotency
Always perform HTTP requests using the pre-configured Axios instance from `services/api.ts`.
- `api.ts` automatically attaches the `Authorization: Bearer <token>` header.
- For `POST` / `PUT` mutation calls (e.g. creating orders, trips, or challans), send an `Idempotency-Key` header (UUID) to prevent duplicate submissions:
```typescript
import api from '../services/api';
import { v4 as uuidv4 } from 'uuid';

export const createOrder = async (orderData: any) => {
  const response = await api.post('/orders', orderData, {
    headers: {
      'Idempotency-Key': uuidv4()
    }
  });
  return response.data;
};
```

### Rule 4: Modular Vanilla CSS Styling
- UI styling must leverage CSS variables defined in `index.css` (e.g., `--color-primary`, `--bg-dark`, `--border-radius`).
- Avoid inline static styles (`style={{ margin: '12px' }}`). Use class names or utility classes.
- Ensure components render cleanly on dark and light themes without hardcoded pixel offsets.

---

## 4. Onboarding & Local Development Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Environment Configuration
Create a `.env` file in `frontend/.env`:
```env
VITE_API_URL=http://localhost:5001/api
```

### 3. Run Development Server
```bash
npm run dev
```
Access the application in your browser at `http://localhost:5173`.

### 4. Production Build & Linting
```bash
npm run lint      # Check TypeScript & ESLint rules
npm run build     # Compile production bundle in dist/
npm run preview   # Preview production build locally
```

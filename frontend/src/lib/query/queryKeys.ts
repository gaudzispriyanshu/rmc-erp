/**
 * Every cache key in the app. Hierarchical on purpose: invalidating
 * `queryKeys.orders.all` also drops every list/detail underneath it.
 * Never inline a key array in a component.
 */
export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  dashboard: {
    summary: ["dashboard", "summary"] as const,
  },
  orders: {
    all: ["orders"] as const,
    list: (filters?: Record<string, unknown>) => ["orders", "list", filters ?? {}] as const,
    detail: (id: string | number) => ["orders", "detail", String(id)] as const,
  },
  trips: {
    all: ["trips"] as const,
    list: (filters?: Record<string, unknown>) => ["trips", "list", filters ?? {}] as const,
    detail: (id: string | number) => ["trips", "detail", String(id)] as const,
  },
  dispatch: {
    all: ["dispatch"] as const,
    challans: (filters?: Record<string, unknown>) =>
      ["dispatch", "challans", filters ?? {}] as const,
    challan: (id: string | number) => ["dispatch", "challan", String(id)] as const,
  },
  inventory: {
    all: ["inventory"] as const,
    items: (filters?: Record<string, unknown>) =>
      ["inventory", "items", filters ?? {}] as const,
    movements: (filters?: Record<string, unknown>) =>
      ["inventory", "movements", filters ?? {}] as const,
  },
  customers: {
    all: ["customers"] as const,
    list: (filters?: Record<string, unknown>) =>
      ["customers", "list", filters ?? {}] as const,
    detail: (id: string | number) => ["customers", "detail", String(id)] as const,
  },
  drivers: {
    all: ["drivers"] as const,
    list: (filters?: Record<string, unknown>) => ["drivers", "list", filters ?? {}] as const,
  },
  vehicles: {
    all: ["vehicles"] as const,
    list: (filters?: Record<string, unknown>) => ["vehicles", "list", filters ?? {}] as const,
  },
  mixDesigns: {
    all: ["mix-designs"] as const,
    list: (filters?: Record<string, unknown>) =>
      ["mix-designs", "list", filters ?? {}] as const,
  },
  quality: {
    all: ["quality"] as const,
    list: (filters?: Record<string, unknown>) => ["quality", "list", filters ?? {}] as const,
  },
  roles: {
    all: ["roles"] as const,
  },
} as const;

/**
 * One map of every backend path. Mirrors backend/src/routes/*.
 * Nothing else in the app should contain a URL string.
 */
export const endpoints = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    me: "/auth/me",
  },
  orders: {
    list: "/orders",
    create: "/orders",
    byId: (id: string | number) => `/orders/${id}`,
    status: (id: string | number) => `/orders/${id}/status`,
  },
  trips: {
    list: "/trips",
    create: "/trips",
    byId: (id: string | number) => `/trips/${id}`,
    status: (id: string | number) => `/trips/${id}/status`,
  },
  dispatch: {
    challans: "/dispatch/challans",
    challanById: (id: string | number) => `/dispatch/challans/${id}`,
  },
  inventory: {
    items: "/inventory/items",
    itemById: (id: string | number) => `/inventory/items/${id}`,
    movements: "/inventory/stock-movements",
  },
  customers: {
    list: "/customers",
    byId: (id: string | number) => `/customers/${id}`,
  },
  drivers: {
    list: "/drivers",
    byId: (id: string | number) => `/drivers/${id}`,
  },
  vehicles: {
    list: "/vehicles",
    byId: (id: string | number) => `/vehicles/${id}`,
  },
  mixDesigns: {
    list: "/mix-designs",
    byId: (id: string | number) => `/mix-designs/${id}`,
  },
  quality: {
    list: "/quality",
    byId: (id: string | number) => `/quality/${id}`,
  },
  roles: {
    list: "/roles",
  },
  workflows: {
    list: "/workflows",
  },
} as const;

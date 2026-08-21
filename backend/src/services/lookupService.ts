import pool from "../config/db";

export interface EntityLookupConfig {
  tableName: string;
  lookup_fields: string[];
  searchable_columns?: string[];
  filterable_columns?: Record<string, string>;
  default_where?: string;
  default_order_by?: string;
  permissions: string[];
}

export type LookupFilters = Record<string, any>;
export type LookupItem = Record<string, any>;

const READ_OR_WRITE = (domain: string) => [
  `${domain}:read`,
  `${domain}:write`,
  `${domain}:create`,
  `${domain}:update`,
];

export const LOOKUP_CONFIG: Record<string, EntityLookupConfig> = {
  customers: {
    tableName: "customers",
    lookup_fields: ["id", "name"],
    searchable_columns: ["name"],
    filterable_columns: { status: "status" },
    default_order_by: "name ASC",
    permissions: [...READ_OR_WRITE("customers"), ...READ_OR_WRITE("orders")],
  },
  orders: {
    tableName: "orders",
    lookup_fields: ["id", "status", "customer_id", "mix_design_id"],
    searchable_columns: ["id"],
    filterable_columns: { customer_id: "customer_id", status: "status" },
    default_where: "status != 'CANCELLED'",
    default_order_by: "id DESC",
    permissions: [...READ_OR_WRITE("orders"), ...READ_OR_WRITE("dispatch"), ...READ_OR_WRITE("trips")],
  },
  "mix-designs": {
    tableName: "mix_designs",
    lookup_fields: ["id", "grade_name", "description"],
    searchable_columns: ["grade_name", "description"],
    filterable_columns: { approval_status: "approval_status", id: "id" },
    default_order_by: "grade_name ASC",
    permissions: [...READ_OR_WRITE("mix_designs"), ...READ_OR_WRITE("orders"), ...READ_OR_WRITE("quality")],
  },
  mix_designs: {
    tableName: "mix_designs",
    lookup_fields: ["id", "grade_name", "description"],
    searchable_columns: ["grade_name", "description"],
    filterable_columns: { approval_status: "approval_status", id: "id" },
    default_order_by: "grade_name ASC",
    permissions: [...READ_OR_WRITE("mix_designs"), ...READ_OR_WRITE("orders"), ...READ_OR_WRITE("quality")],
  },
  vehicles: {
    tableName: "vehicles",
    lookup_fields: ["id", "plate_number", "model"],
    searchable_columns: ["plate_number", "model"],
    filterable_columns: { status: "status" },
    default_where: "status != 'out_of_service'",
    default_order_by: "plate_number ASC",
    permissions: [...READ_OR_WRITE("vehicles"), ...READ_OR_WRITE("dispatch"), ...READ_OR_WRITE("trips")],
  },
  drivers: {
    tableName: "drivers",
    lookup_fields: ["id", "name", "phone"],
    searchable_columns: ["name"],
    filterable_columns: { status: "status" },
    default_where: "status = 'active'",
    default_order_by: "name ASC",
    permissions: [...READ_OR_WRITE("drivers"), ...READ_OR_WRITE("dispatch"), ...READ_OR_WRITE("trips")],
  },
  "inventory-items": {
    tableName: "inventory_items",
    lookup_fields: ["id", "name", "unit"],
    searchable_columns: ["name"],
    filterable_columns: { unit: "unit" },
    default_order_by: "name ASC",
    permissions: [...READ_OR_WRITE("inventory"), ...READ_OR_WRITE("mix_designs"), ...READ_OR_WRITE("quality")],
  },
  inventory_items: {
    tableName: "inventory_items",
    lookup_fields: ["id", "name", "unit"],
    searchable_columns: ["name"],
    filterable_columns: { unit: "unit" },
    default_order_by: "name ASC",
    permissions: [...READ_OR_WRITE("inventory"), ...READ_OR_WRITE("mix_designs"), ...READ_OR_WRITE("quality")],
  },
  roles: {
    tableName: "roles",
    lookup_fields: ["id", "name"],
    searchable_columns: ["name"],
    filterable_columns: {},
    default_order_by: "id ASC",
    permissions: [...READ_OR_WRITE("roles")],
  },
};

// Resolves the permission slugs for a lookup entity from LOOKUP_CONFIG
export const getPermissionsForEntity = (entity: string): string[] => {
  const config = LOOKUP_CONFIG[entity] || LOOKUP_CONFIG[entity.replace("_", "-")];
  return config?.permissions ?? [];
};

// Fetches all action slugs assigned to a role (used internally for batch permission checks)
const getUserActionSlugs = async (roleId: number): Promise<string[]> => {
  const result = await pool.query(
    `SELECT p.action_slug 
     FROM permissions p
     JOIN role_permissions rp ON p.id = rp.permission_id
     WHERE rp.role_id = $1`,
    [roleId]
  );
  return result.rows.map((row) => row.action_slug);
};

// Checks if user has any of the required permissions for an entity (in-memory check for batch operations)
export const hasPermissionForLookup = (userActionSlugs: string[], entity: string): boolean => {
  const permissions = getPermissionsForEntity(entity);
  if (permissions.length === 0) return true;
  return userActionSlugs.some((slug) => permissions.includes(slug));
};

// Batch permission check: fetches user slugs once, returns per-entity authorization
export const checkBatchPermissions = async (
  roleId: number,
  entities: string[]
): Promise<{ allowed: string[]; forbidden: string[] }> => {
  const userActionSlugs = await getUserActionSlugs(roleId);
  const allowed: string[] = [];
  const forbidden: string[] = [];

  for (const entity of entities) {
    if (hasPermissionForLookup(userActionSlugs, entity)) {
      allowed.push(entity);
    } else {
      forbidden.push(entity);
    }
  }

  return { allowed, forbidden };
};

// Config-driven query engine — builds parameterized SQL from LOOKUP_CONFIG
export const getLookupByEntity = async (
  entity: string,
  filters: LookupFilters = {}
): Promise<Record<string, any>[]> => {
  const normalizedEntity = entity.replace("_", "-");
  const config = LOOKUP_CONFIG[entity] || LOOKUP_CONFIG[normalizedEntity];

  if (!config) return [];

  const conditions: string[] = [];
  const params: any[] = [];
  let idx = 1;

  if (config.default_where) {
    conditions.push(`(${config.default_where})`);
  }

  if (config.filterable_columns) {
    for (const [paramKey, dbColumn] of Object.entries(config.filterable_columns)) {
      const val = filters[paramKey];
      if (val !== undefined && val !== null && val !== "all" && val !== "") {
        conditions.push(`${dbColumn} = $${idx++}`);
        params.push(val);
      }
    }
  }

  if (filters.search && config.searchable_columns && config.searchable_columns.length > 0) {
    const searchConds = config.searchable_columns.map((col) => `${col} ILIKE $${idx}`);
    conditions.push(`(${searchConds.join(" OR ")})`);
    params.push(`%${filters.search}%`);
    idx++;
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const selectClause = `SELECT ${config.lookup_fields.join(", ")}`;
  const orderClause = config.default_order_by ? `ORDER BY ${config.default_order_by}` : "";

  const sql = [selectClause, `FROM ${config.tableName}`, whereClause, orderClause]
    .filter(Boolean)
    .join(" ")
    .trim();

  const result = await pool.query(sql, params);
  return result.rows;
};

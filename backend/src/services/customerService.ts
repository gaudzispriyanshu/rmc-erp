import pool from "../config/db";

export interface CustomerInput {
  name: string;
  email?: string;
  phone?: string;
}

export const getAllCustomers = async (filters: { start?: number; end?: number; search?: string } = {}) => {
  const conditions: string[] = [];
  const params: any[] = [];
  let idx = 1;

  if (filters.search) {
    conditions.push(`(name ILIKE $${idx} OR email ILIKE $${idx} OR phone ILIKE $${idx})`);
    params.push(`%${filters.search}%`);
    idx++;
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const start = filters.start ?? 0;
  const end = filters.end ?? 9;
  params.push(end - start + 1, start);

  const result = await pool.query(
    `SELECT *, COUNT(*) OVER() AS _total_count
     FROM customers ${whereClause}
     ORDER BY id DESC
     LIMIT $${idx++} OFFSET $${idx++}`,
    params
  );

  const total = result.rows.length ? parseInt(result.rows[0]._total_count) : 0;
  const customers = result.rows.map(({ _total_count, ...rest }) => rest);
  return { customers, total, start, end: customers.length === 0 ? 0 : Math.min(end, start + customers.length - 1) };
};

export const getCustomerById = async (id: number) => {
  const result = await pool.query("SELECT * FROM customers WHERE id = $1", [id]);
  return result.rows[0];
};

export const createCustomer = async (data: CustomerInput) => {
  const result = await pool.query(
    "INSERT INTO customers (name, email, phone) VALUES ($1, $2, $3) RETURNING *",
    [data.name, data.email ?? null, data.phone ?? null]
  );
  return result.rows[0];
};

export const updateCustomer = async (id: number, data: Partial<CustomerInput>) => {
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;
  for (const key of ["name", "email", "phone"] as const) {
    if (data[key] !== undefined) {
      fields.push(`${key} = $${idx++}`);
      values.push(data[key]);
    }
  }
  if (fields.length === 0) return null;
  values.push(id);
  const result = await pool.query(
    `UPDATE customers SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0];
};

export const deleteCustomer = async (id: number) => {
  const result = await pool.query("DELETE FROM customers WHERE id = $1 RETURNING *", [id]);
  return result.rows[0];
};

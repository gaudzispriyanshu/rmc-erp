import pool from "../config/db";

export interface DriverInput {
  name: string;
  phone?: string;
  license_number?: string;
  status?: string;
  base_salary?: number;
  per_trip_rate?: number;
}

const DRIVER_FIELDS = ["name", "phone", "license_number", "status", "base_salary", "per_trip_rate"] as const;

export const getAllDrivers = async (filters: { start?: number; end?: number; search?: string; status?: string } = {}) => {
  const conditions: string[] = [];
  const params: any[] = [];
  let idx = 1;

  if (filters.search) {
    conditions.push(`(name ILIKE $${idx} OR phone ILIKE $${idx} OR license_number ILIKE $${idx})`);
    params.push(`%${filters.search}%`);
    idx++;
  }
  if (filters.status && filters.status !== "all") {
    conditions.push(`status = $${idx++}`);
    params.push(filters.status);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const start = filters.start ?? 0;
  const end = filters.end ?? 9;
  params.push(end - start + 1, start);

  const result = await pool.query(
    `SELECT *, COUNT(*) OVER() AS _total_count
     FROM drivers ${whereClause}
     ORDER BY id DESC
     LIMIT $${idx++} OFFSET $${idx++}`,
    params
  );

  const total = result.rows.length ? parseInt(result.rows[0]._total_count) : 0;
  const drivers = result.rows.map(({ _total_count, ...rest }) => rest);
  return { drivers, total, start, end: drivers.length === 0 ? 0 : Math.min(end, start + drivers.length - 1) };
};

export const getDriverById = async (id: number) => {
  const result = await pool.query("SELECT * FROM drivers WHERE id = $1", [id]);
  return result.rows[0];
};

export const createDriver = async (data: DriverInput) => {
  const result = await pool.query(
    `INSERT INTO drivers (name, phone, license_number, status, base_salary, per_trip_rate)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [data.name, data.phone ?? null, data.license_number ?? null, data.status ?? "active", data.base_salary ?? 0, data.per_trip_rate ?? 0]
  );
  return result.rows[0];
};

export const updateDriver = async (id: number, data: Partial<DriverInput>) => {
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;
  for (const key of DRIVER_FIELDS) {
    if (data[key] !== undefined) {
      fields.push(`${key} = $${idx++}`);
      values.push(data[key]);
    }
  }
  if (fields.length === 0) return null;
  values.push(id);
  const result = await pool.query(
    `UPDATE drivers SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0];
};

export const deleteDriver = async (id: number) => {
  const result = await pool.query("DELETE FROM drivers WHERE id = $1 RETURNING *", [id]);
  return result.rows[0];
};

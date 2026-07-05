import pool from "../config/db";

export interface VehicleInput {
  plate_number: string;
  model?: string;
  capacity?: number;
  status?: string;
}

const VEHICLE_FIELDS = ["plate_number", "model", "capacity", "status"] as const;

export const getAllVehicles = async (filters: { start?: number; end?: number; search?: string; status?: string } = {}) => {
  const conditions: string[] = [];
  const params: any[] = [];
  let idx = 1;

  if (filters.search) {
    conditions.push(`(plate_number ILIKE $${idx} OR model ILIKE $${idx})`);
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
     FROM vehicles ${whereClause}
     ORDER BY id DESC
     LIMIT $${idx++} OFFSET $${idx++}`,
    params
  );

  const total = result.rows.length ? parseInt(result.rows[0]._total_count) : 0;
  const vehicles = result.rows.map(({ _total_count, ...rest }) => rest);
  return { vehicles, total, start, end: vehicles.length === 0 ? 0 : Math.min(end, start + vehicles.length - 1) };
};

export const getVehicleById = async (id: number) => {
  const result = await pool.query("SELECT * FROM vehicles WHERE id = $1", [id]);
  return result.rows[0];
};

export const createVehicle = async (data: VehicleInput) => {
  const result = await pool.query(
    `INSERT INTO vehicles (plate_number, model, capacity, status)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [data.plate_number, data.model ?? null, data.capacity ?? null, data.status ?? "available"]
  );
  return result.rows[0];
};

export const updateVehicle = async (id: number, data: Partial<VehicleInput>) => {
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;
  for (const key of VEHICLE_FIELDS) {
    if (data[key] !== undefined) {
      fields.push(`${key} = $${idx++}`);
      values.push(data[key]);
    }
  }
  if (fields.length === 0) return null;
  values.push(id);
  const result = await pool.query(
    `UPDATE vehicles SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0];
};

export const deleteVehicle = async (id: number) => {
  const result = await pool.query("DELETE FROM vehicles WHERE id = $1 RETURNING *", [id]);
  return result.rows[0];
};

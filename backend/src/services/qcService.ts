import pool from "../config/db";

// ===== cube tests =====

export interface CubeTestInput {
  order_id?: number;
  mix_design_id?: number;
  sample_id?: string;
  test_date?: string;
  age_days?: number;
  compressive_strength?: number;
  passed?: boolean;
  remarks?: string;
}

export const getCubeTests = async (filters: { order_id?: number } = {}) => {
  const where = filters.order_id ? "WHERE order_id = $1" : "";
  const params = filters.order_id ? [filters.order_id] : [];
  const result = await pool.query(`SELECT * FROM cube_tests ${where} ORDER BY id DESC`, params);
  return result.rows;
};

export const createCubeTest = async (data: CubeTestInput) => {
  const result = await pool.query(
    `INSERT INTO cube_tests (order_id, mix_design_id, sample_id, test_date, age_days, compressive_strength, passed, remarks)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [data.order_id ?? null, data.mix_design_id ?? null, data.sample_id ?? null, data.test_date ?? null,
     data.age_days ?? null, data.compressive_strength ?? null, data.passed ?? null, data.remarks ?? null]
  );
  return result.rows[0];
};

export const deleteCubeTest = async (id: number) => {
  const result = await pool.query("DELETE FROM cube_tests WHERE id = $1 RETURNING *", [id]);
  return result.rows[0];
};

// ===== slump tests =====

export interface SlumpTestInput {
  order_id?: number;
  slump_value?: number;
  test_date?: string;
  passed?: boolean;
  remarks?: string;
}

export const getSlumpTests = async (filters: { order_id?: number } = {}) => {
  const where = filters.order_id ? "WHERE order_id = $1" : "";
  const params = filters.order_id ? [filters.order_id] : [];
  const result = await pool.query(`SELECT * FROM slump_tests ${where} ORDER BY id DESC`, params);
  return result.rows;
};

export const createSlumpTest = async (data: SlumpTestInput) => {
  const result = await pool.query(
    `INSERT INTO slump_tests (order_id, slump_value, test_date, passed, remarks)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [data.order_id ?? null, data.slump_value ?? null, data.test_date ?? null, data.passed ?? null, data.remarks ?? null]
  );
  return result.rows[0];
};

export const deleteSlumpTest = async (id: number) => {
  const result = await pool.query("DELETE FROM slump_tests WHERE id = $1 RETURNING *", [id]);
  return result.rows[0];
};

// ===== non-conformance =====

export interface NonConformanceInput {
  order_id?: number;
  description: string;
  severity?: string;
  status?: string;
  reported_by?: number;
}

export const getNonConformances = async (filters: { status?: string } = {}) => {
  const where = filters.status ? "WHERE status = $1" : "";
  const params = filters.status ? [filters.status] : [];
  const result = await pool.query(`SELECT * FROM non_conformance ${where} ORDER BY id DESC`, params);
  return result.rows;
};

export const createNonConformance = async (data: NonConformanceInput) => {
  const result = await pool.query(
    `INSERT INTO non_conformance (order_id, description, severity, status, reported_by)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [data.order_id ?? null, data.description, data.severity ?? "minor", data.status ?? "open", data.reported_by ?? null]
  );
  return result.rows[0];
};

export const updateNonConformance = async (id: number, data: Partial<NonConformanceInput>) => {
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;
  for (const key of ["description", "severity", "status"] as const) {
    if (data[key] !== undefined) {
      fields.push(`${key} = $${idx++}`);
      values.push(data[key]);
    }
  }
  if (fields.length === 0) return null;
  values.push(id);
  const result = await pool.query(
    `UPDATE non_conformance SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0];
};

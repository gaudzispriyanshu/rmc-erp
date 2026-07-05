import pool from "../config/db";

export interface MixDesignInput {
  grade_name: string;
  description?: string;
  approval_status?: string;
}

export interface MixRequirementInput {
  inventory_item_id: number;
  quantity_per_m3: number;
}

const MIX_FIELDS = ["grade_name", "description", "approval_status"] as const;

// ===== mix_designs CRUD =====

export const getAllMixDesigns = async () => {
  const result = await pool.query("SELECT * FROM mix_designs ORDER BY grade_name ASC");
  return result.rows;
};

export const getMixDesignById = async (id: number) => {
  const result = await pool.query("SELECT * FROM mix_designs WHERE id = $1", [id]);
  return result.rows[0];
};

export const createMixDesign = async (data: MixDesignInput) => {
  const result = await pool.query(
    `INSERT INTO mix_designs (grade_name, description, approval_status)
     VALUES ($1, $2, $3) RETURNING *`,
    [data.grade_name, data.description ?? null, data.approval_status ?? "pending"]
  );
  return result.rows[0];
};

export const updateMixDesign = async (id: number, data: Partial<MixDesignInput>) => {
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;
  for (const key of MIX_FIELDS) {
    if (data[key] !== undefined) {
      fields.push(`${key} = $${idx++}`);
      values.push(data[key]);
    }
  }
  if (fields.length === 0) return null;
  values.push(id);
  const result = await pool.query(
    `UPDATE mix_designs SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0];
};

export const deleteMixDesign = async (id: number) => {
  const result = await pool.query("DELETE FROM mix_designs WHERE id = $1 RETURNING *", [id]);
  return result.rows[0];
};

// ===== mix_requirements (bill of materials for a mix) =====

export const getMixRequirements = async (mixId: number) => {
  const result = await pool.query(
    `SELECT mr.*, ii.name AS item_name, ii.unit
     FROM mix_requirements mr
     JOIN inventory_items ii ON ii.id = mr.inventory_item_id
     WHERE mr.mix_id = $1
     ORDER BY ii.name ASC`,
    [mixId]
  );
  return result.rows;
};

// Replace the full set of requirements for a mix design (transactional).
export const setMixRequirements = async (mixId: number, requirements: MixRequirementInput[]) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM mix_requirements WHERE mix_id = $1", [mixId]);
    for (const req of requirements) {
      await client.query(
        `INSERT INTO mix_requirements (mix_id, inventory_item_id, quantity_per_m3)
         VALUES ($1, $2, $3)`,
        [mixId, req.inventory_item_id, req.quantity_per_m3]
      );
    }
    await client.query("COMMIT");
    return { mixId, count: requirements.length };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

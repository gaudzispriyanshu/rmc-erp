import pool from "../config/db";

export interface WorkflowInput {
  name: string;
  entity_type: string;
  description?: string;
  is_active?: boolean;
}

export interface WorkflowStateInput {
  name: string;
  slug: string;
  sort_order?: number;
  color?: string;
  is_initial?: boolean;
  is_terminal?: boolean;
}

export interface TransitionPair {
  from_state_id: number | null;
  to_state_id: number;
}

// ===== workflows =====

export const getAllWorkflows = async () => {
  const result = await pool.query("SELECT * FROM workflows ORDER BY id ASC");
  return result.rows;
};

export const getWorkflowById = async (id: number) => {
  const result = await pool.query("SELECT * FROM workflows WHERE id = $1", [id]);
  return result.rows[0];
};

// Full workflow bundle: workflow + ordered states + transitions. Used by the admin UI
// and by order/trip screens (fetched by entity_type).
export const getWorkflowFull = async (workflowId: number) => {
  const workflow = await getWorkflowById(workflowId);
  if (!workflow) return null;
  const [states, transitions] = await Promise.all([
    pool.query("SELECT * FROM workflow_states WHERE workflow_id = $1 ORDER BY sort_order ASC, id ASC", [workflowId]),
    pool.query("SELECT * FROM workflow_transitions WHERE workflow_id = $1 ORDER BY id ASC", [workflowId]),
  ]);
  return { workflow, states: states.rows, transitions: transitions.rows };
};

// The active workflow for an entity type (order/trip), with states + transitions.
export const getWorkflowByEntity = async (entityType: string) => {
  const wf = await pool.query(
    "SELECT * FROM workflows WHERE entity_type = $1 AND is_active = TRUE ORDER BY id ASC LIMIT 1",
    [entityType]
  );
  if (wf.rows.length === 0) return null;
  return getWorkflowFull(wf.rows[0].id);
};

export const createWorkflow = async (data: WorkflowInput) => {
  const result = await pool.query(
    `INSERT INTO workflows (name, entity_type, description, is_active)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [data.name, data.entity_type, data.description ?? null, data.is_active ?? true]
  );
  return result.rows[0];
};

export const updateWorkflow = async (id: number, data: Partial<WorkflowInput>) => {
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;
  for (const key of ["name", "entity_type", "description", "is_active"] as const) {
    if (data[key] !== undefined) {
      fields.push(`${key} = $${idx++}`);
      values.push(data[key]);
    }
  }
  if (fields.length === 0) return null;
  values.push(id);
  const result = await pool.query(
    `UPDATE workflows SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0];
};

export const deleteWorkflow = async (id: number) => {
  const result = await pool.query("DELETE FROM workflows WHERE id = $1 RETURNING *", [id]);
  return result.rows[0];
};

// ===== states =====

export const createState = async (workflowId: number, data: WorkflowStateInput) => {
  const result = await pool.query(
    `INSERT INTO workflow_states (workflow_id, name, slug, sort_order, color, is_initial, is_terminal)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [workflowId, data.name, data.slug, data.sort_order ?? 0, data.color ?? "#64748b", data.is_initial ?? false, data.is_terminal ?? false]
  );
  return result.rows[0];
};

export const updateState = async (stateId: number, data: Partial<WorkflowStateInput>) => {
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;
  for (const key of ["name", "slug", "sort_order", "color", "is_initial", "is_terminal"] as const) {
    if (data[key] !== undefined) {
      fields.push(`${key} = $${idx++}`);
      values.push(data[key]);
    }
  }
  if (fields.length === 0) return null;
  values.push(stateId);
  const result = await pool.query(
    `UPDATE workflow_states SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0];
};

export const deleteState = async (stateId: number) => {
  const result = await pool.query("DELETE FROM workflow_states WHERE id = $1 RETURNING *", [stateId]);
  return result.rows[0];
};

export const getStateById = async (stateId: number) => {
  const result = await pool.query("SELECT * FROM workflow_states WHERE id = $1", [stateId]);
  return result.rows[0];
};

export const getStateBySlug = async (entityType: string, slug: string) => {
  const result = await pool.query(
    `SELECT ws.* FROM workflow_states ws
     JOIN workflows w ON w.id = ws.workflow_id
     WHERE w.entity_type = $1 AND w.is_active = TRUE AND ws.slug = $2
     LIMIT 1`,
    [entityType, slug]
  );
  return result.rows[0];
};

// ===== transitions =====

// Replace all transitions for a workflow in one transaction (mirrors saveRolePermissions).
export const saveTransitions = async (workflowId: number, transitions: TransitionPair[]) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM workflow_transitions WHERE workflow_id = $1", [workflowId]);
    for (const t of transitions) {
      await client.query(
        `INSERT INTO workflow_transitions (workflow_id, from_state_id, to_state_id)
         VALUES ($1, $2, $3)`,
        [workflowId, t.from_state_id ?? null, t.to_state_id]
      );
    }
    await client.query("COMMIT");
    return { workflowId, count: transitions.length };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Core guard: is moving from `fromStateId` to `toStateId` a defined transition?
 * fromStateId === null tests an entry-point transition (record creation).
 * IS NOT DISTINCT FROM treats NULL = NULL as true, which plain `=` does not.
 */
export const isTransitionAllowed = async (fromStateId: number | null, toStateId: number): Promise<boolean> => {
  const result = await pool.query(
    `SELECT 1 FROM workflow_transitions
     WHERE from_state_id IS NOT DISTINCT FROM $1 AND to_state_id = $2
     LIMIT 1`,
    [fromStateId, toStateId]
  );
  return result.rows.length > 0;
};

// The states you may legally move to from a given state (for building the UI dropdown).
export const getAllowedNextStates = async (fromStateId: number | null) => {
  const result = await pool.query(
    `SELECT ws.* FROM workflow_transitions t
     JOIN workflow_states ws ON ws.id = t.to_state_id
     WHERE t.from_state_id IS NOT DISTINCT FROM $1
     ORDER BY ws.sort_order ASC`,
    [fromStateId]
  );
  return result.rows;
};

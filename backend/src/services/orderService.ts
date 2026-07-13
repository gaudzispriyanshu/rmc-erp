import pool from "../config/db";
import { isTransitionAllowed, getStateById } from "./workflowService";
import { AppError } from "../errors/AppError";
// Import the generated types (assuming you ran the gen types command)
// import { Database } from "../types/supabase";

// Update your interface to match the new database schema
export interface CreateOrderInput {
  customer_id: number;
  mix_design_id: number;
  quantity: number;
  delivery_address: string;
  delivery_date: string; // Required — user must provide this
}

export const createOrder = async (data: CreateOrderInput) => {
  const { customer_id, mix_design_id, quantity, delivery_address, delivery_date } = data;

  // workflow_state_id is set to the 'order' workflow's initial state, keeping the
  // legacy status string ('pending') in sync with the FK.
  const result = await pool.query(
    `
    INSERT INTO orders
      (customer_id, mix_design_id, quantity, delivery_address, delivery_date, status, workflow_state_id)
    VALUES
      ($1, $2, $3, $4, $5, 'pending',
        (SELECT ws.id FROM workflow_states ws
         JOIN workflows w ON w.id = ws.workflow_id
         WHERE w.entity_type = 'order' AND w.is_active = TRUE AND ws.is_initial = TRUE
         LIMIT 1))
    RETURNING *
    `,
    [customer_id, mix_design_id, quantity, delivery_address, delivery_date]
  );

  return result.rows[0];
};

/**
 * Move an order to a new workflow state, but only if a transition is defined from
 * its current state. Throws Error("NOT_FOUND") or Error("ILLEGAL_TRANSITION"); the
 * controller maps these to 404 / 400.
 */
export const changeOrderStatus = async (orderId: number, toStateId: number) => {
  const current = await pool.query("SELECT workflow_state_id FROM orders WHERE id = $1", [orderId]);
  if (current.rows.length === 0) throw new AppError(404, "Order not found");

  const fromStateId: number | null = current.rows[0].workflow_state_id;
  const allowed = await isTransitionAllowed(fromStateId, toStateId);
  if (!allowed) throw new AppError(400, "That status change is not allowed by the workflow.");

  const toState = await getStateById(toStateId);
  if (!toState) throw new AppError(400, "That status change is not allowed by the workflow.");

  const result = await pool.query(
    "UPDATE orders SET workflow_state_id = $1, status = $2 WHERE id = $3 RETURNING *",
    [toStateId, toState.slug, orderId]
  );
  return result.rows[0];
};

export const deleteOrder = async (id: number) => {
  const result = await pool.query("DELETE FROM orders WHERE id = $1 RETURNING *", [id]);
  return result.rows[0];
};

// Main list API with pagination and filters
export const getAllOrders = async (filters: {
  start?: number;
  end?: number;
  status?: string;
  mix_type_id?: number;
  date_from?: string;
  date_to?: string;
}) => {
  const conditions: string[] = [];
  const params: any[] = [];
  let idx = 1;

  // Status filter
  if (filters.status && filters.status !== 'all') {
    conditions.push(`orders.status = $${idx++}`);
    params.push(filters.status);
  }

  // Mix type filter
  if (filters.mix_type_id) {
    conditions.push(`orders.mix_design_id = $${idx++}`);
    params.push(filters.mix_type_id);
  }

  // Date range filter (on delivery_date)
  if (filters.date_from) {
    conditions.push(`orders.delivery_date >= $${idx++}`);
    params.push(filters.date_from);
  }
  if (filters.date_to) {
    conditions.push(`orders.delivery_date <= $${idx++}::date + interval '1 day'`);
    params.push(filters.date_to);
  }

  const whereClause = conditions.length > 0
    ? `WHERE ${conditions.join(' AND ')}`
    : '';

  // Pagination via start/end
  const start = filters.start || 0;
  const end = filters.end || 9;
  const limit = end - start + 1;
  const offset = start;

  // Single query: fetch paginated orders + total count via window function
  const ordersQuery = `
    SELECT 
      orders.*, 
      customers.name AS customer_name,
      mix_designs.grade_name AS concrete_grade,
      COUNT(*) OVER() AS _total_count
    FROM orders
    LEFT JOIN customers ON orders.customer_id = customers.id
    LEFT JOIN mix_designs ON orders.mix_design_id = mix_designs.id
    ${whereClause}
    ORDER BY orders.created_at DESC
    LIMIT $${idx++} OFFSET $${idx++}
  `;
  params.push(limit, offset);

  const ordersResult = await pool.query(ordersQuery, params);

  // Extract total from the first row (all rows carry the same window count).
  // If no rows matched, total is 0.
  const total = ordersResult.rows.length > 0
    ? parseInt(ordersResult.rows[0]._total_count)
    : 0;

  // Strip the internal _total_count field before returning
  const orders = ordersResult.rows.map(({ _total_count, ...rest }) => rest);

  return {
    orders,
    total,
    start,
    end: Math.min(end, start + orders.length - 1),
  };
};

export const getRecentOrders = async (limit: number = 5) => {
  const result = await pool.query(
    `
    SELECT 
      orders.*, 
      customers.name AS customer_name,
      mix_designs.grade_name AS concrete_grade
    FROM orders
    LEFT JOIN customers ON orders.customer_id = customers.id
    LEFT JOIN mix_designs ON orders.mix_design_id = mix_designs.id
    ORDER BY orders.created_at DESC
    LIMIT $1
    `,
    [limit]
  );

  return result.rows;
};

export const getOrderStats = async () => {
  const result = await pool.query(`
    SELECT
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE status = 'pending') AS pending,
      COUNT(*) FILTER (WHERE status = 'completed' AND created_at::date = CURRENT_DATE) AS completed_today
    FROM orders
  `);

  const row = result.rows[0];
  return {
    total: parseInt(row.total),
    pending: parseInt(row.pending),
    completedToday: parseInt(row.completed_today),
  };
};

export const getOrderById = async (id: number) => {
  const result = await pool.query(
    `
    SELECT
      orders.*,
      customers.name AS customer_name,
      mix_designs.grade_name AS concrete_grade
    FROM orders
    LEFT JOIN customers ON orders.customer_id = customers.id
    LEFT JOIN mix_designs ON orders.mix_design_id = mix_designs.id
    WHERE orders.id = $1
    `,
    [id]
  );

  return result.rows[0];
};

export interface UpdateOrderInput {
  customer_id?: number;
  mix_design_id?: number;
  quantity?: number;
  delivery_address?: string;
  status?: string;
}

export const updateOrder = async (id: number, data: UpdateOrderInput) => {
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  if (data.customer_id !== undefined) {
    fields.push(`customer_id = $${idx++}`);
    values.push(data.customer_id);
  }
  if (data.mix_design_id !== undefined) {
    fields.push(`mix_design_id = $${idx++}`);
    values.push(data.mix_design_id);
  }
  if (data.quantity !== undefined) {
    fields.push(`quantity = $${idx++}`);
    values.push(data.quantity);
  }
  if (data.delivery_address !== undefined) {
    fields.push(`delivery_address = $${idx++}`);
    values.push(data.delivery_address);
  }
  if (data.status !== undefined) {
    fields.push(`status = $${idx++}`);
    values.push(data.status);
  }

  if (fields.length === 0) {
    return null; // Nothing to update
  }

  values.push(id);
  const query = `
    UPDATE orders
    SET ${fields.join(", ")}
    WHERE id = $${idx}
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

// Mix designs list for filter dropdowns
export const getAllMixDesigns = async () => {
  const result = await pool.query(
    "SELECT id, grade_name FROM mix_designs ORDER BY grade_name ASC"
  );
  return result.rows;
};
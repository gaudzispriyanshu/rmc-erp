import pool from "../config/db";
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

  const result = await pool.query(
    `
    INSERT INTO orders 
      (customer_id, mix_design_id, quantity, delivery_address, delivery_date, status)
    VALUES 
      ($1, $2, $3, $4, $5, 'pending')
    RETURNING *
    `,
    [customer_id, mix_design_id, quantity, delivery_address, delivery_date]
  );

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

  // Get total count with filters
  const countQuery = `SELECT COUNT(*) AS total FROM orders ${whereClause}`;
  const countResult = await pool.query(countQuery, [...params]);
  const total = parseInt(countResult.rows[0].total);

  // Pagination via start/end
  const start = filters.start || 0;
  const end = filters.end || 9;
  const limit = end - start + 1;
  const offset = start;

  // Get orders
  const ordersQuery = `
    SELECT 
      orders.*, 
      customers.name AS customer_name,
      mix_designs.grade_name AS concrete_grade
    FROM orders
    LEFT JOIN customers ON orders.customer_id = customers.id
    LEFT JOIN mix_designs ON orders.mix_design_id = mix_designs.id
    ${whereClause}
    ORDER BY orders.created_at DESC
    LIMIT $${idx++} OFFSET $${idx++}
  `;
  params.push(limit, offset);

  const ordersResult = await pool.query(ordersQuery, params);

  return {
    orders: ordersResult.rows,
    total,
    start,
    end: Math.min(end, start + ordersResult.rows.length - 1),
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
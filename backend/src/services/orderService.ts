import pool from "../config/db";

export interface CreateOrderInput {
  customer_id: number;
  concrete_grade: string;
  quantity: number;
  delivery_address: string;
}

export interface UpdateOrderInput {
  concrete_grade?: string;
  quantity?: number;
  delivery_address?: string;
  status?: string;
}

export const createOrder = async (data: CreateOrderInput) => {
  const { customer_id, concrete_grade, quantity, delivery_address } = data;

  const result = await pool.query(
    `
    INSERT INTO orders 
      (customer_id, concrete_grade, quantity, delivery_address, status)
    VALUES 
      ($1, $2, $3, $4, 'pending')
    RETURNING *
    `,
    [customer_id, concrete_grade, quantity, delivery_address]
  );

  return result.rows[0];
};

export const getAllOrders = async () => {
  const result = await pool.query(
    `
    SELECT 
      orders.*, 
      customers.name AS customer_name
    FROM orders
    LEFT JOIN customers ON orders.customer_id = customers.id
    ORDER BY orders.id DESC
    `
  );

  return result.rows;
};

export const getOrderById = async (id: number) => {
  const result = await pool.query(
    `
    SELECT
      orders.*,
      customers.name AS customer_name
    FROM orders
    LEFT JOIN customers ON orders.customer_id = customers.id
    WHERE orders.id = $1
    `,
    [id]
  );

  return result.rows[0];
};

export const updateOrder = async (id: number, data: UpdateOrderInput) => {
  const { concrete_grade, quantity, delivery_address, status } = data;

  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (concrete_grade !== undefined) {
    fields.push(`concrete_grade = $${paramIndex++}`);
    values.push(concrete_grade);
  }
  if (quantity !== undefined) {
    fields.push(`quantity = $${paramIndex++}`);
    values.push(quantity);
  }
  if (delivery_address !== undefined) {
    fields.push(`delivery_address = $${paramIndex++}`);
    values.push(delivery_address);
  }
  if (status !== undefined) {
    fields.push(`status = $${paramIndex++}`);
    values.push(status);
  }

  if (fields.length === 0) {
    // Nothing to update
    return null;
  }

  values.push(id);
  const query = `
    UPDATE orders
    SET ${fields.join(", ")}
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

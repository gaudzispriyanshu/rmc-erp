import pool from "../config/db";

export interface CreateOrderInput {
  customer_id: number;
  concrete_grade: string;
  quantity: number;
  delivery_address: string;
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

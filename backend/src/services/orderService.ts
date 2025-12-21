import pool from "../config/db";
// Import the generated types (assuming you ran the gen types command)
// import { Database } from "../types/supabase"; 

// Update your interface to match the new database schema
export interface CreateOrderInput {
  customer_id: number;
  mix_design_id: number; // Changed from concrete_grade: string
  quantity: number;
  delivery_address: string;
}

export const createOrder = async (data: CreateOrderInput) => {
  const { customer_id, mix_design_id, quantity, delivery_address } = data;

  const result = await pool.query(
    `
    INSERT INTO orders 
      (customer_id, mix_design_id, quantity, delivery_address, status)
    VALUES 
      ($1, $2, $3, $4, 'pending')
    RETURNING *
    `,
    [customer_id, mix_design_id, quantity, delivery_address]
  );

  return result.rows[0];
};

export const getAllOrders = async () => {
  const result = await pool.query(
    `
    SELECT 
      orders.*, 
      customers.name AS customer_name,
      mix_designs.grade_name AS concrete_grade -- Join to get the name for the UI
    FROM orders
    LEFT JOIN customers ON orders.customer_id = customers.id
    LEFT JOIN mix_designs ON orders.mix_design_id = mix_designs.id
    ORDER BY orders.id DESC
    `
  );

  return result.rows;
};
import { Request, Response } from "express";
import { createOrder, getAllOrders } from "../services/orderService";
import { Database } from "../types/supabase";
type OrderWithCustomer = Database['public']['Tables']['orders']['Row'] & {
  customer_name?: string;
  concrete_grade?: string;
};

export const createOrderController = async (req: Request, res: Response) => {
  try {
    // 1. We now expect mix_design_id instead of just a string
    const { customer_id, mix_design_id, quantity, delivery_address } = req.body;

    // 2. Simple validation check
    if (!mix_design_id || !quantity) {
      return res.status(400).json({ error: "Mix design and quantity are required." });
    }

    const order = await createOrder({
      customer_id,
      mix_design_id,
      quantity,
      delivery_address
    });

    res.status(201).json(order);
  } catch (err: any) {
    console.error("Order Creation Error:", err.message);
    res.status(500).json({ error: "Failed to create order. Ensure the Mix Design ID is valid." });
  }
};

export const getAllOrdersController = async (req: Request, res: Response) => {
  try {
    const orders: OrderWithCustomer[] = await getAllOrders();
    res.status(200).json(orders);
  } catch (err: any) {
    console.error("Get Orders Error:", err.message);
    res.status(500).json({ error: "Failed to fetch orders." });
  }
};
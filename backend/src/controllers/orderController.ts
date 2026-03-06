import { Request, Response } from "express";
import { createOrder, getAllOrders, getOrderById, updateOrder } from "../services/orderService";
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

export const getOrderByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    const order = await getOrderById(parseInt(id));

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.status(200).json(order);
  } catch (err: any) {
    console.error("Get Order By ID Error:", err.message);
    res.status(500).json({ error: "Failed to fetch order." });
  }
};

export const updateOrderController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    // Check if body is empty
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: "No fields to update provided." });
    }

    // Check if order exists
    const existingOrder = await getOrderById(parseInt(id));
    if (!existingOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    const updatedOrder = await updateOrder(parseInt(id), req.body);

    if (!updatedOrder) {
      // Since we know the order exists, null means no valid fields were updated
      return res.status(400).json({ error: "No valid fields to update provided." });
    }

    res.status(200).json(updatedOrder);
  } catch (err: any) {
    console.error("Update Order Error:", err.message);
    res.status(500).json({ error: "Failed to update order." });
  }
};
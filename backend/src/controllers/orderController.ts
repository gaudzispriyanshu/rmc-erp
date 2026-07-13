import { Request, Response } from "express";
import { createOrder, getAllOrders, getOrderById, updateOrder, getRecentOrders, getOrderStats, getAllMixDesigns, changeOrderStatus, deleteOrder } from "../services/orderService";
import { Database } from "../types/supabase";
type OrderWithCustomer = Database['public']['Tables']['orders']['Row'] & {
  customer_name?: string;
  concrete_grade?: string;
};

export const createOrderController = async (req: Request, res: Response) => {
  try {
    // Shape, types, and ranges already enforced by validate({ body: createOrderSchema })
    const { customer_id, mix_design_id, quantity, delivery_address, delivery_date } = req.body;

    const order = await createOrder({
      customer_id,
      mix_design_id,
      quantity,
      delivery_address,
      delivery_date
    });

    res.status(201).json(order);
  } catch (err: any) {
    console.error("Order Creation Error:", err.message);
    res.status(500).json({ error: "Failed to create order." });
  }
};

export const getAllOrdersController = async (req: Request, res: Response) => {
  try {
    const filters = {
      start: req.query.start ? parseInt(req.query.start as string) : undefined,
      end: req.query.end ? parseInt(req.query.end as string) : undefined,
      status: req.query.status as string | undefined,
      mix_type_id: req.query.mix_type_id ? parseInt(req.query.mix_type_id as string) : undefined,
      date_from: req.query.date_from as string | undefined,
      date_to: req.query.date_to as string | undefined,
    };
    const result = await getAllOrders(filters);
    res.status(200).json(result);
  } catch (err: any) {
    console.error("Get Orders Error:", err.message);
    res.status(500).json({ error: "Failed to fetch orders." });
  }
};

export const getOrderByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

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

export const getRecentOrdersController = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    const orders = await getRecentOrders(limit);
    res.status(200).json(orders);
  } catch (err: any) {
    console.error("Get Recent Orders Error:", err.message);
    res.status(500).json({ error: "Failed to fetch recent orders." });
  }
};

export const getOrderStatsController = async (req: Request, res: Response) => {
  try {
    const stats = await getOrderStats();
    res.status(200).json(stats);
  } catch (err: any) {
    console.error("Get Order Stats Error:", err.message);
    res.status(500).json({ error: "Failed to fetch order stats." });
  }
};

export const getMixDesignsController = async (req: Request, res: Response) => {
  try {
    const mixDesigns = await getAllMixDesigns();
    res.status(200).json(mixDesigns);
  } catch (err: any) {
    console.error("Get Mix Designs Error:", err.message);
    res.status(500).json({ error: "Failed to fetch mix designs." });
  }
};

export const updateOrderController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

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

// Advance an order along its workflow. Body: { workflow_state_id }
export const changeOrderStatusController = async (req: Request, res: Response) => {
  try {
    const { workflow_state_id } = req.body;

    const order = await changeOrderStatus(parseInt(req.params.id), workflow_state_id);
    res.status(200).json(order);
  } catch (err: any) {
    if (err.message === "NOT_FOUND") return res.status(404).json({ error: "Order not found" });
    if (err.message === "ILLEGAL_TRANSITION") {
      return res.status(400).json({ error: "That status change is not allowed by the workflow." });
    }
    console.error("Change Order Status Error:", err.message);
    res.status(500).json({ error: "Failed to change order status." });
  }
};

export const deleteOrderController = async (req: Request, res: Response) => {
  try {
    const deleted = await deleteOrder(parseInt(req.params.id));
    if (!deleted) return res.status(404).json({ error: "Order not found" });
    res.status(200).json({ message: "Order deleted.", order: deleted });
  } catch (err: any) {
    console.error("Delete Order Error:", err.message);
    res.status(500).json({ error: "Failed to delete order." });
  }
};
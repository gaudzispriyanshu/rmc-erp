import { Request, Response } from "express";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  CreateOrderInput,
  UpdateOrderInput
} from "../services/orderService";

export const createOrderController = async (req: Request, res: Response) => {
  try {
    const data = req.body as CreateOrderInput;
    const order = await createOrder(data);
    res.json(order);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
};

export const getOrderByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const numericId = Number(id);

    if (isNaN(numericId)) {
      res.status(400).json({ error: "Invalid order ID" });
      return;
    }

    const order = await getOrderById(numericId);

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    res.json(order);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
};

export const updateOrderController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const numericId = Number(id);

    if (isNaN(numericId)) {
      res.status(400).json({ error: "Invalid order ID" });
      return;
    }

    const data = req.body as UpdateOrderInput;
    const updatedOrder = await updateOrder(numericId, data);

    if (updatedOrder === null) {
      res.status(400).json({ error: "No fields to update provided" });
      return;
    }

    if (!updatedOrder) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    res.json(updatedOrder);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
};

export const getOrdersController = async (_req: Request, res: Response) => {
  try {
    const orders = await getAllOrders();
    res.json(orders);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
};

import { Request, Response } from "express";
import { createOrder, getAllOrders, CreateOrderInput } from "../services/orderService";

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

export const getOrdersController = async (_req: Request, res: Response) => {
  try {
    const orders = await getAllOrders();
    res.json(orders);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
};

import { Request, Response } from "express";
import { createOrder, getAllOrders, getOrderById, updateOrder, getRecentOrders, getOrderStats, getAllMixDesigns, changeOrderStatus, deleteOrder } from "../services/orderService";
import { AppError } from "../errors/AppError";

// Controllers throw on error; Express 5 forwards rejections to the central
// errorHandler, which shapes the response (incl. FK/type -> 400, dup -> 409).

export const createOrderController = async (req: Request, res: Response) => {
  // Shape/types/ranges already enforced by validate({ body: createOrderSchema }).
  // A bad customer_id / mix_design_id surfaces as a FK error -> 400 via errorHandler.
  const { customer_id, mix_design_id, quantity, delivery_address, delivery_date } = req.body;
  const order = await createOrder({ customer_id, mix_design_id, quantity, delivery_address, delivery_date });
  res.status(201).json(order);
};

export const getAllOrdersController = async (req: Request, res: Response) => {
  const filters = {
    start: req.query.start ? parseInt(req.query.start as string) : undefined,
    end: req.query.end ? parseInt(req.query.end as string) : undefined,
    status: req.query.status as string | undefined,
    mix_type_id: req.query.mix_type_id ? parseInt(req.query.mix_type_id as string) : undefined,
    date_from: req.query.date_from as string | undefined,
    date_to: req.query.date_to as string | undefined,
  };
  res.status(200).json(await getAllOrders(filters));
};

export const getOrderByIdController = async (req: Request, res: Response) => {
  const order = await getOrderById(parseInt(req.params.id));
  if (!order) throw new AppError(404, "Order not found");
  res.status(200).json(order);
};

export const getRecentOrdersController = async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 5;
  res.status(200).json(await getRecentOrders(limit));
};

export const getOrderStatsController = async (_req: Request, res: Response) => {
  res.status(200).json(await getOrderStats());
};

export const getMixDesignsController = async (_req: Request, res: Response) => {
  res.status(200).json(await getAllMixDesigns());
};

export const updateOrderController = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const existingOrder = await getOrderById(id);
  if (!existingOrder) throw new AppError(404, "Order not found");

  const updatedOrder = await updateOrder(id, req.body);
  // Body schema guarantees >=1 field, so null here means the row vanished.
  if (!updatedOrder) throw new AppError(404, "Order not found");
  res.status(200).json(updatedOrder);
};

// Advance an order along its workflow. Body: { workflow_state_id }.
// changeOrderStatus throws AppError(404/400) for not-found / illegal transition.
export const changeOrderStatusController = async (req: Request, res: Response) => {
  const { workflow_state_id } = req.body;
  const order = await changeOrderStatus(parseInt(req.params.id), workflow_state_id);
  res.status(200).json(order);
};

export const deleteOrderController = async (req: Request, res: Response) => {
  const deleted = await deleteOrder(parseInt(req.params.id));
  if (!deleted) throw new AppError(404, "Order not found");
  res.status(200).json({ message: "Order deleted.", order: deleted });
};

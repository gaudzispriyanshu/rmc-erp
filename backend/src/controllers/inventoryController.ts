import { Request, Response } from "express";
import {
  getAllInventoryItems, getInventoryItemById, createInventoryItem, updateInventoryItem, deleteInventoryItem,
  getStockMovements, getLowStockItems, recordStockMovement, consumeStockForOrder,
} from "../services/inventoryService";
import { AppError } from "../errors/AppError";

export const getAllInventoryController = async (req: Request, res: Response) => {
  const result = await getAllInventoryItems({
    start: req.query.start ? parseInt(req.query.start as string) : undefined,
    end: req.query.end ? parseInt(req.query.end as string) : undefined,
    search: req.query.search as string | undefined,
  });
  res.status(200).json(result);
};

export const getLowStockController = async (_req: Request, res: Response) => {
  res.status(200).json(await getLowStockItems());
};

export const getStockMovementsController = async (req: Request, res: Response) => {
  const itemId = req.query.item_id ? parseInt(req.query.item_id as string) : undefined;
  res.status(200).json(await getStockMovements(itemId));
};

export const getInventoryByIdController = async (req: Request, res: Response) => {
  const item = await getInventoryItemById(parseInt(req.params.id));
  if (!item) throw new AppError(404, "Inventory item not found");
  res.status(200).json(item);
};

export const createInventoryController = async (req: Request, res: Response) => {
  res.status(201).json(await createInventoryItem(req.body));
};

export const updateInventoryController = async (req: Request, res: Response) => {
  const updated = await updateInventoryItem(parseInt(req.params.id), req.body);
  if (!updated) throw new AppError(404, "Inventory item not found");
  res.status(200).json(updated);
};

export const deleteInventoryController = async (req: Request, res: Response) => {
  const deleted = await deleteInventoryItem(parseInt(req.params.id));
  if (!deleted) throw new AppError(404, "Inventory item not found");
  res.status(200).json({ message: "Item deleted.", item: deleted });
};

// Manual stock adjustment (+/-).
export const recordStockMovementController = async (req: Request, res: Response) => {
  const { inventory_item_id, change_qty, reason, ref_type, ref_id } = req.body;
  res.status(201).json(await recordStockMovement({ inventory_item_id, change_qty, reason, ref_type, ref_id }));
};

// Auto-deduct raw materials for an order from its mix design's bill of materials.
// consumeStockForOrder throws AppError(404/400) for missing order / no mix design.
export const consumeForOrderController = async (req: Request, res: Response) => {
  const orderId = parseInt(req.params.orderId);
  res.status(200).json(await consumeStockForOrder(orderId));
};

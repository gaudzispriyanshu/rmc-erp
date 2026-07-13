import { Request, Response } from "express";
import {
  getAllInventoryItems, getInventoryItemById, createInventoryItem, updateInventoryItem, deleteInventoryItem,
  getStockMovements, getLowStockItems, recordStockMovement, consumeStockForOrder,
} from "../services/inventoryService";

export const getAllInventoryController = async (req: Request, res: Response) => {
  try {
    const result = await getAllInventoryItems({
      start: req.query.start ? parseInt(req.query.start as string) : undefined,
      end: req.query.end ? parseInt(req.query.end as string) : undefined,
      search: req.query.search as string | undefined,
    });
    res.status(200).json(result);
  } catch (err: any) {
    console.error("Get Inventory Error:", err.message);
    res.status(500).json({ error: "Failed to fetch inventory." });
  }
};

export const getLowStockController = async (_req: Request, res: Response) => {
  try {
    res.status(200).json(await getLowStockItems());
  } catch (err: any) {
    console.error("Get Low Stock Error:", err.message);
    res.status(500).json({ error: "Failed to fetch low stock items." });
  }
};

export const getStockMovementsController = async (req: Request, res: Response) => {
  try {
    const itemId = req.query.item_id ? parseInt(req.query.item_id as string) : undefined;
    res.status(200).json(await getStockMovements(itemId));
  } catch (err: any) {
    console.error("Get Stock Movements Error:", err.message);
    res.status(500).json({ error: "Failed to fetch stock movements." });
  }
};

export const getInventoryByIdController = async (req: Request, res: Response) => {
  try {
    const item = await getInventoryItemById(parseInt(req.params.id));
    if (!item) return res.status(404).json({ error: "Inventory item not found" });
    res.status(200).json(item);
  } catch (err: any) {
    console.error("Get Inventory Item Error:", err.message);
    res.status(500).json({ error: "Failed to fetch inventory item." });
  }
};

export const createInventoryController = async (req: Request, res: Response) => {
  try {
    res.status(201).json(await createInventoryItem(req.body));
  } catch (err: any) {
    console.error("Create Inventory Error:", err.message);
    res.status(500).json({ error: "Failed to create inventory item." });
  }
};

export const updateInventoryController = async (req: Request, res: Response) => {
  try {
    const updated = await updateInventoryItem(parseInt(req.params.id), req.body);
    if (!updated) return res.status(400).json({ error: "No valid fields to update, or item not found." });
    res.status(200).json(updated);
  } catch (err: any) {
    console.error("Update Inventory Error:", err.message);
    res.status(500).json({ error: "Failed to update inventory item." });
  }
};

export const deleteInventoryController = async (req: Request, res: Response) => {
  try {
    const deleted = await deleteInventoryItem(parseInt(req.params.id));
    if (!deleted) return res.status(404).json({ error: "Inventory item not found" });
    res.status(200).json({ message: "Item deleted.", item: deleted });
  } catch (err: any) {
    console.error("Delete Inventory Error:", err.message);
    res.status(500).json({ error: "Failed to delete inventory item." });
  }
};

// Manual stock adjustment (+/-).
export const recordStockMovementController = async (req: Request, res: Response) => {
  try {
    const { inventory_item_id, change_qty, reason, ref_type, ref_id } = req.body;
    res.status(201).json(await recordStockMovement({ inventory_item_id, change_qty, reason, ref_type, ref_id }));
  } catch (err: any) {
    console.error("Record Stock Movement Error:", err.message);
    res.status(500).json({ error: "Failed to record stock movement." });
  }
};

// Auto-deduct raw materials for an order from its mix design's bill of materials.
export const consumeForOrderController = async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.orderId);
    res.status(200).json(await consumeStockForOrder(orderId));
  } catch (err: any) {
    console.error("Consume Stock Error:", err.message);
    if (err.message?.includes("not found")) return res.status(404).json({ error: err.message });
    if (err.message?.includes("no mix design")) return res.status(400).json({ error: err.message });
    res.status(500).json({ error: "Failed to consume stock for order." });
  }
};

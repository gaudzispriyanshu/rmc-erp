import { z } from "zod";
import { paginationFields } from "./common";

// Field list matches InventoryItemInput / ITEM_FIELDS in inventoryService.ts
const itemFields = z.object({
  name: z.string().trim().min(1).max(150),
  current_stock: z.number().min(0).max(1_000_000_000),
  unit: z.string().trim().min(1).max(20),
  min_stock_level: z.number().min(0).max(1_000_000_000),
});

export const createInventoryItemSchema = itemFields.partial().required({ name: true });

export const updateInventoryItemSchema = itemFields
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "No fields to update provided.",
  });

// Manual stock adjustment: change_qty may be positive (in) or negative (out),
// but never zero.
export const recordStockMovementSchema = z.object({
  inventory_item_id: z.number().int().positive(),
  change_qty: z
    .number()
    .min(-1_000_000)
    .max(1_000_000)
    .refine((v) => v !== 0, { message: "change_qty cannot be zero." }),
  reason: z.string().trim().min(1).max(200).optional(),
  ref_type: z.string().trim().min(1).max(50).optional(),
  ref_id: z.number().int().positive().optional(),
});

export const listInventoryQuerySchema = z.object({
  ...paginationFields,
  search: z.string().max(100).optional(),
});

export const movementsQuerySchema = z.object({
  item_id: z.coerce.number().int().positive().optional(),
});

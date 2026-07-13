import { z } from "zod";
import { dateString, paginationFields } from "./common";

export const createOrderSchema = z.object({
  customer_id: z.number().int().positive().optional(), // nullable in DB today
  mix_design_id: z.number().int().positive(),
  // .positive() rejects 0 and negatives — the old `!quantity` check rejected
  // 0 by accident and let negatives straight through to SQL.
  quantity: z.number().positive().max(10_000),
  delivery_address: z.string().trim().min(1).max(500).optional(),
  delivery_date: dateString,
});

// Same fields as UpdateOrderInput in orderService.ts, all optional — but at
// least one must be present. Unknown keys are stripped before the refine, so
// a body of only garbage fields fails with the same message as {}.
export const updateOrderSchema = z
  .object({
    customer_id: z.number().int().positive(),
    mix_design_id: z.number().int().positive(),
    quantity: z.number().positive().max(10_000),
    delivery_address: z.string().trim().min(1).max(500),
    status: z.string().trim().min(1).max(50),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "No fields to update provided.",
  });

export const changeOrderStatusSchema = z.object({
  workflow_state_id: z.number().int().positive(),
});

// ?start=0&end=9&status=pending&mix_type_id=1&date_from=2026-01-01&date_to=2026-03-08
// Query values arrive as strings, hence z.coerce for the numeric ones.
export const listOrdersQuerySchema = z.object({
  ...paginationFields,
  status: z.string().max(50).optional(), // includes the "all" sentinel the UI sends
  mix_type_id: z.coerce.number().int().positive().optional(),
  date_from: dateString.optional(),
  date_to: dateString.optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;

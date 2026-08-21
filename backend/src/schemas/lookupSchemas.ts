import { z } from "zod";

export const ALLOWED_LOOKUP_ENTITIES = [
  "customers",
  "orders",
  "mix-designs",
  "mix_designs",
  "vehicles",
  "drivers",
  "inventory-items",
  "inventory_items",
  "roles",
] as const;

export const lookupEntityParamSchema = z.object({
  entity: z.enum(ALLOWED_LOOKUP_ENTITIES, {
    message: "Invalid lookup entity requested.",
  }),
});

// System parameter 'types' is used for batch lookups.
// .passthrough() allows all entity filters (search, status, customer_id, order_id, etc.) to pass dynamically.
export const lookupQuerySchema = z
  .object({
    types: z.string().optional(),
  })
  .passthrough();

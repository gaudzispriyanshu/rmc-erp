import { z } from "zod";
import { paginationFields } from "./common";

// Field list matches ChallanInput in challanService.ts
export const createChallanSchema = z.object({
  trip_id: z.number().int().positive().optional(),
  order_id: z.number().int().positive().optional(),
  vehicle_id: z.number().int().positive().optional(),
  driver_id: z.number().int().positive().optional(),
  quantity: z.number().positive().max(10_000).optional(),
});

export const listChallansQuerySchema = z.object({
  ...paginationFields,
  trip_id: z.coerce.number().int().positive().optional(),
});

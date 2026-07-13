import { z } from "zod";
import { dateString } from "./common";

// Field lists match CubeTestInput / SlumpTestInput / NonConformanceInput in qcService.ts

export const createCubeTestSchema = z.object({
  order_id: z.number().int().positive().optional(),
  mix_design_id: z.number().int().positive().optional(),
  sample_id: z.string().trim().min(1).max(50).optional(),
  test_date: dateString.optional(),
  age_days: z.number().int().positive().max(365).optional(),
  compressive_strength: z.number().positive().max(200).optional(), // N/mm²
  passed: z.boolean().optional(),
  remarks: z.string().trim().min(1).max(500).optional(),
});

export const createSlumpTestSchema = z.object({
  order_id: z.number().int().positive().optional(),
  slump_value: z.number().positive().max(300).optional(), // mm
  test_date: dateString.optional(),
  passed: z.boolean().optional(),
  remarks: z.string().trim().min(1).max(500).optional(),
});

// reported_by is deliberately absent — the controller sets it from req.user,
// so a client can't report an NC as someone else.
export const createNonConformanceSchema = z.object({
  order_id: z.number().int().positive().optional(),
  description: z.string().trim().min(1).max(1000),
  severity: z.string().trim().min(1).max(20).optional(),
  status: z.string().trim().min(1).max(30).optional(),
});

export const updateNonConformanceSchema = z
  .object({
    description: z.string().trim().min(1).max(1000),
    severity: z.string().trim().min(1).max(20),
    status: z.string().trim().min(1).max(30),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "No fields to update provided.",
  });

export const testsQuerySchema = z.object({
  order_id: z.coerce.number().int().positive().optional(),
});

export const nonConformanceQuerySchema = z.object({
  status: z.string().max(30).optional(),
});

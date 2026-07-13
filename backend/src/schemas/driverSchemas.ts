import { z } from "zod";
import { paginationFields } from "./common";

// Field list matches DriverInput / DRIVER_FIELDS in driverService.ts
const driverFields = z.object({
  name: z.string().trim().min(1).max(150),
  phone: z.string().trim().min(1).max(20),
  license_number: z.string().trim().min(1).max(50),
  status: z.string().trim().min(1).max(30),
  base_salary: z.number().min(0).max(10_000_000),
  per_trip_rate: z.number().min(0).max(1_000_000),
});

export const createDriverSchema = driverFields.partial().required({ name: true });

export const updateDriverSchema = driverFields
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "No fields to update provided.",
  });

export const listDriversQuerySchema = z.object({
  ...paginationFields,
  search: z.string().max(100).optional(),
  status: z.string().max(30).optional(),
});

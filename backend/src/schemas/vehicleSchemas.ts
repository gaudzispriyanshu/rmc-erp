import { z } from "zod";
import { paginationFields } from "./common";

// Field list matches VehicleInput / VEHICLE_FIELDS in vehicleService.ts
const vehicleFields = z.object({
  plate_number: z.string().trim().min(1).max(20),
  model: z.string().trim().min(1).max(100),
  capacity: z.number().positive().max(100), // transit mixer capacity in m³
  status: z.string().trim().min(1).max(30),
});

export const createVehicleSchema = vehicleFields.partial().required({ plate_number: true });

export const updateVehicleSchema = vehicleFields
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "No fields to update provided.",
  });

export const listVehiclesQuerySchema = z.object({
  ...paginationFields,
  search: z.string().max(100).optional(),
  status: z.string().max(30).optional(),
});

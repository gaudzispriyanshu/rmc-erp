import { z } from "zod";
import { dateTime, paginationFields } from "./common";

// Field lists match CreateTripInput / TRIP_UPDATE_FIELDS in tripService.ts

export const createTripSchema = z.object({
  order_id: z.number().int().positive(),
  vehicle_id: z.number().int().positive(),
  driver_id: z.number().int().positive(),
  // Optional: the controller defaults it to the authenticated user.
  assigned_by: z.number().int().positive().optional(),
  status: z.string().trim().min(1).max(30).optional(),
  eta: dateTime,
  started_at: dateTime.optional(),
  completed_at: dateTime.optional(),
  volume_delivered: z.number().positive().max(10_000).optional(), // m³
  fuel_cost_estimate: z.number().min(0).max(1_000_000).optional(),
});

export const updateTripSchema = z
  .object({
    order_id: z.number().int().positive(),
    vehicle_id: z.number().int().positive(),
    driver_id: z.number().int().positive(),
    eta: dateTime,
    started_at: dateTime,
    completed_at: dateTime,
    volume_delivered: z.number().positive().max(10_000),
    fuel_cost_estimate: z.number().min(0).max(1_000_000),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "No fields to update provided.",
  });

export const changeTripStatusSchema = z.object({
  workflow_state_id: z.number().int().positive(),
  note: z.string().trim().min(1).max(500).optional(),
  location: z.string().trim().min(1).max(200).optional(),
});

export const listTripsQuerySchema = z.object({
  ...paginationFields,
  status: z.string().max(30).optional(),
  order_id: z.coerce.number().int().positive().optional(),
  vehicle_id: z.coerce.number().int().positive().optional(),
  driver_id: z.coerce.number().int().positive().optional(),
  assigned_by: z.coerce.number().int().positive().optional(),
  started_at: z.string().max(40).optional(),
  completed_at: z.string().max(40).optional(),
});

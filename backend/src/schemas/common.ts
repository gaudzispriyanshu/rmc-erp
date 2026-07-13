import { z } from "zod";

// Route params always arrive as strings; z.coerce turns "42" into 42
// and rejects "abc", "-1", "1.5".
export const idParam = (key: string = "id") =>
  z.object({ [key]: z.coerce.number().int().positive() });

export const idParamSchema = idParam("id");

// Query values also arrive as strings — spread this into list-query schemas.
export const paginationFields = {
  start: z.coerce.number().int().min(0).optional(),
  end: z.coerce.number().int().min(0).max(10_000).optional(),
};

export const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");

// Timestamps (eta, started_at, ...) — the UI sends datetime-local strings,
// so accept anything Date.parse understands and hand the service a Date.
export const dateTime = z.coerce.date({
  error: "Invalid date/time — send a parseable date string.",
});

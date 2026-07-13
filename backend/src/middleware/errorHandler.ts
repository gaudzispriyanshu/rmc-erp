import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";

// Friendly messages for the unique constraints we know by name; any other
// unique violation falls back to a generic (still non-leaking) message.
const UNIQUE_MESSAGES: Record<string, string> = {
  customers_gst_number_key: "A customer with this GST number already exists.",
  drivers_license_number_key: "A driver with this license number already exists.",
  vehicles_plate_number_key: "A vehicle with this plate number already exists.",
  mix_designs_grade_name_key: "A mix design with this grade name already exists.",
  workflow_states_workflow_id_slug_key: "A state with this slug already exists in the workflow.",
};

// The single place every error becomes an HTTP response. Express 5 forwards
// rejected promises from async handlers here automatically, so controllers
// just throw (or let a DB error bubble) instead of each catching their own.
// Raw Postgres text is logged server-side but NEVER sent to the client.
// Must keep exactly 4 params — that's how Express recognizes error middleware.
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // 1. Intentional, typed errors thrown by controllers/services.
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // 2. Postgres driver errors carry a string `.code`. Translate the ones that
  //    really mean "bad request" into 4xx so they stop masquerading as 500s.
  switch (err?.code) {
    case "23505": // unique_violation
      return res.status(409).json({
        error: UNIQUE_MESSAGES[err.constraint] ?? "A record with these details already exists.",
      });
    case "23503": // foreign_key_violation — e.g. an order pointing at a customer_id that doesn't exist
      return res.status(400).json({ error: "A referenced record does not exist." });
    case "23502": // not_null_violation
      return res.status(400).json({ error: "A required field is missing." });
    case "23514": // check_violation
      return res.status(400).json({ error: "A value is outside its allowed range." });
    case "22P02": // invalid_text_representation (e.g. a non-numeric value for a numeric column)
    case "22007": // invalid_datetime_format
    case "22003": // numeric_value_out_of_range
      return res.status(400).json({ error: "One or more fields have an invalid value." });
  }

  // 3. Anything else is a genuine server fault — log the detail, tell the
  //    client nothing beyond a generic message.
  console.error(`[${req.method} ${req.originalUrl}]`, err?.message ?? err);
  res.status(500).json({ error: "Internal server error." });
};

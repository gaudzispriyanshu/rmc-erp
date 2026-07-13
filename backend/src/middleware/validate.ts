import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

interface ValidationSchemas {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
}

// Middleware factory, same shape as authorize(permission) in ./auth.
// Usage: router.post("/", authenticate, authorize("orders:write"), validate({ body: createOrderSchema }), controller)
export const validate = (schemas: ValidationSchemas) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Params first (bad URL beats bad body), then query, then body.
    for (const part of ["params", "query", "body"] as const) {
      const schema = schemas[part];
      if (!schema) continue;

      const result = schema.safeParse(req[part]);
      if (!result.success) {
        const details = result.error.issues.map((issue) => ({
          field: issue.path.join(".") || part,
          message: issue.message,
        }));
        // `error` stays a plain string — the shape the frontend already
        // reads everywhere; `details` is additive.
        return res.status(400).json({ error: details[0].message, details });
      }

      // Only body is writable: in Express 5 req.query is a read-only getter
      // and req.params is rebuilt per router layer. Replacing body with the
      // parsed result strips unknown keys, so services never see fields the
      // schema doesn't whitelist.
      if (part === "body") req.body = result.data;
    }

    next();
  };
};

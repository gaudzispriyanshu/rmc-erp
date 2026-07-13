import { Request, Response, NextFunction } from "express";

// Safety net for anything a controller's try/catch misses. Express 5
// forwards rejected promises from async handlers here automatically.
// Must keep exactly 4 params — that's how Express recognizes error middleware.
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`[${req.method} ${req.originalUrl}]`, err.message);
  res.status(500).json({ error: "Internal server error." });
};

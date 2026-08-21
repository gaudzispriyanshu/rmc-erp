import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import pool from "../config/db"; // Import your DB pool to check permissions

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface JwtPayload {
  userId: number;
  email: string;
  roleId: number;
}

// 1. Existing Authentication Middleware
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// 2. Dynamic Permission Guard
// Accepts a single slug string OR an array of slugs (OR logic — user needs ANY one to pass)
export const authorize = (requiredPermissions: string | string[]) => {
  const slugs = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const { roleId } = req.user;

      // Uses ANY($2) so a single slug or an array of slugs both work via OR logic
      const result = await pool.query(
        `SELECT p.action_slug 
         FROM permissions p
         JOIN role_permissions rp ON p.id = rp.permission_id
         WHERE rp.role_id = $1 AND p.action_slug = ANY($2)`,
        [roleId, slugs]
      );

      if (result.rows.length === 0) {
        return res.status(403).json({ 
          error: "Forbidden: You do not have permission to perform this action." 
        });
      }

      next();
    } catch (err) {
      console.error("Authorization Error:", err);
      return res.status(500).json({ error: "Internal server error during authorization." });
    }
  };
};
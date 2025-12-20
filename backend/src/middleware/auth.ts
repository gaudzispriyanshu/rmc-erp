import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Shared JWT Payload Interface
export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}

// Auth Middleware
const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ error: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    req.user = decoded; // <— this works because of your global.d.ts

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

export default auth;

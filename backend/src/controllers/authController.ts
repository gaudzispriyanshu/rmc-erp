import { Request, Response } from "express";
import { registerUser, loginUser, verifyUser } from "../services/authService";

// authService throws AppError with the right status; the central errorHandler
// turns it into the response, so no per-handler try/catch is needed.

export const register = async (req: Request, res: Response) => {
  const { email, password, name, role_id } = req.body;
  const data = await registerUser(email, password, name, role_id);
  res.json({ message: "User registered successfully", ...data });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const data = await loginUser(email, password);
  res.json({ message: "Login successful", ...data });
};

export const verify = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const user = await verifyUser(userId);
  res.json({ user });
};

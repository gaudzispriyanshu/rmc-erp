import { Request, Response } from "express";
import { registerUser, loginUser, verifyUser } from "../services/authService";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body;
    const data = await registerUser(email, password, name, role);
    res.json({ message: "User registered successfully", ...data });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const data = await loginUser(email, password);
    res.json({ message: "Login successful", ...data });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const verify = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const user = await verifyUser(userId);
    res.json({ user });
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
};

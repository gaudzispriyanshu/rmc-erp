import { Router } from "express";
import { register, login, verify } from "../controllers/authController";
import authMiddleware from "../middleware/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/verify", authMiddleware, verify);

export default router;

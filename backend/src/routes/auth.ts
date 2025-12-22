import { Router } from "express";
import { register, login, verify } from "../controllers/authController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/verify", authenticate, verify);

export default router;

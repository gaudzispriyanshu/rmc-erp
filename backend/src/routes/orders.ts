import { Router } from "express";
import authMiddleware from "../middleware/auth";
import {
  createOrderController,
  getOrdersController
} from "../controllers/orderController";

const router = Router();

router.post("/", authMiddleware, createOrderController);
router.get("/", authMiddleware, getOrdersController);

export default router;

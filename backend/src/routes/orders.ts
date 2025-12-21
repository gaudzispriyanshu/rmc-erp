import { Router } from "express";
import authMiddleware from "../middleware/auth";
import {
  createOrderController,
  getOrdersController,
  getOrderByIdController,
  updateOrderController
} from "../controllers/orderController";

const router = Router();

router.post("/", authMiddleware, createOrderController);
router.get("/", authMiddleware, getOrdersController);
router.get("/:id", authMiddleware, getOrderByIdController);
router.put("/:id", authMiddleware, updateOrderController);

export default router;

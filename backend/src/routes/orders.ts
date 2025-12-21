import { Router } from "express";
import authMiddleware from "../middleware/auth";
import {
  createOrderController,
  getAllOrdersController,
  getOrderByIdController,
  updateOrderController
} from "../controllers/orderController";

const router = Router();

router.post("/", authMiddleware, createOrderController);
router.get("/", authMiddleware, getAllOrdersController);
router.get("/:id", authMiddleware, getOrderByIdController);
router.put("/:id", authMiddleware, updateOrderController);

export default router;

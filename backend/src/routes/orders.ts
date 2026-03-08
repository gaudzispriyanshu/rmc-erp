import { Router } from "express";
import {
  createOrderController,
  getAllOrdersController,
  getOrderByIdController,
  updateOrderController,
  getRecentOrdersController
} from "../controllers/orderController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// 1. View all orders - requires 'orders:read' permission
router.get("/", authenticate, authorize("orders:read"), getAllOrdersController);

// 2. View recent orders (dashboard) - must be BEFORE /:id to avoid conflict
router.get("/recent", authenticate, authorize("orders:read"), getRecentOrdersController);

// 3. View a specific order - also requires 'orders:read'
router.get("/:id", authenticate, authorize("orders:read"), getOrderByIdController);

// 3. Create a new order - requires 'orders:write'
router.post("/", authenticate, authorize("orders:write"), createOrderController);

// 4. Update an existing order - requires 'orders:update'
router.put("/:id", authenticate, authorize("orders:update"), updateOrderController);

export default router;

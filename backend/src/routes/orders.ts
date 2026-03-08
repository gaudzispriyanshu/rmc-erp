import { Router } from "express";
import {
  createOrderController,
  getAllOrdersController,
  getOrderByIdController,
  updateOrderController,
  getRecentOrdersController,
  getOrderStatsController,
  getMixDesignsController
} from "../controllers/orderController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// Static routes FIRST (before /:id)

// 1. Order stats for dashboard cards
router.get("/stats", authenticate, authorize("orders:read"), getOrderStatsController);

// 2. Recent orders for dashboard
router.get("/recent", authenticate, authorize("orders:read"), getRecentOrdersController);

// 3. Mix designs list for filter dropdowns
router.get("/mix-designs", authenticate, authorize("orders:read"), getMixDesignsController);

// 4. List all orders with pagination + filters
//    ?start=0&end=9&status=pending&mix_type_id=1&date_from=2026-01-01&date_to=2026-03-08
router.get("/", authenticate, authorize("orders:read"), getAllOrdersController);

// 5. View a specific order
router.get("/:id", authenticate, authorize("orders:read"), getOrderByIdController);

// 6. Create a new order
router.post("/", authenticate, authorize("orders:write"), createOrderController);

// 7. Update an existing order
router.put("/:id", authenticate, authorize("orders:update"), updateOrderController);

export default router;

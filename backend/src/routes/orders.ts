import { Router } from "express";
import {
  createOrderController,
  getAllOrdersController,
  getOrderByIdController,
  updateOrderController,
  getRecentOrdersController,
  getOrderStatsController,
  getMixDesignsController,
  changeOrderStatusController,
  deleteOrderController
} from "../controllers/orderController";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { idempotency } from "../middleware/idempotency";
import { idParamSchema } from "../schemas/common";
import {
  createOrderSchema,
  updateOrderSchema,
  changeOrderStatusSchema,
  listOrdersQuerySchema
} from "../schemas/orderSchemas";

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
router.get("/", authenticate, authorize("orders:read"), validate({ query: listOrdersQuerySchema }), getAllOrdersController);

// 5. View a specific order
router.get("/:id", authenticate, authorize("orders:read"), validate({ params: idParamSchema }), getOrderByIdController);

// 6. Create a new order
router.post("/", authenticate, authorize("orders:write"), validate({ body: createOrderSchema }), idempotency, createOrderController);

// 7. Update an existing order
router.put("/:id", authenticate, authorize("orders:update"), validate({ params: idParamSchema, body: updateOrderSchema }), updateOrderController);

// 8. Advance an order along its workflow (transition-guarded)
router.patch("/:id/status", authenticate, authorize("orders:update"), validate({ params: idParamSchema, body: changeOrderStatusSchema }), changeOrderStatusController);

// 9. Delete an order
router.delete("/:id", authenticate, authorize("orders:delete"), validate({ params: idParamSchema }), deleteOrderController);

export default router;

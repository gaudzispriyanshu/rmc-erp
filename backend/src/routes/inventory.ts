import { Router } from "express";
import {
  getAllInventoryController, getInventoryByIdController, createInventoryController,
  updateInventoryController, deleteInventoryController,
  getLowStockController, getStockMovementsController, recordStockMovementController, consumeForOrderController,
} from "../controllers/inventoryController";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { idParam, idParamSchema } from "../schemas/common";
import {
  createInventoryItemSchema, updateInventoryItemSchema, recordStockMovementSchema,
  listInventoryQuerySchema, movementsQuerySchema,
} from "../schemas/inventorySchemas";

const router = Router();

// Static routes FIRST (before /:id)
router.get("/low-stock", authenticate, authorize("inventory:read"), getLowStockController);
router.get("/movements", authenticate, authorize("inventory:read"), validate({ query: movementsQuerySchema }), getStockMovementsController);
router.post("/movements", authenticate, authorize("inventory:update"), validate({ body: recordStockMovementSchema }), recordStockMovementController);
router.post("/consume/:orderId", authenticate, authorize("inventory:update"), validate({ params: idParam("orderId") }), consumeForOrderController);

router.get("/", authenticate, authorize("inventory:read"), validate({ query: listInventoryQuerySchema }), getAllInventoryController);
router.get("/:id", authenticate, authorize("inventory:read"), validate({ params: idParamSchema }), getInventoryByIdController);
router.post("/", authenticate, authorize("inventory:write"), validate({ body: createInventoryItemSchema }), createInventoryController);
router.put("/:id", authenticate, authorize("inventory:update"), validate({ params: idParamSchema, body: updateInventoryItemSchema }), updateInventoryController);
router.delete("/:id", authenticate, authorize("inventory:delete"), validate({ params: idParamSchema }), deleteInventoryController);

export default router;

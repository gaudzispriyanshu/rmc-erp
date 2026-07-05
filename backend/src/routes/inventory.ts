import { Router } from "express";
import {
  getAllInventoryController, getInventoryByIdController, createInventoryController,
  updateInventoryController, deleteInventoryController,
  getLowStockController, getStockMovementsController, recordStockMovementController, consumeForOrderController,
} from "../controllers/inventoryController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// Static routes FIRST (before /:id)
router.get("/low-stock", authenticate, authorize("inventory:read"), getLowStockController);
router.get("/movements", authenticate, authorize("inventory:read"), getStockMovementsController);
router.post("/movements", authenticate, authorize("inventory:update"), recordStockMovementController);
router.post("/consume/:orderId", authenticate, authorize("inventory:update"), consumeForOrderController);

router.get("/", authenticate, authorize("inventory:read"), getAllInventoryController);
router.get("/:id", authenticate, authorize("inventory:read"), getInventoryByIdController);
router.post("/", authenticate, authorize("inventory:write"), createInventoryController);
router.put("/:id", authenticate, authorize("inventory:update"), updateInventoryController);
router.delete("/:id", authenticate, authorize("inventory:delete"), deleteInventoryController);

export default router;

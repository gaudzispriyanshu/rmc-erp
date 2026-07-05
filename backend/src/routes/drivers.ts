import { Router } from "express";
import {
  getAllDriversController, getDriverByIdController, createDriverController,
  updateDriverController, deleteDriverController,
} from "../controllers/driverController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, authorize("drivers:read"), getAllDriversController);
router.get("/:id", authenticate, authorize("drivers:read"), getDriverByIdController);
router.post("/", authenticate, authorize("drivers:write"), createDriverController);
router.put("/:id", authenticate, authorize("drivers:update"), updateDriverController);
router.delete("/:id", authenticate, authorize("drivers:delete"), deleteDriverController);

export default router;

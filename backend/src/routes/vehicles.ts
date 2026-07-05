import { Router } from "express";
import {
  getAllVehiclesController, getVehicleByIdController, createVehicleController,
  updateVehicleController, deleteVehicleController,
} from "../controllers/vehicleController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, authorize("vehicles:read"), getAllVehiclesController);
router.get("/:id", authenticate, authorize("vehicles:read"), getVehicleByIdController);
router.post("/", authenticate, authorize("vehicles:write"), createVehicleController);
router.put("/:id", authenticate, authorize("vehicles:update"), updateVehicleController);
router.delete("/:id", authenticate, authorize("vehicles:delete"), deleteVehicleController);

export default router;

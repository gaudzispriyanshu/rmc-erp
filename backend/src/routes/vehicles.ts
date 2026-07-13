import { Router } from "express";
import {
  getAllVehiclesController, getVehicleByIdController, createVehicleController,
  updateVehicleController, deleteVehicleController,
} from "../controllers/vehicleController";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { idParamSchema } from "../schemas/common";
import {
  createVehicleSchema, updateVehicleSchema, listVehiclesQuerySchema,
} from "../schemas/vehicleSchemas";

const router = Router();

router.get("/", authenticate, authorize("vehicles:read"), validate({ query: listVehiclesQuerySchema }), getAllVehiclesController);
router.get("/:id", authenticate, authorize("vehicles:read"), validate({ params: idParamSchema }), getVehicleByIdController);
router.post("/", authenticate, authorize("vehicles:write"), validate({ body: createVehicleSchema }), createVehicleController);
router.put("/:id", authenticate, authorize("vehicles:update"), validate({ params: idParamSchema, body: updateVehicleSchema }), updateVehicleController);
router.delete("/:id", authenticate, authorize("vehicles:delete"), validate({ params: idParamSchema }), deleteVehicleController);

export default router;

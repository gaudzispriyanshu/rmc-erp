import { Router } from "express";
import {
  getAllDriversController, getDriverByIdController, createDriverController,
  updateDriverController, deleteDriverController,
} from "../controllers/driverController";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { idParamSchema } from "../schemas/common";
import {
  createDriverSchema, updateDriverSchema, listDriversQuerySchema,
} from "../schemas/driverSchemas";

const router = Router();

router.get("/", authenticate, authorize("drivers:read"), validate({ query: listDriversQuerySchema }), getAllDriversController);
router.get("/:id", authenticate, authorize("drivers:read"), validate({ params: idParamSchema }), getDriverByIdController);
router.post("/", authenticate, authorize("drivers:write"), validate({ body: createDriverSchema }), createDriverController);
router.put("/:id", authenticate, authorize("drivers:update"), validate({ params: idParamSchema, body: updateDriverSchema }), updateDriverController);
router.delete("/:id", authenticate, authorize("drivers:delete"), validate({ params: idParamSchema }), deleteDriverController);

export default router;

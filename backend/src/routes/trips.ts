import { Router } from "express";
import {
  createTripController, getAllTripController, getTripByIdController,
  updateTripController, deleteTripController, changeTripStatusController, getTripUpdatesController,
} from "../controllers/tripController";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { idParamSchema } from "../schemas/common";
import {
  createTripSchema, updateTripSchema, changeTripStatusSchema, listTripsQuerySchema,
} from "../schemas/tripSchemas";

const router = Router();

// 1. Get all trips
router.get("/", authenticate, authorize("trips:read"), validate({ query: listTripsQuerySchema }), getAllTripController);

// 2. Get a trip by id
router.get("/:id", authenticate, authorize("trips:read"), validate({ params: idParamSchema }), getTripByIdController);

// 3. Get a trip's audit trail
router.get("/:id/updates", authenticate, authorize("trips:read"), validate({ params: idParamSchema }), getTripUpdatesController);

// 4. Create a trip
router.post("/", authenticate, authorize("trips:write"), validate({ body: createTripSchema }), createTripController);

// 5. Update a trip
router.put("/:id", authenticate, authorize("trips:update"), validate({ params: idParamSchema, body: updateTripSchema }), updateTripController);

// 6. Advance a trip along its workflow (transition-guarded, writes audit row)
router.patch("/:id/status", authenticate, authorize("trips:update"), validate({ params: idParamSchema, body: changeTripStatusSchema }), changeTripStatusController);

// 7. Delete a trip
router.delete("/:id", authenticate, authorize("trips:delete"), validate({ params: idParamSchema }), deleteTripController);

export default router;

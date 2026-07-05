import { Router } from "express";
import {
  createTripController, getAllTripController, getTripByIdController,
  updateTripController, deleteTripController, changeTripStatusController, getTripUpdatesController,
} from "../controllers/tripController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// 1. Get all trips
router.get("/", authenticate, authorize("trips:read"), getAllTripController);

// 2. Get a trip by id
router.get("/:id", authenticate, authorize("trips:read"), getTripByIdController);

// 3. Get a trip's audit trail
router.get("/:id/updates", authenticate, authorize("trips:read"), getTripUpdatesController);

// 4. Create a trip
router.post("/", authenticate, authorize("trips:write"), createTripController);

// 5. Update a trip
router.put("/:id", authenticate, authorize("trips:update"), updateTripController);

// 6. Advance a trip along its workflow (transition-guarded, writes audit row)
router.patch("/:id/status", authenticate, authorize("trips:update"), changeTripStatusController);

// 7. Delete a trip
router.delete("/:id", authenticate, authorize("trips:delete"), deleteTripController);

export default router;

import { Router } from "express";
import {
  getCubeTestsController, createCubeTestController, deleteCubeTestController,
  getSlumpTestsController, createSlumpTestController, deleteSlumpTestController,
  getNonConformancesController, createNonConformanceController, updateNonConformanceController,
} from "../controllers/qcController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// Cube tests
router.get("/cube-tests", authenticate, authorize("quality:read"), getCubeTestsController);
router.post("/cube-tests", authenticate, authorize("quality:write"), createCubeTestController);
router.delete("/cube-tests/:id", authenticate, authorize("quality:delete"), deleteCubeTestController);

// Slump tests
router.get("/slump-tests", authenticate, authorize("quality:read"), getSlumpTestsController);
router.post("/slump-tests", authenticate, authorize("quality:write"), createSlumpTestController);
router.delete("/slump-tests/:id", authenticate, authorize("quality:delete"), deleteSlumpTestController);

// Non-conformance
router.get("/non-conformance", authenticate, authorize("quality:read"), getNonConformancesController);
router.post("/non-conformance", authenticate, authorize("quality:write"), createNonConformanceController);
router.put("/non-conformance/:id", authenticate, authorize("quality:update"), updateNonConformanceController);

export default router;

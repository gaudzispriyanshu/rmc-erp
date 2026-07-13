import { Router } from "express";
import {
  getCubeTestsController, createCubeTestController, deleteCubeTestController,
  getSlumpTestsController, createSlumpTestController, deleteSlumpTestController,
  getNonConformancesController, createNonConformanceController, updateNonConformanceController,
} from "../controllers/qcController";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { idParamSchema } from "../schemas/common";
import {
  createCubeTestSchema, createSlumpTestSchema,
  createNonConformanceSchema, updateNonConformanceSchema,
  testsQuerySchema, nonConformanceQuerySchema,
} from "../schemas/qcSchemas";

const router = Router();

// Cube tests
router.get("/cube-tests", authenticate, authorize("quality:read"), validate({ query: testsQuerySchema }), getCubeTestsController);
router.post("/cube-tests", authenticate, authorize("quality:write"), validate({ body: createCubeTestSchema }), createCubeTestController);
router.delete("/cube-tests/:id", authenticate, authorize("quality:delete"), validate({ params: idParamSchema }), deleteCubeTestController);

// Slump tests
router.get("/slump-tests", authenticate, authorize("quality:read"), validate({ query: testsQuerySchema }), getSlumpTestsController);
router.post("/slump-tests", authenticate, authorize("quality:write"), validate({ body: createSlumpTestSchema }), createSlumpTestController);
router.delete("/slump-tests/:id", authenticate, authorize("quality:delete"), validate({ params: idParamSchema }), deleteSlumpTestController);

// Non-conformance
router.get("/non-conformance", authenticate, authorize("quality:read"), validate({ query: nonConformanceQuerySchema }), getNonConformancesController);
router.post("/non-conformance", authenticate, authorize("quality:write"), validate({ body: createNonConformanceSchema }), createNonConformanceController);
router.put("/non-conformance/:id", authenticate, authorize("quality:update"), validate({ params: idParamSchema, body: updateNonConformanceSchema }), updateNonConformanceController);

export default router;

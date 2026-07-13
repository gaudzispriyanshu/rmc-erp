import { Router } from "express";
import {
  getAllWorkflowsController, getWorkflowController, createWorkflowController,
  updateWorkflowController, deleteWorkflowController,
  createStateController, updateStateController, deleteStateController,
  saveTransitionsController, getAllowedNextStatesController,
} from "../controllers/workflowController";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { idParam, idParamSchema } from "../schemas/common";
import {
  createWorkflowSchema, updateWorkflowSchema,
  createStateSchema, updateStateSchema, saveTransitionsSchema,
  listWorkflowsQuerySchema, allowedNextQuerySchema,
} from "../schemas/workflowSchemas";

const router = Router();

// Static routes FIRST (before /:id)
router.get("/allowed-next", authenticate, authorize("workflows:read"), validate({ query: allowedNextQuerySchema }), getAllowedNextStatesController);

// State edit/delete (two-segment paths, no clash with /:id)
router.put("/states/:stateId", authenticate, authorize("workflows:write"), validate({ params: idParam("stateId"), body: updateStateSchema }), updateStateController);
router.delete("/states/:stateId", authenticate, authorize("workflows:write"), validate({ params: idParam("stateId") }), deleteStateController);

router.get("/", authenticate, authorize("workflows:read"), validate({ query: listWorkflowsQuerySchema }), getAllWorkflowsController);
router.get("/:id", authenticate, authorize("workflows:read"), validate({ params: idParamSchema }), getWorkflowController);
router.post("/", authenticate, authorize("workflows:write"), validate({ body: createWorkflowSchema }), createWorkflowController);
router.put("/:id", authenticate, authorize("workflows:write"), validate({ params: idParamSchema, body: updateWorkflowSchema }), updateWorkflowController);
router.delete("/:id", authenticate, authorize("workflows:write"), validate({ params: idParamSchema }), deleteWorkflowController);

// Nested: states + transitions for a workflow
router.post("/:id/states", authenticate, authorize("workflows:write"), validate({ params: idParamSchema, body: createStateSchema }), createStateController);
router.put("/:id/transitions", authenticate, authorize("workflows:write"), validate({ params: idParamSchema, body: saveTransitionsSchema }), saveTransitionsController);

export default router;

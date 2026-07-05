import { Router } from "express";
import {
  getAllWorkflowsController, getWorkflowController, createWorkflowController,
  updateWorkflowController, deleteWorkflowController,
  createStateController, updateStateController, deleteStateController,
  saveTransitionsController, getAllowedNextStatesController,
} from "../controllers/workflowController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// Static routes FIRST (before /:id)
router.get("/allowed-next", authenticate, authorize("workflows:read"), getAllowedNextStatesController);

// State edit/delete (two-segment paths, no clash with /:id)
router.put("/states/:stateId", authenticate, authorize("workflows:write"), updateStateController);
router.delete("/states/:stateId", authenticate, authorize("workflows:write"), deleteStateController);

router.get("/", authenticate, authorize("workflows:read"), getAllWorkflowsController);
router.get("/:id", authenticate, authorize("workflows:read"), getWorkflowController);
router.post("/", authenticate, authorize("workflows:write"), createWorkflowController);
router.put("/:id", authenticate, authorize("workflows:write"), updateWorkflowController);
router.delete("/:id", authenticate, authorize("workflows:write"), deleteWorkflowController);

// Nested: states + transitions for a workflow
router.post("/:id/states", authenticate, authorize("workflows:write"), createStateController);
router.put("/:id/transitions", authenticate, authorize("workflows:write"), saveTransitionsController);

export default router;

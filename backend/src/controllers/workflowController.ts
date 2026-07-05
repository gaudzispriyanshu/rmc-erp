import { Request, Response } from "express";
import {
  getAllWorkflows, getWorkflowFull, getWorkflowByEntity, createWorkflow, updateWorkflow, deleteWorkflow,
  createState, updateState, deleteState, saveTransitions, getAllowedNextStates,
} from "../services/workflowService";

export const getAllWorkflowsController = async (req: Request, res: Response) => {
  try {
    // ?entity_type=order returns the full active workflow bundle for that entity.
    if (req.query.entity_type) {
      const bundle = await getWorkflowByEntity(req.query.entity_type as string);
      if (!bundle) return res.status(404).json({ error: "No active workflow for that entity type." });
      return res.status(200).json(bundle);
    }
    res.status(200).json(await getAllWorkflows());
  } catch (err: any) {
    console.error("Get Workflows Error:", err.message);
    res.status(500).json({ error: "Failed to fetch workflows." });
  }
};

export const getWorkflowController = async (req: Request, res: Response) => {
  try {
    const bundle = await getWorkflowFull(parseInt(req.params.id));
    if (!bundle) return res.status(404).json({ error: "Workflow not found" });
    res.status(200).json(bundle);
  } catch (err: any) {
    console.error("Get Workflow Error:", err.message);
    res.status(500).json({ error: "Failed to fetch workflow." });
  }
};

export const createWorkflowController = async (req: Request, res: Response) => {
  try {
    const { name, entity_type } = req.body;
    if (!name || !entity_type) return res.status(400).json({ error: "name and entity_type are required." });
    res.status(201).json(await createWorkflow(req.body));
  } catch (err: any) {
    console.error("Create Workflow Error:", err.message);
    res.status(500).json({ error: "Failed to create workflow." });
  }
};

export const updateWorkflowController = async (req: Request, res: Response) => {
  try {
    const updated = await updateWorkflow(parseInt(req.params.id), req.body);
    if (!updated) return res.status(400).json({ error: "No valid fields to update, or workflow not found." });
    res.status(200).json(updated);
  } catch (err: any) {
    console.error("Update Workflow Error:", err.message);
    res.status(500).json({ error: "Failed to update workflow." });
  }
};

export const deleteWorkflowController = async (req: Request, res: Response) => {
  try {
    const deleted = await deleteWorkflow(parseInt(req.params.id));
    if (!deleted) return res.status(404).json({ error: "Workflow not found" });
    res.status(200).json({ message: "Workflow deleted.", workflow: deleted });
  } catch (err: any) {
    console.error("Delete Workflow Error:", err.message);
    res.status(500).json({ error: "Failed to delete workflow." });
  }
};

// ===== states =====

export const createStateController = async (req: Request, res: Response) => {
  try {
    const { name, slug } = req.body;
    if (!name || !slug) return res.status(400).json({ error: "name and slug are required." });
    res.status(201).json(await createState(parseInt(req.params.id), req.body));
  } catch (err: any) {
    console.error("Create State Error:", err.message);
    if (err.code === "23505") return res.status(409).json({ error: "A state with this slug already exists in the workflow." });
    res.status(500).json({ error: "Failed to create state." });
  }
};

export const updateStateController = async (req: Request, res: Response) => {
  try {
    const updated = await updateState(parseInt(req.params.stateId), req.body);
    if (!updated) return res.status(400).json({ error: "No valid fields to update, or state not found." });
    res.status(200).json(updated);
  } catch (err: any) {
    console.error("Update State Error:", err.message);
    res.status(500).json({ error: "Failed to update state." });
  }
};

export const deleteStateController = async (req: Request, res: Response) => {
  try {
    const deleted = await deleteState(parseInt(req.params.stateId));
    if (!deleted) return res.status(404).json({ error: "State not found" });
    res.status(200).json({ message: "State deleted.", state: deleted });
  } catch (err: any) {
    console.error("Delete State Error:", err.message);
    res.status(500).json({ error: "Failed to delete state." });
  }
};

// ===== transitions =====

export const saveTransitionsController = async (req: Request, res: Response) => {
  try {
    const { transitions } = req.body;
    if (!Array.isArray(transitions)) return res.status(400).json({ error: "transitions must be an array." });
    res.status(200).json(await saveTransitions(parseInt(req.params.id), transitions));
  } catch (err: any) {
    console.error("Save Transitions Error:", err.message);
    res.status(500).json({ error: "Failed to save transitions." });
  }
};

export const getAllowedNextStatesController = async (req: Request, res: Response) => {
  try {
    const fromStateId = req.query.from_state_id ? parseInt(req.query.from_state_id as string) : null;
    res.status(200).json(await getAllowedNextStates(fromStateId));
  } catch (err: any) {
    console.error("Get Allowed Next States Error:", err.message);
    res.status(500).json({ error: "Failed to fetch allowed next states." });
  }
};

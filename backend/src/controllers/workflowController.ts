import { Request, Response } from "express";
import {
  getAllWorkflows, getWorkflowFull, getWorkflowByEntity, createWorkflow, updateWorkflow, deleteWorkflow,
  createState, updateState, deleteState, saveTransitions, getAllowedNextStates,
} from "../services/workflowService";
import { AppError } from "../errors/AppError";

export const getAllWorkflowsController = async (req: Request, res: Response) => {
  // ?entity_type=order returns the full active workflow bundle for that entity.
  if (req.query.entity_type) {
    const bundle = await getWorkflowByEntity(req.query.entity_type as string);
    if (!bundle) throw new AppError(404, "No active workflow for that entity type.");
    return res.status(200).json(bundle);
  }
  res.status(200).json(await getAllWorkflows());
};

export const getWorkflowController = async (req: Request, res: Response) => {
  const bundle = await getWorkflowFull(parseInt(req.params.id));
  if (!bundle) throw new AppError(404, "Workflow not found");
  res.status(200).json(bundle);
};

export const createWorkflowController = async (req: Request, res: Response) => {
  res.status(201).json(await createWorkflow(req.body));
};

export const updateWorkflowController = async (req: Request, res: Response) => {
  const updated = await updateWorkflow(parseInt(req.params.id), req.body);
  if (!updated) throw new AppError(404, "Workflow not found");
  res.status(200).json(updated);
};

export const deleteWorkflowController = async (req: Request, res: Response) => {
  const deleted = await deleteWorkflow(parseInt(req.params.id));
  if (!deleted) throw new AppError(404, "Workflow not found");
  res.status(200).json({ message: "Workflow deleted.", workflow: deleted });
};

// ===== states =====

// A duplicate slug within a workflow surfaces as a unique violation -> 409.
export const createStateController = async (req: Request, res: Response) => {
  res.status(201).json(await createState(parseInt(req.params.id), req.body));
};

export const updateStateController = async (req: Request, res: Response) => {
  const updated = await updateState(parseInt(req.params.stateId), req.body);
  if (!updated) throw new AppError(404, "State not found");
  res.status(200).json(updated);
};

export const deleteStateController = async (req: Request, res: Response) => {
  const deleted = await deleteState(parseInt(req.params.stateId));
  if (!deleted) throw new AppError(404, "State not found");
  res.status(200).json({ message: "State deleted.", state: deleted });
};

// ===== transitions =====

export const saveTransitionsController = async (req: Request, res: Response) => {
  const { transitions } = req.body;
  res.status(200).json(await saveTransitions(parseInt(req.params.id), transitions));
};

export const getAllowedNextStatesController = async (req: Request, res: Response) => {
  const fromStateId = req.query.from_state_id ? parseInt(req.query.from_state_id as string) : null;
  res.status(200).json(await getAllowedNextStates(fromStateId));
};

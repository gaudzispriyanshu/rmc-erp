import { z } from "zod";

// Field lists match WorkflowInput / WorkflowStateInput / TransitionPair in workflowService.ts

const workflowFields = z.object({
  name: z.string().trim().min(1).max(100),
  entity_type: z.string().trim().min(1).max(50),
  description: z.string().trim().min(1).max(500),
  is_active: z.boolean(),
});

export const createWorkflowSchema = workflowFields.partial().required({
  name: true,
  entity_type: true,
});

export const updateWorkflowSchema = workflowFields
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "No fields to update provided.",
  });

const stateFields = z.object({
  name: z.string().trim().min(1).max(100),
  slug: z.string().trim().min(1).max(50),
  sort_order: z.number().int().min(0).max(1000),
  color: z.string().trim().min(1).max(20),
  is_initial: z.boolean(),
  is_terminal: z.boolean(),
});

export const createStateSchema = stateFields.partial().required({
  name: true,
  slug: true,
});

export const updateStateSchema = stateFields
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "No fields to update provided.",
  });

export const saveTransitionsSchema = z.object({
  transitions: z
    .array(
      z.object({
        from_state_id: z.number().int().positive().nullable(),
        to_state_id: z.number().int().positive(),
      })
    )
    .max(200),
});

export const listWorkflowsQuerySchema = z.object({
  entity_type: z.string().max(50).optional(),
});

export const allowedNextQuerySchema = z.object({
  from_state_id: z.coerce.number().int().positive().optional(),
});

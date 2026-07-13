import { z } from "zod";

// Field list matches MixDesignInput / MIX_FIELDS in mixDesignService.ts
const mixDesignFields = z.object({
  grade_name: z.string().trim().min(1).max(100),
  description: z.string().trim().min(1).max(500),
  approval_status: z.string().trim().min(1).max(30),
});

export const createMixDesignSchema = mixDesignFields.partial().required({ grade_name: true });

export const updateMixDesignSchema = mixDesignFields
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "No fields to update provided.",
  });

// Bill of materials for a mix — matches MixRequirementInput
export const setMixRequirementsSchema = z.object({
  requirements: z
    .array(
      z.object({
        inventory_item_id: z.number().int().positive(),
        quantity_per_m3: z.number().positive().max(100_000),
      })
    )
    .max(100),
});

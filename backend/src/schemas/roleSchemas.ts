import { z } from "zod";

export const createRoleSchema = z.object({
  name: z.string().trim().min(1).max(50),
  description: z.string().trim().min(1).max(200).optional(),
});

export const saveRolePermissionsSchema = z.object({
  permissionIds: z.array(z.number().int().positive()).max(500),
});

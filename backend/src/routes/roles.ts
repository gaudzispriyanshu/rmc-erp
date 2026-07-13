import { Router } from "express";
import {
    getAllRolesController,
    createRoleController,
    deleteRoleController,
    getAllPermissionsController,
    getRolePermissionMatrixController,
    saveRolePermissionsController,
} from "../controllers/roleController";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { idParamSchema } from "../schemas/common";
import { createRoleSchema, saveRolePermissionsSchema } from "../schemas/roleSchemas";

const router = Router();

// Static routes FIRST (before /:id)
// Get all permissions
router.get("/permissions", authenticate, authorize("admin:read"), getAllPermissionsController);

// Get the full matrix (roles + permissions + mappings) for the UI
router.get("/matrix", authenticate, authorize("admin:read"), getRolePermissionMatrixController);

// Get all roles
router.get("/", authenticate, authorize("admin:read"), getAllRolesController);

// Create a new role
router.post("/", authenticate, authorize("admin:write"), validate({ body: createRoleSchema }), createRoleController);

// Delete a role
router.delete("/:id", authenticate, authorize("admin:delete"), validate({ params: idParamSchema }), deleteRoleController);

// Save permissions for a specific role
router.put("/:id/permissions", authenticate, authorize("admin:update"), validate({ params: idParamSchema, body: saveRolePermissionsSchema }), saveRolePermissionsController);

export default router;

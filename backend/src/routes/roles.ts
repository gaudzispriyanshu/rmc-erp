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

const router = Router();

// Static routes FIRST (before /:id)
// Get all permissions
router.get("/permissions", authenticate, authorize("admin:read"), getAllPermissionsController);

// Get the full matrix (roles + permissions + mappings) for the UI
router.get("/matrix", authenticate, authorize("admin:read"), getRolePermissionMatrixController);

// Get all roles
router.get("/", authenticate, authorize("admin:read"), getAllRolesController);

// Create a new role
router.post("/", authenticate, authorize("admin:write"), createRoleController);

// Delete a role
router.delete("/:id", authenticate, authorize("admin:delete"), deleteRoleController);

// Save permissions for a specific role
router.put("/:id/permissions", authenticate, authorize("admin:update"), saveRolePermissionsController);

export default router;


import { Request, Response } from "express";
import {
    getAllRoles,
    createRole,
    deleteRole,
    getAllPermissions,
    getRolePermissionMatrix,
    saveRolePermissions,
} from "../services/roleService";

export const getAllRolesController = async (req: Request, res: Response) => {
    try {
        const roles = await getAllRoles();
        res.status(200).json(roles);
    } catch (err: any) {
        console.error("Get Roles Error:", err.message);
        res.status(500).json({ error: "Failed to fetch roles." });
    }
};

export const createRoleController = async (req: Request, res: Response) => {
    try {
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).json({ error: "Role name is required." });
        }
        const role = await createRole(name, description);
        res.status(201).json(role);
    } catch (err: any) {
        console.error("Create Role Error:", err.message);
        if (err.message.includes("duplicate") || err.code === "23505") {
            return res.status(409).json({ error: "Role with this name already exists." });
        }
        res.status(500).json({ error: "Failed to create role." });
    }
};

export const deleteRoleController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deleted = await deleteRole(parseInt(id));
        if (!deleted) {
            return res.status(404).json({ error: "Role not found." });
        }
        res.status(200).json({ message: "Role deleted.", role: deleted });
    } catch (err: any) {
        console.error("Delete Role Error:", err.message);
        res.status(500).json({ error: "Failed to delete role." });
    }
};

export const getAllPermissionsController = async (req: Request, res: Response) => {
    try {
        const permissions = await getAllPermissions();
        res.status(200).json(permissions);
    } catch (err: any) {
        console.error("Get Permissions Error:", err.message);
        res.status(500).json({ error: "Failed to fetch permissions." });
    }
};

export const getRolePermissionMatrixController = async (req: Request, res: Response) => {
    try {
        const [roles, permissions, matrix] = await Promise.all([
            getAllRoles(),
            getAllPermissions(),
            getRolePermissionMatrix(),
        ]);
        res.status(200).json({ roles, permissions, matrix });
    } catch (err: any) {
        console.error("Get Matrix Error:", err.message);
        res.status(500).json({ error: "Failed to fetch role-permission matrix." });
    }
};

export const saveRolePermissionsController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { permissionIds } = req.body;

        if (!Array.isArray(permissionIds)) {
            return res.status(400).json({ error: "permissionIds must be an array." });
        }

        const result = await saveRolePermissions(parseInt(id), permissionIds);
        res.status(200).json({ message: "Permissions updated.", ...result });
    } catch (err: any) {
        console.error("Save Permissions Error:", err.message);
        res.status(500).json({ error: "Failed to save permissions." });
    }
};

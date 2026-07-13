import { Request, Response } from "express";
import {
    getAllRoles,
    createRole,
    deleteRole,
    getAllPermissions,
    getRolePermissionMatrix,
    saveRolePermissions,
} from "../services/roleService";
import { AppError } from "../errors/AppError";

export const getAllRolesController = async (_req: Request, res: Response) => {
    res.status(200).json(await getAllRoles());
};

// A duplicate role name surfaces as a unique violation -> 409 via errorHandler.
export const createRoleController = async (req: Request, res: Response) => {
    const { name, description } = req.body;
    const role = await createRole(name, description);
    res.status(201).json(role);
};

export const deleteRoleController = async (req: Request, res: Response) => {
    const deleted = await deleteRole(parseInt(req.params.id));
    if (!deleted) throw new AppError(404, "Role not found.");
    res.status(200).json({ message: "Role deleted.", role: deleted });
};

export const getAllPermissionsController = async (_req: Request, res: Response) => {
    res.status(200).json(await getAllPermissions());
};

export const getRolePermissionMatrixController = async (_req: Request, res: Response) => {
    const [roles, permissions, matrix] = await Promise.all([
        getAllRoles(),
        getAllPermissions(),
        getRolePermissionMatrix(),
    ]);
    res.status(200).json({ roles, permissions, matrix });
};

export const saveRolePermissionsController = async (req: Request, res: Response) => {
    const { permissionIds } = req.body;
    const result = await saveRolePermissions(parseInt(req.params.id), permissionIds);
    res.status(200).json({ message: "Permissions updated.", ...result });
};

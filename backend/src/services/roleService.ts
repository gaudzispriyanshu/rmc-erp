import pool from "../config/db";

// ===== ROLES =====

export const getAllRoles = async () => {
    const result = await pool.query(
        "SELECT * FROM roles ORDER BY id ASC"
    );
    return result.rows;
};

export const createRole = async (name: string, description?: string) => {
    const result = await pool.query(
        "INSERT INTO roles (name, description) VALUES ($1, $2) RETURNING *",
        [name, description || null]
    );
    return result.rows[0];
};

export const deleteRole = async (id: number) => {
    const result = await pool.query(
        "DELETE FROM roles WHERE id = $1 RETURNING *",
        [id]
    );
    return result.rows[0];
};

// ===== PERMISSIONS =====

export const getAllPermissions = async () => {
    const result = await pool.query(
        "SELECT * FROM permissions ORDER BY id ASC"
    );
    return result.rows;
};

// ===== ROLE-PERMISSION MATRIX =====

// Returns all role_permissions as a flat list for building the matrix on the frontend
export const getRolePermissionMatrix = async () => {
    const result = await pool.query(
        `SELECT rp.role_id, rp.permission_id, p.action_slug
     FROM role_permissions rp
     JOIN permissions p ON rp.permission_id = p.id
     ORDER BY rp.role_id, rp.permission_id`
    );
    return result.rows;
};

// Replace all permissions for a given role
export const saveRolePermissions = async (roleId: number, permissionIds: number[]) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // Delete existing permissions for this role
        await client.query(
            "DELETE FROM role_permissions WHERE role_id = $1",
            [roleId]
        );

        // Insert new permissions
        if (permissionIds.length > 0) {
            const values = permissionIds
                .map((pid, i) => `($1, $${i + 2})`)
                .join(", ");
            const params = [roleId, ...permissionIds];
            await client.query(
                `INSERT INTO role_permissions (role_id, permission_id) VALUES ${values}`,
                params
            );
        }

        await client.query("COMMIT");
        return { roleId, permissionIds };
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db";

export interface JwtPayload {
  userId: number;
  email: string;
  roleId: number;
}

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const registerUser = async (
  email: string,
  password: string,
  name: string,
  roleName: string = "staff"
) => {
  const userExists = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );

  if (userExists.rows.length > 0) {
    throw new Error("User already exists");
  }

  // 1. Get role_id from roles table
  const roleResult = await pool.query(
    "SELECT id FROM roles WHERE name = $1",
    [roleName]
  );

  let roleId: number;

  if (roleResult.rows.length === 0) {
     // Optional: Create role if it doesn't exist? Or throw error?
     // For now, let's assume we want to fail if role doesn't exist,
     // BUT for safety/dev experience, maybe fallback to a default or insert it.
     // Given the instructions, let's throw or handle gracefully.
     // I'll assume standard roles exist. If not, I'll default to 1 or handle it.
     // Let's try to insert it if it doesn't exist (auto-provisioning) or just throw.
     // Better: Throw error saying role not found.
     throw new Error(`Role '${roleName}' not found.`);
  } else {
    roleId = roleResult.rows[0].id;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // 2. Insert into users with role_id
  // Note: We keep writing to 'role' (string) column if it exists for legacy compatibility?
  // The user didn't say to remove it. But the PRIMARY goal is RBAC.
  // I will check if 'role' column is still in use.
  // Based on the 'read_file' of authService.ts earlier, it was using it.
  // I'll try to write to both to be safe, assuming the column exists.
  // But wait, if I don't know for sure, I should check schema.
  // The migration '20251221085716_add_rbac_tables.sql' only added role_id.
  // So 'role' column likely still exists.

  const result = await pool.query(
    `INSERT INTO users (email, password, name, role, role_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, name, role, role_id`,
    [email, hashedPassword, name, roleName, roleId]
  );

  const user = result.rows[0];

  const token = jwt.sign(
    { userId: user.id, email: user.email, roleId: user.role_id } as JwtPayload,
    JWT_SECRET,
    { expiresIn: "24h" }
  );

  return { user, token };
};

export const loginUser = async (email: string, password: string) => {
  const result = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );

  if (result.rows.length === 0) {
    throw new Error("Invalid credentials");
  }

  const user = result.rows[0];

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    throw new Error("Invalid credentials");
  }

  // Ensure role_id is present. If user was created before RBAC, it might be null.
  // We might need to backfill or handle nulls.
  if (!user.role_id) {
      // Try to recover role_id from role name string
      if (user.role) {
          const roleRes = await pool.query("SELECT id FROM roles WHERE name = $1", [user.role]);
          if (roleRes.rows.length > 0) {
              user.role_id = roleRes.rows[0].id;
              // Optionally update the user record
              await pool.query("UPDATE users SET role_id = $1 WHERE id = $2", [user.role_id, user.id]);
          } else {
             throw new Error("User has no valid role assigned.");
          }
      } else {
          throw new Error("User has no role assigned.");
      }
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email, roleId: user.role_id } as JwtPayload,
    JWT_SECRET,
    { expiresIn: "24h" }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      roleId: user.role_id
    },
  };
};

export const verifyUser = async (userId: number) => {
  const result = await pool.query(
    "SELECT id, email, name, role, role_id FROM users WHERE id = $1",
    [userId]
  );

  if (result.rows.length === 0) {
    throw new Error("User not found");
  }

  return result.rows[0];
};

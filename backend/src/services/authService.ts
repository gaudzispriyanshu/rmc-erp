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
  // We stop writing to the legacy 'role' column to enforce RBAC usage.
  // The 'role' column will be deprecated.

  const result = await pool.query(
    `INSERT INTO users (email, password, name, role_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, name, role_id`,
    [email, hashedPassword, name, roleId]
  );

  // Attach role name for frontend compatibility
  const user = { ...result.rows[0], role: roleName };

  const token = jwt.sign(
    { userId: user.id, email: user.email, roleId: user.role_id } as JwtPayload,
    JWT_SECRET,
    { expiresIn: "24h" }
  );

  return { user, token };
};

export const loginUser = async (email: string, password: string) => {
  // Use LEFT JOIN to get role name from roles table
  const result = await pool.query(
    `SELECT u.*, r.name as role_name
     FROM users u
     LEFT JOIN roles r ON u.role_id = r.id
     WHERE u.email = $1`,
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
      // Try to recover role_id from role name string (legacy fallback)
      if (user.role) {
          const roleRes = await pool.query("SELECT id, name FROM roles WHERE name = $1", [user.role]);
          if (roleRes.rows.length > 0) {
              user.role_id = roleRes.rows[0].id;
              // We also found the role name from roles table, so let's use it
              user.role_name = roleRes.rows[0].name;

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
      // Prefer role_name from joined table, fallback to legacy 'role' column if needed
      role: user.role_name || user.role,
      roleId: user.role_id
    },
  };
};

export const verifyUser = async (userId: number) => {
  // Select legacy role column as fallback
  const result = await pool.query(
    `SELECT u.id, u.email, u.name, u.role_id, u.role as legacy_role, r.name as role_name
     FROM users u
     LEFT JOIN roles r ON u.role_id = r.id
     WHERE u.id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    throw new Error("User not found");
  }

  const user = result.rows[0];

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role_id: user.role_id,
    // Prefer joined role name, fallback to legacy role column
    role: user.role_name || user.legacy_role
  };
};

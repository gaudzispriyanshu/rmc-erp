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
  role_id: number
) => {
  if (!role_id) {
    throw new Error("role_id is required");
  }

  const userExists = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );

  if (userExists.rows.length > 0) {
    throw new Error("User already exists");
  }

  // Validate that the role_id exists in the roles table
  const roleResult = await pool.query(
    "SELECT id, name FROM roles WHERE id = $1",
    [role_id]
  );

  if (roleResult.rows.length === 0) {
    throw new Error(`Role with id '${role_id}' not found.`);
  }

  const roleName = roleResult.rows[0].name;
  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO users (email, password, name, role, role_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, name, role, role_id`,
    [email, hashedPassword, name, roleName, role_id]
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

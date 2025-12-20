import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db";

export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const registerUser = async (
  email: string,
  password: string,
  name: string,
  role: string = "staff"
) => {
  const userExists = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );

  if (userExists.rows.length > 0) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO users (email, password, name, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, name, role`,
    [email, hashedPassword, name, role]
  );

  const user = result.rows[0];

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role } as JwtPayload,
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

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role } as JwtPayload,
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
    },
  };
};

export const verifyUser = async (userId: number) => {
  const result = await pool.query(
    "SELECT id, email, name, role FROM users WHERE id = $1",
    [userId]
  );

  if (result.rows.length === 0) {
    throw new Error("User not found");
  }

  return result.rows[0];
};

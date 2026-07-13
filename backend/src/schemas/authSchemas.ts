import { z } from "zod";

// 72 = bcrypt's input byte limit; anything past it is silently ignored,
// so reject rather than pretend it's part of the password.
export const registerSchema = z.object({
  email: z.email().max(254),
  password: z.string().min(8).max(72),
  name: z.string().trim().min(1).max(100),
  role_id: z.number().int().positive(),
});

// Login only checks presence/limits — existing accounts may predate the
// register policy, and a login schema must never lock them out.
export const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(72),
});

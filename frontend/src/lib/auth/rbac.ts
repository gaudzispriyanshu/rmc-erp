import type { AuthUser } from "@/features/auth/types/auth";

/** Single place that answers "is this user allowed to see/do X". */
export function hasRole(user: AuthUser | null, roles: string[] | undefined): boolean {
  if (!roles || roles.length === 0) return Boolean(user);
  if (!user) return false;
  return roles.includes(user.role);
}

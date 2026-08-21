"use client";

/**
 * JWT storage.
 *
 * A readable cookie (not localStorage) so `middleware.ts` can gate routes at the
 * edge before any JS runs. Tradeoff, stated plainly: a readable cookie is still
 * XSS-reachable. The hardened version is an httpOnly cookie set by the backend
 * (or by a Next route handler proxying login) — worth doing before this is
 * exposed to the internet.
 */
import { TOKEN_KEY, TOKEN_MAX_AGE_SECONDS } from "@/lib/auth/constants";

export function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${TOKEN_KEY}=([^;]+)`));
  return match ? decodeURIComponent(match[2]!) : null;
}

export function setToken(token: string): void {
  document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=${TOKEN_MAX_AGE_SECONDS}; samesite=lax`;
}

export function clearToken(): void {
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; samesite=lax`;
}

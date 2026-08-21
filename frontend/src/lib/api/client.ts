import axios, { type AxiosRequestConfig } from "axios";
import { env } from "@/config/env";
import { clearToken, getToken } from "@/lib/auth/token";
import { site } from "@/config/site";
import { toApiError } from "@/lib/api/errors";

export const apiClient = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  timeout: env.NEXT_PUBLIC_API_TIMEOUT,
  headers: { "Content-Type": "application/json" },
});

/** Attach the JWT on every request. */
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** Normalise every failure, and bounce to login on an expired session. */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError = toApiError(error);
    if (apiError.isUnauthorized && typeof window !== "undefined") {
      clearToken();
      const next = encodeURIComponent(window.location.pathname);
      window.location.replace(`${site.routes.login}?next=${next}`);
    }
    return Promise.reject(apiError);
  },
);

/**
 * The backend requires an Idempotency-Key on every create
 * (backend/src/middleware/idempotency.ts): same key + same body replays the
 * original 2xx instead of inserting twice. Generate ONE key per form session,
 * not per click, so a double-submit collapses into one row.
 */
export function newIdempotencyKey(): string {
  return crypto.randomUUID();
}

export function withIdempotencyKey(key: string, config: AxiosRequestConfig = {}) {
  return {
    ...config,
    headers: { ...config.headers, "Idempotency-Key": key },
  } satisfies AxiosRequestConfig;
}

/** Thin typed helpers so feature api/ files stay one-liners. */
export const http = {
  get: async <T>(url: string, config?: AxiosRequestConfig) =>
    (await apiClient.get<T>(url, config)).data,
  post: async <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    (await apiClient.post<T>(url, body, config)).data,
  put: async <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    (await apiClient.put<T>(url, body, config)).data,
  patch: async <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    (await apiClient.patch<T>(url, body, config)).data,
  delete: async <T>(url: string, config?: AxiosRequestConfig) =>
    (await apiClient.delete<T>(url, config)).data,
};

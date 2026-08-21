import axios from "axios";

/**
 * Mirrors the backend's central errorHandler payload
 * (backend/src/errors/AppError.ts) so the UI never has to guess a shape.
 */
export type ApiErrorBody = {
  message?: string;
  code?: string;
  /** Zod field errors, when validation middleware rejects the request */
  errors?: Record<string, string[]> | { path: string; message: string }[];
};

export class ApiError extends Error {
  readonly status: number;
  readonly code: string | undefined;
  readonly fieldErrors: Record<string, string> | undefined;

  constructor(
    message: string,
    status: number,
    code?: string,
    fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }

  get isValidation() {
    return this.status === 400 || this.status === 422;
  }
  get isUnauthorized() {
    return this.status === 401;
  }
  get isForbidden() {
    return this.status === 403;
  }
  get isNotFound() {
    return this.status === 404;
  }
  get isConflict() {
    return this.status === 409;
  }
}

function flattenFieldErrors(body: ApiErrorBody | undefined) {
  if (!body?.errors) return undefined;
  const out: Record<string, string> = {};
  if (Array.isArray(body.errors)) {
    for (const e of body.errors) out[e.path] = e.message;
  } else {
    for (const [path, messages] of Object.entries(body.errors)) {
      if (messages?.[0]) out[path] = messages[0];
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

/** Turn anything thrown by axios into one predictable ApiError. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError<ApiErrorBody>(error)) {
    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return new ApiError("The server took too long to respond.", 408, "TIMEOUT");
    }
    if (!error.response) {
      return new ApiError("Cannot reach the server.", 0, "NETWORK");
    }
    const body = error.response.data;
    return new ApiError(
      body?.message ?? error.response.statusText ?? "Request failed.",
      error.response.status,
      body?.code,
      flattenFieldErrors(body),
    );
  }

  return new ApiError(
    error instanceof Error ? error.message : "Something went wrong.",
    500,
  );
}

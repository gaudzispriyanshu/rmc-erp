// Throw this anywhere (controller or service) to return a specific HTTP status
// with a safe, client-facing message. The central errorHandler turns it into
// the response; anything that is NOT an AppError becomes a generic 500 so raw
// internal/DB errors never reach the client.
export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = "AppError";
  }
}

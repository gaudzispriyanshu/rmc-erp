import { z } from "zod";

/**
 * Fail fast on bad config instead of shipping `undefined` into a URL.
 * Only NEXT_PUBLIC_* vars are readable in the browser.
 */
const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_API_TIMEOUT: z.coerce.number().int().positive().default(15_000),
});

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_API_TIMEOUT: process.env.NEXT_PUBLIC_API_TIMEOUT,
});

if (!parsed.success) {
  throw new Error(
    `Invalid environment variables:\n${z.prettifyError(parsed.error)}\nSee .env.example`,
  );
}

export const env = parsed.data;

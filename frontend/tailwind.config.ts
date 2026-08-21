import type { Config } from "tailwindcss";

/**
 * Tailwind v4 is CSS-first: the design system lives in `src/styles/tokens.css`
 * under `@theme`, and every class lives in `src/styles/globals.css`.
 *
 * This file is loaded via `@config` from globals.css and is kept ONLY for the
 * things CSS cannot express: content globs outside the default scan, plugins,
 * and safelisting classes built at runtime.
 *
 * Do NOT add colours/spacing/fonts here — they belong in tokens.css.
 */
const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx,mdx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/features/**/*.{ts,tsx}",
    "./src/config/**/*.{ts,tsx}",
  ],
  plugins: [],
};

export default config;

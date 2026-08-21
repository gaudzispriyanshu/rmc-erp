import coreWebVitals from "eslint-config-next/core-web-vitals";
import next from "eslint-config-next";
import typescript from "eslint-config-next/typescript";
import queryPlugin from "@tanstack/eslint-plugin-query";

const eslintConfig = [
  ...next,
  ...coreWebVitals,
  ...typescript,
  ...queryPlugin.configs["flat/recommended"],
  {
    rules: {
      "@typescript-eslint/consistent-type-imports": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../../*"],
              message: "Use the @/ path alias instead of deep relative imports.",
            },
          ],
        },
      ],
    },
  },
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts"] },
];

export default eslintConfig;

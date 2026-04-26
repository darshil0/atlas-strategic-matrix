import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

/**
 * ESLint flat config (TypeScript + React)
 * - Uses tseslint.config() helper for valid Flat Config structures.
 * - Integrates standard JS/TS recommended rules.
 * - Keeps the project's "zero warning" intent.
 */
export default tseslint.config(
  // Global ignores
  {
    ignores: ["dist", "node_modules", "coverage"],
  },

  // Base TS/TSX rules
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parserOptions: {
        project: "./tsconfig.json",
      },
      globals: {
        ...globals.browser,
        ...globals.jest,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/ban-ts-comment": "warn",
      // Add or tighten rules here incrementally to reach Zero Warning Baseline.
    },
  }
);

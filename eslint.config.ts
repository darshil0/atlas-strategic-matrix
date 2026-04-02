import js from "@eslint/js";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

/**
 * ESLint flat config (TypeScript + React)
 * - Uses @typescript-eslint/parser and plugin
 * - Points parserOptions.project -> ./tsconfig.json for type-aware rules
 * - Keeps the project's "zero warning" intent but does not force strict rules here.
 */
export default [
  // Global ignores
  {
    ignores: ["dist", "node_modules", "coverage"],
  },

  // Base TS/TSX rules
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        project: "./tsconfig.json",
      },
      globals: {
        ...globals.browser,
        ...globals.jest,
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    extends: [
      js.configs.recommended,
      "plugin:@typescript-eslint/recommended",
      "plugin:@typescript-eslint/stylistic",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/ban-ts-comment": "warn",
      // Add or tighten rules here incrementally to reach Zero Warning Baseline.
    },
  },
];
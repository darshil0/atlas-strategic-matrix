import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", "dist", ".idea", ".git", ".cache"],
    css: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "node_modules/",
        "src/test/",
        "**/*.config.{ts,js}",
        "**/types/**",
        "**/*.d.ts",
        "**/*.spec.{ts,tsx}",
        "**/*.test.{ts,tsx}",
      ],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 85,
        statements: 85,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/components": path.resolve(__dirname, "./src/components"),
      "@/config": path.resolve(__dirname, "./src/config"),
      "@/data": path.resolve(__dirname, "./src/data"),
      "@/hooks": path.resolve(__dirname, "./src/hooks"),
      "@/lib": path.resolve(__dirname, "./src/lib"),
      "@/lib/adk": path.resolve(__dirname, "./src/lib/adk"),
      "@/lib/utils": path.resolve(__dirname, "./src/lib/utils.ts"),
      "@/services": path.resolve(__dirname, "./src/services"),
      "@/styles": path.resolve(__dirname, "./src/styles"),
      "@/test": path.resolve(__dirname, "./src/test"),
      "@/types": path.resolve(__dirname, "./src/types/index.ts"),
      "@adk": path.resolve(__dirname, "./src/lib/adk/index.ts"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@config": path.resolve(__dirname, "./src/config/index.ts"),
      "@data": path.resolve(__dirname, "./src/data/taskBank.ts"),
      "@lib": path.resolve(__dirname, "./src/lib"),
      "@services": path.resolve(__dirname, "./src/services/index.ts"),
      "@types": path.resolve(__dirname, "./src/types/index.ts"),
    },
  },
});

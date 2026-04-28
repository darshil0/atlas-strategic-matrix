import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import compression from "vite-plugin-compression";
import path from "node:path";
import { fileURLToPath } from "node:url";

// __dirname replacement in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    server: {
      port: 3000,
      host: true,
      strictPort: true,
    },
    plugins: [
      react(),
      compression({
        algorithm: "gzip",
        ext: ".gz",
      }),
      compression({
        algorithm: "brotliCompress",
        ext: ".br",
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@adk": path.resolve(__dirname, "./src/lib/adk"),
        "@services": path.resolve(__dirname, "./src/services"),
        "@types": path.resolve(__dirname, "./src/types/index.ts"),
        "@config": path.resolve(__dirname, "./src/config/index.ts"),
        "@data": path.resolve(__dirname, "./src/data"),
        "@lib": path.resolve(__dirname, "./src/lib"),
        "@components": path.resolve(__dirname, "./src/components"),
      },
    },
    css: {
      devSourcemap: true,
    },
    build: {
      outDir: "dist",
      sourcemap: mode !== "production",
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("react") || id.includes("react-dom")) {
                return "vendor-react";
              }
              if (id.includes("@xyflow/react") || id.includes("framer-motion")) {
                return "vendor-viz";
              }
              if (id.includes("@google/generative-ai")) {
                return "vendor-ai";
              }
              return "vendor";
            }
            return undefined;
          },
        },
      },
    },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["./src/test/setup.ts"],
      include: ["src/**/*.{test,spec}.{ts,tsx}"],
      css: true,
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html"],
        exclude: [
          "node_modules/",
          "src/test/setup.ts",
          "**/*.config.{ts,js}",
          "**/types/**",
          "**/*.d.ts",
        ],
      },
    },
  };
});

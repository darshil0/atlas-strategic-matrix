import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
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
        "@components": path.resolve(__dirname, "./src/components"),
        "@components/*": path.resolve(__dirname, "./src/components/*"),
        "@config": path.resolve(__dirname, "./src/config/index.ts"),
        "@config/*": path.resolve(__dirname, "./src/config/*"),
        "@data": path.resolve(__dirname, "./src/data"),
        "@data/*": path.resolve(__dirname, "./src/data/*"),
        "@lib": path.resolve(__dirname, "./src/lib"),
        "@lib/*": path.resolve(__dirname, "./src/lib/*"),
        "@lib/adk": path.resolve(__dirname, "./src/lib/adk/index.ts"),
        "@lib/adk/*": path.resolve(__dirname, "./src/lib/adk/*"),
        "@lib/utils": path.resolve(__dirname, "./src/lib/utils.ts"),
        "@services": path.resolve(__dirname, "./src/services"),
        "@services/*": path.resolve(__dirname, "./src/services/*"),
        "@types": path.resolve(__dirname, "./src/types/index.ts"),
        "@types/*": path.resolve(__dirname, "./src/types/*"),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});

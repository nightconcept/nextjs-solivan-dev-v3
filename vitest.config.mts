import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./tests/setup.ts",
    // Exclude Playwright spec files
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/cypress/**",
      "**/.{idea,git,cache,output,temp}/**",
      "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*",
      "**/*.spec.ts", // Exclude Playwright tests
    ], // <-- Added comma here
  },
  resolve: {
    // <-- Moved resolve block here
    alias: {
      "@": path.dirname(fileURLToPath(import.meta.url)), // Use import.meta.url for ESM path
    },
    // },
  },
});

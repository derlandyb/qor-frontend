import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { coverageConfigDefaults } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    exclude: ["node_modules", "e2e", "design-system"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: [
        ...coverageConfigDefaults.exclude,
        "**/*.config.ts",
        "src/main.tsx",
        "src/**/types.ts",
        "src/types/**",
        "src/test/**",
        "design-system/**",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});

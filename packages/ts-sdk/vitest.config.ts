import { defineConfig } from "vitest/config";

// The SDK's own config, so vitest does not pick up the app's vitest.config.ts two folders up
// (that one needs the app's dependencies, which the SDK publish job does not install).
export default defineConfig({
  test: { include: ["__tests__/**/*.test.ts"] },
});

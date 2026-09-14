import { defineConfig } from "vitest/config";

export default defineConfig({
  // JSX uses the automatic runtime, which is Oxc's default since Vite 8 —
  // no transform option needed (the old `esbuild.jsx` is ignored there).
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/**/*.test.{ts,tsx}"],
  },
});

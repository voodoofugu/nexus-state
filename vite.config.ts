import { fileURLToPath, URL } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import nsDocs from "./site/plugins/docs.ts";
import nsReadme from "./site/plugins/readme.ts";

// сайт документации: одна страница, собранная из README и JSDoc библиотеки
export default defineConfig({
  root: "site",
  plugins: [react(), nsDocs(), nsReadme()],
  resolve: {
    alias: {
      "@nexus-state/src": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    fs: {
      allow: [".."],
    },
  },
});

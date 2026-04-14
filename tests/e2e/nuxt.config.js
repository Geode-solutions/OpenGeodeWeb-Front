import path from "node:path";

const rootNuxtConfigPath = path.resolve(import.meta.dirname, "../..", "nuxt.config.js");
const workspaceNodeModules = path.resolve(import.meta.dirname, "../../../../node_modules");
console.log("Nuxt Config Root Path:", rootNuxtConfigPath);

export default defineNuxtConfig({
  devtools: false,
  extends: [rootNuxtConfigPath],
  compatibilityDate: "2026-04-10",
  vite: {
    server: {
      fs: {
        allow: [".", workspaceNodeModules],
      },
    },
  },
});

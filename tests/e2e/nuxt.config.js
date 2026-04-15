import path from "node:path";

const __dirname = import.meta.dirname;
console.log(`Loading Nuxt config: ${import.meta.url}`);
const rootNuxtConfigPath = path.resolve(__dirname, "../..", "nuxt.config.js");
const workspaceNodeModules = path.resolve(__dirname, "../../../../node_modules");

export default defineNuxtConfig({
  devtools: false,
  extends: [rootNuxtConfigPath],
  compatibilityDate: "2026-04-15",
  vite: {
    define: {
      name: "true",
    },
    server: {
      fs: {
        allow: [".", workspaceNodeModules],
      },
    },
  },
});

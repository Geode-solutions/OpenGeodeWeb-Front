// Node imports
import path, { dirname } from "node:path"
import { fileURLToPath } from "node:url"

// Local imports
import package_json from "./package.json"

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      API_URL: "api.geode-solutions.com",
      COMMAND_BACK: "opengeodeweb-back",
      COMMAND_VIEWER: "opengeodeweb-viewer",
      NUXT_ROOT_PATH: __dirname,
      MODE: process.env.MODE || "CLOUD",
      PROJECT: package_json.name,
      SITE_BRANCH:
        process.env.NODE_ENV === "production" ? process.env.SITE_BRANCH : "",
    },
  },

  modules: [
    ["@pinia/nuxt", { autoImports: ["defineStore", "storeToRefs"] }],
    "@vueuse/nuxt",
  ],
  imports: {
    scan: false,
  },

  alias: {
    "@ogw_front": path.resolve(__dirname, "app"),
    "@ogw_internal": path.resolve(__dirname, "internal"),
    "@ogw_tests": path.resolve(__dirname, "tests"),
  },

  // ** Global CSS
  css: ["vuetify/lib/styles/main.sass"],

  // ** Build configuration
  build: {
    transpile: ["vuetify"],
  },

  vue: {
    compilerOptions: {
      isCustomElement: (tag) => ["md-linedivider"].includes(tag),
    },
  },

  vite: {
    optimizeDeps: {
      include: [
        "ajv",
        "fast-deep-equal",
        "globalthis",
        "h3",
        "js-file-download",
        "lodash",
        "seedrandom",
      ],
    },
  },
})

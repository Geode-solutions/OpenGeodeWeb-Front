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
      BACK_COMMAND: "opengeodeweb-back",
      BACK_PATH: path.join(
        __dirname,
        "tests",
        "integration",
        "microservices",
        "back",
      ),
      BROWSER: process.env.BROWSER ?? false,
      PROJECT: package_json.name,
      SITE_BRANCH:
        process.env.NODE_ENV === "production" ? process.env.SITE_BRANCH : "",
      VIEWER_COMMAND: "opengeodeweb-viewer",
      VIEWER_PATH: path.join(
        __dirname,
        "tests",
        "integration",
        "microservices",
        "viewer",
      ),
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
        "is-electron",
        "js-file-download",
        "lodash",
        "seedrandom",
      ],
    },
  },
})

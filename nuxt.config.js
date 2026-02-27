// Node imports
import path from "node:path"

export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      API_URL: "api.geode-solutions.com",
      SITE_BRANCH:
        process.env.NODE_ENV === "production" ? process.env.SITE_BRANCH : "",
      PROJECT: process.env.NODE_ENV === "production" ? process.env.PROJECT : "",
      BROWSER: process.env.BROWSER ?? false,
      BACK_PATH: path.join(
        __dirname,
        "tests",
        "integration",
        "microservices",
        "back",
      ),
      BACK_COMMAND: "opengeodeweb-back",
      VIEWER_PATH: path.join(
        __dirname,
        "tests",
        "integration",
        "microservices",
        "viewer",
      ),
      VIEWER_COMMAND: "opengeodeweb-viewer",
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
    "@ogw_front": `${__dirname}/app/`,
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
    server: {
      watch: {
        include: ["server/**"],
      },
    },
  },

  nitro: {
    routeRules: {
      "/api/extensions": { bodySize: 100 * 1024 * 1024 }, // 100MB
    },
    watchOptions: {
      include: ["server/**"],
    },
  },

  watch: ["server"],
})

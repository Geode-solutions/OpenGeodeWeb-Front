import { defineVitestProject } from "@nuxt/test-utils/config"

export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      API_URL: "api.geode-solutions.com",
      SITE_BRANCH:
        process.env.NODE_ENV === "production" ? process.env.SITE_BRANCH : "",
      PROJECT: process.env.NODE_ENV === "production" ? process.env.PROJECT : "",
      BROWSER: process.env.BROWSER ?? false,
      GEODE_PORT: process.env.GEODE_PORT ?? null,
      VIEWER_PORT: process.env.VIEWER_PORT ?? null,
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
    "@ogw_front": __dirname + "/app/",
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

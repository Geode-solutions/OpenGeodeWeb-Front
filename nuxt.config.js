export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      API_URL: "api.geode-solutions.com",
      SITE_BRANCH:
        process.env.NODE_ENV === "production" ? process.env.SITE_BRANCH : "",
      PROJECT: process.env.NODE_ENV === "production" ? process.env.PROJECT : "",
      NODE_ENV: process.env.NODE_ENV,
    },
  },

  modules: [
    ["@pinia/nuxt", { autoImports: ["defineStore", "storeToRefs"] }],
    "@vueuse/nuxt",
  ],
  imports: {
    dirs: ["stores"],
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

  testUtils: {},

  vite: {
    optimizeDeps: {
      include: [
        "is-electron",
        "fast-deep-equal",
        "seedrandom",
        "lodash",
        "ajv",
        "globalthis",
      ],
    },
  },
})

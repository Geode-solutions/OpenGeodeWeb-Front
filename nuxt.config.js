export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      VIEWER_PROTOCOL: process.env.NODE_ENV === "production" ? "wss" : "ws",
      GEODE_PROTOCOL: process.env.NODE_ENV === "production" ? "https" : "http",
      VIEWER_PORT: process.env.NODE_ENV === "production" ? "443" : "1234",
      GEODE_PORT: process.env.NODE_ENV === "production" ? "443" : "5000",
      SITE_BRANCH:
        process.env.NODE_ENV === "production" ? process.env.SITE_BRANCH : "",
      PROJECT: process.env.NODE_ENV === "production" ? process.env.PROJECT : "",
      NODE_ENV: process.env.NODE_ENV,
    },
  },

  modules: [["@pinia/nuxt", { autoImports: ["defineStore"] }], "@vueuse/nuxt"],
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
      include: ["fast-deep-equal", "seedrandom", "lodash", "ajv", "globalthis"],
    },
  },
})

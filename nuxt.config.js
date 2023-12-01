export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      VIEWER_PROTOCOL: process.env.NODE_ENV === "production" ? "wss" : "ws",
      GEODE_PROTOCOL: process.env.NODE_ENV === "production" ? "https" : "http",
      VIEWER_PORT: process.env.NODE_ENV === "production" ? "443" : "1234",
      GEODE_PORT: process.env.NODE_ENV === "production" ? "443" : "5000",
      SITE_BRANCH:
        process.env.NODE_ENV === "production" ? process.env.SITE_BRANCH : "",
      NODE_ENV: process.env.NODE_ENV,
    },
  },

  imports: {
    dirs: ["stores"],
  },

  modules: [
    ["@pinia/nuxt", { autoImports: ["defineStore"] }],
    "@vueuse/nuxt",
    "nuxt-vitest",
  ],
})

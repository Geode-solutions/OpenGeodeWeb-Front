import { defineVitestConfig } from "nuxt-vitest/config"
import vuetify from "vite-plugin-vuetify"

export default defineVitestConfig({
  plugins: [vuetify()],
  test: {
    globals: true,
    environment: "jsdom",
    server: {
      deps: {
        inline: ["vuetify"],
      },
    },
  },
  resolve: {
    alias: {
      "@": ".",
    },
  },
})

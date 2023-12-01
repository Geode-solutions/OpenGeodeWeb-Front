import { defineVitestConfig } from "nuxt-vitest/config"

export default defineVitestConfig({
  test: {
    globals: true,
    environment: "jsdom",
    server: {
      deps: {
        optimizer: {
          web: {
            include: ["vuetify"],
          },
        },
      },
    },
  },
})

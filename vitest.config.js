import { defineVitestConfig } from "nuxt-vitest/config"

export default defineVitestConfig({
  test: {
    globals: true,
    environment: "nuxt",
    server: {
      deps: {
        optimizer: {
          web: {
            inline: ["vuetify"],
          },
        },
      },
    },
  },
})

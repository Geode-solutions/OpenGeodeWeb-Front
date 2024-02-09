import { defineVitestConfig } from "@nuxt/test-utils/config"

export default defineVitestConfig({
  test: {
    environment: "nuxt",
    globals: true,
    server: {
      deps: {
        inline: ["vuetify"],
      },
    },
  },
})

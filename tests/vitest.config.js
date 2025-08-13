import { defineVitestConfig } from "@nuxt/test-utils/config"

export default defineVitestConfig({
  test: {
    projects: [
      {
        name: "unit",
        root: "./tests/unit",
        environment: "nuxt",
        server: {
          deps: {
            inline: ["vuetify"],
          },
        },
      },
      {
        name: "integration",
        root: "./tests/integration",
        environment: "nuxt",
        server: {
          deps: {
            inline: ["vuetify"],
          },
        },
      },
    ],
  },
})

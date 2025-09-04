import { defineVitestConfig } from "@nuxt/test-utils/config"

export default defineVitestConfig({
  test: {
    projects: [
      {
        name: "unit",
        environment: "nuxt",
        include: ["tests/unit/**/*.test.js"],
        server: {
          deps: {
            inline: ["vuetify"],
          },
        },
      },
      {
        name: "integration",
        include: ["tests/integration/**/*.test.js"],
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

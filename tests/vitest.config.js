import { defineConfig } from "vitest/config"
import { defineVitestProject } from "@nuxt/test-utils/config"

export default defineConfig({
  test: {
    projects: [
      await defineVitestProject({
        test: {
          name: "unit",
          include: ["tests/unit/**/*.test.js"],
          environment: "nuxt",
          server: {
            deps: {
              inline: ["vuetify"],
            },
          },
        },
      }),
      await defineVitestProject({
        test: {
          name: "integration",
          include: ["tests/integration/**/*.test.js"],
          environment: "nuxt",
          fileParallelism: false,
          server: {
            deps: {
              inline: ["vuetify"],
            },
          },
        },
      }),
    ],
  },
})

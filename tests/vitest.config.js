import { defineConfig } from "vitest/config"
import { defineVitestProject } from "@nuxt/test-utils/config"
import path from "path"

const globalRetry = process.env.CI ? 3 : 0

export default defineConfig({
  test: {
    setupFiles: [path.resolve(__dirname, "./setup_indexeddb.js")],
    projects: [
      defineVitestProject({
        test: {
          name: "unit",
          include: ["tests/unit/**/*.test.js"],
          environment: "nuxt",
          setupFiles: [path.resolve(__dirname, "./setup_indexeddb.js")],
          server: {
            deps: {
              inline: ["vuetify"],
            },
          },
          retry: globalRetry,
        },
      }),
      defineVitestProject({
        test: {
          name: "integration",
          include: ["tests/integration/**/*.test.js"],
          environment: "nuxt",
          fileParallelism: false,
          setupFiles: [path.resolve(__dirname, "./setup_indexeddb.js")],
          server: {
            deps: {
              inline: ["vuetify"],
            },
          },
          retry: globalRetry,
        },
      }),
    ],
  },
})
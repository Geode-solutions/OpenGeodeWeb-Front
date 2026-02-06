import { defineConfig } from "vitest/config"
import { defineVitestProject } from "@nuxt/test-utils/config"
import path from "node:path"

const RETRIES = 3
const DEFAULT_RETRY = 0

const globalRetry = process.env.CI ? RETRIES : DEFAULT_RETRY

// eslint-disable-next-line import/no-default-export
export default defineConfig({
  test: {
    setupFiles: [path.resolve(__dirname, "./setup_indexeddb.js")],
    projects: [
      await defineVitestProject({
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
      await defineVitestProject({
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

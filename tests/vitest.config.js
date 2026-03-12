import { defineConfig } from "vitest/config"
import { defineVitestProject } from "@nuxt/test-utils/config"
import { fileURLToPath } from "node:url"
import path from "node:path"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const RETRIES = 3
const DEFAULT_RETRY = 0

const globalRetry = process.env.CI ? RETRIES : DEFAULT_RETRY

// oxlint-disable-next-line import/no-default-export
export default defineConfig({
  resolve: {
    alias: {
      "@ogw_tests": path.resolve(__dirname, "."),
    },
  },
  test: {
    globals: false,
    setupFiles: [path.resolve(__dirname, "./setup_indexeddb.js")],
    projects: [
      await defineVitestProject({
        test: {
          name: "unit",
          globals: false,
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
          globals: false,
          include: [
            "tests/integration/stores/data_style/mesh/cells.nuxt.test.js",
          ],
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

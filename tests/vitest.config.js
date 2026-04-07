import { defineConfig } from "vitest/config";
import { defineVitestProject } from "@nuxt/test-utils/config";
import path from "node:path";

const __dirname = import.meta.dirname;

const RETRIES = 3;
const DEFAULT_RETRY = 0;
const TIMEOUTS = {
  unit: 5000,
  integration: 15_000,
};

const globalRetry = process.env.CI ? RETRIES : DEFAULT_RETRY;

// oxlint-disable-next-line import/no-default-export
export default defineConfig({
  resolve: {
    alias: {
      "@ogw_tests": path.resolve(__dirname, "."),
    },
  },
  test: {
    setupFiles: [path.resolve(__dirname, "./setup_indexeddb.js")],
    projects: [
      await defineVitestProject({
        test: {
          name: "unit",
          include: ["tests/unit/**/*.test.js"],
          environment: "nuxt",
          testTimeout: TIMEOUTS.unit,
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
          testTimeout: TIMEOUTS.integration,
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
});

import { fileURLToPath } from "node:url";
import path from "node:path";

import { defineConfig } from "vitest/config";
import { defineVitestProject } from "@nuxt/test-utils/config";
import { playwright } from "@vitest/browser-playwright";
// import vue from "@vitejs/plugin-vue";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const RETRIES = 3;
const DEFAULT_RETRY = 0;

const globalRetry = process.env.CI ? RETRIES : DEFAULT_RETRY;

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
        // plugins: [vue()],
        test: {
          name: "browser",
          include: ["tests/browser/**/*.test.js"],
          setupFiles: ["vitest-browser-vue"],
          browser: {
            enabled: true,
            // headless: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
          retry: globalRetry,
        },
      }),
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
});

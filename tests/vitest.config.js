import path from "node:path";

import { defineConfig } from "vitest/config";
import { defineVitestProject } from "@nuxt/test-utils/config";
import { nodePolyfills } from "vite-plugin-node-polyfills";

const __dirname = import.meta.dirname;

const RETRIES = 3;
const DEFAULT_RETRY = 0;
const TIMEOUTS = {
  unit: 5000,
  browser: 15_000,
  integration: 15_000,
};

const globalRetry = process.env.CI ? RETRIES : DEFAULT_RETRY;

const setupIndexedDB = path.resolve(__dirname, "./setup_indexeddb.js");

const openGeodeFrontPath = path.resolve(__dirname, "../app");

const commonTestConfig = {
  setupFiles: [setupIndexedDB],
  retry: globalRetry,
  server: {
    deps: {
      inline: ["vuetify"],
    },
  },
};

const sharedAlias = {
  "@ogw_tests": path.resolve(__dirname, "."),
  "@ogw_front": openGeodeFrontPath,
};

// oxlint-disable-next-line import/no-default-export
export default defineConfig({
  plugins: [
    nodePolyfills({
      globals: {
        Buffer: true,
      },
      protocolImports: true,
    }),
  ],
  resolve: {
    alias: sharedAlias,
  },
  test: {
    ...commonTestConfig,
    projects: [
      await defineVitestProject({
        test: {
          name: "browser",
          extends: true,
          include: ["tests/browser/cells.nuxt.test.js"],
          environment: "nuxt",
          testTimeout: TIMEOUTS.browser,
          setupFiles: [setupIndexedDB],
        },
      }),
      // await defineVitestProject({
      //   test: {
      //     name: "unit",
      //     extends: true,
      //     include: ["tests/unit/**/*.test.js"],
      //     environment: "nuxt",
      //     testTimeout: TIMEOUTS.unit,
      //     setupFiles: [setupIndexedDB],
      //   },
      // }),
      // await defineVitestProject({
      //   test: {
      //     name: "integration",
      //     extends: true,
      //     include: ["tests/integration/stores/data_style/mesh/cells.nuxt.test.js"],
      //     environment: "nuxt",
      //     fileParallelism: false,
      //     testTimeout: TIMEOUTS.integration,
      //     setupFiles: [setupIndexedDB],
      //   },
      // }),
    ],
  },
});

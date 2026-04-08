import path from "node:path";

import { defineConfig } from "vitest/config";
import { defineVitestProject } from "@nuxt/test-utils/config";
// import { playwright } from "@vitest/browser-playwright";

// import { serverCleanup, serverSetup } from "./browser/commands.js";

const __dirname = import.meta.dirname;

const RETRIES = 3;
const DEFAULT_RETRY = 0;
const TIMEOUTS = {
  unit: 5000,
  integration: 15_000,
};

const globalRetry = process.env.CI ? RETRIES : DEFAULT_RETRY;

const commonTestConfig = {
  setupFiles: [path.resolve(__dirname, "./setup_indexeddb.js")],
  retry: globalRetry,
  server: {
    deps: {
      inline: ["vuetify"],
    },
  },
};

// oxlint-disable-next-line import/no-default-export
export default defineConfig({
  resolve: {
    alias: {
      "@ogw_tests": path.resolve(__dirname, "."),
    },
  },
  test: {
    ...commonTestConfig,
    projects: [
      // await defineVitestProject({
      //   test: {
      //     name: "browser",
      //     include: ["tests/browser/cells.nuxt.test.js"],
      //     environment: "nuxt",
      //     setupFiles: [path.resolve(__dirname, "./setup_indexeddb.js")],
      //     browser: {
      //       enabled: true,
      //       provider: playwright(),
      //       instances: [{ browser: "chromium" }],
      //       commands: {
      //         serverCleanup,
      //         serverSetup,
      //       },
      //     },
      //     retry: globalRetry,
      //   },
      // }),
      await defineVitestProject({
        test: {
          name: "unit",
          extends: true,
          include: ["tests/unit/**/*.test.js"],
          environment: "nuxt",
          testTimeout: TIMEOUTS.unit,
        },
      }),
      await defineVitestProject({
        test: {
          name: "integration",
          extends: true,
          include: ["tests/integration/stores/data_style/mesh/cells.nuxt.test.js"],
          environment: "nuxt",
          fileParallelism: false,
          testTimeout: TIMEOUTS.integration,
        },
      }),
    ],
  },
});

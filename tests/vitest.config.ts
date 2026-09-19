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
const CI_WORKERS = 2;

const isCI = process.env.CI !== undefined && process.env.CI !== "";
const globalRetry = isCI ? RETRIES : DEFAULT_RETRY;
const maxWorkers = isCI ? CI_WORKERS : 3;

const aliases = {
  "@ogw_tests": path.resolve(__dirname, "."),
  "@geode/opengeodeweb-front/shared": path.resolve(__dirname, "..", "shared"),
};

// oxlint-disable-next-line import/no-default-export
export default defineConfig({
  test: {
    setupFiles: [path.resolve(__dirname, "./setup_indexeddb.ts")],
    projects: [
      // oxlint-disable-next-line no-top-level-await
      await defineVitestProject({
        test: {
          name: "unit",
          include: ["tests/unit/**/*.test.ts"],
          globals: true,
          environment: "nuxt",
          alias: aliases,
          testTimeout: TIMEOUTS.unit,
          setupFiles: [path.resolve(__dirname, "./setup_indexeddb.ts")],
          server: {
            deps: {
              inline: ["vuetify"],
            },
          },
          retry: globalRetry,
        },
      }),
      // oxlint-disable-next-line no-top-level-await
      await defineVitestProject({
        test: {
          name: "integration",
          include: ["tests/integration/**/*.test.ts"],
          globals: true,
          environment: "nuxt",
          alias: aliases,
          maxWorkers,
          testTimeout: TIMEOUTS.integration,
          setupFiles: [path.resolve(__dirname, "./setup_indexeddb.ts")],
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

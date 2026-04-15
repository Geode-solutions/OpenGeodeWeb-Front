import path from "node:path";

import { defineConfig } from "vitest/config";
import { defineVitestProject } from "@nuxt/test-utils/config";
import { playwright } from '@vitest/browser-playwright'

const __dirname = import.meta.dirname;

const RETRIES = 3;
const DEFAULT_RETRY = 0;
const TIMEOUTS = {
  unit: 5000,
  integration: 15_000,
  e2e: 120_000,
};

const globalRetry = process.env.CI ? RETRIES : DEFAULT_RETRY;
const setupIndexedDB = path.resolve(__dirname, "./setup_indexeddb.js");

const repoRoot = path.resolve(__dirname, "..");
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
  "@ogw_tests": __dirname,
  "@ogw_front": path.resolve(repoRoot, "app"),
  "@ogw_internal": path.resolve(repoRoot, "internal"),
  "@ogw_server": path.resolve(repoRoot, "server"),
};

const e2eAppPath = path.resolve(__dirname, "e2e");
const e2eGlobalSetupPath = path.resolve(e2eAppPath, "global_setup.js");
console.log("E2E Test App Path:", e2eAppPath);

// oxlint-disable-next-line import/no-default-export
export default defineConfig({
  resolve: {
    alias: sharedAlias,
  },
  test: {
    ...commonTestConfig,
    projects: [
      await defineVitestProject({
        plugins: [
          {
            name: 'ignore-bun-test',
            enforce: 'pre',
            resolveId(id) {
              if (id === 'bun:test') {
                return { id: 'bun:test', external: true }
              }
            }
          }
        ],
        environments: {
          client: {
            noExternal: false,
            external: ["@nuxt/test-utils", "bun:test"],
          },
        },
        resolve: {
          alias: sharedAlias,
        },
        test: {
          name: "e2e",
          extends: true,
          include: ["tests/e2e/cells.nuxt.test.js"],
          testTimeout: TIMEOUTS.e2e,
          environment: "node",
          server: {
            deps: {
              external: ['bun:test', '@nuxt/test-utils'],
            },
          },
          setupFiles: [setupIndexedDB],
          // browser: {
          //   enabled: true,
          //   provider: playwright(),
          //   instances: [{ browser: "chromium" }],
          //   expect: {
          //     toMatchScreenshot: {
          //       threshold: 0.02,
          //     },
          //   },
          //   connectTimeout: 120_000,
          // },
        },
      }),
      await defineVitestProject({
        test: {
          name: "unit",
          extends: true,
          include: ["tests/unit/**/*.test.js"],
          environment: "nuxt",
          testTimeout: TIMEOUTS.unit,
          setupFiles: [setupIndexedDB],
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
          setupFiles: [setupIndexedDB],
        },
      }),
    ],
  },
});

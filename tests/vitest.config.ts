import { defineConfig } from "vitest/config";
import { defineVitestProject } from "@nuxt/test-utils/config";
import path from "node:path";
import { playwright } from "@vitest/browser-playwright";

import { browserCommands } from "./browser/commands";

const __dirname = import.meta.dirname;

const RETRIES = 3;
const DEFAULT_RETRY = 0;
const TIMEOUTS = {
  unit: 5000,
  integration: 15_000,
};
const CI_WORKERS = 4;
const BROWSER_TIMEOUT = 60_000;
const BROWSER_HOOK_TIMEOUT = 180_000;
const BROWSER_WORKERS = 3;
const VIEWPORT = { width: 1200, height: 800 };
// Same tolerances as the Vease e2e tests: the references are made on Linux, Windows text rendering
// (DirectWrite vs FreeType) adds about 2% of different pixels
const SCREENSHOT_THRESHOLD = 0.3;
const LINUX_MAX_DIFF_PIXEL_RATIO = 0.02;
const WINDOWS_MAX_DIFF_PIXEL_RATIO = 0.025;
const MAX_DIFF_PIXEL_RATIO =
  process.platform === "win32" ? WINDOWS_MAX_DIFF_PIXEL_RATIO : LINUX_MAX_DIFF_PIXEL_RATIO;
const browserHelpersPath = path.resolve(__dirname, "browser", "helpers");
const browserTestsPath = path.resolve(__dirname, "browser", "tests");
// The reference screenshots mirror the folders of the tests: screenshots/<folder>/<test file>/
const browserScreenshotsPath = path.join(browserTestsPath, "screenshots");
const browserShimPath = path.resolve(__dirname, "browser", "shim");

const isCI = process.env.CI !== undefined && process.env.CI !== "";
const globalRetry = isCI ? RETRIES : DEFAULT_RETRY;
const maxWorkers = isCI ? CI_WORKERS : undefined;

const aliases = {
  "@ogw_tests": path.resolve(__dirname, "."),
  "@geode/opengeodeweb-front/shared": path.resolve(__dirname, "..", "shared"),
};

// The viewer tests and their helpers (browser/helpers, shared with Vease) are written for Playwright: in
// Browser mode, the Playwright API is replaced by the shim of browser/shim
const browserAliases = [
  { find: /^@playwright\/test$/u, replacement: path.join(browserShimPath, "playwright.ts") },
  { find: /^node:path$/u, replacement: "pathe" },
  ...Object.entries(aliases).map(([find, replacement]) => ({ find, replacement })),
];

// Vite module ids use forward slashes, on Windows too
const browserHelpersId = browserHelpersPath.split(path.sep).join("/");

// The helpers build file paths from import.meta.dirname, which a browser module does not have
const helpersDirnamePlugin = {
  name: "ogw:helpers-import-meta-dirname",
  enforce: "pre" as const,
  transform(code: string, id: string): string | undefined {
    if (!id.startsWith(browserHelpersId) || !code.includes("import.meta.dirname")) {
      return undefined;
    }
    return code.replaceAll("import.meta.dirname", JSON.stringify(path.posix.dirname(id)));
  },
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
      // Real browser: each test file starts its own back and viewer (see browser/commands.ts)
      // oxlint-disable-next-line no-top-level-await
      await defineVitestProject({
        plugins: [helpersDirnamePlugin],
        test: {
          name: "browser",
          include: ["tests/browser/**/*.test.ts"],
          globals: true,
          environment: "nuxt",
          alias: browserAliases,
          maxWorkers: BROWSER_WORKERS,
          testTimeout: BROWSER_TIMEOUT,
          hookTimeout: BROWSER_HOOK_TIMEOUT,
          server: {
            deps: {
              inline: ["vuetify"],
            },
          },
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({
              contextOptions: { permissions: ["clipboard-read", "clipboard-write"] },
            }),
            instances: [{ browser: "chromium", viewport: VIEWPORT }],
            commands: browserCommands,
            expect: {
              toMatchScreenshot: {
                // One reference per screenshot for every browser and platform, like the Vease e2e tests
                resolveScreenshotPath: ({ arg, root, testFileDirectory, testFileName, ext }) =>
                  path.join(
                    browserScreenshotsPath,
                    path.relative(browserTestsPath, path.resolve(root, testFileDirectory)),
                    testFileName,
                    `${arg}${ext}`,
                  ),
                comparatorName: "pixelmatch",
                comparatorOptions: {
                  threshold: SCREENSHOT_THRESHOLD,
                  allowedMismatchedPixelRatio: MAX_DIFF_PIXEL_RATIO,
                },
              },
            },
          },
        },
      }),
    ],
  },
});

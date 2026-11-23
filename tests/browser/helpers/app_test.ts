// The Playwright test of the apps built on this layer, which run its shared suites (see ../suites/index.ts) against
// Their own UI. Each app gives how it is launched (launchApp); the app of a worker is opened by the first test that
// Uses it (or a beforeAll) and closed by app.close or at the end of the worker. A screenshot is taken at the end of
// Each passing test

// Node imports
import path from "node:path";

// Third party imports
import type { Locator, Page } from "@playwright/test";
// oxlint-disable-next-line eslint/no-duplicate-imports
import { test as base, expect } from "@playwright/test";
import { consola } from "consola";

// Local imports
import { screenshotPath } from "./screenshot_path";
import { waitForActionSettled } from "./wait_for_action_settled";

const MILLISECONDS_PER_SECOND = 1000;
// Launching the app (browser, back and viewer), then afterAppLaunch
const APP_LAUNCH_TIMEOUT_MS = 180_000;

interface LaunchedApp {
  window: Page;
  // Closes the page and stops everything launchApp started
  cleanup: () => Promise<void>;
}

interface ScreenshotMask {
  locators: Locator[];
}

interface RunningApp {
  // Page of the open app (throws if the app is closed)
  readonly window: Page;
  // Launches the app if it is not open
  open: () => Promise<Page>;
  // Closes the app if it is open
  close: () => Promise<void>;
}

interface AppWorkerFixtures {
  // One worker per test file: set to import.meta.url by each test file
  suiteId: string;
  // Given by each app
  launchApp: () => Promise<LaunchedApp>;
  // Run on each launched app before its first test, and before closing it
  afterAppLaunch: (window: Page) => Promise<void>;
  beforeAppClose: (window: Page) => Promise<void>;
  // Run before each screenshot, before waiting for the actions to settle (e.g. a busy indicator of the app)
  beforeScreenshot: (window: Page) => Promise<void>;
  // Parts of the app masked in every screenshot (e.g. depending on the login state)
  appScreenshotMask: (window: Page) => Locator[];
  app: RunningApp;
  // Kills the running app and launches a new one, like a user closing and reopening it
  restartApp: () => Promise<Page>;
}

interface AppTestFixtures {
  // Page of the app, opened if needed: it follows restartApp
  window: Page;
  // Parts of the app masked in the screenshot of the test
  screenshotMask: ScreenshotMask;
  logTestProgress: undefined;
  autoScreenshot: undefined;
}

async function doNothing(): Promise<void> {
  // Default of the app hooks
}

const test = base.extend<AppTestFixtures, AppWorkerFixtures>({
  suiteId: ["default", { option: true, scope: "worker" }],

  launchApp: [
    // oxlint-disable-next-line no-empty-pattern
    async ({}, use): Promise<void> => {
      await use(() => {
        throw new Error("The app must override the launchApp fixture");
      });
    },
    { scope: "worker" },
  ],

  afterAppLaunch: [
    // oxlint-disable-next-line no-empty-pattern
    async ({}, use): Promise<void> => {
      await use(doNothing);
    },
    { scope: "worker" },
  ],

  beforeAppClose: [
    // oxlint-disable-next-line no-empty-pattern
    async ({}, use): Promise<void> => {
      await use(doNothing);
    },
    { scope: "worker" },
  ],

  beforeScreenshot: [
    // oxlint-disable-next-line no-empty-pattern
    async ({}, use): Promise<void> => {
      await use(doNothing);
    },
    { scope: "worker" },
  ],

  appScreenshotMask: [
    // oxlint-disable-next-line no-empty-pattern
    async ({}, use): Promise<void> => {
      await use(() => []);
    },
    { scope: "worker" },
  ],

  app: [
    async ({ launchApp, afterAppLaunch, beforeAppClose }, use): Promise<void> => {
      let openApp: LaunchedApp | undefined = undefined;
      const app: RunningApp = {
        get window(): Page {
          if (openApp === undefined) {
            throw new Error("The app is not open");
          }
          return openApp.window;
        },
        open: async (): Promise<Page> => {
          if (openApp === undefined) {
            openApp = await launchApp();
            await afterAppLaunch(openApp.window);
          }
          return openApp.window;
        },
        close: async (): Promise<void> => {
          if (openApp !== undefined) {
            const { window, cleanup } = openApp;
            openApp = undefined;
            await beforeAppClose(window);
            await cleanup();
          }
        },
      };
      await use(app);
      await app.close();
    },
    { scope: "worker" },
  ],

  restartApp: [
    async ({ app }, use): Promise<void> => {
      await use(async (): Promise<Page> => {
        await app.close();
        const window = await app.open();
        return window;
      });
    },
    { scope: "worker" },
  ],

  window: [
    async ({ app }, use): Promise<void> => {
      await use(await app.open());
    },
    { scope: "test", timeout: APP_LAUNCH_TIMEOUT_MS },
  ],

  screenshotMask: [
    // oxlint-disable-next-line no-empty-pattern
    async ({}, use): Promise<void> => {
      await use({ locators: [] });
    },
    { scope: "test" },
  ],

  logTestProgress: [
    // oxlint-disable-next-line no-empty-pattern
    async ({}, use, testInfo): Promise<void> => {
      const name = `${path.basename(testInfo.file)} › ${testInfo.title}`;
      consola.info(`\u001B[33m[START]\u001B[0m ${name}`);
      const start = Date.now();
      await use(undefined);
      const statusColor = testInfo.status === "passed" ? "\u001B[32m" : "\u001B[31m";
      const status = (testInfo.status ?? "done").toUpperCase();
      const duration = ((Date.now() - start) / MILLISECONDS_PER_SECOND).toFixed(2);
      consola.info(
        `\u001B[35m[END]\u001B[0m ${name} : ${statusColor}TEST ${status}\u001B[0m (${duration}s)`,
      );
    },
    { auto: true },
  ],

  autoScreenshot: [
    async (
      { app, beforeScreenshot, appScreenshotMask, screenshotMask },
      use,
      testInfo,
    ): Promise<void> => {
      await use(undefined);
      // Read at teardown: the test may have restarted the app
      const { window } = app;
      if (testInfo.status === testInfo.expectedStatus) {
        await beforeScreenshot(window);
        await waitForActionSettled(window);
        await expect(window).toHaveScreenshot(screenshotPath(testInfo), {
          mask: [...appScreenshotMask(window), ...screenshotMask.locators],
        });
      }
    },
    { auto: true },
  ],
});

export { test };
export type { AppTestFixtures, AppWorkerFixtures, LaunchedApp, RunningApp };

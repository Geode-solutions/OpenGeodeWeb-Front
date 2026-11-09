// Third party imports
import { type Page, test as base } from "@playwright/test";

// Local imports
import { type RunningApp, startApp } from "./app";

interface WorkerFixtures {
  app: RunningApp;
  window: Page;
}

// One app per worker, shared by the tests of a file (they run serially and build on each other)
const test = base.extend<object, WorkerFixtures>({
  app: [
    async ({ playwright, browserName, headless, channel, launchOptions }, use): Promise<void> => {
      const browser = await playwright[browserName].launch({ ...launchOptions, headless, channel });
      const app = await startApp(browser);
      await use(app);
      await app.cleanup();
      await browser.close();
    },
    { scope: "worker" },
  ],
  window: [
    async ({ app }, use): Promise<void> => {
      await use(app.window);
    },
    { scope: "worker" },
  ],
});

export { test };
export { expect } from "@playwright/test";

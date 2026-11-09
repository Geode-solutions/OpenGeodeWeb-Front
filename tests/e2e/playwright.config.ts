// Third party imports
import { defineConfig, devices } from "@playwright/test";

const MILLISECONDS = 1000;
const BROWSER_TIMEOUT = 60;
const CI_RETRIES = 1;
const LINUX_MAX_DIFF_PIXEL_RATIO = 0.02;
const SCREENSHOT_THRESHOLD = 0.3;

const isCI = process.env.CI !== undefined && process.env.CI !== "";
// The screenshot tool captures the tab with getDisplayMedia: chromium-headless-shell does not support it, so Chrome runs the full Chromium (new headless) and accepts the capture without the picker dialog
const CHROMIUM_CHANNEL = "chromium";
const AUTO_ACCEPT_TAB_CAPTURE = "--auto-accept-this-tab-capture";

// oxlint-disable-next-line import/no-default-export
export default defineConfig<{ mode: string }>({
  testDir: "./tests",
  testMatch: "**/*.test.ts",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? CI_RETRIES : 0,
  reporter: "html",
  timeout: BROWSER_TIMEOUT * MILLISECONDS,
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: LINUX_MAX_DIFF_PIXEL_RATIO,
      threshold: SCREENSHOT_THRESHOLD,
      pathTemplate: "./screenshots/{testFileName}/{testName}.png",
    },
  },
  use: {
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "browser-chrome",
      use: {
        ...devices["Desktop Chrome"],
        // Read by the fixtures of the tests copied from Vease
        mode: "BROWSER",
        channel: CHROMIUM_CHANNEL,
        launchOptions: { args: [AUTO_ACCEPT_TAB_CAPTURE] },
      },
    },
  ],
});

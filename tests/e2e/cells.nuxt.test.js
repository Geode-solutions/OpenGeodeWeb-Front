// Node imports
import path from "node:path";

// Third party imports
import { beforeAll, describe, expect, test } from "vitest";
import { createPage, setup, url } from "@nuxt/test-utils/e2e";

import { setupIntegrationTests } from "@ogw_tests/integration/setup";

// Local imports

const timeout = 180_000; // increased
const INTERVAL_TIMEOUT = 180_000; // for beforeAll

await setup({
  rootDir: path.resolve(import.meta.dirname),
  server: true,
  browser: true,
  setupTimeout: 80_000,
});

const file_name = "test.og_rgd2d";
const geode_object = "RegularGrid2D";
let id = "",
  projectFolderPath = "";

beforeAll(async () => {
  id = "";
  projectFolderPath = "";
  await setupIntegrationTests(file_name, geode_object);
}, INTERVAL_TIMEOUT);

describe("Dashboard E2E – Real Nitro Backend + Playwright Browser", () => {
  test(
    "HybridRenderingView component renders",
    async () => {
      const page = await createPage(url("/"));
      console.log("→ Page opened. Waiting for full load and rendering...");
      await page.waitForLoadState("networkidle", { timeout: 90_000 });
      page.waitForTimeout(5000);
      console.log("→ Taking screenshot...");
      await expect(page).toMatchScreenshot("hybrid-rendering-view");
    },
    timeout,
  );
});

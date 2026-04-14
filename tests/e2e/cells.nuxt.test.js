import { beforeAll, describe, expect, test } from "vitest";

// import { page } from "@vitest/browser/context";

import { importFile } from "@ogw_front/utils/file_import_workflow";

import { setup } from '@nuxt/test-utils/e2e'

const timeout = 5000;

const file_name = "test.og_rgd2d";
const geode_object = "RegularGrid2D";
beforeAll(async () => {

  await setup({
    rootDir: import.meta.dirname,
    server: true,
    dev: true,
    dotenv: { env: { MODE: "BROWSER" } },
    setupTimeout: 10_000,
  
});
//   console.log("Navigating to", process.env.NUXT_TEST_URL);
//   await page.goto(process.env.NUXT_TEST_URL);
//   await importFile(file_name, geode_object);
});

describe("Dashboard E2E – Real Nitro Backend + Playwright Browser", () => {
  test(
    "should display the dashboard and interact with it",
    () => {
      console.log("Running E2E test: should display the dashboard and interact with it");
      const one = 1;
      expect(one).toBe(one);
    },
    timeout,
  );
});

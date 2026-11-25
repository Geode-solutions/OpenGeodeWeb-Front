// Local imports
import { BREP_FILE, BREP_NAME, LAMBERT_93 } from "#browser_helpers/crs_test_data";
import { brepGeodeObjectType, pointSetGeodeObjectType } from "#browser_helpers/constants";
import {
  clickAssign,
  confirmAssign,
  expectCrsMismatch,
  expectCurrentCrs,
  expectFeedback,
  expectTreeCrs,
  openCrsFromTree,
  openCrsFromWarning,
  selectCrs,
} from "#browser_helpers/crs";
import { moveMouseOutOfTheWay } from "#browser_helpers/app_interaction";

import type { SuiteRuntime } from "#browser_helpers/suite_runtime";

// Constants
// Around Paris in Lambert-93 metres, without crs
const LAMBERT_FILE = "test_lambert93_no_crs.og_pts3d";
const LAMBERT_NAME = "test_lambert93_no_crs";
// The same points, saved in UTM 31N
const UTM_FILE = "test_utm31n.og_pts3d";
const UTM_NAME = "test_utm31n";
// Local coordinates: they fit no CRS
const LOCAL_FILE = "test.og_pts3d";
const LOCAL_NAME = "test";

// Shared with the apps built on this layer: each one runs it with its own test fixture and data loader
function registerTests({ test, loadTestDatas }: SuiteRuntime): void {
  test.describe.configure({ mode: "serial" });

  test("load a model", async ({ window }) => {
    await loadTestDatas(window, [BREP_FILE]);
  });

  // The first crs sets the project crs
  test("assign a crs to the model", async ({ window }) => {
    await openCrsFromTree(window, brepGeodeObjectType, BREP_NAME);
    await selectCrs(window, LAMBERT_93);
    await confirmAssign(window);
    await expectTreeCrs(window, brepGeodeObjectType, BREP_NAME, "EPSG:2154");
    await moveMouseOutOfTheWay(window);
  });

  // Their coordinates fit the project crs: they were made in it
  test("imported data without crs take the project crs", async ({ window }) => {
    await expectFeedback(window, `EPSG:2154 assigned: ${LAMBERT_NAME}`, async () => {
      await loadTestDatas(window, [LAMBERT_FILE]);
    });
    await expectTreeCrs(window, pointSetGeodeObjectType, LAMBERT_NAME, "EPSG:2154");
    await moveMouseOutOfTheWay(window);
  });

  test("imported data in another crs are converted to the project crs", async ({ window }) => {
    await expectFeedback(window, `Converted to EPSG:2154: ${UTM_NAME}`, async () => {
      await loadTestDatas(window, [UTM_FILE]);
    });
    await expectTreeCrs(window, pointSetGeodeObjectType, UTM_NAME, "EPSG:2154");
    await moveMouseOutOfTheWay(window);
  });

  // Local coordinates keep no crs: the warning offers to georeference them
  test("imported data that fit no crs are flagged in the tree", async ({ window }) => {
    await expectFeedback(
      window,
      `${LOCAL_NAME}: these coordinates do not match EPSG:2154`,
      async () => {
        await loadTestDatas(window, [LOCAL_FILE]);
      },
    );
    await expectCrsMismatch(window, pointSetGeodeObjectType, LOCAL_NAME, true);
    await moveMouseOutOfTheWay(window);
  });

  test("open the crs dialog from the warning", async ({ window }) => {
    await openCrsFromWarning(window, pointSetGeodeObjectType, LOCAL_NAME);
    await expectCurrentCrs(window, "None (local coordinates)");
  });

  test("select the project crs", async ({ window }) => {
    await selectCrs(window, LAMBERT_93);
  });

  // An explicit choice: assigned anyway, with the warning offering to georeference
  test("assign the project crs to the data", async ({ window }) => {
    await expectFeedback(window, "Georeference the data?", async () => {
      await clickAssign(window);
    });
    await expectCrsMismatch(window, pointSetGeodeObjectType, LOCAL_NAME, false);
    await moveMouseOutOfTheWay(window);
  });
}

export { registerTests };

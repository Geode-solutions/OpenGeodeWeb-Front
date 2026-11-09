// Local imports
// oxlint-disable-next-line no-relative-parent-imports
import { loadTestDatas } from "../utils/app";
// oxlint-disable-next-line no-relative-parent-imports
import { expect, test } from "../utils/fixtures";

const inputFilename = "test.og_psf3d";
const geodeObjectType = "PolygonalSurface3D";

test.describe.configure({ mode: "serial" });

test("viewer is rendered", async ({ window }) => {
  await expect(window.getByTestId("hybridViewer")).toBeVisible();
});

test("load a polygonal surface through the e2e hook", async ({ window }) => {
  const dataIds = await loadTestDatas(window, [
    { filename: inputFilename, geode_object_type: geodeObjectType },
  ]);
  expect(dataIds).toHaveLength(1);
  await expect(window.getByTestId("mainObjectTree")).toBeVisible();
  await expect(window.getByTestId("treeItemLabel").first()).toBeVisible();
});

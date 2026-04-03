// Third party imports
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-vue";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json" with { type: "json" };

// Local imports
import { Status } from "@ogw_front/utils/status";
import { cleanupBackend } from "@ogw_front/utils/local/cleanup";
import { setupIntegrationTests } from "@ogw_tests/integration/setup";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useViewerStore } from "@ogw_front/stores/viewer";

import { HybridRenderingView } from "@ogw_front/components/HybridRenderingView.vue";

// Local constants
const INTERVAL_TIMEOUT = 60_000;
const mesh_cells_schemas = viewer_schemas.opengeodeweb_viewer.mesh.cells;
const file_name = "test.og_rgd2d";
const geode_object = "RegularGrid2D";

let id = "",
  projectFolderPath = "";

beforeAll(async () => {
  id = "";
  projectFolderPath = "";
  ({ id, projectFolderPath } = await setupIntegrationTests(file_name, geode_object));
}, INTERVAL_TIMEOUT);

afterAll(async () => {
  console.log("afterAll mesh cells kill", projectFolderPath);
  await cleanupBackend(projectFolderPath);
});

describe("Mesh cells", () => {
  describe("Cells visibility", () => {
    test("Visibility true", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const visibility = true;
      const spy = vi.spyOn(viewerStore, "request");
      const result = dataStyleStore.setMeshCellsVisibility(id, visibility);
      expect(result).toBeInstanceOf(Promise);
      await result;
      expect(spy).toHaveBeenCalledWith(
        mesh_cells_schemas.visibility,
        { id, visibility },
        {
          response_function: expect.any(Function),
        },
      );
      expect(dataStyleStore.meshCellsVisibility(id)).toBe(visibility);
      const hybridRenderingView = await render(HybridRenderingView, {
        global: {
          plugins: [vuetify],
        },
      });
      await expect(hybridRenderingView.container).toMatchScreenshot();
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });
  });
});

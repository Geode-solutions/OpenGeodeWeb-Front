import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
// import { server } from "@vitest/browser/context";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json" with { type: "json" };

import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useViewerStore } from "@ogw_front/stores/viewer";
import HybridRenderingView from "@ogw_front/components/HybridRenderingView.vue";

// NO more direct imports of cleanupBackend / setupIntegrationTests here ← key change

const INTERVAL_TIMEOUT = 60_000;
const mesh_cells_schemas = viewer_schemas.opengeodeweb_viewer.mesh.cells;
const file_name = "test.og_rgd2d";
const geode_object = "RegularGrid2D";

let id = "",
  projectFolderPath = "";

beforeAll(async () => {
  // This runs in the browser but the actual work happens in Node
  ({ id, projectFolderPath } = await commands.serverSetup(file_name, geode_object));
}, INTERVAL_TIMEOUT);

afterAll(async () => {
  await commands.serverCleanup(projectFolderPath);
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
    });
  });
});

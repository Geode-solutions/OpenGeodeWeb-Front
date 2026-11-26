// Third party imports
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import { beforeAllTimeout, setupIntegrationTests } from "@ogw_tests/integration/setup";
import { Status } from "@ogw_front/utils/status";
import { assertDefined } from "@ogw_tests/utils";
import { cleanupBackend } from "@ogw_server/utils/cleanup";
import { importFile } from "@ogw_front/utils/import_workflow";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const image_schemas = viewer_schemas.opengeodeweb_viewer.image;
const file_name = "test.og_img2d";
const geode_object = "RasterImage2D";
const OPACITY = 0.4;

let id = "";
let projectFolderPath = "";

describe("image", () => {
  beforeAll(async () => {
    ({ id, projectFolderPath } = await setupIntegrationTests(file_name, geode_object));
  }, beforeAllTimeout);

  afterAll(async () => {
    await cleanupBackend(projectFolderPath);
  });

  test("a raster image is imported as an image", async () => {
    const item = await useDataStore().item(id);
    expect(item.viewer_object_type).toBe("image");
    expect(useDataStyleStore().imageVisibility(id)).toBe(true);
    expect(useDataStyleStore().imageOpacity(id)).toBe(1);
  });

  describe("image visibility", () => {
    test.each([false, true])("visibility %s", async (visibility) => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const spy = vi.spyOn(viewerStore, "request");
      await dataStyleStore.setVisibility(id, visibility);
      expect(spy).toHaveBeenCalledWith(
        { schema: image_schemas.visibility, params: { id, visibility } },
        {
          // oxlint-disable-next-line no-unsafe-assignment -- expect.any(Function) is untyped by design, this is a vitest matcher not a real callback.
          response_function: expect.any(Function),
        },
      );
      expect(dataStyleStore.imageVisibility(id)).toBe(visibility);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });
  });

  describe("image opacity", () => {
    test("opacity", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const spy = vi.spyOn(viewerStore, "request");
      await dataStyleStore.setImageOpacity(id, OPACITY);
      expect(spy).toHaveBeenCalledWith(
        { schema: image_schemas.opacity, params: { id, opacity: OPACITY } },
        {
          // oxlint-disable-next-line no-unsafe-assignment -- expect.any(Function) is untyped by design, this is a vitest matcher not a real callback.
          response_function: expect.any(Function),
        },
      );
      expect(dataStyleStore.imageOpacity(id)).toBe(OPACITY);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });
  });

  describe("apply image default style", () => {
    test("apply image default style", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      await dataStyleStore.applyImageStyle(id);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });
  });

  describe("raster image 3d", () => {
    test("is imported and styled as an image", async () => {
      const dataStyleStore = useDataStyleStore();
      const viewerStore = useViewerStore();
      const [imported] = await importFile("test.og_img3d", "RasterImage3D");
      const id3d = assertDefined(imported, "No object imported from test.og_img3d");
      const item = await useDataStore().item(id3d);
      expect(item.viewer_object_type).toBe("image");
      await dataStyleStore.setImageOpacity(id3d, OPACITY);
      await dataStyleStore.setVisibility(id3d, false);
      expect(dataStyleStore.imageOpacity(id3d)).toBe(OPACITY);
      expect(dataStyleStore.imageVisibility(id3d)).toBe(false);
      expect(viewerStore.status).toBe(Status.CONNECTED);
    });
  });
});

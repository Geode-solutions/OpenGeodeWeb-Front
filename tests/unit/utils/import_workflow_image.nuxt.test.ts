// Third party imports
import { describe, expect, test, vi } from "vitest";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import {
  IMAGE_TYPES,
  mockHybridVisibility,
  mockViewer,
  sentRequests,
} from "@ogw_tests/unit/stores/image_style_helpers";
import { mockAs, setupActivePinia } from "@ogw_tests/utils";
import { importFile } from "@ogw_front/utils/import_workflow";
import { useBackStore } from "@ogw_front/stores/back";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

vi.setConfig({ testTimeout: 10_000 });

const image_schemas = viewer_schemas.opengeodeweb_viewer.image;

describe("import file of a raster image", () => {
  test.each(IMAGE_TYPES)("a %s is styled as an image", async (geode_object_type) => {
    setupActivePinia();
    const imageId = crypto.randomUUID();
    const image = {
      id: imageId,
      name: "image",
      viewer_object_type: "image",
      geode_object_type,
      binary_light_viewable: "light",
    };
    const backStore = useBackStore();
    backStore.request = mockAs<typeof backStore.request>(
      vi.fn<() => Promise<unknown>>().mockResolvedValue({ data: [image] }),
    );
    const dataStore = useDataStore();
    dataStore.item = mockAs<typeof dataStore.item>(
      vi.fn<() => Promise<unknown>>().mockResolvedValue({ ...image, data_id: imageId }),
    );
    // The viewer registration takes long enough for the default style to be stored
    const dataStyleStore = useDataStyleStore();
    const registerObject = vi.fn<() => Promise<void>>(async () => {
      await vi.waitFor(() => {
        expect(dataStyleStore.styles[imageId]).toBeDefined();
      });
    });
    dataStore.registerObject = mockAs<typeof dataStore.registerObject>(registerObject);
    const hybridViewerStore = useHybridViewerStore();
    const addItem = vi.fn<() => Promise<void>>().mockResolvedValue();
    hybridViewerStore.addItem = mockAs<typeof hybridViewerStore.addItem>(addItem);
    mockHybridVisibility();
    const request = mockViewer();

    await expect(importFile("image.og_img2d", geode_object_type)).resolves.toStrictEqual([imageId]);

    const schemas = sentRequests(request).map(({ schema }) => schema);
    expect(registerObject).toHaveBeenCalledWith(imageId, "image");
    expect(schemas).toContain(image_schemas.visibility);
    expect(schemas).toContain(image_schemas.opacity);
    expect(addItem).toHaveBeenCalledWith(imageId);
  });
});

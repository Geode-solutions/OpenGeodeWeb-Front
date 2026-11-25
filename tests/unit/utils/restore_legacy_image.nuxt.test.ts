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
import { importWorkflowFromSnapshot } from "@ogw_front/utils/import_workflow";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useTreeviewStore } from "@ogw_front/stores/treeview";

vi.setConfig({ testTimeout: 10_000 });

const image_schemas = viewer_schemas.opengeodeweb_viewer.image;

// Projects saved before raster images were image objects hold them as meshes, with an empty style
describe("restore of a raster image saved as a mesh", () => {
  test.each(IMAGE_TYPES)("a legacy %s is restored as an image", async (geode_object_type) => {
    setupActivePinia();
    const imageId = crypto.randomUUID();
    const legacyItem = {
      id: imageId,
      geode_id: imageId,
      name: "image",
      viewer_object_type: "mesh" as const,
      geode_object_type,
      binary_light_viewable: "light",
    };
    const dataStore = useDataStore();
    const dataStyleStore = useDataStyleStore();
    // The viewer registration takes long enough for the default style to be stored
    dataStore.registerObject = mockAs<typeof dataStore.registerObject>(
      vi.fn<() => Promise<void>>(async () => {
        await vi.waitFor(() => {
          expect(dataStyleStore.styles[imageId]).toBeDefined();
        });
      }),
    );
    const hybridViewerStore = useHybridViewerStore();
    hybridViewerStore.addItem = mockAs<typeof hybridViewerStore.addItem>(
      vi.fn<() => Promise<void>>().mockResolvedValue(),
    );
    hybridViewerStore.remoteRender = mockAs<typeof hybridViewerStore.remoteRender>(
      vi.fn<() => Promise<void>>().mockResolvedValue(),
    );
    hybridViewerStore.setBackgroundColor = mockAs<typeof hybridViewerStore.setBackgroundColor>(
      vi.fn<() => Promise<void>>().mockResolvedValue(),
    );
    mockHybridVisibility();
    const request = mockViewer();

    await expect(importWorkflowFromSnapshot([legacyItem])).resolves.toStrictEqual([imageId]);
    const item = await dataStore.item(imageId);
    const treeChildren = useTreeviewStore().items.flatMap((group) => group.children);
    const treeChild = treeChildren.find((child) => child.id === imageId);
    expect([item.viewer_object_type, treeChild?.viewer_object_type]).toStrictEqual([
      "image",
      "image",
    ]);

    request.mockClear();
    await dataStyleStore.importStores({
      styles: { [imageId]: { id: imageId } },
      componentStyles: {},
      modelComponentTypeStyles: {},
    });
    // The style cache follows the database asynchronously
    await vi.waitFor(() => {
      expect(dataStyleStore.imageVisibility(imageId)).toBe(true);
    });
    expect(dataStyleStore.imageOpacity(imageId)).toBe(1);
    await dataStyleStore.applyAllStylesFromState();

    const schemas = sentRequests(request).map(({ schema }) => schema);
    expect(schemas).toStrictEqual(
      expect.arrayContaining([image_schemas.visibility, image_schemas.opacity]),
    );
  });
});

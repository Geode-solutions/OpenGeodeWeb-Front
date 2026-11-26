// Third party imports
import { beforeEach, describe, expect, test, vi } from "vitest";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import {
  IMAGE_TYPES,
  mockHybridVisibility,
  mockImageItem,
  mockViewer,
  sentRequests,
} from "@ogw_tests/unit/stores/image_style_helpers";
import { mockAs, setupActivePinia } from "@ogw_tests/utils";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

vi.setConfig({ testTimeout: 10_000 });

const image_schemas = viewer_schemas.opengeodeweb_viewer.image;
const STORED_OPACITY = 0.4;

describe("data style store with images", () => {
  // Styles persist in the database between tests: each test styles its own image
  let imageId = "";

  beforeEach(() => {
    setupActivePinia();
    imageId = crypto.randomUUID();
  });

  test.each(IMAGE_TYPES)("applies the default style of a %s", async (type) => {
    const request = mockViewer();
    mockHybridVisibility();
    mockImageItem(imageId, type);
    const dataStyleStore = useDataStyleStore();
    await dataStyleStore.addDataStyle(imageId, type);
    await vi.waitFor(() => {
      expect(dataStyleStore.styles[imageId]).toBeDefined();
    });

    await dataStyleStore.applyDefaultStyle(imageId);

    const schemas = sentRequests(request).map(({ schema }) => schema);
    expect(schemas).toHaveLength(2);
    expect(schemas).toContain(image_schemas.visibility);
    expect(schemas).toContain(image_schemas.opacity);
    expect(dataStyleStore.imageVisibility(imageId)).toBe(true);
    expect(dataStyleStore.imageOpacity(imageId)).toBe(1);
  });

  test.each(IMAGE_TYPES)("sets the visibility of a %s through the image schema", async (type) => {
    const request = mockViewer();
    const setVisibility = mockHybridVisibility();
    mockImageItem(imageId, type);
    const dataStyleStore = useDataStyleStore();

    await dataStyleStore.setVisibility(imageId, false);

    expect(sentRequests(request)).toStrictEqual([
      { schema: image_schemas.visibility, params: { id: imageId, visibility: false } },
    ]);
    expect(setVisibility).toHaveBeenCalledWith(imageId, false);
    expect(dataStyleStore.objectVisibility(imageId)).toBe(false);
  });

  test.each(IMAGE_TYPES)("re-applies the style of a %s of a loaded project", async (type) => {
    const request = mockViewer();
    mockHybridVisibility();
    mockImageItem(imageId, type);
    const hybridViewerStore = useHybridViewerStore();
    hybridViewerStore.setBackgroundColor = mockAs<typeof hybridViewerStore.setBackgroundColor>(
      vi.fn<() => Promise<void>>().mockResolvedValue(),
    );
    await useDataStyleState().mutateStyle(imageId, { visibility: true, opacity: STORED_OPACITY });

    await useDataStyleStore().applyAllStylesFromState();

    expect(sentRequests(request)).toContainEqual({
      schema: image_schemas.opacity,
      params: { id: imageId, opacity: STORED_OPACITY },
    });
    expect(sentRequests(request)).toContainEqual({
      schema: image_schemas.visibility,
      params: { id: imageId, visibility: true },
    });
  });
});

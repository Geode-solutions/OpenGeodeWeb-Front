// Third party imports
import { beforeEach, describe, expect, test, vi } from "vitest";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import {
  IMAGE_TYPES,
  mockHybridVisibility,
  mockViewer,
  sentRequests,
} from "@ogw_tests/unit/stores/image_style_helpers";
import { mockAs, setupActivePinia } from "@ogw_tests/utils";
import { getDefaultStyle } from "@ogw_front/utils/default_styles";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useImageStyle } from "@ogw_internal/stores/data_style/image/index";
import { useViewerStore } from "@ogw_front/stores/viewer";

vi.setConfig({ testTimeout: 10_000 });

const image_schemas = viewer_schemas.opengeodeweb_viewer.image;
const HALF_OPACITY = 0.5;
const LOW_OPACITY = 0.2;
const STORED_OPACITY = 0.3;

describe("image default style", () => {
  test.each(IMAGE_TYPES)("%s is visible and opaque", (type) => {
    expect(getDefaultStyle(type)).toStrictEqual({ visibility: true, opacity: 1 });
  });
});

describe("image style", () => {
  // Styles persist in the database between tests: each test styles its own image
  let imageId = "";

  beforeEach(() => {
    setupActivePinia();
    imageId = crypto.randomUUID();
  });

  test("applying a style holding only its data_id applies nothing", async () => {
    const request = mockViewer();
    await useDataStyleState().mutateStyle(imageId, {});

    await expect(useImageStyle().applyImageStyle(imageId)).resolves.toStrictEqual([]);
    expect(request).not.toHaveBeenCalled();
  });

  test("an unknown style key is refused", async () => {
    mockViewer();
    await useDataStyleState().mutateStyle(imageId, { points: {} });

    await expect(useImageStyle().applyImageStyle(imageId)).rejects.toThrow(
      "Unknown image key: points",
    );
  });

  test.each([true, false])("visibility %s is sent and stored", async (visibility) => {
    const request = mockViewer();
    const setVisibility = mockHybridVisibility();
    const imageStyle = useImageStyle();

    await imageStyle.setImageVisibility(imageId, visibility);

    expect(sentRequests(request)).toStrictEqual([
      { schema: image_schemas.visibility, params: { id: imageId, visibility } },
    ]);
    expect(setVisibility).toHaveBeenCalledWith(imageId, visibility);
    expect(imageStyle.imageVisibility(imageId)).toBe(visibility);
  });

  test.each([0, HALF_OPACITY, 1])("opacity %s is sent and stored", async (opacity) => {
    const request = mockViewer();
    const imageStyle = useImageStyle();

    await imageStyle.setImageOpacity(imageId, opacity);

    expect(sentRequests(request)).toStrictEqual([
      { schema: image_schemas.opacity, params: { id: imageId, opacity } },
    ]);
    expect(imageStyle.imageOpacity(imageId)).toBe(opacity);
  });

  test("a failed request leaves the style unchanged", async () => {
    const viewerStore = useViewerStore();
    viewerStore.request = mockAs<typeof viewerStore.request>(
      vi.fn<() => Promise<never>>().mockRejectedValue(new Error("viewer down")),
    );
    await useDataStyleState().mutateStyle(imageId, { visibility: true, opacity: 1 });
    const imageStyle = useImageStyle();

    await expect(imageStyle.setImageOpacity(imageId, LOW_OPACITY)).rejects.toThrow("viewer down");
    await expect(imageStyle.setImageVisibility(imageId, false)).rejects.toThrow("viewer down");
    expect(imageStyle.imageOpacity(imageId)).toBe(1);
    expect(imageStyle.imageVisibility(imageId)).toBe(true);
  });

  test("applying the stored style sends its visibility and opacity", async () => {
    const request = mockViewer();
    mockHybridVisibility();
    await useDataStyleState().mutateStyle(imageId, { visibility: false, opacity: STORED_OPACITY });

    await useImageStyle().applyImageStyle(imageId);

    const sent = sentRequests(request);
    expect(sent).toHaveLength(2);
    expect(sent).toContainEqual({
      schema: image_schemas.visibility,
      params: { id: imageId, visibility: false },
    });
    expect(sent).toContainEqual({
      schema: image_schemas.opacity,
      params: { id: imageId, opacity: STORED_OPACITY },
    });
  });
});

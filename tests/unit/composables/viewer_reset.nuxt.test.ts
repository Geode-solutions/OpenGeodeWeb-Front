// oxlint-disable vitest/require-mock-type-parameters
import { afterEach, describe, expect, test, vi } from "vitest";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

import {
  setOrientationMarkerVisibility,
  useOrientationMarkerVisible,
} from "@ogw_front/composables/orientation_overlay";
import { afterViewerReset } from "@ogw_front/composables/viewer_reset";
import { mockAs } from "@ogw_tests/utils";
import { setSceneColors } from "@ogw_front/utils/default_styles";

vi.setConfig({ testTimeout: 10_000 });

type ViewerRequest = Parameters<typeof afterViewerReset>[0];

const { set_background_color, set_orientation_widget, set_text_style } =
  viewer_schemas.opengeodeweb_viewer.viewer;
const BRAND_BACKGROUND = { red: 160, green: 180, blue: 187, alpha: 1 };
const BRAND_TEXT = { red: 31, green: 46, blue: 51, alpha: 1 };

function setOrientationOverlay(enabled: boolean): void {
  // The resolved app config type holds the layer's literal default
  Object.assign(useAppConfig().ogwFront, { orientationOverlay: enabled });
}

function recordRequests(): { request: ViewerRequest; schemas: unknown[] } {
  const schemas: unknown[] = [];
  const request = mockAs<ViewerRequest>(
    vi.fn(async (args: { schema: unknown }) => {
      schemas.push(args.schema);
      await Promise.resolve();
    }),
  );
  return { request, schemas };
}

describe("after a viewer reset", () => {
  afterEach(() => {
    setSceneColors({});
    setOrientationOverlay(false);
  });

  test("leaves the viewer as is for an app without scene colors nor overlay", async () => {
    const { request } = recordRequests();
    await afterViewerReset(request);
    expect(request).not.toHaveBeenCalled();
  });

  test("gives the viewer the app scene colors, then hides its marker", async () => {
    setSceneColors({ background: BRAND_BACKGROUND, text: BRAND_TEXT });
    setOrientationOverlay(true);
    const { request, schemas } = recordRequests();
    await afterViewerReset(request);
    expect(schemas).toStrictEqual([set_background_color, set_text_style, set_orientation_widget]);
    expect(request).toHaveBeenCalledWith({
      schema: set_background_color,
      // oxlint-disable-next-line id-length -- the viewer schema requires { r, g, b }
      params: { color: { r: 160, g: 180, b: 187 } },
    });
    expect(request).toHaveBeenCalledWith({
      schema: set_text_style,
      // oxlint-disable-next-line id-length -- the viewer schema requires { r, g, b }
      params: { color: { r: 31, g: 46, b: 51 }, font_family: "arial", opacity: 1 },
    });
  });

  test("hides the marker even when the viewer rejects the scene colors", async () => {
    setSceneColors({ background: BRAND_BACKGROUND });
    setOrientationOverlay(true);
    const request = vi
      .fn<(args: { schema: unknown }) => Promise<unknown>>()
      .mockRejectedValueOnce(new Error("timeout"))
      .mockResolvedValue({});
    await expect(afterViewerReset(mockAs<ViewerRequest>(request))).resolves.toBeUndefined();
    expect(request.mock.calls.map(([args]) => args.schema)).toStrictEqual([
      set_background_color,
      set_orientation_widget,
    ]);
  });

  test("shows the orientation marker again", async () => {
    const { request } = recordRequests();
    await setOrientationMarkerVisibility(false, request);
    expect(useOrientationMarkerVisible().value).toBe(false);
    await afterViewerReset(request);
    expect(useOrientationMarkerVisible().value).toBe(true);
  });
});

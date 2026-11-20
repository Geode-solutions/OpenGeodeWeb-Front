// oxlint-disable vitest/require-mock-type-parameters
import { afterEach, describe, expect, test, vi } from "vitest";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

import {
  hideViewerMarker,
  hideViewerMarkerRequest,
  viewerOrientationMarker,
  withViewerMarker,
} from "@ogw_front/composables/orientation_overlay";

vi.setConfig({ testTimeout: 10_000 });

const { set_orientation_widget } = viewer_schemas.opengeodeweb_viewer.viewer;

function setOrientationOverlay(enabled: boolean): void {
  // The resolved app config type holds the layer's literal default
  Object.assign(useAppConfig().ogwFront, { orientationOverlay: enabled });
}

describe("orientation marker sent to the viewer", () => {
  afterEach(() => {
    setOrientationOverlay(false);
  });

  test("is the scene style choice without the overlay", () => {
    setOrientationOverlay(false);
    expect(viewerOrientationMarker("compass")).toBe("compass");
    expect(hideViewerMarkerRequest()).toBeUndefined();
  });

  test("hides the VTK marker after a viewer reset only with the overlay", async () => {
    const request = vi.fn(async () => {
      await Promise.reject(new Error("unknown marker"));
    });
    setOrientationOverlay(false);
    await hideViewerMarker(request);
    expect(request).not.toHaveBeenCalled();
    setOrientationOverlay(true);
    // An older viewer rejecting the "none" marker does not fail the reset
    await expect(hideViewerMarker(request)).resolves.toBeUndefined();
    expect(request).toHaveBeenCalledWith({
      schema: set_orientation_widget,
      params: { marker: "none" },
    });
  });

  test("draws the VTK marker for the time of a screenshot with the overlay", async () => {
    const calls: string[] = [];
    const request = vi.fn(async (args: { params: { marker: string } }) => {
      calls.push(args.params.marker);
      await Promise.resolve();
    });
    async function capture(): Promise<string> {
      calls.push("capture");
      await Promise.resolve();
      return "image";
    }
    setOrientationOverlay(false);
    await expect(withViewerMarker("compass", request, capture)).resolves.toBe("image");
    expect(calls).toStrictEqual(["capture"]);
    calls.length = 0;
    setOrientationOverlay(true);
    await expect(withViewerMarker("compass", request, capture)).resolves.toBe("image");
    expect(calls).toStrictEqual(["compass", "capture", "none"]);
  });

  test("hides the VTK marker again when the screenshot fails", async () => {
    const markers: string[] = [];
    const request = vi.fn(async (args: { params: { marker: string } }) => {
      markers.push(args.params.marker);
      await Promise.resolve();
    });
    setOrientationOverlay(true);
    await expect(
      withViewerMarker("axes", request, async () => {
        await Promise.reject(new Error("capture failed"));
      }),
    ).rejects.toThrow("capture failed");
    expect(markers).toStrictEqual(["axes", "none"]);
  });
});

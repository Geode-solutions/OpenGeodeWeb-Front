import type { ComputedRef } from "vue";
import type { SceneOrientationWidget } from "@ogw_internal/stores/data_style/types";
import { consola } from "consola";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Marker value hiding the VTK orientation marker of the viewer
const NO_VIEWER_MARKER = "none";

type ViewerOrientationMarker = SceneOrientationWidget | typeof NO_VIEWER_MARKER;

// Apps opt in with `ogwFront.orientationOverlay` in their app.config.ts: the front then draws the
// Orientation marker (Viewer/OrientationOverlay.vue) and the viewer draws none.
function readOrientationOverlay(appConfig: ReturnType<typeof useAppConfig>): boolean {
  // The resolved type holds the layer's literal default (false): widen it to the config input type
  const ogwFront: { orientationOverlay?: boolean } | undefined = appConfig.ogwFront;
  return ogwFront?.orientationOverlay === true;
}

function isOrientationOverlayEnabled(): boolean {
  return readOrientationOverlay(useAppConfig());
}

function useOrientationOverlay(): ComputedRef<boolean> {
  const appConfig = useAppConfig();
  return computed(() => readOrientationOverlay(appConfig));
}

// Marker sent to the viewer for the scene style choice: the scene style keeps the user's choice
function viewerOrientationMarker(marker: SceneOrientationWidget): ViewerOrientationMarker {
  return isOrientationOverlayEnabled() ? NO_VIEWER_MARKER : marker;
}

interface HideViewerMarkerRequest {
  schema: typeof viewer_schemas.opengeodeweb_viewer.viewer.set_orientation_widget;
  params: { marker: typeof NO_VIEWER_MARKER };
}

// Request hiding the VTK marker, undefined when the app keeps it
function hideViewerMarkerRequest(): HideViewerMarkerRequest | undefined {
  if (!isOrientationOverlayEnabled()) {
    return undefined;
  }
  return {
    schema: viewer_schemas.opengeodeweb_viewer.viewer.set_orientation_widget,
    params: { marker: NO_VIEWER_MARKER },
  };
}

// To call after each viewer reset, which brings the VTK axes back
async function hideViewerMarker(
  request: (args: HideViewerMarkerRequest) => Promise<unknown>,
): Promise<void> {
  const hideMarker = hideViewerMarkerRequest();
  if (!hideMarker) {
    return;
  }
  try {
    await request(hideMarker);
  } catch (error) {
    // A viewer without the "none" marker keeps drawing its own: not a reason to fail the reset, but both markers
    // Then show, so it is reported
    consola.warn("[OrientationOverlay] The viewer kept its orientation marker:", error);
  }
}

interface ViewerMarkerRequest {
  schema: typeof viewer_schemas.opengeodeweb_viewer.viewer.set_orientation_widget;
  params: { marker: ViewerOrientationMarker };
}

// The viewer renders the scene screenshots, without the front overlay: with the overlay on, the VTK marker of the
// User's choice is drawn for the time of the capture, then hidden again (also when the capture fails)
async function withViewerMarker<Result>(
  marker: SceneOrientationWidget,
  request: (args: ViewerMarkerRequest) => Promise<unknown>,
  capture: () => Promise<Result>,
): Promise<Result> {
  if (!isOrientationOverlayEnabled()) {
    return capture();
  }
  await request({
    schema: viewer_schemas.opengeodeweb_viewer.viewer.set_orientation_widget,
    params: { marker },
  });
  try {
    return await capture();
  } finally {
    await hideViewerMarker(request);
  }
}

export {
  NO_VIEWER_MARKER,
  hideViewerMarker,
  hideViewerMarkerRequest,
  isOrientationOverlayEnabled,
  useOrientationOverlay,
  viewerOrientationMarker,
  withViewerMarker,
};
export type { ViewerOrientationMarker };

import type { ColorRGB, ColorRGBA } from "@geode/opengeodeweb-viewer/schema_types";
import type { ViewerRequest } from "@ogw_front/stores/viewer_helpers/request";
// Third party imports
import { consola } from "consola";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import { getDefaultSceneStyle, getSceneColors } from "@ogw_front/utils/default_styles";
import {
  hideViewerMarker,
  resetOrientationMarkerVisibility,
} from "@ogw_front/composables/orientation_overlay";

// The scene colors of the viewer have no alpha (the text one takes it as its opacity)
function toViewerColor({ red, green, blue }: ColorRGBA): ColorRGB {
  return { red, green, blue };
}

// A reset viewer draws its own scene colors: give it the app's (`ogwFront.sceneColors`), which the default
// Scene style shows
async function applyAppSceneColors(request: ViewerRequest): Promise<void> {
  const sceneColors = getSceneColors();
  const { background_color, text } = getDefaultSceneStyle();
  if (sceneColors.background) {
    await request({
      schema: viewer_schemas.opengeodeweb_viewer.viewer.set_background_color,
      params: { color: toViewerColor(background_color) },
    });
  }
  if (sceneColors.text) {
    await request({
      schema: viewer_schemas.opengeodeweb_viewer.viewer.set_text_style,
      params: {
        color: toViewerColor(text.color),
        font_family: text.font_family,
        opacity: text.color.alpha,
      },
    });
  }
}

// To call after each viewer reset (reset_visualization), which brings back the viewer's own scene. Neither
// Step fails the reset: the viewer stays usable with its own colors, and the marker is hidden either way
async function afterViewerReset(request: ViewerRequest): Promise<void> {
  resetOrientationMarkerVisibility();
  try {
    await applyAppSceneColors(request);
  } catch (error) {
    consola.warn("[SceneColors] The viewer kept its own scene colors:", error);
  }
  await hideViewerMarker(request);
}

export { afterViewerReset, toViewerColor };

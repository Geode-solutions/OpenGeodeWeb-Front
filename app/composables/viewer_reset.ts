import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";
import type { ViewerRequest } from "@ogw_front/stores/viewer_helpers/request";
// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import { getDefaultSceneStyle, getSceneColors } from "@ogw_front/utils/default_styles";
import { hideViewerMarker } from "@ogw_front/composables/orientation_overlay";

// oxlint-disable-next-line id-length -- the viewer schema requires { r, g, b }
function toViewerColor(color: RGBAColor): { r: number; g: number; b: number } {
  // oxlint-disable-next-line id-length -- the viewer schema requires { r, g, b }
  return { r: color.red, g: color.green, b: color.blue };
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

// To call after each viewer reset (reset_visualization), which brings back the viewer's own scene
async function afterViewerReset(request: ViewerRequest): Promise<void> {
  await applyAppSceneColors(request);
  await hideViewerMarker(request);
}

export { afterViewerReset, toViewerColor };

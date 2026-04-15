// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { useDataStore } from "@ogw_front/stores/data";
import { useModelCornersCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const model_corners_schemas = viewer_schemas.opengeodeweb_viewer.model.corners;

export function useModelCornersColorStyle() {
  const dataStore = useDataStore();
  const viewerStore = useViewerStore();
  const modelCornersCommonStyle = useModelCornersCommonStyle();

  function modelCornerColor(id, corner_id) {
    return modelCornersCommonStyle.modelCornerStyle(id, corner_id).color;
  }

  function setModelCornersColor(id, corner_ids, color, color_mode = "constant") {
    if (!corner_ids || corner_ids.length === 0) {
      return Promise.resolve();
    }
    return dataStore.getMeshComponentsViewerIds(id, corner_ids).then((corner_viewer_ids) => {
      if (!corner_viewer_ids || corner_viewer_ids.length === 0) {
        return modelCornersCommonStyle.mutateModelCornersStyle(id, corner_ids, {
          color,
          color_mode,
        });
      }
      const params = { id, block_ids: corner_viewer_ids, color_mode };
      if (color_mode === "constant") {
        params.color = color;
      }
      return viewerStore.request(model_corners_schemas.color, params, {
        response_function: () =>
          modelCornersCommonStyle.mutateModelCornersStyle(id, corner_ids, { color, color_mode }),
      });
    });
  }

  return {
    modelCornerColor,
    setModelCornersColor,
  };
}

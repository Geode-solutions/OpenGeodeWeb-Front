// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useModelCornersCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const model_corners_schemas = viewer_schemas.opengeodeweb_viewer.model.corners;

export function useModelCornersColorStyle() {
  const dataStore = useDataStore();
  const viewerStore = useViewerStore();
  const modelCornersCommonStyle = useModelCornersCommonStyle();
  const dataStyleState = useDataStyleState();

  function modelCornerColor(id, corner_id) {
    return modelCornersCommonStyle.modelCornerStyle(id, corner_id).color;
  }

  function setModelCornersColor(id, corner_ids, color, color_mode = "constant") {
    return dataStyleState
      .setModelTypeColor(id, corner_ids, color, color_mode, model_corners_schemas.color, {
        dataStore,
        viewerStore,
      })
      .then((res) => {
        if (!res) {
          return modelCornersCommonStyle.mutateModelCornersStyle(id, corner_ids, {
            color,
            color_mode,
          });
        }
        return res;
      });
  }

  return {
    modelCornerColor,
    setModelCornersColor,
  };
}

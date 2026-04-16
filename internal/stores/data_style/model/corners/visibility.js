// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useModelCornersCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const model_corners_schemas = viewer_schemas.opengeodeweb_viewer.model.corners;

export function useModelCornersVisibilityStyle() {
  const dataStore = useDataStore();
  const viewerStore = useViewerStore();
  const modelCornersCommonStyle = useModelCornersCommonStyle();
  const dataStyleState = useDataStyleState();

  function modelCornerVisibility(id, corner_id) {
    return modelCornersCommonStyle.modelCornerStyle(id, corner_id).visibility;
  }

  function setModelCornersVisibility(id, corner_ids, visibility) {
    return dataStyleState
      .setModelTypeVisibility(id, corner_ids, visibility, model_corners_schemas.visibility, {
        dataStore,
        viewerStore,
      })
      .then((res) => {
        if (!res) {
          return modelCornersCommonStyle.mutateModelCornersStyle(id, corner_ids, {
            visibility,
          });
        }
        return res;
      });
  }

  return {
    modelCornerVisibility,
    setModelCornersVisibility,
  };
}

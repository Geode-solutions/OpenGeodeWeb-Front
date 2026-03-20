// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { useModelPointsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const model_points_schemas = viewer_schemas.opengeodeweb_viewer.model.points;

export function useModelPointsVisibilityStyle() {
  const viewerStore = useViewerStore();
  const modelPointsCommonStyle = useModelPointsCommonStyle();

  function modelPointsVisibility(id) {
    return modelPointsCommonStyle.modelPointsStyle(id).visibility;
  }

  function setModelPointsVisibility(id, visibility) {
    return viewerStore.request(
      model_points_schemas.visibility,
      { id, visibility },
      {
        response_function: () => {
          modelPointsCommonStyle.modelPointsStyle(id).visibility = visibility;
          console.log(setModelPointsVisibility.name, { id }, modelPointsVisibility(id));
        },
      },
    );
  }

  return {
    modelPointsVisibility,
    setModelPointsVisibility,
  };
}

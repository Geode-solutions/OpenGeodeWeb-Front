// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { useModelPointsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const model_points_schemas = viewer_schemas.opengeodeweb_viewer.model.points;

export function useModelPointsSizeStyle() {
  const viewerStore = useViewerStore();
  const modelPointsCommonStyle = useModelPointsCommonStyle();

  function modelPointsSize(id) {
    return modelPointsCommonStyle.modelPointsStyle(id).size;
  }

  function setModelPointsSize(id, size) {
    return viewerStore.request(
      model_points_schemas.size,
      { id, size },
      {
        response_function: () => {
          return modelPointsCommonStyle.mutateModelPointsStyle(id, { size })
        },
      },
    );
  }

  return {
    modelPointsSize,
    setModelPointsSize,
  };
}

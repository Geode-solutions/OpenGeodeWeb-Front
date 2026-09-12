// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { useModelPointsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.model.points.visibility;

export function useModelPointsVisibilityStyle() {
  const viewerStore = useViewerStore();
  const modelPointsCommonStyle = useModelPointsCommonStyle();

  function modelPointsVisibility(id: string): boolean | undefined {
    return modelPointsCommonStyle.modelPointsStyle(id).visibility as boolean | undefined;
  }

  function setModelPointsVisibility(id: string, visibility: boolean | undefined) {
    const params = { id, visibility };
    return viewerStore.request(
      { schema, params },
      {
        response_function: () =>
          modelPointsCommonStyle.mutateModelPointsStyle(id, {
            visibility,
          }),
      },
    );
  }

  return {
    modelPointsVisibility,
    setModelPointsVisibility,
  };
}

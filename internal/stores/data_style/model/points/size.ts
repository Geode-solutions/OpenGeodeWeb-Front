// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { useModelPointsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.model.points.size;

export function useModelPointsSizeStyle() {
  const viewerStore = useViewerStore();
  const modelPointsCommonStyle = useModelPointsCommonStyle();

  function modelPointsSize(id: string): number | undefined {
    return modelPointsCommonStyle.modelPointsStyle(id).size as number | undefined;
  }

  function setModelPointsSize(id: string, size: number | undefined) {
    const params = { id, size };
    return viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: () => modelPointsCommonStyle.mutateModelPointsStyle(id, { size }),
      },
    );
  }

  return {
    modelPointsSize,
    setModelPointsSize,
  };
}

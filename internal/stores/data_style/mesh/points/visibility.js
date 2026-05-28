// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { useMeshPointsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.mesh.points.visibility;

export function useMeshPointsVisibilityStyle() {
  const viewerStore = useViewerStore();
  const meshPointsCommonStyle = useMeshPointsCommonStyle();

  function meshPointsVisibility(id) {
    return meshPointsCommonStyle.meshPointsStyle(id).visibility;
  }
  function setMeshPointsVisibility(id, visibility) {
    const params = { id, visibility };
    return viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: () => meshPointsCommonStyle.mutateMeshPointsStyle(id, { visibility }),
      },
    );
  }

  return {
    meshPointsVisibility,
    setMeshPointsVisibility,
  };
}

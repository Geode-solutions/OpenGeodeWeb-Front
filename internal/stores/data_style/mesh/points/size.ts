// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { useMeshPointsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.mesh.points.size;

export function useMeshPointsSizeStyle() {
  const viewerStore = useViewerStore();
  const meshPointsCommonStyle = useMeshPointsCommonStyle();

  function meshPointsSize(id) {
    return meshPointsCommonStyle.meshPointsStyle(id).size;
  }
  function setMeshPointsSize(id, size) {
    const params = { id, size };
    return viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: () => meshPointsCommonStyle.mutateMeshPointsStyle(id, { size }),
      },
    );
  }

  return {
    meshPointsSize,
    setMeshPointsSize,
  };
}

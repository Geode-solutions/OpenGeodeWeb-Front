// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { useMeshPointsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.mesh.points.color;

export function useMeshPointsColorStyle() {
  const viewerStore = useViewerStore();
  const meshPointsCommonStyle = useMeshPointsCommonStyle();

  function meshPointsColor(id) {
    return meshPointsCommonStyle.meshPointsColoring(id).color;
  }
  function setMeshPointsColor(id, color) {
    const params = { id, color };
    return viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: () =>
          meshPointsCommonStyle.mutateMeshPointsColoring(id, {
            color,
          }),
      },
    );
  }

  return {
    meshPointsColor,
    setMeshPointsColor,
  };
}

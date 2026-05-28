// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { useMeshPolygonsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.mesh.polygons.visibility;

export function useMeshPolygonsVisibilityStyle() {
  const viewerStore = useViewerStore();
  const meshPolygonsCommonStyle = useMeshPolygonsCommonStyle();

  function meshPolygonsVisibility(id) {
    return meshPolygonsCommonStyle.meshPolygonsStyle(id).visibility;
  }
  function setMeshPolygonsVisibility(id, visibility) {
    const params = { id, visibility };
    return viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: () =>
          meshPolygonsCommonStyle.mutateMeshPolygonsStyle(id, {
            visibility,
          }),
      },
    );
  }

  return {
    meshPolygonsVisibility,
    setMeshPolygonsVisibility,
  };
}

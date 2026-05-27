// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { useMeshPolyhedraCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.mesh.polyhedra.visibility;

export function useMeshPolyhedraVisibilityStyle() {
  const viewerStore = useViewerStore();
  const meshPolyhedraCommonStyle = useMeshPolyhedraCommonStyle();

  function meshPolyhedraVisibility(id) {
    return meshPolyhedraCommonStyle.meshPolyhedraStyle(id).visibility;
  }
  function setMeshPolyhedraVisibility(id, visibility) {
    const params = { id, visibility };
    return viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: () =>
          meshPolyhedraCommonStyle.mutateMeshPolyhedraStyle(id, {
            visibility,
          }),
      },
    );
  }

  return {
    meshPolyhedraVisibility,
    setMeshPolyhedraVisibility,
  };
}

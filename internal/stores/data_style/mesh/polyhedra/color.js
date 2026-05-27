// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { useMeshPolyhedraCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.mesh.polyhedra.color;

export function useMeshPolyhedraColorStyle() {
  const viewerStore = useViewerStore();
  const meshPolyhedraCommonStyle = useMeshPolyhedraCommonStyle();

  function meshPolyhedraColor(id) {
    return meshPolyhedraCommonStyle.meshPolyhedraColoring(id).color;
  }
  function setMeshPolyhedraColor(id, color) {
    const params = { id, color };
    return viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: () =>
          meshPolyhedraCommonStyle.mutateMeshPolyhedraColoring(id, {
            color,
          }),
      },
    );
  }

  return {
    meshPolyhedraColor,
    setMeshPolyhedraColor,
  };
}

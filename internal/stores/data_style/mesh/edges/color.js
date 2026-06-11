// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { useMeshEdgesCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.mesh.edges.color;

export function useMeshEdgesColorStyle() {
  const viewerStore = useViewerStore();
  const meshEdgesCommonStyle = useMeshEdgesCommonStyle();

  function meshEdgesColor(id) {
    return meshEdgesCommonStyle.meshEdgesColoring(id).constant;
  }
  function setMeshEdgesColor(id, color) {
    const params = { id, color };
    return viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: () =>
          meshEdgesCommonStyle.mutateMeshEdgesColoring(id, {
            constant: color,
          }),
      },
    );
  }

  return {
    meshEdgesColor,
    setMeshEdgesColor,
  };
}

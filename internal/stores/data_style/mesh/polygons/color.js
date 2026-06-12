// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { useMeshPolygonsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.mesh.polygons.color;

export function useMeshPolygonsColorStyle() {
  const viewerStore = useViewerStore();
  const meshPolygonsCommonStyle = useMeshPolygonsCommonStyle();

  function meshPolygonsColor(id) {
    return meshPolygonsCommonStyle.meshPolygonsColoring(id).constant;
  }
  function setMeshPolygonsColor(id, color) {
    const params = { id, color };
    return viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: () =>
          meshPolygonsCommonStyle.mutateMeshPolygonsColoring(id, {
            constant: color,
          }),
      },
    );
  }

  return {
    meshPolygonsColor,
    setMeshPolygonsColor,
  };
}

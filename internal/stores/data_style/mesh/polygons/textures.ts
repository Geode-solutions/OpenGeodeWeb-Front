// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { useMeshPolygonsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.mesh.polygons.apply_textures;

export function useMeshPolygonsTexturesStyle() {
  const viewerStore = useViewerStore();
  const meshPolygonsCommonStyle = useMeshPolygonsCommonStyle();

  function meshPolygonsTextures(id) {
    return meshPolygonsCommonStyle.meshPolygonsColoring(id).textures;
  }
  function setMeshPolygonsTextures(id, textures) {
    const params = { id, textures };
    return viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: () =>
          meshPolygonsCommonStyle.mutateMeshPolygonsStyle(id, {
            coloring: { textures },
          }),
      },
    );
  }

  return {
    meshPolygonsTextures,
    setMeshPolygonsTextures,
  };
}

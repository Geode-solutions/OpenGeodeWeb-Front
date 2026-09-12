// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { useMeshCellsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.mesh.apply_textures;

export function useMeshCellsTexturesStyle() {
  const viewerStore = useViewerStore();
  const meshCellsCommonStyle = useMeshCellsCommonStyle();

  function meshCellsTextures(id: string): unknown {
    return meshCellsCommonStyle.meshCellsColoring(id).textures;
  }
  function setMeshCellsTextures(id: string, textures: unknown) {
    const params = { id, textures };
    return viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: () =>
          meshCellsCommonStyle.mutateMeshCellsStyle(id, {
            coloring: { textures },
          }),
      },
    );
  }

  return {
    meshCellsTextures,
    setMeshCellsTextures,
  };
}

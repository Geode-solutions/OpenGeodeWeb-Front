// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useViewerStore } from "@ogw_front/stores/viewer"
import { useMeshCellsCommonStyle } from "./common"

// Local constants
const meshCellsTexturesSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.cells.apply_textures

export function useMeshCellsTexturesStyle() {
  const viewerStore = useViewerStore()
  const meshCellsCommonStyle = useMeshCellsCommonStyle()

  function meshCellsTextures(id) {
    return meshCellsCommonStyle.meshCellsColoring(id).textures
  }
  function setMeshCellsTextures(id, textures) {
    return viewerStore.request(
      meshCellsTexturesSchemas,
      { id, textures },
      {
        response_function: () => {
          meshCellsCommonStyle.meshCellsColoring(id).textures = textures
          console.log(setMeshCellsTextures.name, { id }, meshCellsTextures(id))
        },
      },
    )
  }

  return {
    meshCellsTextures,
    setMeshCellsTextures,
  }
}

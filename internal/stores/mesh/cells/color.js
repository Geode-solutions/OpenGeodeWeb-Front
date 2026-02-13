// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useViewerStore } from "@ogw_front/stores/viewer"
import { useMeshCellsCommonStyle } from "./common"

// Local constants
const meshCellsColorSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.cells.color

export function useMeshCellsColorStyle() {
  const viewerStore = useViewerStore()
  const meshCellsCommonStyle = useMeshCellsCommonStyle()

  function meshCellsColor(id) {
    return meshCellsCommonStyle.meshCellsColoring(id).color
  }
  function setMeshCellsColor(id, color) {
    return viewerStore.request(
      meshCellsColorSchemas,
      { id, color },
      {
        response_function: () => {
          meshCellsCommonStyle.meshCellsColoring(id).color = color
          console.log(
            setMeshCellsColor.name,
            { id },
            JSON.stringify(meshCellsColor(id)),
          )
        },
      },
    )
  }

  return {
    meshCellsColor,
    setMeshCellsColor,
  }
}

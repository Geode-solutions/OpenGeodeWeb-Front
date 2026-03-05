// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useMeshCellsCommonStyle } from "./common"
import { useDataStyleStateStore } from "../../state"
import { useViewerStore } from "@ogw_front/stores/viewer"

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
    const updateState = async () => {
      const dataStyleStateStore = useDataStyleStateStore()
      await dataStyleStateStore.mutateStyle(id, (style) => {
        style.cells.coloring.color = color
      })
      console.log(
        setMeshCellsColor.name,
        { id },
        JSON.stringify(meshCellsColor(id)),
      )
    }

    if (meshCellsColorSchemas && color !== undefined) {
      return viewerStore.request(
        meshCellsColorSchemas,
        { id, color },
        {
          response_function: updateState,
        },
      )
    } else {
      return updateState()
    }
  }

  return {
    meshCellsColor,
    setMeshCellsColor,
  }
}

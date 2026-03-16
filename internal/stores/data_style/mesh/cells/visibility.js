// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useMeshCellsCommonStyle } from "./common"
import { useDataStyleStateStore } from "../../state"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const meshCellsVisibilitySchema =
  viewer_schemas.opengeodeweb_viewer.mesh.cells.visibility

export function useMeshCellsVisibilityStyle() {
  const viewerStore = useViewerStore()
  const meshCellsCommonStyle = useMeshCellsCommonStyle()

  function meshCellsVisibility(id) {
    return meshCellsCommonStyle.meshCellsStyle(id).visibility
  }
  function setMeshCellsVisibility(id, visibility) {
    const updateState = async () => {
      const dataStyleStateStore = useDataStyleStateStore()
      await dataStyleStateStore.mutateStyle(id, (style) => {
        style.cells.visibility = visibility
      })
      console.log(setMeshCellsVisibility.name, { id }, meshCellsVisibility(id))
    }

    if (meshCellsVisibilitySchema) {
      return viewerStore.request(
        meshCellsVisibilitySchema,
        { id, visibility },
        {
          response_function: updateState,
        },
      )
    } else {
      return updateState()
    }
  }

  return {
    meshCellsVisibility,
    setMeshCellsVisibility,
  }
}

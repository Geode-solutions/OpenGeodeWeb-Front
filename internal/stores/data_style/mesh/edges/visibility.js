// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useMeshEdgesCommonStyle } from "./common"
import { useDataStyleStateStore } from "../../state"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const meshEdgesVisibilitySchema =
  viewer_schemas.opengeodeweb_viewer.mesh.edges.visibility

export function useMeshEdgesVisibilityStyle() {
  const viewerStore = useViewerStore()
  const meshEdgesCommonStyle = useMeshEdgesCommonStyle()

  function meshEdgesVisibility(id) {
    return meshEdgesCommonStyle.meshEdgesStyle(id).visibility
  }
  function setMeshEdgesVisibility(id, visibility) {
    const updateState = async () => {
      const dataStyleStateStore = useDataStyleStateStore()
      await dataStyleStateStore.mutateStyle(id, (style) => {
        style.edges.visibility = visibility
      })
      console.log(setMeshEdgesVisibility.name, { id }, meshEdgesVisibility(id))
    }

    if (meshEdgesVisibilitySchema) {
      return viewerStore.request(
        meshEdgesVisibilitySchema,
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
    meshEdgesVisibility,
    setMeshEdgesVisibility,
  }
}

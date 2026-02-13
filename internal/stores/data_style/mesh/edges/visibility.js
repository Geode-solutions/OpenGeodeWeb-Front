// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useViewerStore } from "@ogw_front/stores/viewer"
import { useMeshEdgesCommonStyle } from "./common"

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
    return viewerStore.request(
      meshEdgesVisibilitySchema,
      { id, visibility },
      {
        response_function: () => {
          meshEdgesCommonStyle.meshEdgesStyle(id).visibility = visibility
          console.log(
            setMeshEdgesVisibility.name,
            { id },
            meshEdgesVisibility(id),
          )
        },
      },
    )
  }

  return {
    meshEdgesVisibility,
    setMeshEdgesVisibility,
  }
}

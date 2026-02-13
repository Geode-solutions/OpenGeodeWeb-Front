// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useViewerStore } from "@ogw_front/stores/viewer"
import { useMeshPointsCommonStyle } from "./common"

// Local constants
const meshPointsVisibilitySchema =
  viewer_schemas.opengeodeweb_viewer.mesh.points.visibility

export function useMeshPointsVisibilityStyle() {
  const viewerStore = useViewerStore()
  const meshPointsCommonStyle = useMeshPointsCommonStyle()

  function meshPointsVisibility(id) {
    return meshPointsCommonStyle.meshPointsStyle(id).visibility
  }
  function setMeshPointsVisibility(id, visibility) {
    return viewerStore.request(
      meshPointsVisibilitySchema,
      { id, visibility },
      {
        response_function: () => {
          meshPointsCommonStyle.meshPointsStyle(id).visibility = visibility
          console.log(
            setMeshPointsVisibility.name,
            { id },
            meshPointsVisibility(id),
          )
        },
      },
    )
  }

  return {
    meshPointsVisibility,
    setMeshPointsVisibility,
  }
}

// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useMeshPointsCommonStyle } from "./common"
import { useViewerStore } from "@ogw_front/stores/viewer"

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
    const updateState = async () => {
      const dataStyleStateStore = useDataStyleStateStore()
      await dataStyleStateStore.mutateStyle(id, (style) => {
        style.points.visibility = visibility
      })
      console.log(
        setMeshPointsVisibility.name,
        { id },
        meshPointsVisibility(id),
      )
    }

    if (meshPointsVisibilitySchema) {
      return viewerStore.request(
        meshPointsVisibilitySchema,
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
    meshPointsVisibility,
    setMeshPointsVisibility,
  }
}

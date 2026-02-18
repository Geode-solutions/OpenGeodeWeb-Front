// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useMeshPointsCommonStyle } from "./common"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const meshPointsSizeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.points.size

export function useMeshPointsSizeStyle() {
  const viewerStore = useViewerStore()
  const meshPointsCommonStyle = useMeshPointsCommonStyle()

  function meshPointsSize(id) {
    return meshPointsCommonStyle.meshPointsStyle(id).size
  }
  function setMeshPointsSize(id, size) {
    return viewerStore.request(
      meshPointsSizeSchemas,
      { id, size },
      {
        response_function: () => {
          meshPointsCommonStyle.meshPointsStyle(id).size = size
          console.log(
            setMeshPointsSize.name,
            { id },
            JSON.stringify(meshPointsSize(id)),
          )
        },
      },
    )
  }

  return {
    meshPointsSize,
    setMeshPointsSize,
  }
}

// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useMeshPointsCommonStyle } from "./common"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const meshPointsColorSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.points.color

export function useMeshPointsColorStyle() {
  const viewerStore = useViewerStore()
  const meshPointsCommonStyle = useMeshPointsCommonStyle()

  function meshPointsColor(id) {
    return meshPointsCommonStyle.meshPointsColoring(id).color
  }
  function setMeshPointsColor(id, color) {
    return viewerStore.request(
      meshPointsColorSchemas,
      { id, color },
      {
        response_function: () => {
          meshPointsCommonStyle.meshPointsColoring(id).color = color
          console.log(
            setMeshPointsColor.name,
            { id },
            JSON.stringify(meshPointsColor(id)),
          )
        },
      },
    )
  }

  return {
    meshPointsColor,
    setMeshPointsColor,
  }
}

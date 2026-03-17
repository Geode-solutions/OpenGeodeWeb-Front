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
    const mutate = () => {
      return meshPointsCommonStyle
        .mutateMeshPointsColoringStyle(id, (coloring) => {
          coloring.color = color
        })
        .then(() => {
          console.log(
            setMeshPointsColor.name,
            { id },
            JSON.stringify(meshPointsColor(id)),
          )
        })
    }

    if (meshPointsColorSchemas && color !== undefined) {
      return viewerStore.request(
        meshPointsColorSchemas,
        { id, color },
        {
          response_function: mutate,
        },
      )
    } else {
      return mutate()
    }
  }

  return {
    meshPointsColor,
    setMeshPointsColor,
  }
}

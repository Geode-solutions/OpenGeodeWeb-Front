// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useMeshEdgesCommonStyle } from "./common"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const meshEdgesColorSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.edges.color

export function useMeshEdgesColorStyle() {
  const viewerStore = useViewerStore()
  const meshEdgesCommonStyle = useMeshEdgesCommonStyle()

  function meshEdgesColoring(id) {
    return meshEdgesCommonStyle.meshEdgesStyle(id).coloring
  }
  function meshEdgesColor(id) {
    return meshEdgesColoring(id).color
  }
  function setMeshEdgesColor(id, color) {
    return viewerStore.request(
      meshEdgesColorSchemas,
      { id, color },
      {
        response_function: () => {
          return meshEdgesCommonStyle.mutateMeshEdgesStyle(id, {
            coloring: { color },
          })
        },
      },
    )
  }

  return {
    meshEdgesColor,
    setMeshEdgesColor,
  }
}

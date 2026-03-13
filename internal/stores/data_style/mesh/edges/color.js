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

  function meshEdgesColor(id) {
    return meshEdgesCommonStyle.meshEdgesColoring(id).color
  }
  function setMeshEdgesColor(id, color) {
    return viewerStore.request(
      meshEdgesColorSchemas,
      { id, color },
      {
        response_function: () => {
          meshEdgesCommonStyle.meshEdgesColoring(id).color = color
          console.log(
            setMeshEdgesColor.name,
            { id },
            JSON.stringify(meshEdgesColor(id)),
          )
        },
      },
    )
  }

  return {
    meshEdgesColor,
    setMeshEdgesColor,
  }
}

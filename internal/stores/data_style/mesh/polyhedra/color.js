// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useMeshPolyhedraCommonStyle } from "./common"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const meshPolyhedraColorSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.polyhedra.color

export function useMeshPolyhedraColorStyle() {
  const viewerStore = useViewerStore()
  const meshPolyhedraCommonStyle = useMeshPolyhedraCommonStyle()

  function meshPolyhedraColor(id) {
    return meshPolyhedraCommonStyle.meshPolyhedraColoring(id).color
  }
  function setMeshPolyhedraColor(id, color) {
    return viewerStore.request(
      meshPolyhedraColorSchemas,
      { id, color },
      {
        response_function: () => {
          meshPolyhedraCommonStyle.meshPolyhedraColoring(id).color = color
          console.log(
            setMeshPolyhedraColor.name,
            { id },
            JSON.stringify(meshPolyhedraColor(id)),
          )
        },
      },
    )
  }

  return {
    meshPolyhedraColor,
    setMeshPolyhedraColor,
  }
}

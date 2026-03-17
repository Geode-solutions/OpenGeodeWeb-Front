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
    const mutate = () => {
      return meshPolyhedraCommonStyle
        .mutateMeshPolyhedraColoringStyle(id, (coloring) => {
          coloring.color = color
          console.log(
            setMeshPolyhedraColor.name,
            { id },
            JSON.stringify(coloring.color),
          )
        })
    }

    if (meshPolyhedraColorSchemas && color !== undefined) {
      return viewerStore.request(
        meshPolyhedraColorSchemas,
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
    meshPolyhedraColor,
    setMeshPolyhedraColor,
  }
}

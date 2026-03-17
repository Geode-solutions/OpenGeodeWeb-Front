// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useMeshPolygonsCommonStyle } from "./common"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const meshPolygonsColorSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.polygons.color

export function useMeshPolygonsColorStyle() {
  const viewerStore = useViewerStore()
  const meshPolygonsCommonStyle = useMeshPolygonsCommonStyle()

  function meshPolygonsColor(id) {
    return meshPolygonsCommonStyle.meshPolygonsColoring(id).color
  }
  function setMeshPolygonsColor(id, color) {
    const mutate = () => {
      return meshPolygonsCommonStyle.mutateMeshPolygonsColoringStyle(
        id,
        (coloring) => {
          coloring.color = color
          console.log(
            setMeshPolygonsColor.name,
            { id },
            JSON.stringify(coloring.color),
          )
        },
      )
    }

    if (meshPolygonsColorSchemas && color !== undefined) {
      return viewerStore.request(
        meshPolygonsColorSchemas,
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
    meshPolygonsColor,
    setMeshPolygonsColor,
  }
}

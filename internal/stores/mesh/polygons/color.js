// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useViewerStore } from "@ogw_front/stores/viewer"
import { useMeshPolygonsCommonStyle } from "./common"

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
    return viewerStore.request(
      meshPolygonsColorSchemas,
      { id, color },
      {
        response_function: () => {
          meshPolygonsCommonStyle.meshPolygonsColoring(id).color = color
          console.log(
            setMeshPolygonsColor.name,
            { id },
            JSON.stringify(meshPolygonsColor(id)),
          )
        },
      },
    )
  }

  return {
    meshPolygonsColor,
    setMeshPolygonsColor,
  }
}

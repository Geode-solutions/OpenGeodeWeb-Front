// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useMeshPolygonsSharedStore } from "./shared"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const meshPolygonsColorSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.polygons.color

export function useMeshPolygonsColorStyle() {
  const viewerStore = useViewerStore()
  const meshPolygonsSharedStore = useMeshPolygonsSharedStore()

  function meshPolygonsColor(id) {
    return meshPolygonsSharedStore.meshPolygonsColoring(id).color
  }
  function setMeshPolygonsColor(id, color) {
    return viewerStore.request(
      meshPolygonsColorSchemas,
      { id, color },
      {
        response_function: () => {
          meshPolygonsSharedStore.meshPolygonsColoring(id).color = color
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

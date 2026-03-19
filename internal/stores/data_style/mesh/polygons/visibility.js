// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useMeshPolygonsCommonStyle } from "./common"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const meshPolygonsVisibilitySchema =
  viewer_schemas.opengeodeweb_viewer.mesh.polygons.visibility

export function useMeshPolygonsVisibilityStyle() {
  const viewerStore = useViewerStore()
  const meshPolygonsCommonStyle = useMeshPolygonsCommonStyle()

  function meshPolygonsVisibility(id) {
    return meshPolygonsCommonStyle.meshPolygonsStyle(id).visibility
  }
  function setMeshPolygonsVisibility(id, visibility) {
    return viewerStore.request(
      meshPolygonsVisibilitySchema,
      { id, visibility },
      {
        response_function: () => {
          meshPolygonsCommonStyle.meshPolygonsStyle(id).visibility = visibility
          console.log(
            setMeshPolygonsVisibility.name,
            { id },
            meshPolygonsVisibility(id),
          )
        },
      },
    )
  }

  return {
    meshPolygonsVisibility,
    setMeshPolygonsVisibility,
  }
}

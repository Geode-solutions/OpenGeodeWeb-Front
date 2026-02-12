// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useMeshPolygonsSharedStore } from "./shared"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const meshPolygonsVisibilitySchema =
  viewer_schemas.opengeodeweb_viewer.mesh.polygons.visibility

export function useMeshPolygonsVisibilityStyle() {
  const viewerStore = useViewerStore()
  const meshPolygonsSharedStore = useMeshPolygonsSharedStore()

  function meshPolygonsVisibility(id) {
    return meshPolygonsSharedStore.meshPolygonsStyle(id).visibility
  }
  function setMeshPolygonsVisibility(id, visibility) {
    return viewerStore.request(
      meshPolygonsVisibilitySchema,
      { id, visibility },
      {
        response_function: () => {
          meshPolygonsSharedStore.meshPolygonsStyle(id).visibility = visibility
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

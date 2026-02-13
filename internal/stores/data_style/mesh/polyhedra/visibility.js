// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useViewerStore } from "@ogw_front/stores/viewer"
import { useMeshPolyhedraCommonStyle } from "./common"

// Local constants
const meshPolyhedraVisibilitySchema =
  viewer_schemas.opengeodeweb_viewer.mesh.polyhedra.visibility

export function useMeshPolyhedraVisibilityStyle() {
  const viewerStore = useViewerStore()
  const meshPolyhedraCommonStyle = useMeshPolyhedraCommonStyle()

  function meshPolyhedraVisibility(id) {
    return meshPolyhedraCommonStyle.meshPolyhedraStyle(id).visibility
  }
  function setMeshPolyhedraVisibility(id, visibility) {
    return viewerStore.request(
      meshPolyhedraVisibilitySchema,
      { id, visibility },
      {
        response_function: () => {
          meshPolyhedraCommonStyle.meshPolyhedraStyle(id).visibility =
            visibility
          console.log(
            setMeshPolyhedraVisibility.name,
            { id },
            meshPolyhedraVisibility(id),
          )
        },
      },
    )
  }

  return {
    meshPolyhedraVisibility,
    setMeshPolyhedraVisibility,
  }
}

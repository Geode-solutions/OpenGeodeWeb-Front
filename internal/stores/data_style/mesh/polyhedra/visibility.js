// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useMeshPolyhedraCommonStyle } from "./common"
import { useViewerStore } from "@ogw_front/stores/viewer"

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
    const mutate = () => {
      return meshPolyhedraCommonStyle
        .mutateMeshPolyhedraStyle(id, (polyhedra) => {
          polyhedra.visibility = visibility
        })
        .then(() => {
          console.log(
            setMeshPolyhedraVisibility.name,
            { id },
            meshPolyhedraVisibility(id),
          )
        })
    }

    if (meshPolyhedraVisibilitySchema) {
      return viewerStore.request(
        meshPolyhedraVisibilitySchema,
        { id, visibility },
        {
          response_function: mutate,
        },
      )
    } else {
      return mutate()
    }
  }

  return {
    meshPolyhedraVisibility,
    setMeshPolyhedraVisibility,
  }
}

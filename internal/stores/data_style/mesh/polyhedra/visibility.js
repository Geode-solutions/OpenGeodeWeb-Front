// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useMeshPolyhedraCommonStyle } from "./common"
import { useDataStyleStateStore } from "../../state"
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
    const updateState = async () => {
      const dataStyleStateStore = useDataStyleStateStore()
      await dataStyleStateStore.mutateStyle(id, (style) => {
        style.polyhedra.visibility = visibility
      })
      console.log(
        setMeshPolyhedraVisibility.name,
        { id },
        meshPolyhedraVisibility(id),
      )
    }

    if (meshPolyhedraVisibilitySchema) {
      return viewerStore.request(
        meshPolyhedraVisibilitySchema,
        { id, visibility },
        {
          response_function: updateState,
        },
      )
    } else {
      return updateState()
    }
  }

  return {
    meshPolyhedraVisibility,
    setMeshPolyhedraVisibility,
  }
}

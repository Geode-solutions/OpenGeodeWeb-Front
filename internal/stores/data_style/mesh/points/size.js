// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useMeshPointsCommonStyle } from "./common"
import { useDataStyleStateStore } from "../../state"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const meshPointsSizeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.points.size

export function useMeshPointsSizeStyle() {
  const viewerStore = useViewerStore()
  const meshPointsCommonStyle = useMeshPointsCommonStyle()

  function meshPointsSize(id) {
    return meshPointsCommonStyle.meshPointsStyle(id).size
  }
  function setMeshPointsSize(id, size) {
    const updateState = async () => {
      const dataStyleStateStore = useDataStyleStateStore()
      await dataStyleStateStore.mutateStyle(id, (style) => {
        style.points.size = size
      })
      console.log(
        setMeshPointsSize.name,
        { id },
        JSON.stringify(meshPointsSize(id)),
      )
    }

    if (meshPointsSizeSchemas) {
      return viewerStore.request(
        meshPointsSizeSchemas,
        { id, size },
        {
          response_function: updateState,
        },
      )
    } else {
      return updateState()
    }
  }

  return {
    meshPointsSize,
    setMeshPointsSize,
  }
}

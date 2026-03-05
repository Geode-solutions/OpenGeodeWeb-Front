// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useMeshEdgesCommonStyle } from "./common"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const meshEdgesWidthSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.edges.width

export function useMeshEdgesWidthStyle() {
  const viewerStore = useViewerStore()
  const meshEdgesCommonStyle = useMeshEdgesCommonStyle()

  function meshEdgesWidth(id) {
    return meshEdgesCommonStyle.meshEdgesStyle(id).width
  }
  function setMeshEdgesWidth(id, width) {
    const updateState = async () => {
      const dataStyleStateStore = useDataStyleStateStore()
      await dataStyleStateStore.mutateStyle(id, (style) => {
        style.edges.width = width
      })
      console.log(setMeshEdgesWidth.name, { id }, meshEdgesWidth(id))
    }

    if (meshEdgesWidthSchemas) {
      return viewerStore.request(
        meshEdgesWidthSchemas,
        { id, width },
        {
          response_function: updateState,
        },
      )
    } else {
      return updateState()
    }
  }

  return {
    meshEdgesWidth,
    setMeshEdgesWidth,
  }
}

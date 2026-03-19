// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

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
    return viewerStore.request(
      meshEdgesWidthSchemas,
      { id, width },
      {
        response_function: () => {
          return meshEdgesCommonStyle.mutateMeshEdgesStyle(id, { width })
        },
      },
    )
  }

  return {
    meshEdgesWidth,
    setMeshEdgesWidth,
  }
}

// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useModelEdgesCommonStyle } from "./common"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const model_edges_schemas = viewer_schemas.opengeodeweb_viewer.model.edges

export function useModelEdgesVisibilityStyle() {
  const viewerStore = useViewerStore()
  const modelEdgesCommonStyle = useModelEdgesCommonStyle()

  function modelEdgesVisibility(id) {
    return modelEdgesCommonStyle.modelEdgesStyle(id).visibility
  }

  function setModelEdgesVisibility(id, visibility) {
    return viewerStore.request(
      model_edges_schemas.visibility,
      { id, visibility },
      {
        response_function: () => {
          modelEdgesCommonStyle.modelEdgesStyle(id).visibility = visibility
          console.log(
            setModelEdgesVisibility.name,
            { id },
            modelEdgesVisibility(id),
          )
        },
      },
    )
  }

  return {
    modelEdgesVisibility,
    setModelEdgesVisibility,
  }
}

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
    const mutate = () => {
      return modelEdgesCommonStyle.mutateModelEdgesStyle(id, (edges) => {
        edges.visibility = visibility
        console.log(setModelEdgesVisibility.name, { id }, edges.visibility)
      })
    }

    if (model_edges_schemas?.visibility) {
      return viewerStore.request(
        model_edges_schemas.visibility,
        { id, visibility },
        {
          response_function: mutate,
        },
      )
    } else {
      return mutate()
    }
  }

  function applyModelEdgesStyle(id) {
    const style = modelEdgesStyle(id)
    return Promise.resolve([setModelEdgesVisibility(id, style.visibility)])
  }

  return {
    modelEdgesVisibility,
    setModelEdgesVisibility,
  }
}

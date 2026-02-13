// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useDataStyleStateStore } from "../state"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const model_edges_schemas = viewer_schemas.opengeodeweb_viewer.model.edges

export function useModelEdgesStyle() {
  const dataStyleStateStore = useDataStyleStateStore()
  const viewerStore = useViewerStore()

  function modelEdgesStyle(id) {
    return dataStyleStateStore.styles[id].edges
  }
  function modelEdgesVisibility(id) {
    return modelEdgesStyle(id).visibility
  }

  function setModelEdgesVisibility(id, visibility) {
    return viewerStore.request(
      model_edges_schemas.visibility,
      { id, visibility },
      {
        response_function: () => {
          modelEdgesStyle(id).visibility = visibility
          console.log(
            setModelEdgesVisibility.name,
            { id },
            modelEdgesVisibility(id),
          )
        },
      },
    )
  }

  function applyModelEdgesStyle(id) {
    const style = modelEdgesStyle(id)
    return Promise.all([setModelEdgesVisibility(id, style.visibility)])
  }

  return {
    modelEdgesVisibility,
    setModelEdgesVisibility,
    applyModelEdgesStyle,
  }
}

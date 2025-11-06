// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local constants
const model_edges_schemas = viewer_schemas.opengeodeweb_viewer.model.edges

export function useModelEdgesStyle() {
  const dataStyleStore = useDataStyleStore()

  function modelEdgesStyle(id) {
    return dataStyleStore.styles[id].edges
  }
  function modelEdgesVisibility(id) {
    return modelEdgesStyle(id).visibility
  }

  function setModelEdgesVisibility(id, visibility) {
    return viewer_call(
      {
        schema: model_edges_schemas.visibility,
        params: { id, visibility },
      },
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

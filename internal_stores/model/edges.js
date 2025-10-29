// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local constants
const model_edges_schemas = viewer_schemas.opengeodeweb_viewer.model.edges

export function useModelEdgesStyle() {
  const dataStyleStore = useDataStyleStore()

  function modelEdgesVisibility(id) {
    return dataStyleStore.styles[id].edges.visibility
  }

  function setModelEdgesVisibility(id, visibility) {
    return viewer_call(
      {
        schema: model_edges_schemas.visibility,
        params: { id, visibility },
      },
      {
        response_function: () => {
          dataStyleStore.styles[id].edges.visibility = visibility
          console.log(
            `${setModelEdgesVisibility.name} ${id} ${modelEdgesVisibility(id)}`,
          )
        },
      },
    )
  }

  function applyModelEdgesStyle(id, style) {
    setModelEdgesVisibility(id, style.visibility)
  }

  function setModelEdgesDefaultStyle(id) {
    setModelEdgesVisibility(id, false)
  }

  return {
    modelEdgesVisibility,
    setModelEdgesVisibility,
    applyModelEdgesStyle,
    setModelEdgesDefaultStyle,
  }
}

import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"
const model_edges_schemas = viewer_schemas.opengeodeweb_viewer.model.edges

export function useModelEdgesStyle() {
  const dataStyleStore = useDataStyleStore()

  function edgesStyle(id) {
    return dataStyleStore.getStyle(id).edges
  }

  function modelEdgesVisibility(id) {
    return edgesStyle(id).visibility
  }

  function setModelEdgesVisibility(id, visibility) {
    const edges_style = edgesStyle(id)
    return viewer_call(
      {
        schema: model_edges_schemas.visibility,
        params: { id, visibility },
      },
      {
        response_function: () => {
          edges_style.visibility = visibility
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

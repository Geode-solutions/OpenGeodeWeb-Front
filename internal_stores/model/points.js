import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"
const model_points_schemas = viewer_schemas.opengeodeweb_viewer.model.points

export function useModelPointsStyle() {
  const dataStyleStore = useDataStyleStore()

  function modelPointsVisibility(id) {
    return dataStyleStore.styles[id].points.visibility
  }
  function setModelPointsVisibility(id, visibility) {
    return viewer_call(
      {
        schema: model_points_schemas.visibility,
        params: { id, visibility },
      },
      {
        response_function: () => {
          dataStyleStore.styles[id].points.visibility = visibility
          console.log(
            `${setModelPointsVisibility.name} ${id} ${modelPointsVisibility(id)}`,
          )
        },
      },
    )
  }

  function modelPointsSize(id) {
    return dataStyleStore.styles[id].points.size
  }
  function setModelPointsSize(id, size) {
    return viewer_call(
      {
        schema: model_points_schemas.size,
        params: { id, size },
      },
      {
        response_function: () => {
          dataStyleStore.styles[id].points.size = size
          console.log(`${setModelPointsSize.name} ${id} ${modelPointsSize(id)}`)
        },
      },
    )
  }

  function applyModelPointsStyle(id, style) {
    setModelPointsVisibility(id, style.visibility)
    setModelPointsSize(id, style.size)
  }

  function setModelPointsDefaultStyle(id) {
    setModelPointsVisibility(id, false)
  }

  return {
    applyModelPointsStyle,
    modelPointsVisibility,
    modelPointsSize,
    setModelPointsVisibility,
    setModelPointsSize,
    setModelPointsDefaultStyle,
  }
}

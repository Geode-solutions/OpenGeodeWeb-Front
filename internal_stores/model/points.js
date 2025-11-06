// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local constants
const model_points_schemas = viewer_schemas.opengeodeweb_viewer.model.points

export function useModelPointsStyle() {
  const dataStyleStore = useDataStyleStore()

  function modelPointsStyle(id) {
    return dataStyleStore.getStyle(id).points
  }
  function modelPointsVisibility(id) {
    return modelPointsStyle(id).visibility
  }
  function setModelPointsVisibility(id, visibility) {
    return viewer_call(
      {
        schema: model_points_schemas.visibility,
        params: { id, visibility },
      },
      {
        response_function: () => {
          modelPointsStyle(id).visibility = visibility
          console.log(
            setModelPointsVisibility.name,
            { id },
            modelPointsVisibility(id),
          )
        },
      },
    )
  }

  function modelPointsSize(id) {
    return modelPointsStyle(id).size
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
          console.log(setModelPointsSize.name, { id }, modelPointsSize(id))
        },
      },
    )
  }

  function applyModelPointsStyle(id) {
    const style = modelPointsStyle(id)
    return Promise.all([
      setModelPointsVisibility(id, style.visibility),
      setModelPointsSize(id, style.size),
    ])
  }

  return {
    modelPointsVisibility,
    modelPointsSize,
    setModelPointsVisibility,
    setModelPointsSize,
    applyModelPointsStyle,
  }
}

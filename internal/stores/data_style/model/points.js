// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useDataStyleStateStore } from "../state"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const model_points_schemas = viewer_schemas.opengeodeweb_viewer.model.points

export function useModelPointsStyle() {
  const dataStyleStateStore = useDataStyleStateStore()
  const viewerStore = useViewerStore()

  function modelPointsStyle(id) {
    return dataStyleStateStore.getStyle(id).points
  }
  function modelPointsVisibility(id) {
    return modelPointsStyle(id).visibility
  }
  function setModelPointsVisibility(id, visibility) {
    const updateState = async () => {
      await dataStyleStateStore.mutateStyle(id, (style) => {
        style.points.visibility = visibility
      })
      console.log(
        setModelPointsVisibility.name,
        { id },
        modelPointsVisibility(id),
      )
    }

    if (model_points_schemas?.visibility) {
      return viewerStore.request(
        model_points_schemas.visibility,
        { id, visibility },
        {
          response_function: updateState,
        },
      )
    } else {
      return updateState()
    }
  }

  function modelPointsSize(id) {
    return modelPointsStyle(id).size
  }
  function setModelPointsSize(id, size) {
    const updateState = async () => {
      await dataStyleStateStore.mutateStyle(id, (style) => {
        style.points.size = size
      })
      console.log(setModelPointsSize.name, { id }, modelPointsSize(id))
    }

    if (model_points_schemas?.size) {
      return viewerStore.request(
        model_points_schemas.size,
        { id, size },
        {
          response_function: updateState,
        },
      )
    } else {
      return updateState()
    }
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

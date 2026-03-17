// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useModelPointsCommonStyle } from "./common"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const model_points_schemas = viewer_schemas.opengeodeweb_viewer.model.points

export function useModelPointsVisibilityStyle() {
  const viewerStore = useViewerStore()
  const modelPointsCommonStyle = useModelPointsCommonStyle()

  function modelPointsVisibility(id) {
    return modelPointsCommonStyle.modelPointsStyle(id).visibility
  }

  function setModelPointsVisibility(id, visibility) {
    const mutate = () => {
      return modelPointsCommonStyle.mutateModelPointsStyle(id, (points) => {
        points.visibility = visibility
        console.log(
          setModelPointsVisibility.name,
          { id },
          points.visibility,
        )
      })
    }

    if (model_points_schemas?.visibility) {
      return viewerStore.request(
        model_points_schemas.visibility,
        { id, visibility },
        {
          response_function: mutate,
        },
      )
    } else {
      return mutate()
    }
  }

  return {
    modelPointsVisibility,
    setModelPointsVisibility,
  }
}

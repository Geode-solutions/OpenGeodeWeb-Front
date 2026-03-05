// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useModelPointsCommonStyle } from "./common"
import { useViewerStore } from "@ogw_front/stores/viewer"
import { useDataStyleStateStore } from "../../state"

// Local constants
const model_points_schemas = viewer_schemas.opengeodeweb_viewer.model.points

export function useModelPointsVisibilityStyle() {
  const viewerStore = useViewerStore()
  const dataStyleStateStore = useDataStyleStateStore()
  const modelPointsCommonStyle = useModelPointsCommonStyle()

  function modelPointsVisibility(id) {
    return modelPointsCommonStyle.modelPointsStyle(id).visibility
  }

  async function setModelPointsVisibility(id, visibility) {
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

  return {
    modelPointsVisibility,
    setModelPointsVisibility,
  }
}

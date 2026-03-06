// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useModelPointsCommonStyle } from "./common"
import { useViewerStore } from "@ogw_front/stores/viewer"
import { useDataStyleStateStore } from "../../state"

// Local constants
const model_points_schemas = viewer_schemas.opengeodeweb_viewer.model.points

export function useModelPointsSizeStyle() {
  const viewerStore = useViewerStore()
  const dataStyleStateStore = useDataStyleStateStore()
  const modelPointsCommonStyle = useModelPointsCommonStyle()

  function modelPointsSize(id) {
    return modelPointsCommonStyle.modelPointsStyle(id).size
  }

  async function setModelPointsSize(id, size) {
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

  return {
    modelPointsSize,
    setModelPointsSize,
  }
}

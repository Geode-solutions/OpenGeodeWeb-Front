// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useDataStore } from "@ogw_front/stores/data"
import { useModelCornersCommonStyle } from "./common"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const model_corners_schemas = viewer_schemas.opengeodeweb_viewer.model.corners

export function useModelCornersVisibilityStyle() {
  const dataStore = useDataStore()
  const viewerStore = useViewerStore()
  const modelCornersCommonStyle = useModelCornersCommonStyle()

  function setModelCornersVisibility(id, corner_ids, visibility) {
    if (!corner_ids || corner_ids.length === 0) {
      return Promise.resolve()
    }
    return dataStore
      .getMeshComponentsViewerIds(id, corner_ids)
      .then((corner_viewer_ids) => {
        if (!corner_viewer_ids || corner_viewer_ids.length === 0) {
          return modelCornersCommonStyle.mutateModelCornersStyle(
            id,
            corner_ids,
            { visibility },
          )
        }
        return viewerStore.request(
          model_corners_schemas.visibility,
          { id, block_ids: corner_viewer_ids, visibility },
          {
            response_function: () => {
              return modelCornersCommonStyle.mutateModelCornersStyle(
                id,
                corner_ids,
                { visibility },
              )
            },
          },
        )
      })
  }

  return {
    modelCornerVisibility,
    setModelCornersVisibility,
  }
}

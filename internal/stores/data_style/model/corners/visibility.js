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
  function modelCornerVisibility(id, corner_id) {
    return modelCornersCommonStyle.modelCornerStyle(id, corner_id).visibility
  }
  function saveModelCornerVisibility(id, corner_id, visibility) {
    modelCornersCommonStyle.modelCornerStyle(id, corner_id).visibility =
      visibility
  }
  async function setModelCornersVisibility(id, corner_ids, visibility) {
    if (!corner_ids || corner_ids.length === 0) {
      return
    }
    const corner_viewer_ids = await dataStore.getMeshComponentsViewerIds(
      id,
      corner_ids,
    )
    if (!corner_viewer_ids || corner_viewer_ids.length === 0) {
      console.warn(
        "[setModelCornersVisibility] No viewer IDs found, skipping visibility request",
        { id, corner_ids },
      )
      return
    }
    return viewerStore.request(
      model_corners_schemas.visibility,
      { id, block_ids: corner_viewer_ids, visibility },
      {
        response_function: () => {
          for (const corner_id of corner_ids) {
            saveModelCornerVisibility(id, corner_id, visibility)
          }
          console.log(
            setModelCornersVisibility.name,
            { id },
            { corner_ids },
            modelCornerVisibility(id, corner_ids[0]),
          )
        },
      },
    )
  }

  return {
    modelCornerVisibility,
    setModelCornersVisibility,
  }
}

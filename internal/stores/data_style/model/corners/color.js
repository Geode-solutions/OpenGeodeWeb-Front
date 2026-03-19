// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useDataStore } from "@ogw_front/stores/data"
import { useModelCornersCommonStyle } from "./common"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const model_corners_schemas = viewer_schemas.opengeodeweb_viewer.model.corners

export function useModelCornersColorStyle() {
  const dataStore = useDataStore()
  const viewerStore = useViewerStore()
  const modelCornersCommonStyle = useModelCornersCommonStyle()
  function modelCornerColor(id, corner_id) {
    return modelCornersCommonStyle.modelCornerStyle(id, corner_id).color
  }
  function saveModelCornerColor(id, corner_id, color) {
    modelCornersCommonStyle.modelCornerStyle(id, corner_id).color = color
  }
  async function setModelCornersColor(id, corner_ids, color) {
    if (!corner_ids || corner_ids.length === 0) {
      return
    }
    const corner_viewer_ids = await dataStore.getMeshComponentsViewerIds(
      id,
      corner_ids,
    )
    if (!corner_viewer_ids || corner_viewer_ids.length === 0) {
      console.warn(
        "[setModelCornersColor] No viewer IDs found, skipping color request",
        {
          id,
          corner_ids,
        },
      )
      return
    }
    return viewerStore.request(
      model_corners_schemas.color,
      { id, block_ids: corner_viewer_ids, color },
      {
        response_function: () => {
          for (const corner_id of corner_ids) {
            saveModelCornerColor(id, corner_id, color)
          }
          console.log(
            setModelCornersColor.name,
            { id },
            { corner_ids },
            JSON.stringify(modelCornerColor(id, corner_ids[0])),
          )
        },
      },
    )
  }

  return {
    modelCornerColor,
    setModelCornersColor,
  }
}

// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useDataStore } from "@ogw_front/stores/data"
import { useDataStyleStateStore } from "../data_style_state"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const model_corners_schemas = viewer_schemas.opengeodeweb_viewer.model.corners

export function useModelCornersStyle() {
  const dataStyleStateStore = useDataStyleStateStore()
  const dataStore = useDataStore()
  const viewerStore = useViewerStore()

  function modelCornersStyle(id) {
    return dataStyleStateStore.getStyle(id).corners
  }
  function modelCornerStyle(id, corner_id) {
    if (!modelCornersStyle(id)[corner_id]) {
      modelCornersStyle(id)[corner_id] = {}
    }
    return modelCornersStyle(id)[corner_id]
  }

  function modelCornerVisibility(id, corner_id) {
    return modelCornerStyle(id, corner_id).visibility
  }

  function saveModelCornerVisibility(id, corner_id, visibility) {
    modelCornerStyle(id, corner_id).visibility = visibility
  }
  async function setModelCornersVisibility(id, corner_ids, visibility) {
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

  function modelCornerColor(id, corner_id) {
    return modelCornerStyle(id, corner_id).color
  }

  function saveModelCornerColor(id, corner_id, color) {
    modelCornerStyle(id, corner_id).color = color
  }

  async function setModelCornersColor(id, corner_ids, color) {
    const corner_viewer_ids = await dataStore.getMeshComponentsViewerIds(
      id,
      corner_ids,
    )
    if (!corner_viewer_ids || corner_viewer_ids.length === 0) {
      console.warn(
        "[setModelCornersColor] No viewer IDs found, skipping color request",
        { id, corner_ids },
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

  async function applyModelCornersStyle(id) {
    const style = modelCornersStyle(id)
    const corner_ids = await dataStore.getCornersGeodeIds(id)
    console.log(applyModelCornersStyle.name, { id }, { corner_ids })
    return Promise.all([
      setModelCornersVisibility(id, corner_ids, style.visibility),
      setModelCornersColor(id, corner_ids, style.color),
    ])
  }

  return {
    modelCornerVisibility,
    modelCornerColor,
    setModelCornersVisibility,
    setModelCornersColor,
    applyModelCornersStyle,
  }
}

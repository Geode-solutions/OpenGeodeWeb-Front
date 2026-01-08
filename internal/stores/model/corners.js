// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useDataStyleStore } from "@ogw_front/stores/data_style"
import { useDataStore } from "@ogw_front/stores/data"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const model_corners_schemas = viewer_schemas.opengeodeweb_viewer.model.corners

export function useModelCornersStyle() {
  const dataStyleStore = useDataStyleStore()
  const dataStore = useDataStore()
  const viewerStore = useViewerStore()

  function modelCornersStyle(id) {
    return dataStyleStore.getStyle(id).corners
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
    const corner_flat_indexes = await dataStore.getFlatIndexes(id, corner_ids)
    if (corner_flat_indexes.length === 0) {
      return Promise.resolve()
    }
    return viewerStore.request(
      model_corners_schemas.visibility,
      { id, block_ids: corner_flat_indexes, visibility },
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
    const corner_flat_indexes = await dataStore.getFlatIndexes(id, corner_ids)
    if (corner_flat_indexes.length === 0) {
      return Promise.resolve()
    }
    return viewerStore.request(
      model_corners_schemas.color,
      { id, block_ids: corner_flat_indexes, color },
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
    const corner_ids = await dataStore.getCornersUuids(id)
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

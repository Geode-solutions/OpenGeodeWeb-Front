// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useDataStore } from "@ogw_front/stores/data"
import { useDataStyleStateStore } from "@/internal/stores/data_style_state"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const model_lines_schemas = viewer_schemas.opengeodeweb_viewer.model.lines

export function useModelLinesStyle() {
  const dataStyleStateStore = useDataStyleStateStore()
  const dataStore = useDataStore()
  const viewerStore = useViewerStore()

  function modelLinesStyle(id) {
    return dataStyleStateStore.getStyle(id).lines
  }
  function modelLineStyle(id, line_id) {
    if (!modelLinesStyle(id)[line_id]) {
      modelLinesStyle(id)[line_id] = {}
    }
    return modelLinesStyle(id)[line_id]
  }

  function modelLineVisibility(id, line_id) {
    return modelLineStyle(id, line_id).visibility
  }

  function saveModelLineVisibility(id, line_id, visibility) {
    modelLineStyle(id, line_id).visibility = visibility
  }
  async function setModelLinesVisibility(id, line_ids, visibility) {
    const line_flat_indexes = await dataStore.getFlatIndexes(id, line_ids)
    if (line_flat_indexes.length === 0) {
      return Promise.resolve()
    }
    return viewerStore.request(
      model_lines_schemas.visibility,
      { id, block_ids: line_flat_indexes, visibility },
      {
        response_function: () => {
          for (const line_id of line_ids) {
            saveModelLineVisibility(id, line_id, visibility)
          }
          console.log(
            setModelLinesVisibility.name,
            { id },
            { line_ids },
            modelLineVisibility(id, line_ids[0]),
          )
        },
      },
    )
  }

  function modelLineColor(id, line_id) {
    return modelLineStyle(id, line_id).color
  }
  function saveModelLineColor(id, line_id, color) {
    modelLineStyle(id, line_id).color = color
  }
  async function setModelLinesColor(id, line_ids, color) {
    const line_flat_indexes = await dataStore.getFlatIndexes(id, line_ids)
    if (line_flat_indexes.length === 0) {
      return Promise.resolve()
    }
    return viewerStore.request(
      model_lines_schemas.color,
      { id, block_ids: line_flat_indexes, color },
      {
        response_function: () => {
          for (const line_id of line_ids) {
            saveModelLineColor(id, line_id, color)
          }
          console.log(
            setModelLinesColor.name,
            { id },
            { line_ids },
            JSON.stringify(modelLineColor(id, line_ids[0])),
          )
        },
      },
    )
  }

  async function applyModelLinesStyle(id) {
    const style = modelLinesStyle(id)
    const line_ids = await dataStore.getLinesUuids(id)
    return Promise.all([
      setModelLinesVisibility(id, line_ids, style.visibility),
      setModelLinesColor(id, line_ids, style.color),
    ])
  }

  return {
    modelLineVisibility,
    modelLineColor,
    setModelLinesVisibility,
    setModelLinesColor,
    applyModelLinesStyle,
  }
}

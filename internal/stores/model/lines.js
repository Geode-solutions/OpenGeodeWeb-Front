// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useDataStyleStore } from "@ogw_front/stores/data_style.js"
import { useDataBaseStore } from "@ogw_front/stores/data_base.js"
import { useViewerStore } from "@ogw_front/stores/viewer.js"

// Local constants
const model_lines_schemas = viewer_schemas.opengeodeweb_viewer.model.lines

export function useModelLinesStyle() {
  const dataStyleStore = useDataStyleStore()
  const dataBaseStore = useDataBaseStore()
  const viewerStore = useViewerStore()

  function modelLinesStyle(id) {
    return dataStyleStore.getStyle(id).lines
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
  function setModelLinesVisibility(id, line_ids, visibility) {
    const line_flat_indexes = dataBaseStore.getFlatIndexes(id, line_ids)
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
  function setModelLinesColor(id, line_ids, color) {
    const line_flat_indexes = dataBaseStore.getFlatIndexes(id, line_ids)
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

  function applyModelLinesStyle(id) {
    const style = modelLinesStyle(id)
    const line_ids = dataBaseStore.getLinesUuids(id)
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

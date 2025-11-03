// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local constants
const model_lines_schemas = viewer_schemas.opengeodeweb_viewer.model.lines

export function useModelLinesStyle() {
  const dataStyleStore = useDataStyleStore()
  const dataBaseStore = useDataBaseStore()

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
    return viewer_call(
      {
        schema: model_lines_schemas.visibility,
        params: { id, block_ids: line_flat_indexes, visibility },
      },
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
    return viewer_call(
      {
        schema: model_lines_schemas.color,
        params: { id, block_ids: line_flat_indexes, color },
      },
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
    const lines_style = modelLinesStyle(id)
    const line_ids = dataBaseStore.getLinesUuids(id)
    return Promise.all([
      setModelLinesVisibility(id, line_ids, lines_style.visibility),
      setModelLinesColor(id, line_ids, lines_style.color),
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

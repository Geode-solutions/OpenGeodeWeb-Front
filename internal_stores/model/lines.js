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
    console.log("setModelLinesVisibility", id, line_ids, visibility)
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
  function modelLineColor(id) {
    return modelLineStyle(id, line_id).color
  }
  function saveModelLineColor(id, line_id, color) {
    modelLineStyle(id, line_id).color = color
  }

  function setModelLinesColor(id, line_ids, color) {
    console.log("setModelLinesColor", id, line_ids, color)
    const line_flat_indexes = dataBaseStore.getFlatIndexes(id, line_ids)
    return viewer_call(
      {
        schema: model_lines_schemas.color,
        params: { id, block_ids: line_flat_indexes, color },
      },
      {
        response_function: () => {
          console.log("response setModelLinesColor")
          for (const line_id of line_ids) {
            saveModelLineColor(id, line_id, color)
          }
          console.log("end response setModelLinesColor")
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
    console.log("applyModelLinesStyle", id)
    const lines_style = modelLinesStyle(id)
    console.log("lines_style", lines_style)
    const lines_ids = dataBaseStore.getLinesUuids(id)
    const promise_array = [
      setModelLinesVisibility(id, lines_ids, lines_style.visibility),
      setModelLinesColor(id, lines_ids, lines_style.color),
    ]
    console.log("applyModelLinesStyle", { promise_array })
    return Promise.all(promise_array)
  }

  return {
    modelLineVisibility,
    modelLineColor,
    setModelLinesVisibility,
    setModelLinesColor,
    applyModelLinesStyle,
  }
}

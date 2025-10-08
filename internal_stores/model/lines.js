import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"
const lines_schemas = viewer_schemas.opengeodeweb_viewer.model.lines

export function useLinesStyle() {
  const dataStyleStore = useDataStyleStore()
  const dataBaseStore = useDataBaseStore()

  function lineVisibility(id, line_id) {
    return dataStyleStore.styles[id].lines[line_id].visibility
  }
  function setLineVisibility(id, line_ids, visibility) {
    const line_flat_indexes = dataBaseStore.getFlatIndexes(id, line_ids)
    return viewer_call(
      {
        schema: lines_schemas.visibility,
        params: { id, block_ids: line_flat_indexes, visibility },
      },
      {
        response_function: () => {
          for (const line_id of line_ids) {
            if (!dataStyleStore.styles[id].lines[line_id])
              dataStyleStore.styles[id].lines[line_id] = {}
            dataStyleStore.styles[id].lines[line_id].visibility = visibility
          }
          console.log(
            `${setLineVisibility.name} ${id} ${lineVisibility(id, line_ids[0])}`,
          )
        },
      },
    )
  }

  function lineColor(id, line_id) {
    return dataStyleStore.styles[id].lines[line_id].color
  }
  function setLineColor(id, line_ids, color) {
    const line_flat_indexes = dataBaseStore.getFlatIndexes(id, line_ids)
    return viewer_call(
      {
        schema: lines_schemas.color,
        params: { id, block_ids: line_flat_indexes, color },
      },
      {
        response_function: () => {
          for (const line_id of line_ids) {
            if (!dataStyleStore.styles[id].lines[line_id])
              dataStyleStore.styles[id].lines[line_id] = {}
            dataStyleStore.styles[id].lines[line_id].color = color
          }
          console.log(
            `${setLineColor.name} ${id} ${lineColor(id, line_ids[0])}`,
          )
        },
      },
    )
  }

  function setLinesDefaultStyle(id) {
    const line_ids = dataBaseStore.getLinesUuids(id)
    setLineVisibility(id, line_ids, dataStyleStore.styles[id].lines.visibility)
    setLineColor(id, line_ids, dataStyleStore.styles[id].lines.color)
  }

  function applyLinesStyle(id) {
    const lines = dataStyleStore.styles[id].lines
    for (const [line_id, style] of Object.entries(lines)) {
      setLineVisibility(id, [line_id], style.visibility)
    }
  }

  return {
    applyLinesStyle,
    lineColor,
    lineVisibility,
    setLinesDefaultStyle,
    setLineVisibility,
  }
}

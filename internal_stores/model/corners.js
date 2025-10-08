import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"
const corners_schemas = viewer_schemas.opengeodeweb_viewer.model.corners

export function useCornersStyle() {
  const dataStyleStore = useDataStyleStore()
  const dataBaseStore = useDataBaseStore()

  function cornerVisibility(id, corner_id) {
    return dataStyleStore.styles[id].corners[corner_id].visibility
  }
  function setCornerVisibility(id, corner_ids, visibility) {
    const corner_flat_indexes = dataBaseStore.getFlatIndexes(id, corner_ids)
    return viewer_call(
      {
        schema: corners_schemas.visibility,
        params: { id, block_ids: corner_flat_indexes, visibility },
      },
      {
        response_function: () => {
          for (const corner_id of corner_ids) {
            if (!dataStyleStore.styles[id].corners[corner_id])
              dataStyleStore.styles[id].corners[corner_id] = {}
            dataStyleStore.styles[id].corners[corner_id].visibility = visibility
          }
          console.log(
            `${setCornerVisibility.name} ${id} ${block_ids} ${cornerVisibility(
              id,
              block_ids[0],
            )}`,
          )
        },
      },
    )
  }

  function cornerColor(id, corner_id) {
    return dataStyleStore.styles[id].corners[corner_id].color
  }
  function setCornerColor(id, corner_ids, color) {
    const corner_flat_indexes = dataBaseStore.getFlatIndexes(id, corner_ids)
    return viewer_call(
      {
        schema: corners_schemas.color,
        params: { id, block_ids: corner_flat_indexes, color },
      },
      {
        response_function: () => {
          for (const corner_id of corner_ids) {
            if (!dataStyleStore.styles[id].corners[corner_id])
              dataStyleStore.styles[id].corners[corner_id] = {}
            dataStyleStore.styles[id].corners[corner_id].color = color
          }
          console.log(
            `${setCornerColor.name} ${id} ${block_ids} ${cornerColor(
              id,
              block_ids[0],
            )}`,
          )
        },
      },
    )
  }

  function setCornersDefaultStyle(id) {
    const corner_ids = dataBaseStore.getCornersUuids(id)
    return setCornerVisibility(
      id,
      corner_ids,
      dataStyleStore.styles[id].corners.visibility,
    )
  }

  function applyCornersStyle(id) {
    const corners = dataStyleStore.styles[id].corners
    const promise_array = []
    for (const [corner_id, style] of Object.entries(corners)) {
      promise_array.push(setCornerVisibility(id, [corner_id], style.visibility))
    }
    return Promise.all(promise_array)
  }

  return {
    applyCornersStyle,
    cornerColor,
    cornerVisibility,
    setCornerColor,
    setCornerVisibility,
    setCornersDefaultStyle,
  }
}

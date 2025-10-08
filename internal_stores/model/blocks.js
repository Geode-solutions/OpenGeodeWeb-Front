import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"
const blocks_schemas = viewer_schemas.opengeodeweb_viewer.model.blocks

export function useBlocksStyle() {
  const dataStyleStore = useDataStyleStore()
  const dataBaseStore = useDataBaseStore()

  function blockStyle(id, block_id) {
    return dataStyleStore.styles[id].blocks[block_id]
  }

  function blockVisibility(id, block_id) {
    return blockStyle(id, block_id).visibility
  }
  function setBlockVisibility(id, block_ids, visibility) {
    const block_flat_indexes = dataBaseStore.getFlatIndexes(id, block_ids)
    return viewer_call(
      {
        schema: blocks_schemas.visibility,
        params: { id, block_ids: block_flat_indexes, visibility },
      },
      {
        response_function: () => {
          for (const block_id of block_ids) {
            if (!dataStyleStore.styles[id].blocks[block_id])
              dataStyleStore.styles[id].blocks[block_id] = {}
            dataStyleStore.styles[id].blocks[block_id].visibility = visibility
          }
          console.log(
            `${setBlockVisibility.name} ${id} ${block_ids} ${blockVisibility(
              id,
              block_ids[0],
            )}`,
          )
        },
      },
    )
  }

  function blockColor(id, block_id) {
    return blockStyle(id, block_id).color
  }
  function setBlockColor(id, block_ids, color) {
    const block_flat_indexes = dataBaseStore.getFlatIndexes(id, block_ids)
    return viewer_call(
      {
        schema: blocks_schemas.visibility,
        params: { id, block_ids: block_flat_indexes, visibility },
      },
      {
        response_function: () => {
          for (const block_id of block_ids) {
            if (!dataStyleStore.styles[id].blocks[block_id])
              dataStyleStore.styles[id].blocks[block_id] = {}
            dataStyleStore.styles[id].blocks[block_id].color = color
          }
          console.log(
            `${setBlockColor.name} ${id} ${block_ids} ${blockColor(
              id,
              block_ids[0],
            )}`,
          )
        },
      },
    )
  }

  function setBlocksDefaultStyle(id) {
    const block_ids = dataBaseStore.getBlocksUuids(id)
    return setBlockVisibility(
      id,
      block_ids,
      dataStyleStore.styles[id].blocks.visibility,
    )
  }

  function applyBlocksStyle(id) {
    const blocks = dataStyleStore.styles[id].blocks
    const promise_array = []
    for (const [block_id, style] of Object.entries(blocks)) {
      promise_array.push(setBlockVisibility(id, [block_id], style.visibility))
    }
    return Promise.all(promise_array)
  }

  return {
    applyBlocksStyle,
    blockVisibility,
    setBlockColor,
    setBlockVisibility,
    setBlocksDefaultStyle,
  }
}

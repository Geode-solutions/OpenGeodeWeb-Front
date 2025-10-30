// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local constants
const model_blocks_schemas = viewer_schemas.opengeodeweb_viewer.model.blocks

export function useModelBlocksStyle() {
  const dataStyleStore = useDataStyleStore()
  const dataBaseStore = useDataBaseStore()

  function modelBlocksStyle(id) {
    return dataStyleStore.getStyle(id).blocks
  }
  function modelBlockStyle(id, block_id) {
    if (!modelBlocksStyle(id)[block_id]) {
      modelBlocksStyle(id)[block_id] = {}
    }
    return modelBlocksStyle[block_id]
  }

  function modelBlockVisibility(id, block_id) {
    return modelBlockStyle(id, block_id).visibility
  }

  function saveModelBlockVisibility(id, block_id, visibility) {
    modelBlockStyle(id, block_id).visibility = visibility
  }
  function setModelBlocksVisibility(id, block_ids, visibility) {
    const block_flat_indexes = dataBaseStore.getFlatIndexes(id, block_ids)
    return viewer_call(
      {
        schema: model_blocks_schemas.visibility,
        params: { id, block_ids: block_flat_indexes, visibility },
      },
      {
        response_function: () => {
          for (const block_id of block_ids) {
            saveModelBlockVisibility(id, block_id, visibility)
          }
          console.log(
            setModelBlocksVisibility.name,
            { id },
            { block_ids },
            modelBlockVisibility(id, block_ids[0]),
          )
        },
      },
    )
  }
  function modelBlockColor(id, block_id) {
    return modelBlockStyle(id, block_id).color
  }

  function saveModelBlockColor(id, block_id, color) {
    modelBlockStyle(id, block_id).color = color
  }

  function setModelBlocksColor(id, block_ids, color) {
    const block_flat_indexes = dataBaseStore.getFlatIndexes(id, block_ids)
    return viewer_call(
      {
        schema: model_blocks_schemas.color,
        params: { id, block_ids: block_flat_indexes, color },
      },
      {
        response_function: () => {
          for (const block_id of block_ids) {
            saveModelBlockColor(id, block_id, color)
          }
          console.log(
            setModelBlocksColor.name,
            { id },
            { block_ids },
            JSON.stringify(modelBlockColor(id, block_ids[0])),
          )
        },
      },
    )
  }

  function setModelBlocksDefaultStyle(id) {
    const blocks = dataBaseStore.getBlocksUuids(id)
    return Promise.all([
      setModelBlocksVisibility(
        id,
        blocks,
        dataStyleStore.styles[id].blocks.visibility,
      ),
      setModelBlocksColor(id, blocks, dataStyleStore.styles[id].blocks.color),
    ])
  }

  function applyModelBlocksStyle(id) {
    console.log("applyModelBlocksStyle", id)
    const blocks_style = modelBlocksStyle(id)
    console.log("blocks_style", blocks_style)
    const block_ids = dataBaseStore.getBlocksUuids(id)
    return Promise.all([
      setModelBlocksVisibility(id, block_ids, blocks_style.visibility),
      setModelBlocksColor(id, block_ids, blocks_style.color),
    ])
  }

  return {
    modelBlockVisibility,
    modelBlockColor,
    setModelBlocksVisibility,
    setModelBlocksColor,
    setModelBlocksDefaultStyle,
    applyModelBlocksStyle,
  }
}

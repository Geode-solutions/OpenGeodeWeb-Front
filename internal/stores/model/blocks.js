// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useDataStore } from "@ogw_front/stores/data"
import { useDataStyleStateStore } from "../data_style_state"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const model_blocks_schemas = viewer_schemas.opengeodeweb_viewer.model.blocks

export function useModelBlocksStyle() {
  const dataStyleStateStore = useDataStyleStateStore()
  const dataStore = useDataStore()
  const viewerStore = useViewerStore()

  function modelBlocksStyle(id) {
    return dataStyleStateStore.getStyle(id).blocks
  }
  function modelBlockStyle(id, block_id) {
    if (!modelBlocksStyle(id)[block_id]) {
      modelBlocksStyle(id)[block_id] = {}
    }
    return modelBlocksStyle(id)[block_id]
  }

  function modelBlockVisibility(id, block_id) {
    return modelBlockStyle(id, block_id).visibility
  }

  function saveModelBlockVisibility(id, block_id, visibility) {
    modelBlockStyle(id, block_id).visibility = visibility
  }
  async function setModelBlocksVisibility(id, block_ids, visibility) {
    const blocks_viewer_indexes = await dataStore.getViewerIndexes(
      id,
      block_ids,
    )
    if (blocks_viewer_indexes.length === 0) {
      return Promise.resolve()
    }
    return viewerStore.request(
      model_blocks_schemas.visibility,
      { id, block_ids: blocks_viewer_indexes, visibility },
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

  async function setModelBlocksColor(id, block_ids, color) {
    const blocks_viewer_indexes = await dataStore.getViewerIndexes(
      id,
      block_ids,
    )
    if (blocks_viewer_indexes.length === 0) {
      return Promise.resolve()
    }
    return viewerStore.request(
      model_blocks_schemas.color,
      { id, block_ids: blocks_viewer_indexes, color },
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

  async function applyModelBlocksStyle(id) {
    const style = modelBlocksStyle(id)
    const blocks_ids = await dataStore.getBlocksUuids(id)
    return Promise.all([
      setModelBlocksVisibility(id, blocks_ids, style.visibility),
      setModelBlocksColor(id, blocks_ids, style.color),
    ])
  }

  return {
    modelBlockVisibility,
    modelBlockColor,
    setModelBlocksVisibility,
    setModelBlocksColor,
    applyModelBlocksStyle,
  }
}

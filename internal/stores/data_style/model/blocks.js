// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useDataStore } from "@ogw_front/stores/data"
import { useDataStyleStateStore } from "../state"
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
    return dataStyleStateStore.getComponentStyle(id, block_id)
  }

  function modelBlockVisibility(id, block_id) {
    return modelBlockStyle(id, block_id).visibility
  }

  async function setModelBlocksVisibility(id, block_ids, visibility) {
    if (!block_ids || block_ids.length === 0) {
      return
    }

    const updateState = async () => {
      for (const block_id of block_ids) {
        await dataStyleStateStore.mutateComponentStyle(id, block_id, (style) => {
          style.visibility = visibility
        })
      }
      console.log(
        setModelBlocksVisibility.name,
        { id },
        { block_ids },
        modelBlockVisibility(id, block_ids[0]),
      )
    }

    const blocks_viewer_ids = await dataStore.getMeshComponentsViewerIds(
      id,
      block_ids,
    )
    if (!blocks_viewer_ids || blocks_viewer_ids.length === 0) {
      console.warn(
        "[setModelBlocksVisibility] No viewer IDs found, skipping visibility request",
        { id, block_ids },
      )
      await updateState()
      return
    }

    if (model_blocks_schemas?.visibility) {
      return viewerStore.request(
        model_blocks_schemas.visibility,
        { id, block_ids: blocks_viewer_ids, visibility },
        {
          response_function: updateState,
        },
      )
    } else {
      await updateState()
    }
  }
  function modelBlockColor(id, block_id) {
    return modelBlockStyle(id, block_id).color
  }


  async function setModelBlocksColor(id, block_ids, color) {
    if (!block_ids || block_ids.length === 0) {
      return
    }

    const updateState = async () => {
      for (const block_id of block_ids) {
        await dataStyleStateStore.mutateComponentStyle(id, block_id, (style) => {
          style.color = color
        })
      }
      console.log(
        setModelBlocksColor.name,
        { id },
        { block_ids },
        JSON.stringify(modelBlockColor(id, block_ids[0])),
      )
    }

    const blocks_viewer_ids = await dataStore.getMeshComponentsViewerIds(
      id,
      block_ids,
    )
    if (!blocks_viewer_ids || blocks_viewer_ids.length === 0) {
      console.warn(
        "[setModelBlocksColor] No viewer IDs found, skipping color request",
        { id, block_ids },
      )
      await updateState()
      return
    }

    if (model_blocks_schemas?.color) {
      return viewerStore.request(
        model_blocks_schemas.color,
        { id, block_ids: blocks_viewer_ids, color },
        {
          response_function: updateState,
        },
      )
    } else {
      await updateState()
    }
  }

  async function setModelBlocksDefaultStyle(id) {
    const style = modelBlocksStyle(id)
    const blocks_ids = await dataStore.getBlocksGeodeIds(id)
    return Promise.all([
      setModelBlocksVisibility(id, blocks_ids, style.visibility),
      setModelBlocksColor(id, blocks_ids, style.color),
    ])
  }

  async function applyModelBlocksStyle(id) {
    return setModelBlocksDefaultStyle(id)
  }

  return {
    modelBlockVisibility,
    modelBlockColor,
    setModelBlocksVisibility,
    setModelBlocksColor,
    applyModelBlocksStyle,
    setModelBlocksDefaultStyle,
  }
}

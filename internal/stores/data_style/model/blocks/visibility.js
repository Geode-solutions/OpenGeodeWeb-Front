// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useDataStore } from "@ogw_front/stores/data"
import { useModelBlocksCommonStyle } from "./common"
import { useViewerStore } from "@ogw_front/stores/viewer"
import { useDataStyleStateStore } from "../../state"

// Local constants
const model_blocks_schemas = viewer_schemas.opengeodeweb_viewer.model.blocks

export function useModelBlocksVisibilityStyle() {
  const dataStore = useDataStore()
  const viewerStore = useViewerStore()
  const dataStyleStateStore = useDataStyleStateStore()
  const modelBlocksCommonStyle = useModelBlocksCommonStyle()
  function modelBlockVisibility(id, block_id) {
    return modelBlocksCommonStyle.modelBlockStyle(id, block_id).visibility
  }
  function saveModelBlockVisibility(id, block_id, visibility) {
    modelBlocksCommonStyle.modelBlockStyle(id, block_id).visibility = visibility
  }

  async function setModelBlocksVisibility(id, block_ids, visibility) {
    const updateState = async () => {
      for (const block_id of block_ids) {
        await dataStyleStateStore.mutateComponentStyle(
          id,
          block_id,
          (style) => {
            style.visibility = visibility
          },
        )
      }
      console.log(
        setModelBlocksVisibility.name,
        { id },
        { block_ids },
        modelBlockVisibility(id, block_ids[0]),
      )
    }

    if (!block_ids || block_ids.length === 0) {
      return
    }

    if (model_blocks_schemas?.visibility) {
      const blocks_viewer_ids = await dataStore.getMeshComponentsViewerIds(
        id,
        block_ids,
      )
      if (!blocks_viewer_ids || blocks_viewer_ids.length === 0) {
        return updateState()
      }
      return viewerStore.request(
        model_blocks_schemas.visibility,
        { id, block_ids: blocks_viewer_ids, visibility },
        {
          response_function: updateState,
        },
      )
    } else {
      return updateState()
    }
  }

  return {
    modelBlockVisibility,
    setModelBlocksVisibility,
  }
}

// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useDataStore } from "@ogw_front/stores/data"
import { useModelBlocksCommonStyle } from "./common"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const model_blocks_schemas = viewer_schemas.opengeodeweb_viewer.model.blocks

export function useModelBlocksVisibilityStyle() {
  const dataStore = useDataStore()
  const viewerStore = useViewerStore()
  const modelBlocksCommonStyle = useModelBlocksCommonStyle()

  function modelBlockVisibility(id, block_id) {
    const style = modelBlocksCommonStyle.modelBlockStyle(id, block_id)
    if (style.visibility === undefined) {
      return true
    }
    return style.visibility
  }

  function setModelBlocksVisibility(id, block_ids, visibility) {
    const mutate = () => {
      return modelBlocksCommonStyle.mutateModelBlocksStyle(
        id,
        block_ids,
        (style) => {
          style.visibility = visibility
          console.log(
            setModelBlocksVisibility.name,
            { id },
            { block_ids },
            style.visibility,
          )
        },
      )
    }

    if (!block_ids || block_ids.length === 0) {
      return Promise.resolve()
    }
    return dataStore.getMeshComponentsViewerIds(id, block_ids).then(
      (block_viewer_ids) => {
        if (!block_viewer_ids || block_viewer_ids.length === 0) {
          console.warn(
            "[setModelBlocksVisibility] No viewer IDs found, skipping visibility request",
            { id, block_ids },
          )
          return mutate()
        }
        return viewerStore.request(
          model_blocks_schemas.visibility,
          { id, block_ids: block_viewer_ids, visibility },
          {
            response_function: mutate,
          },
        )
      },
    )
  }

  return {
    modelBlockVisibility,
    setModelBlocksVisibility,
  }
}

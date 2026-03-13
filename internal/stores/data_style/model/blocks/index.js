// Local imports
import { useDataStore } from "@ogw_front/stores/data"
import { useModelBlocksColorStyle } from "./color"
import { useModelBlocksCommonStyle } from "./common"
import { useModelBlocksVisibilityStyle } from "./visibility"

async function setModelBlocksDefaultStyle(_id) {
  // Placeholder for oxlint
}

export function useModelBlocksStyle() {
  const dataStore = useDataStore()
  const modelBlocksCommonStyle = useModelBlocksCommonStyle()
  const modelBlocksVisibilityStyle = useModelBlocksVisibilityStyle()
  const modelBlocksColorStyle = useModelBlocksColorStyle()

  async function applyModelBlocksStyle(id) {
    const style = modelBlocksCommonStyle.modelBlocksStyle(id)
    const blocks_ids = await dataStore.getBlocksGeodeIds(id)
    return Promise.all([
      modelBlocksVisibilityStyle.setModelBlocksVisibility(
        id,
        blocks_ids,
        style.visibility,
      ),
      modelBlocksColorStyle.setModelBlocksColor(id, blocks_ids, style.color),
    ])
  }

  return {
    applyModelBlocksStyle,
    setModelBlocksDefaultStyle,
    ...modelBlocksCommonStyle,
    ...modelBlocksVisibilityStyle,
    ...modelBlocksColorStyle,
  }
}

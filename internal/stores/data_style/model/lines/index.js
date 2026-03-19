// Local imports
import { useDataStore } from "@ogw_front/stores/data"
import { useModelLinesColorStyle } from "./color"
import { useModelLinesCommonStyle } from "./common"
import { useModelLinesVisibilityStyle } from "./visibility"

async function setModelLinesDefaultStyle(_id) {
  // Placeholder for oxlint
}

export function useModelLinesStyle() {
  const dataStore = useDataStore()
  const modelLinesCommonStyle = useModelLinesCommonStyle()
  const modelLinesVisibilityStyle = useModelLinesVisibilityStyle()
  const modelLinesColorStyle = useModelLinesColorStyle()

  async function applyModelLinesStyle(id) {
    const style = modelLinesCommonStyle.modelLinesStyle(id)
    const line_ids = await dataStore.getLinesGeodeIds(id)
    return Promise.all([
      modelLinesVisibilityStyle.setModelLinesVisibility(
        id,
        line_ids,
        style.visibility,
      ),
      modelLinesColorStyle.setModelLinesColor(id, line_ids, style.color),
    ])
  }

  return {
    applyModelLinesStyle,
    setModelLinesDefaultStyle,
    ...modelLinesCommonStyle,
    ...modelLinesVisibilityStyle,
    ...modelLinesColorStyle,
  }
}

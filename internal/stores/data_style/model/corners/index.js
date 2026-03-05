// Local imports
import { useModelCornersColorStyle } from "./color"
import { useModelCornersCommonStyle } from "./common"
import { useModelCornersVisibilityStyle } from "./visibility"
import { useDataStore } from "@ogw_front/stores/data"

export function useModelCornersStyle() {
  const dataStore = useDataStore()
  const modelCornersCommonStyle = useModelCornersCommonStyle()
  const modelCornersVisibilityStyle = useModelCornersVisibilityStyle()
  const modelCornersColorStyle = useModelCornersColorStyle()

  async function applyModelCornersStyle(id) {
    const style = modelCornersCommonStyle.modelCornersStyle(id)
    const corner_ids = await dataStore.getCornersGeodeIds(id)
    console.log(applyModelCornersStyle.name, { id }, { corner_ids })
    return Promise.all([
      modelCornersVisibilityStyle.setModelCornersVisibility(
        id,
        corner_ids,
        style.visibility,
      ),
      modelCornersColorStyle.setModelCornersColor(id, corner_ids, style.color),
    ])
  }

  async function setModelCornersDefaultStyle(id) {}

  return {
    applyModelCornersStyle,
    setModelCornersDefaultStyle,
    ...modelCornersCommonStyle,
    ...modelCornersVisibilityStyle,
    ...modelCornersColorStyle,
  }
}

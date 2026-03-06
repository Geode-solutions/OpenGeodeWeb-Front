// Local imports
import { useModelLinesColorStyle } from "./color"
import { useModelLinesCommonStyle } from "./common"
import { useModelLinesVisibilityStyle } from "./visibility"
import { useDataStore } from "@ogw_front/stores/data"

export function useModelLinesStyle() {
  const dataStore = useDataStore()
  const modelLinesCommonStyle = useModelLinesCommonStyle()
  const modelLinesVisibilityStyle = useModelLinesVisibilityStyle()
  const modelLinesColorStyle = useModelLinesColorStyle()

  async function applyModelLinesStyle(id) {
    const line_ids = await dataStore.getLinesGeodeIds(id)
    if (line_ids.length === 0) return

    const visibilityGroups = {}
    const colorGroups = {}

    for (const line_id of line_ids) {
      const style = modelLinesCommonStyle.modelLineStyle(id, line_id)

      const vKey = String(style.visibility)
      if (!visibilityGroups[vKey]) visibilityGroups[vKey] = []
      visibilityGroups[vKey].push(line_id)

      const cKey = JSON.stringify(style.color)
      if (!colorGroups[cKey]) colorGroups[cKey] = []
      colorGroups[cKey].push(line_id)
    }

    const promises = []

    for (const [vValue, ids] of Object.entries(visibilityGroups)) {
      promises.push(
        modelLinesVisibilityStyle.setModelLinesVisibility(
          id,
          ids,
          vValue === "true",
        ),
      )
    }

    for (const [cValue, ids] of Object.entries(colorGroups)) {
      promises.push(
        modelLinesColorStyle.setModelLinesColor(id, ids, JSON.parse(cValue)),
      )
    }

    return Promise.all(promises)
  }

  async function setModelLinesDefaultStyle(id) { }

  return {
    applyModelLinesStyle,
    setModelLinesDefaultStyle,
    ...modelLinesCommonStyle,
    ...modelLinesVisibilityStyle,
    ...modelLinesColorStyle,
  }
}

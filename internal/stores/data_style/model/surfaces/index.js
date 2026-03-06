// Local imports
import { useModelSurfacesColorStyle } from "./color"
import { useModelSurfacesCommonStyle } from "./common"
import { useModelSurfacesVisibilityStyle } from "./visibility"
import { useDataStore } from "@ogw_front/stores/data"

export function useModelSurfacesStyle() {
  const dataStore = useDataStore()
  const modelSurfacesCommonStyle = useModelSurfacesCommonStyle()
  const modelSurfacesVisibilityStyle = useModelSurfacesVisibilityStyle()
  const modelSurfacesColorStyle = useModelSurfacesColorStyle()

  async function applyModelSurfacesStyle(id) {
    const surface_ids = await dataStore.getSurfacesGeodeIds(id)
    if (surface_ids.length === 0) return

    const visibilityGroups = {}
    const colorGroups = {}

    for (const surface_id of surface_ids) {
      const style = modelSurfacesCommonStyle.modelSurfaceStyle(id, surface_id)

      const vKey = String(style.visibility)
      if (!visibilityGroups[vKey]) visibilityGroups[vKey] = []
      visibilityGroups[vKey].push(surface_id)

      const cKey = JSON.stringify(style.color)
      if (!colorGroups[cKey]) colorGroups[cKey] = []
      colorGroups[cKey].push(surface_id)
    }

    const promises = []

    for (const [vValue, ids] of Object.entries(visibilityGroups)) {
      promises.push(
        modelSurfacesVisibilityStyle.setModelSurfacesVisibility(
          id,
          ids,
          vValue === "true",
        ),
      )
    }

    for (const [cValue, ids] of Object.entries(colorGroups)) {
      promises.push(
        modelSurfacesColorStyle.setModelSurfacesColor(
          id,
          ids,
          JSON.parse(cValue),
        ),
      )
    }

    return Promise.all(promises)
  }

  async function setModelSurfacesDefaultStyle(id) { }

  return {
    applyModelSurfacesStyle,
    setModelSurfacesDefaultStyle,
    ...modelSurfacesCommonStyle,
    ...modelSurfacesVisibilityStyle,
    ...modelSurfacesColorStyle,
  }
}

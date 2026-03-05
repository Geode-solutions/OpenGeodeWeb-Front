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
        const style = modelSurfacesCommonStyle.modelSurfacesStyle(id)
        const surface_ids = await dataStore.getSurfacesGeodeIds(id)
        return Promise.all([
            modelSurfacesVisibilityStyle.setModelSurfacesVisibility(
                id,
                surface_ids,
                style.visibility,
            ),
            modelSurfacesColorStyle.setModelSurfacesColor(id, surface_ids, style.color),
        ])
    }

    async function setModelSurfacesDefaultStyle(id) {
        // Keep for compatibility
    }

    return {
        applyModelSurfacesStyle,
        setModelSurfacesDefaultStyle,
        ...modelSurfacesCommonStyle,
        ...modelSurfacesVisibilityStyle,
        ...modelSurfacesColorStyle,
    }
}

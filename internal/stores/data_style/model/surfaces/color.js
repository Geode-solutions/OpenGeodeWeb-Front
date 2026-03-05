// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useModelSurfacesCommonStyle } from "./common"
import { useDataStore } from "@ogw_front/stores/data"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const model_surfaces_schemas = viewer_schemas.opengeodeweb_viewer.model.surfaces

export function useModelSurfacesColorStyle() {
    const dataStore = useDataStore()
    const viewerStore = useViewerStore()
    const modelSurfacesCommonStyle = useModelSurfacesCommonStyle()

    function modelSurfaceColor(id, surface_id) {
        return modelSurfacesCommonStyle.modelSurfaceStyle(id, surface_id).color
    }
    function saveModelSurfaceColor(id, surface_id, color) {
        modelSurfacesCommonStyle.modelSurfaceStyle(id, surface_id).color = color
    }

    async function setModelSurfacesColor(id, surface_ids, color) {
        if (!surface_ids || surface_ids.length === 0) {
            return
        }
        const surface_viewer_ids = await dataStore.getMeshComponentsViewerIds(
            id,
            surface_ids,
        )
        if (!surface_viewer_ids || surface_viewer_ids.length === 0) {
            console.warn(
                "[setModelSurfacesColor] No viewer IDs found, skipping color request",
                { id, surface_ids },
            )
            return
        }
        return viewerStore.request(
            model_surfaces_schemas.color,
            { id, block_ids: surface_viewer_ids, color },
            {
                response_function: () => {
                    for (const surface_id of surface_ids) {
                        saveModelSurfaceColor(id, surface_id, color)
                    }
                    console.log(
                        setModelSurfacesColor.name,
                        { id },
                        { surface_ids },
                        JSON.stringify(modelSurfaceColor(id, surface_ids[0])),
                    )
                },
            },
        )
    }

    return {
        modelSurfaceColor,
        setModelSurfacesColor,
    }
}

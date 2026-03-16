// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useDataStore } from "@ogw_front/stores/data"
import { useModelCornersCommonStyle } from "./common"
import { useViewerStore } from "@ogw_front/stores/viewer"
import { useDataStyleStateStore } from "../../state"

// Local constants
const model_corners_schemas = viewer_schemas.opengeodeweb_viewer.model.corners

export function useModelCornersVisibilityStyle() {
    const dataStore = useDataStore()
    const viewerStore = useViewerStore()
    const modelCornersCommonStyle = useModelCornersCommonStyle()

    function modelCornerVisibility(id, corner_id) {
        return modelCornersCommonStyle.modelCornerStyle(id, corner_id).visibility
    }

    async function setModelCornersVisibility(id, corner_ids, visibility) {
        const dataStyleStateStore = useDataStyleStateStore()
        const updateState = async () => {
            for (const corner_id of corner_ids) {
                await dataStyleStateStore.mutateComponentStyle(id, corner_id, (style) => {
                    style.visibility = visibility
                })
            }
            console.log(
                setModelCornersVisibility.name,
                { id },
                { corner_ids },
                modelCornerVisibility(id, corner_ids[0]),
            )
        }

        if (!corner_ids || corner_ids.length === 0) {
            return
        }
        const corner_viewer_ids = await dataStore.getMeshComponentsViewerIds(
            id,
            corner_ids,
        )
        if (!corner_viewer_ids || corner_viewer_ids.length === 0) {
            console.warn(
                "[setModelCornersVisibility] No viewer IDs found, skipping visibility request",
                { id, corner_ids },
            )
            return updateState()
        }
        return viewerStore.request(
            model_corners_schemas.visibility,
            { id, block_ids: corner_viewer_ids, visibility },
            {
                response_function: updateState,
            },
        )
    }

    return {
        modelCornerVisibility,
        setModelCornersVisibility,
    }
}

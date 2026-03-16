// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useDataStore } from "@ogw_front/stores/data"
import { useModelCornersCommonStyle } from "./common"
import { useViewerStore } from "@ogw_front/stores/viewer"
import { useDataStyleStateStore } from "../../state"

// Local constants
const model_corners_schemas = viewer_schemas.opengeodeweb_viewer.model.corners

export function useModelCornersColorStyle() {
    const dataStore = useDataStore()
    const viewerStore = useViewerStore()
    const modelCornersCommonStyle = useModelCornersCommonStyle()

    function modelCornerColor(id, corner_id) {
        return modelCornersCommonStyle.modelCornerStyle(id, corner_id).color
    }

    async function setModelCornersColor(id, corner_ids, color) {
        const dataStyleStateStore = useDataStyleStateStore()
        const updateState = async () => {
            for (const corner_id of corner_ids) {
                await dataStyleStateStore.mutateComponentStyle(id, corner_id, (style) => {
                    style.color = color
                })
            }
            console.log(
                setModelCornersColor.name,
                { id },
                { corner_ids },
                JSON.stringify(modelCornerColor(id, corner_ids[0])),
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
                "[setModelCornersColor] No viewer IDs found, skipping color request",
                { id, corner_ids },
            )
            return updateState()
        }
        return viewerStore.request(
            model_corners_schemas.color,
            { id, block_ids: corner_viewer_ids, color },
            {
                response_function: updateState,
            },
        )
    }

    return {
        modelCornerColor,
        setModelCornersColor,
    }
}

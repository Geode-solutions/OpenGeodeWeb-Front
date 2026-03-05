// Local imports
import { useModelBlocksColorStyle } from "./color"
import { useModelBlocksCommonStyle } from "./common"
import { useModelBlocksVisibilityStyle } from "./visibility"
import { useDataStore } from "@ogw_front/stores/data"

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

    async function setModelBlocksDefaultStyle(id) {
        // This function logic was referenced in index.js but not fully implemented in blocks.js
        // I will keep it for compatibility if needed, but it seems to be handled by appliers.
    }

    return {
        applyModelBlocksStyle,
        setModelBlocksDefaultStyle,
        ...modelBlocksCommonStyle,
        ...modelBlocksVisibilityStyle,
        ...modelBlocksColorStyle,
    }
}

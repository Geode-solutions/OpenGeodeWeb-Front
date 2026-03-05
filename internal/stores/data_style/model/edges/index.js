// Local imports
import { useModelEdgesCommonStyle } from "./common"
import { useModelEdgesVisibilityStyle } from "./visibility"

export function useModelEdgesStyle() {
    const modelEdgesCommonStyle = useModelEdgesCommonStyle()
    const modelEdgesVisibilityStyle = useModelEdgesVisibilityStyle()

    function applyModelEdgesStyle(id) {
        const style = modelEdgesCommonStyle.modelEdgesStyle(id)
        return Promise.resolve([
            modelEdgesVisibilityStyle.setModelEdgesVisibility(id, style.visibility),
        ])
    }

    return {
        applyModelEdgesStyle,
        ...modelEdgesCommonStyle,
        ...modelEdgesVisibilityStyle,
    }
}

import { useDataStyleStateStore } from "../../state"

export function useModelLinesCommonStyle() {
    const dataStyleStateStore = useDataStyleStateStore()

    function modelLinesStyle(id) {
        return dataStyleStateStore.getStyle(id).lines
    }

    function modelLineStyle(id, line_id) {
        if (!modelLinesStyle(id)[line_id]) {
            modelLinesStyle(id)[line_id] = {}
        }
        return modelLinesStyle(id)[line_id]
    }

    return {
        modelLinesStyle,
        modelLineStyle,
    }
}

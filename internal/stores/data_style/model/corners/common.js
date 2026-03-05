import { useDataStyleStateStore } from "../../state"

export function useModelCornersCommonStyle() {
  const dataStyleStateStore = useDataStyleStateStore()

  function modelCornersStyle(id) {
    return dataStyleStateStore.getStyle(id).corners
  }

  function modelCornerStyle(id, corner_id) {
    if (!modelCornersStyle(id)[corner_id]) {
      modelCornersStyle(id)[corner_id] = {}
    }
    return modelCornersStyle(id)[corner_id]
  }

  return {
    modelCornersStyle,
    modelCornerStyle,
  }
}

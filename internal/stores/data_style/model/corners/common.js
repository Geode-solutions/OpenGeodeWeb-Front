import { useDataStyleStateStore } from "@ogw_internal/stores/data_style/state"

export function useModelCornersCommonStyle() {
  const dataStyleStateStore = useDataStyleStateStore()

  function modelCornersStyle(id) {
    return dataStyleStateStore.styles[id].corners
  }

  function modelCornerStyle(id, corner_id) {
    const groupStyle = modelCornersStyle(id)
    const individualStyle = dataStyleStateStore.getComponentStyle(id, corner_id)
    return { ...groupStyle, ...individualStyle }
  }

  return {
    modelCornersStyle,
    modelCornerStyle,
  }
}

import { useDataStyleStateStore } from "@ogw_internal/stores/data_style/state"

export function useModelCornersCommonStyle() {
  const dataStyleStateStore = useDataStyleStateStore()

  function modelCornersStyle(id) {
    return dataStyleStateStore.getStyle(id).corners
  }

  function modelCornerStyle(id, corner_id) {
    const groupStyle = modelCornersStyle(id)
    const individualStyle = dataStyleStateStore.getComponentStyle(id, corner_id)
    return { ...groupStyle, ...individualStyle }
  }

  function mutateModelCornersStyle(id, corner_ids, mutationCallback) {
    return dataStyleStateStore.mutateComponentStyles(
      id,
      corner_ids,
      mutationCallback,
    )
  }

  return {
    modelCornersStyle,
    modelCornerStyle,
    mutateModelCornersStyle,
  }
}

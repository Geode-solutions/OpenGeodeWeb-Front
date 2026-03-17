import { useDataStyleStateStore } from "@ogw_internal/stores/data_style/state"

export function useModelPointsCommonStyle() {
  const dataStyleStateStore = useDataStyleStateStore()

  function modelPointsStyle(id) {
    return dataStyleStateStore.getStyle(id).points
  }

  function mutateModelPointsStyle(id, mutationCallback) {
    return dataStyleStateStore.mutateStyle(id, (style) => {
      mutationCallback(style.points)
    })
  }

  return {
    modelPointsStyle,
    mutateModelPointsStyle,
  }
}

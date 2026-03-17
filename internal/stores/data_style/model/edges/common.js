import { useDataStyleStateStore } from "@ogw_internal/stores/data_style/state"

export function useModelEdgesCommonStyle() {
  const dataStyleStateStore = useDataStyleStateStore()

  function modelEdgesStyle(id) {
    return dataStyleStateStore.getStyle(id).edges
  }

  function mutateModelEdgesStyle(id, mutationCallback) {
    return dataStyleStateStore.mutateStyle(id, (style) => {
      mutationCallback(style.edges)
    })
  }

  return {
    modelEdgesStyle,
    mutateModelEdgesStyle,
  }
}

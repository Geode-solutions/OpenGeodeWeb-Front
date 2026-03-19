import { useDataStyleStateStore } from "@ogw_internal/stores/data_style/state"

export function useModelEdgesCommonStyle() {
  const dataStyleStateStore = useDataStyleStateStore()

  function mutateModelEdgesStyle(id, values) {
    return dataStyleStateStore.mutateStyle(id, {
      edges: values,
    })
  }

  function modelEdgesStyle(id) {
    return dataStyleStateStore.getStyle(id).edges
  }

  return {
    modelEdgesStyle,
    mutateModelEdgesStyle,
  }
}

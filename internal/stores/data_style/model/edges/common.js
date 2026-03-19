import { useDataStyleStateStore } from "@ogw_internal/stores/data_style/state"

export function useModelEdgesCommonStyle() {
  const dataStyleStateStore = useDataStyleStateStore()

  function mutateModelEdgesStyle(id, values) {
    return dataStyleStateStore.mutateStyle(id, (style) => {
      Object.assign(style.edges, values)
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

import { useDataStyleStateStore } from "@ogw_internal/stores/data_style/state"

export function useMeshEdgesCommonStyle() {
  const dataStyleStateStore = useDataStyleStateStore()

  function mutateMeshEdgesStyle(id, values) {
    return dataStyleStateStore.mutateStyle(id, (style) => {
      Object.assign(style.edges, values)
    })
  }
  function meshEdgesStyle(id) {
    return dataStyleStateStore.getStyle(id).edges
  }

  return {
    meshEdgesStyle,
    mutateMeshEdgesStyle
  }
}

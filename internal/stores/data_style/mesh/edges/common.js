import merge from "lodash/merge"
import { useDataStyleStateStore } from "@ogw_internal/stores/data_style/state"

export function useMeshEdgesCommonStyle() {
  const dataStyleStateStore = useDataStyleStateStore()

  function mutateMeshEdgesStyle(id, values) {
    return dataStyleStateStore.mutateStyle(id, (style) => {
      merge(style.edges, values)
    })
  }

  function meshEdgesStyle(id) {
    return dataStyleStateStore.getStyle(id).edges
  }

  return {
    meshEdgesStyle,
    mutateMeshEdgesStyle,
  }
}

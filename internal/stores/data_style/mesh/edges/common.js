import { useDataStyleStateStore } from "@ogw_internal/stores/data_style/state"

export function useMeshEdgesCommonStyle() {
  const dataStyleStateStore = useDataStyleStateStore()

  function mutateMeshEdgesStyle(id, values) {
    return dataStyleStateStore.mutateStyle(id, {
      edges: values,
    })
  }

  function meshEdgesStyle(id) {
    return dataStyleStateStore.getStyle(id).edges
  }

  function meshEdgesColoring(id) {
    return meshEdgesStyle(id).coloring
  }

  function mutateMeshEdgesColoring(id, values) {
    return mutateMeshEdgesStyle(id, {
      coloring: values,
    })
  }

  return {
    meshEdgesStyle,
    meshEdgesColoring,
    mutateMeshEdgesStyle,
    mutateMeshEdgesColoring,
  }
}

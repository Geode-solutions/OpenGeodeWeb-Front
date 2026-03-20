import { useDataStyleStateStore } from "@ogw_internal/stores/data_style/state"

export function useMeshPolyhedraCommonStyle() {
  const dataStyleStateStore = useDataStyleStateStore()

  function mutateMeshPolyhedraStyle(id, values) {
    return dataStyleStateStore.mutateStyle(id, {
      polyhedra: values,
    })
  }

  function meshPolyhedraStyle(id) {
    return dataStyleStateStore.getStyle(id).polyhedra
  }

  function meshPolyhedraColoring(id) {
    return meshPolyhedraStyle(id).coloring
  }

  function mutateMeshPolyhedraColoring(id, values) {
    return mutateMeshPolyhedraStyle(id, {
      coloring: values,
    })
  }

  return {
    meshPolyhedraStyle,
    meshPolyhedraColoring,
    mutateMeshPolyhedraStyle,
    mutateMeshPolyhedraColoring,
  }
}

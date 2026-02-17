import { useDataStyleStateStore } from "../../state"

export function useMeshPolyhedraCommonStyle() {
  const dataStyleStateStore = useDataStyleStateStore()

  function meshPolyhedraStyle(id) {
    return dataStyleStateStore.getStyle(id).polyhedra
  }

  function meshPolyhedraColoring(id) {
    return meshPolyhedraStyle(id).coloring
  }

  function meshPolyhedraActiveColoring(id) {
    return meshPolyhedraColoring(id).active
  }

  return {
    meshPolyhedraStyle,
    meshPolyhedraColoring,
    meshPolyhedraActiveColoring,
  }
}

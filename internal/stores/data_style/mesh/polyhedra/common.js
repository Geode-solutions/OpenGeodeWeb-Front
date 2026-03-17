import { useDataStyleStateStore } from "@ogw_internal/stores/data_style/state"

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

  function mutateMeshPolyhedraStyle(id, mutationCallback) {
    return dataStyleStateStore.mutateStyle(id, (style) => {
      mutationCallback(style.polyhedra)
    })
  }

  function mutateMeshPolyhedraColoringStyle(id, mutationCallback) {
    return mutateMeshPolyhedraStyle(id, (polyhedra) => {
      mutationCallback(polyhedra.coloring)
    })
  }

  function mutateMeshPolyhedraPolyhedronStyle(id, mutationCallback) {
    return mutateMeshPolyhedraColoringStyle(id, (coloring) => {
      mutationCallback(coloring.polyhedron)
    })
  }

  function mutateMeshPolyhedraVertexStyle(id, mutationCallback) {
    return mutateMeshPolyhedraColoringStyle(id, (coloring) => {
      mutationCallback(coloring.vertex)
    })
  }

  return {
    meshPolyhedraStyle,
    meshPolyhedraColoring,
    meshPolyhedraActiveColoring,
    mutateMeshPolyhedraStyle,
    mutateMeshPolyhedraColoringStyle,
    mutateMeshPolyhedraPolyhedronStyle,
    mutateMeshPolyhedraVertexStyle,
  }
}



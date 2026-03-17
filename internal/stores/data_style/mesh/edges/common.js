import { useDataStyleStateStore } from "@ogw_internal/stores/data_style/state"

export function useMeshEdgesCommonStyle() {
  const dataStyleStateStore = useDataStyleStateStore()

  function meshEdgesStyle(id) {
    return dataStyleStateStore.getStyle(id).edges
  }

  function meshEdgesColoring(id) {
    return meshEdgesStyle(id).coloring
  }

  function meshEdgesActiveColoring(id) {
    return meshEdgesColoring(id).active
  }

  function mutateMeshEdgesStyle(id, mutationCallback) {
    return dataStyleStateStore.mutateStyle(id, (style) => {
      mutationCallback(style.edges)
    })
  }

  function mutateMeshEdgesColoringStyle(id, mutationCallback) {
    return mutateMeshEdgesStyle(id, (edges) => {
      mutationCallback(edges.coloring)
    })
  }

  function mutateMeshEdgesVertexStyle(id, mutationCallback) {
    return mutateMeshEdgesColoringStyle(id, (coloring) => {
      mutationCallback(coloring.vertex)
    })
  }

  function mutateMeshEdgesEdgeStyle(id, mutationCallback) {
    return mutateMeshEdgesColoringStyle(id, (coloring) => {
      mutationCallback(coloring.edge)
    })
  }

  return {
    meshEdgesStyle,
    meshEdgesColoring,
    meshEdgesActiveColoring,
    mutateMeshEdgesStyle,
    mutateMeshEdgesColoringStyle,
    mutateMeshEdgesVertexStyle,
    mutateMeshEdgesEdgeStyle,
  }
}




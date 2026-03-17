import { useDataStyleStateStore } from "@ogw_internal/stores/data_style/state"

export function useMeshPointsCommonStyle() {
  const dataStyleStateStore = useDataStyleStateStore()

  function meshPointsStyle(id) {
    return dataStyleStateStore.getStyle(id).points
  }

  function meshPointsColoring(id) {
    return meshPointsStyle(id).coloring
  }

  function meshPointsActiveColoring(id) {
    return meshPointsColoring(id).active
  }

  function mutateMeshPointsStyle(id, mutationCallback) {
    return dataStyleStateStore.mutateStyle(id, (style) => {
      mutationCallback(style.points)
    })
  }

  function mutateMeshPointsColoringStyle(id, mutationCallback) {
    return mutateMeshPointsStyle(id, (points) => {
      mutationCallback(points.coloring)
    })
  }

  function mutateMeshPointsVertexStyle(id, mutationCallback) {
    return mutateMeshPointsColoringStyle(id, (coloring) => {
      mutationCallback(coloring.vertex)
    })
  }

  return {
    meshPointsStyle,
    meshPointsColoring,
    meshPointsActiveColoring,
    mutateMeshPointsStyle,
    mutateMeshPointsColoringStyle,
    mutateMeshPointsVertexStyle,
  }
}

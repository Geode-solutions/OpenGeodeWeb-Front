import { useDataStyleStateStore } from "./../state"

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

  return {
    meshPointsStyle,
    meshPointsColoring,
    meshPointsActiveColoring,
  }
}

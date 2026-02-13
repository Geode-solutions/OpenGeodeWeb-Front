import { useDataStyleStateStore } from "../../state"

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

  return {
    meshEdgesStyle,
    meshEdgesColoring,
    meshEdgesActiveColoring,
  }
}

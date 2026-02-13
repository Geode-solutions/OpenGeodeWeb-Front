import { useDataStyleStateStore } from "./../state"

export function useMeshCellsCommonStyle() {
  const dataStyleStateStore = useDataStyleStateStore()

  function meshCellsStyle(id) {
    return dataStyleStateStore.getStyle(id).cells
  }

  function meshCellsColoring(id) {
    return meshCellsStyle(id).coloring
  }

  function meshCellsActiveColoring(id) {
    return meshCellsColoring(id).active
  }

  return {
    meshCellsStyle,
    meshCellsColoring,
    meshCellsActiveColoring,
  }
}

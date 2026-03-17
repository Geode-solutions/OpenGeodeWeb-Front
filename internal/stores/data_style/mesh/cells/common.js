import { useDataStyleStateStore } from "@ogw_internal/stores/data_style/state"

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

  function mutateMeshCellsStyle(id, mutationCallback) {
    return dataStyleStateStore.mutateStyle(id, (style) => {
      mutationCallback(style.cells)
    })
  }

  function mutateMeshCellsColoringStyle(id, mutationCallback) {
    return mutateMeshCellsStyle(id, (cells) => {
      mutationCallback(cells.coloring)
    })
  }

  function mutateMeshCellsCellStyle(id, mutationCallback) {
    return mutateMeshCellsColoringStyle(id, (coloring) => {
      mutationCallback(coloring.cell)
    })
  }

  function mutateMeshCellsVertexStyle(id, mutationCallback) {
    return mutateMeshCellsColoringStyle(id, (coloring) => {
      mutationCallback(coloring.vertex)
    })
  }

  return {
    meshCellsStyle,
    meshCellsColoring,
    meshCellsActiveColoring,
    mutateMeshCellsStyle,
    mutateMeshCellsColoringStyle,
    mutateMeshCellsCellStyle,
    mutateCellsStyle: mutateMeshCellsCellStyle,
    mutateMeshCellsVertexStyle,
  }
}



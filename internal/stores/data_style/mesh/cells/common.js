import { useDataStyleStateStore } from "@ogw_internal/stores/data_style/state"

export function useMeshCellsCommonStyle() {
  const dataStyleStateStore = useDataStyleStateStore()

  function mutateMeshCellsStyle(id, values) {
    return dataStyleStateStore.mutateStyle(id, {
      cells: values,
    })
  }

  function meshCellsStyle(id) {
    return dataStyleStateStore.getStyle(id).cells
  }

  function meshCellsColoring(id) {
    return meshCellsStyle(id).coloring
  }

  return {
    meshCellsStyle,
    meshCellsColoring,
    mutateMeshCellsStyle,
  }
}

import { useDataStyleState } from "@ogw_internal/stores/data_style/state";

export function useMeshCellsCommonStyle() {
  const dataStyleStateStore = useDataStyleState();

  function mutateMeshCellsStyle(id, values) {
    return dataStyleStateStore.mutateStyle(id, {
      cells: values,
    });
  }

  function meshCellsStyle(id) {
    return dataStyleStateStore.getStyle(id).cells;
  }

  function meshCellsColoring(id) {
    return meshCellsStyle(id).coloring;
  }

  function mutateMeshCellsColoring(id, values) {
    return mutateMeshCellsStyle(id, {
      coloring: values,
    });
  }

  function mutateMeshCellsCellStyle(id, values) {
    return mutateMeshCellsColoring(id, {
      cell: values,
    });
  }

  return {
    meshCellsStyle,
    meshCellsColoring,
    mutateMeshCellsStyle,
    mutateMeshCellsColoring,
    mutateMeshCellsCellStyle,
  };
}

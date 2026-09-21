import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";

export function useMeshCellsCommonStyle() {
  const dataStyleState = useDataStyleState();

  function mutateMeshCellsStyle(id: string, values: StyleValues) {
    return dataStyleState.mutateStyle(id, {
      cells: values,
    });
  }

  function meshCellsStyle(id: string): StyleValues {
    return dataStyleState.getStyle(id).cells as StyleValues;
  }

  function meshCellsColoring(id: string): StyleValues {
    return meshCellsStyle(id).coloring as StyleValues;
  }

  function mutateMeshCellsColoring(id: string, values: StyleValues) {
    return mutateMeshCellsStyle(id, {
      coloring: values,
    });
  }

  function mutateMeshCellsCellStyle(id: string, values: StyleValues) {
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

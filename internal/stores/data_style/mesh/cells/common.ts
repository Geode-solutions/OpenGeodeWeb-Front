import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";

export function useMeshCellsCommonStyle(): {
  meshCellsStyle: (id: string) => StyleValues;
  meshCellsColoring: (id: string) => StyleValues;
  mutateMeshCellsStyle: (id: string, values: StyleValues) => Promise<string>;
  mutateMeshCellsColoring: (id: string, values: StyleValues) => Promise<string>;
  mutateMeshCellsCellStyle: (id: string, values: StyleValues) => Promise<string>;
} {
  const dataStyleState = useDataStyleState();

  async function mutateMeshCellsStyle(id: string, values: StyleValues): Promise<string> {
    const result = await dataStyleState.mutateStyle(id, {
      cells: values,
    });
    return result;
  }

  function meshCellsStyle(id: string): StyleValues {
    return dataStyleState.getStyle(id).cells ?? {};
  }

  function meshCellsColoring(id: string): StyleValues {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring shape is defined by the data style schema.
    return meshCellsStyle(id).coloring as StyleValues;
  }

  async function mutateMeshCellsColoring(id: string, values: StyleValues): Promise<string> {
    const result = await mutateMeshCellsStyle(id, {
      coloring: values,
    });
    return result;
  }

  async function mutateMeshCellsCellStyle(id: string, values: StyleValues): Promise<string> {
    const result = await mutateMeshCellsColoring(id, {
      cell: values,
    });
    return result;
  }

  return {
    meshCellsStyle,
    meshCellsColoring,
    mutateMeshCellsStyle,
    mutateMeshCellsColoring,
    mutateMeshCellsCellStyle,
  };
}

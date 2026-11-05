import type { DataId } from "@ogw_front/types/identifiers";
import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";

export function useMeshCellsCommonStyle(): {
  meshCellsStyle: (meshId: DataId) => StyleValues;
  meshCellsColoring: (meshId: DataId) => StyleValues;
  mutateMeshCellsStyle: (meshId: DataId, values: StyleValues) => Promise<string>;
  mutateMeshCellsColoring: (meshId: DataId, values: StyleValues) => Promise<string>;
  mutateMeshCellsCellStyle: (meshId: DataId, values: StyleValues) => Promise<string>;
} {
  const dataStyleState = useDataStyleState();

  async function mutateMeshCellsStyle(meshId: DataId, values: StyleValues): Promise<string> {
    const result = await dataStyleState.mutateStyle(meshId, {
      cells: values,
    });
    return result;
  }

  function meshCellsStyle(meshId: DataId): StyleValues {
    return dataStyleState.getStyle(meshId).cells ?? {};
  }

  function meshCellsColoring(meshId: DataId): StyleValues {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring shape is defined by the data style schema.
    return meshCellsStyle(meshId).coloring as StyleValues;
  }

  async function mutateMeshCellsColoring(meshId: DataId, values: StyleValues): Promise<string> {
    const result = await mutateMeshCellsStyle(meshId, {
      coloring: values,
    });
    return result;
  }

  async function mutateMeshCellsCellStyle(meshId: DataId, values: StyleValues): Promise<string> {
    const result = await mutateMeshCellsColoring(meshId, {
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

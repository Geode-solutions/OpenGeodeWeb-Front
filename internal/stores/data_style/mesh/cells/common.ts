import type { MeshId } from "@ogw_front/types/identifiers";
import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";

export function useMeshCellsCommonStyle(): {
  meshCellsStyle: (meshId: MeshId) => StyleValues;
  meshCellsColoring: (meshId: MeshId) => StyleValues;
  mutateMeshCellsStyle: (meshId: MeshId, values: StyleValues) => Promise<MeshId>;
  mutateMeshCellsColoring: (meshId: MeshId, values: StyleValues) => Promise<MeshId>;
  mutateMeshCellsCellStyle: (meshId: MeshId, values: StyleValues) => Promise<MeshId>;
} {
  const dataStyleState = useDataStyleState();

  async function mutateMeshCellsStyle(meshId: MeshId, values: StyleValues): Promise<MeshId> {
    const result = await dataStyleState.mutateStyle(meshId, {
      cells: values,
    });
    return result;
  }

  function meshCellsStyle(meshId: MeshId): StyleValues {
    return dataStyleState.getStyle(meshId).cells ?? {};
  }

  function meshCellsColoring(meshId: MeshId): StyleValues {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring shape is defined by the data style schema.
    return meshCellsStyle(meshId).coloring as StyleValues;
  }

  async function mutateMeshCellsColoring(meshId: MeshId, values: StyleValues): Promise<MeshId> {
    const result = await mutateMeshCellsStyle(meshId, {
      coloring: values,
    });
    return result;
  }

  async function mutateMeshCellsCellStyle(meshId: MeshId, values: StyleValues): Promise<MeshId> {
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

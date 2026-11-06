import type { MeshId } from "@ogw_front/types/identifiers";
import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";

export function useMeshPolyhedraCommonStyle(): {
  meshPolyhedraStyle: (meshId: MeshId) => StyleValues;
  meshPolyhedraColoring: (meshId: MeshId) => StyleValues;
  mutateMeshPolyhedraStyle: (meshId: MeshId, values: StyleValues) => Promise<string>;
  mutateMeshPolyhedraColoring: (meshId: MeshId, values: StyleValues) => Promise<string>;
} {
  const dataStyleState = useDataStyleState();

  async function mutateMeshPolyhedraStyle(meshId: MeshId, values: StyleValues): Promise<string> {
    const result = await dataStyleState.mutateStyle(meshId, {
      polyhedra: values,
    });
    return result;
  }

  function meshPolyhedraStyle(meshId: MeshId): StyleValues {
    return dataStyleState.getStyle(meshId).polyhedra ?? {};
  }

  function meshPolyhedraColoring(meshId: MeshId): StyleValues {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring shape is defined by the data style schema.
    return meshPolyhedraStyle(meshId).coloring as StyleValues;
  }

  async function mutateMeshPolyhedraColoring(meshId: MeshId, values: StyleValues): Promise<string> {
    const result = await mutateMeshPolyhedraStyle(meshId, {
      coloring: values,
    });
    return result;
  }

  return {
    meshPolyhedraStyle,
    meshPolyhedraColoring,
    mutateMeshPolyhedraStyle,
    mutateMeshPolyhedraColoring,
  };
}

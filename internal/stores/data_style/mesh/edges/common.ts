import type { MeshId } from "@ogw_front/types/identifiers";
import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";

export function useMeshEdgesCommonStyle(): {
  meshEdgesStyle: (meshId: MeshId) => StyleValues;
  meshEdgesColoring: (meshId: MeshId) => StyleValues;
  mutateMeshEdgesStyle: (meshId: MeshId, values: StyleValues) => Promise<string>;
  mutateMeshEdgesColoring: (meshId: MeshId, values: StyleValues) => Promise<string>;
} {
  const dataStyleState = useDataStyleState();

  async function mutateMeshEdgesStyle(meshId: MeshId, values: StyleValues): Promise<string> {
    const result = await dataStyleState.mutateStyle(meshId, {
      edges: values,
    });
    return result;
  }

  function meshEdgesStyle(meshId: MeshId): StyleValues {
    return dataStyleState.getStyle(meshId).edges ?? {};
  }

  function meshEdgesColoring(meshId: MeshId): StyleValues {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring shape is defined by the data style schema.
    return meshEdgesStyle(meshId).coloring as StyleValues;
  }

  async function mutateMeshEdgesColoring(meshId: MeshId, values: StyleValues): Promise<string> {
    const result = await mutateMeshEdgesStyle(meshId, {
      coloring: values,
    });
    return result;
  }

  return {
    meshEdgesStyle,
    meshEdgesColoring,
    mutateMeshEdgesStyle,
    mutateMeshEdgesColoring,
  };
}

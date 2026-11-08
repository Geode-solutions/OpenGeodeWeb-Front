import type { MeshId } from "@ogw_front/types/identifiers";
import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import type { Visibility } from "@ogw_front/types/style";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";

export function useMeshPointsCommonStyle(): {
  meshPointsStyle: (meshId: MeshId) => StyleValues;
  meshPointsColoring: (meshId: MeshId) => StyleValues;
  mutateMeshPointsColoring: (meshId: MeshId, values: StyleValues) => Promise<string>;
  mutateMeshPointsStyle: (meshId: MeshId, values: StyleValues) => Promise<string>;
  mutateMeshPointsVisibility: (response: { id: string; visibility: Visibility }) => Promise<string>;
} {
  const dataStyleState = useDataStyleState();

  async function mutateMeshPointsStyle(meshId: MeshId, values: StyleValues): Promise<string> {
    const result = await dataStyleState.mutateStyle(meshId, {
      points: values,
    });
    return result;
  }

  async function mutateMeshPointsVisibility(response: {
    id: string;
    visibility: Visibility;
  }): Promise<string> {
    const result = await mutateMeshPointsStyle(response.id, { visibility: response.visibility });
    return result;
  }

  function meshPointsStyle(meshId: MeshId): StyleValues {
    return dataStyleState.getStyle(meshId).points ?? {};
  }

  function meshPointsColoring(meshId: MeshId): StyleValues {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring shape is defined by the data style schema.
    return meshPointsStyle(meshId).coloring as StyleValues;
  }

  async function mutateMeshPointsColoring(meshId: MeshId, values: StyleValues): Promise<string> {
    const result = await mutateMeshPointsStyle(meshId, {
      coloring: values,
    });
    return result;
  }

  return {
    meshPointsStyle,
    meshPointsColoring,
    mutateMeshPointsColoring,
    mutateMeshPointsStyle,
    mutateMeshPointsVisibility,
  };
}

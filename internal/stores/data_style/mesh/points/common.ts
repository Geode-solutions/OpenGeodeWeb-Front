import type { DataId } from "@ogw_front/types/identifiers";
import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";

export function useMeshPointsCommonStyle(): {
  meshPointsStyle: (meshId: DataId) => StyleValues;
  meshPointsColoring: (meshId: DataId) => StyleValues;
  mutateMeshPointsColoring: (meshId: DataId, values: StyleValues) => Promise<string>;
  mutateMeshPointsStyle: (meshId: DataId, values: StyleValues) => Promise<string>;
  mutateMeshPointsVisibility: (response: { id: string; visibility: boolean }) => Promise<string>;
} {
  const dataStyleState = useDataStyleState();

  async function mutateMeshPointsStyle(meshId: DataId, values: StyleValues): Promise<string> {
    const result = await dataStyleState.mutateStyle(meshId, {
      points: values,
    });
    return result;
  }

  async function mutateMeshPointsVisibility(response: {
    id: string;
    visibility: boolean;
  }): Promise<string> {
    const result = await mutateMeshPointsStyle(response.id, { visibility: response.visibility });
    return result;
  }

  function meshPointsStyle(meshId: DataId): StyleValues {
    return dataStyleState.getStyle(meshId).points ?? {};
  }

  function meshPointsColoring(meshId: DataId): StyleValues {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring shape is defined by the data style schema.
    return meshPointsStyle(meshId).coloring as StyleValues;
  }

  async function mutateMeshPointsColoring(meshId: DataId, values: StyleValues): Promise<string> {
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

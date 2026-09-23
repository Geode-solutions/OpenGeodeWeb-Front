import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";

export function useMeshPointsCommonStyle(): {
  meshPointsStyle: (id: string) => StyleValues;
  meshPointsColoring: (id: string) => StyleValues;
  mutateMeshPointsColoring: (id: string, values: StyleValues) => Promise<string>;
  mutateMeshPointsStyle: (id: string, values: StyleValues) => Promise<string>;
  mutateMeshPointsVisibility: (response: { id: string; visibility: boolean }) => Promise<string>;
} {
  const dataStyleState = useDataStyleState();

  async function mutateMeshPointsStyle(id: string, values: StyleValues): Promise<string> {
    const result = await dataStyleState.mutateStyle(id, {
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

  function meshPointsStyle(id: string): StyleValues {
    return dataStyleState.getStyle(id).points ?? {};
  }

  function meshPointsColoring(id: string): StyleValues {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring shape is defined by the data style schema.
    return meshPointsStyle(id).coloring as StyleValues;
  }

  async function mutateMeshPointsColoring(id: string, values: StyleValues): Promise<string> {
    const result = await mutateMeshPointsStyle(id, {
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

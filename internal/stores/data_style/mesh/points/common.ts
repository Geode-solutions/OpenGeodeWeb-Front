import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";

export function useMeshPointsCommonStyle(): {
  meshPointsStyle: (id: string) => StyleValues;
  meshPointsColoring: (id: string) => StyleValues;
  mutateMeshPointsColoring: (id: string, values: StyleValues) => Promise<string>;
  mutateMeshPointsStyle: (id: string, values: StyleValues) => Promise<string>;
  mutateMeshPointsVisibility: (
    response: Readonly<{ id: string; visibility: boolean }>,
  ) => Promise<string>;
} {
  const dataStyleState = useDataStyleState();

  async function mutateMeshPointsStyle(id: string, values: StyleValues): Promise<string> {
    return await dataStyleState.mutateStyle(id, {
      points: values,
    });
  }

  async function mutateMeshPointsVisibility(
    response: Readonly<{ id: string; visibility: boolean }>,
  ): Promise<string> {
    return mutateMeshPointsStyle(response.id, { visibility: response.visibility });
  }

  function meshPointsStyle(id: string): StyleValues {
    return dataStyleState.getStyle(id).points as StyleValues;
  }

  function meshPointsColoring(id: string): StyleValues {
    return meshPointsStyle(id).coloring as StyleValues;
  }

  async function mutateMeshPointsColoring(id: string, values: StyleValues): Promise<string> {
    return mutateMeshPointsStyle(id, {
      coloring: values,
    });
  }

  return {
    meshPointsStyle,
    meshPointsColoring,
    mutateMeshPointsColoring,
    mutateMeshPointsStyle,
    mutateMeshPointsVisibility,
  };
}

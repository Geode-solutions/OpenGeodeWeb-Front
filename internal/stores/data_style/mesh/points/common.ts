import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";

export function useMeshPointsCommonStyle() {
  const dataStyleState = useDataStyleState();

  function mutateMeshPointsStyle(id: string, values: StyleValues) {
    return dataStyleState.mutateStyle(id, {
      points: values,
    });
  }

  function mutateMeshPointsVisibility(response: { id: string; visibility: boolean }) {
    return mutateMeshPointsStyle(response.id, { visibility: response.visibility });
  }

  function meshPointsStyle(id: string): StyleValues {
    return dataStyleState.getStyle(id).points as StyleValues;
  }

  function meshPointsColoring(id: string): StyleValues {
    return meshPointsStyle(id).coloring as StyleValues;
  }

  function mutateMeshPointsColoring(id: string, values: StyleValues) {
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

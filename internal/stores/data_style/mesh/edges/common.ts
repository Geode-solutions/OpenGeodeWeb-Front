import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";

export function useMeshEdgesCommonStyle() {
  const dataStyleState = useDataStyleState();

  function mutateMeshEdgesStyle(id: string, values: StyleValues) {
    return dataStyleState.mutateStyle(id, {
      edges: values,
    });
  }

  function meshEdgesStyle(id: string): StyleValues {
    return dataStyleState.getStyle(id).edges as StyleValues;
  }

  function meshEdgesColoring(id: string): StyleValues {
    return meshEdgesStyle(id).coloring as StyleValues;
  }

  function mutateMeshEdgesColoring(id: string, values: StyleValues) {
    return mutateMeshEdgesStyle(id, {
      coloring: values,
    });
  }

  return {
    meshEdgesStyle,
    meshEdgesColoring,
    mutateMeshEdgesStyle,
    mutateMeshEdgesColoring,
  };
}

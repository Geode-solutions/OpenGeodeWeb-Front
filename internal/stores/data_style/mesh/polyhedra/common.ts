import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";

export function useMeshPolyhedraCommonStyle() {
  const dataStyleState = useDataStyleState();

  function mutateMeshPolyhedraStyle(id: string, values: StyleValues) {
    return dataStyleState.mutateStyle(id, {
      polyhedra: values,
    });
  }

  function meshPolyhedraStyle(id: string): StyleValues {
    return dataStyleState.getStyle(id).polyhedra as StyleValues;
  }

  function meshPolyhedraColoring(id: string): StyleValues {
    return meshPolyhedraStyle(id).coloring as StyleValues;
  }

  function mutateMeshPolyhedraColoring(id: string, values: StyleValues) {
    return mutateMeshPolyhedraStyle(id, {
      coloring: values,
    });
  }

  return {
    meshPolyhedraStyle,
    meshPolyhedraColoring,
    mutateMeshPolyhedraStyle,
    mutateMeshPolyhedraColoring,
  };
}

import type { StyleValues } from "../../types";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";

export function useMeshPolygonsCommonStyle() {
  const dataStyleState = useDataStyleState();

  function mutateMeshPolygonsStyle(id: string, values: StyleValues) {
    return dataStyleState.mutateStyle(id, {
      polygons: values,
    });
  }

  function meshPolygonsStyle(id: string): StyleValues {
    return dataStyleState.getStyle(id).polygons as StyleValues;
  }

  function meshPolygonsColoring(id: string): StyleValues {
    return meshPolygonsStyle(id).coloring as StyleValues;
  }

  function mutateMeshPolygonsColoring(id: string, values: StyleValues) {
    return mutateMeshPolygonsStyle(id, {
      coloring: values,
    });
  }

  return {
    meshPolygonsStyle,
    meshPolygonsColoring,
    mutateMeshPolygonsStyle,
    mutateMeshPolygonsColoring,
  };
}

import { useDataStyleState } from "@ogw_internal/stores/data_style/state";

export function useMeshPolygonsCommonStyle() {
  const dataStyleState = useDataStyleState();

  function mutateMeshPolygonsStyle(id, values) {
    return dataStyleState.mutateStyle(id, {
      polygons: values,
    });
  }

  function meshPolygonsStyle(id) {
    return dataStyleState.getStyle(id).polygons;
  }

  function meshPolygonsColoring(id) {
    return meshPolygonsStyle(id).coloring;
  }

  function mutateMeshPolygonsColoring(id, values) {
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

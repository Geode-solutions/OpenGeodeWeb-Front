import { useDataStyleState } from "@ogw_internal/stores/data_style/state";

export function useMeshPolyhedraCommonStyle() {
  const dataStyleState = useDataStyleState();

  function mutateMeshPolyhedraStyle(id, values) {
    return dataStyleState.mutateStyle(id, {
      polyhedra: values,
    });
  }

  function meshPolyhedraStyle(id) {
    return dataStyleState.getStyle(id).polyhedra;
  }

  function meshPolyhedraColoring(id) {
    return meshPolyhedraStyle(id).coloring;
  }

  function mutateMeshPolyhedraColoring(id, values) {
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

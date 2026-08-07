import { useDataStyleState } from "@ogw_internal/stores/data_style/state";

export function useMeshPointsCommonStyle() {
  const dataStyleState = useDataStyleState();

  function mutateMeshPointsStyle(id, values) {
    return dataStyleState.mutateStyle(id, {
      points: values,
    });
  }

  function mutateMeshPointsVisibility(response) {
    return mutateMeshPointsStyle(response.id, { visibility: response.visibility });
  }

  function meshPointsStyle(id) {
    return dataStyleState.getStyle(id).points;
  }

  function meshPointsColoring(id) {
    return meshPointsStyle(id).coloring;
  }

  function mutateMeshPointsColoring(id, values) {
    return mutateMeshPointsStyle(id, {
      coloring: values,
    });
  }

  return {
    meshPointsStyle,
    meshPointsColoring,
    // mutateMeshPointsStyle,
    mutateMeshPointsColoring,
    mutateMeshPointsVisibility,
  };
}

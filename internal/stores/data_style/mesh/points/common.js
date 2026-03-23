import { useDataStyleStateStore } from "@ogw_internal/stores/data_style/state";

export function useMeshPointsCommonStyle() {
  const dataStyleStateStore = useDataStyleStateStore();

  function mutateMeshPointsStyle(id, values) {
    return dataStyleStateStore.mutateStyle(id, {
      points: values,
    })
  }

  function meshPointsStyle(id) {
    return dataStyleStateStore.getStyle(id).points;
  }

  function meshPointsColoring(id) {
    return meshPointsStyle(id).coloring;
  }

  function mutateMeshPointsColoring(id, values) {
    return mutateMeshPointsStyle(id, {
      coloring: values,
    })
  }

  return {
    meshPointsStyle,
    meshPointsColoring,
    mutateMeshPointsStyle,
    mutateMeshPointsColoring,
  }
}

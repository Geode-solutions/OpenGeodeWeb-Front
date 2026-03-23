import { useDataStyleStateStore } from "@ogw_internal/stores/data_style/state";

export function useModelPointsCommonStyle() {
  const dataStyleStateStore = useDataStyleStateStore();

  function mutateModelPointsStyle(id, values) {
    return dataStyleStateStore.mutateStyle(id, {
      points: values,
    });
  }

  function modelPointsStyle(id) {
    return dataStyleStateStore.getStyle(id).points;
  }

  return {
    modelPointsStyle,
    mutateModelPointsStyle,
  };
}

import { useDataStyleState } from "@ogw_internal/stores/data_style/state";

export function useModelPointsCommonStyle() {
  const dataStyleState = useDataStyleState();

  function mutateModelPointsStyle(id, values) {
    return dataStyleState.mutateStyle(id, {
      points: values,
    });
  }

  function modelPointsStyle(id) {
    return dataStyleState.getStyle(id).points;
  }

  return {
    modelPointsStyle,
    mutateModelPointsStyle,
  };
}

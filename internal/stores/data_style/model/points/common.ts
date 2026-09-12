import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";

export function useModelPointsCommonStyle() {
  const dataStyleState = useDataStyleState();

  function mutateModelPointsStyle(id: string, values: StyleValues) {
    return dataStyleState.mutateStyle(id, {
      points: values,
    });
  }

  function modelPointsStyle(id: string): StyleValues {
    return dataStyleState.getStyle(id).points as StyleValues;
  }

  return {
    modelPointsStyle,
    mutateModelPointsStyle,
  };
}

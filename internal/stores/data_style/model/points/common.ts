import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";

export function useModelPointsCommonStyle(): {
  modelPointsStyle: (id: string) => StyleValues;
  mutateModelPointsStyle: (id: string, values: StyleValues) => Promise<unknown>;
} {
  const dataStyleState = useDataStyleState();

  async function mutateModelPointsStyle(id: string, values: StyleValues): Promise<unknown> {
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

import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";

export function useModelEdgesCommonStyle(): {
  modelEdgesStyle: (id: string) => StyleValues;
  mutateModelEdgesStyle: (id: string, values: StyleValues) => Promise<string>;
} {
  const dataStyleState = useDataStyleState();

  async function mutateModelEdgesStyle(id: string, values: StyleValues): Promise<string> {
    return dataStyleState.mutateStyle(id, {
      edges: values,
    });
  }

  function modelEdgesStyle(id: string): StyleValues {
    return dataStyleState.getStyle(id).edges as StyleValues;
  }

  return {
    modelEdgesStyle,
    mutateModelEdgesStyle,
  };
}

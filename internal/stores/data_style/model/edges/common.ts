import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";

export function useModelEdgesCommonStyle(): {
  modelEdgesStyle: (id: string) => StyleValues;
  mutateModelEdgesStyle: (id: string, values: StyleValues) => Promise<string>;
} {
  const dataStyleState = useDataStyleState();

  async function mutateModelEdgesStyle(id: string, values: StyleValues): Promise<string> {
    const result = await dataStyleState.mutateStyle(id, {
      edges: values,
    });
    return result;
  }

  function modelEdgesStyle(id: string): StyleValues {
    const { edges } = dataStyleState.getStyle(id);
    if (edges === undefined) {
      return {};
    }
    return edges;
  }

  return {
    modelEdgesStyle,
    mutateModelEdgesStyle,
  };
}

import type { ModelId } from "@ogw_front/types/identifiers";
import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";

export function useModelEdgesCommonStyle(): {
  modelEdgesStyle: (modelId: ModelId) => StyleValues;
  mutateModelEdgesStyle: (modelId: ModelId, values: StyleValues) => Promise<string>;
} {
  const dataStyleState = useDataStyleState();

  async function mutateModelEdgesStyle(modelId: ModelId, values: StyleValues): Promise<string> {
    const result = await dataStyleState.mutateStyle(modelId, {
      edges: values,
    });
    return result;
  }

  function modelEdgesStyle(modelId: ModelId): StyleValues {
    const { edges } = dataStyleState.getStyle(modelId);
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

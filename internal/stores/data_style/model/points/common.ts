import type { DataId } from "@ogw_front/types/identifiers";
import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";

export function useModelPointsCommonStyle(): {
  modelPointsStyle: (modelId: DataId) => StyleValues;
  mutateModelPointsStyle: (modelId: DataId, values: StyleValues) => Promise<unknown>;
} {
  const dataStyleState = useDataStyleState();

  async function mutateModelPointsStyle(modelId: DataId, values: StyleValues): Promise<unknown> {
    const result = await dataStyleState.mutateStyle(modelId, {
      points: values,
    });
    return result;
  }

  function modelPointsStyle(modelId: DataId): StyleValues {
    return dataStyleState.getStyle(modelId).points ?? {};
  }

  return {
    modelPointsStyle,
    mutateModelPointsStyle,
  };
}

import type { DataId } from "@ogw_front/types/identifiers";
import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import merge from "lodash/merge";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";

export function useModelLinesCommonStyle(): {
  modelLinesStyle: (modelId: DataId) => StyleValues;
  modelLineStyle: (modelId: DataId, line_id?: string) => StyleValues;
  modelLineColoring: (modelId: DataId, line_id?: string) => StyleValues;
  mutateModelLinesColoring: (
    modelId: DataId,
    lines_ids: string[],
    values: StyleValues,
  ) => Promise<void>;
  mutateModelLinesTypeColoring: (modelId: DataId, values: StyleValues) => Promise<void>;
} {
  const dataStyleState = useDataStyleState();
  const modelCommonStyle = useModelCommonStyle();

  function modelLinesStyle(modelId: DataId): StyleValues {
    return dataStyleState.getStyle(modelId).lines ?? {};
  }

  function modelComponentTypeLinesStyle(modelId: DataId): StyleValues {
    const defaultStyle = modelLinesStyle(modelId);
    const typeStyle = dataStyleState.getModelComponentTypeStyle(modelId, "Line");
    return merge({}, defaultStyle, typeStyle);
  }

  function modelLineStyle(modelId: DataId, line_id?: string): StyleValues {
    if (line_id === undefined) {
      return modelComponentTypeLinesStyle(modelId);
    }
    const typeStyle = modelComponentTypeLinesStyle(modelId);
    const individualStyle = dataStyleState.getComponentStyle(modelId, line_id);
    return merge({}, typeStyle, individualStyle);
  }

  function modelLineColoring(modelId: DataId, line_id?: string): StyleValues {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring shape is defined by the data style schema.
    return modelLineStyle(modelId, line_id).coloring as StyleValues;
  }

  async function mutateModelLinesColoring(
    modelId: DataId,
    lines_ids: string[],
    values: StyleValues,
  ): Promise<void> {
    await modelCommonStyle.mutateComponentStyles(modelId, lines_ids, {
      coloring: values,
    });
  }

  async function mutateModelLinesTypeColoring(modelId: DataId, values: StyleValues): Promise<void> {
    await modelCommonStyle.mutateModelComponentTypeStyle(modelId, "Line", {
      coloring: values,
    });
  }

  return {
    modelLinesStyle,
    modelLineStyle,
    modelLineColoring,
    mutateModelLinesColoring,
    mutateModelLinesTypeColoring,
  };
}

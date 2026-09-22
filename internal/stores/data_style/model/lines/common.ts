import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import merge from "lodash/merge";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";

export function useModelLinesCommonStyle(): {
  modelLinesStyle: (id: string) => StyleValues;
  modelLineStyle: (id: string, line_id?: string) => StyleValues;
  modelLineColoring: (id: string, line_id?: string) => StyleValues;
  mutateModelLinesColoring: (id: string, lines_ids: string[], values: StyleValues) => Promise<void>;
  mutateModelLinesTypeColoring: (id: string, values: StyleValues) => Promise<void>;
} {
  const dataStyleState = useDataStyleState();
  const modelCommonStyle = useModelCommonStyle();

  function modelLinesStyle(id: string): StyleValues {
    return dataStyleState.getStyle(id).lines ?? {};
  }

  function modelComponentTypeLinesStyle(id: string): StyleValues {
    const defaultStyle = modelLinesStyle(id);
    const typeStyle = dataStyleState.getModelComponentTypeStyle(id, "Line");
    return merge({}, defaultStyle, typeStyle);
  }

  function modelLineStyle(id: string, line_id?: string): StyleValues {
    if (line_id === undefined) {
      return modelComponentTypeLinesStyle(id);
    }
    const typeStyle = modelComponentTypeLinesStyle(id);
    const individualStyle = dataStyleState.getComponentStyle(id, line_id);
    return merge({}, typeStyle, individualStyle);
  }

  function modelLineColoring(id: string, line_id?: string): StyleValues {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring shape is defined by the data style schema.
    return modelLineStyle(id, line_id).coloring as StyleValues;
  }

  async function mutateModelLinesColoring(
    id: string,
    lines_ids: string[],
    values: StyleValues,
  ): Promise<void> {
    await modelCommonStyle.mutateComponentStyles(id, lines_ids, {
      coloring: values,
    });
  }

  async function mutateModelLinesTypeColoring(id: string, values: StyleValues): Promise<void> {
    await modelCommonStyle.mutateModelComponentTypeStyle(id, "Line", {
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

import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import merge from "lodash/merge";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";

export function useModelCornersCommonStyle(): {
  modelCornersStyle: (id: string) => StyleValues;
  modelCornerStyle: (id: string, corner_id?: string) => StyleValues;
  modelCornerColoring: (id: string, corner_id?: string) => StyleValues;
  mutateModelCornersColoring: (
    id: string,
    corners_ids: string[],
    values: StyleValues,
  ) => Promise<void>;
  mutateModelCornersTypeColoring: (id: string, values: StyleValues) => Promise<void>;
} {
  const dataStyleState = useDataStyleState();
  const modelCommonStyle = useModelCommonStyle();

  function modelCornersStyle(id: string): StyleValues {
    return dataStyleState.getStyle(id).corners as StyleValues;
  }

  function modelComponentTypeCornersStyle(id: string): StyleValues {
    const defaultStyle = modelCornersStyle(id);
    const typeStyle = dataStyleState.getModelComponentTypeStyle(id, "Corner");
    return merge({}, defaultStyle, typeStyle);
  }

  function modelCornerStyle(id: string, corner_id?: string): StyleValues {
    if (corner_id === undefined) {
      return modelComponentTypeCornersStyle(id);
    }
    const typeStyle = modelComponentTypeCornersStyle(id);
    const individualStyle = dataStyleState.getComponentStyle(id, corner_id);
    return merge({}, typeStyle, individualStyle);
  }

  function modelCornerColoring(id: string, corner_id?: string): StyleValues {
    return modelCornerStyle(id, corner_id).coloring as StyleValues;
  }

  async function mutateModelCornersColoring(
    id: string,
    corners_ids: string[],
    values: StyleValues,
  ): Promise<void> {
    return modelCommonStyle.mutateComponentStyles(id, corners_ids, {
      coloring: values,
    });
  }

  async function mutateModelCornersTypeColoring(id: string, values: StyleValues): Promise<void> {
    return modelCommonStyle.mutateModelComponentTypeStyle(id, "Corner", {
      coloring: values,
    });
  }

  return {
    modelCornersStyle,
    modelCornerStyle,
    modelCornerColoring,
    mutateModelCornersColoring,
    mutateModelCornersTypeColoring,
  };
}

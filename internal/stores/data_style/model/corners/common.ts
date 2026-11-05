import type { DataId } from "@ogw_front/types/identifiers";
import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import merge from "lodash/merge";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";

export function useModelCornersCommonStyle(): {
  modelCornersStyle: (modelId: DataId) => StyleValues;
  modelCornerStyle: (modelId: DataId, corner_id?: string) => StyleValues;
  modelCornerColoring: (modelId: DataId, corner_id?: string) => StyleValues;
  mutateModelCornersColoring: (
    modelId: DataId,
    corners_ids: string[],
    values: StyleValues,
  ) => Promise<void>;
  mutateModelCornersTypeColoring: (modelId: DataId, values: StyleValues) => Promise<void>;
} {
  const dataStyleState = useDataStyleState();
  const modelCommonStyle = useModelCommonStyle();

  function modelCornersStyle(modelId: DataId): StyleValues {
    const { corners } = dataStyleState.getStyle(modelId);
    if (corners === undefined) {
      return {};
    }
    return corners;
  }

  function modelComponentTypeCornersStyle(modelId: DataId): StyleValues {
    const defaultStyle = modelCornersStyle(modelId);
    const typeStyle = dataStyleState.getModelComponentTypeStyle(modelId, "Corner");
    return merge({}, defaultStyle, typeStyle);
  }

  function modelCornerStyle(modelId: DataId, corner_id?: string): StyleValues {
    if (corner_id === undefined) {
      return modelComponentTypeCornersStyle(modelId);
    }
    const typeStyle = modelComponentTypeCornersStyle(modelId);
    const individualStyle = dataStyleState.getComponentStyle(modelId, corner_id);
    return merge({}, typeStyle, individualStyle);
  }

  function modelCornerColoring(modelId: DataId, corner_id?: string): StyleValues {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring is a StyleValues sub-object stored under a StyleValues index signature.
    return modelCornerStyle(modelId, corner_id).coloring as StyleValues;
  }

  async function mutateModelCornersColoring(
    modelId: DataId,
    corners_ids: string[],
    values: StyleValues,
  ): Promise<void> {
    await modelCommonStyle.mutateComponentStyles(modelId, corners_ids, {
      coloring: values,
    });
  }

  async function mutateModelCornersTypeColoring(
    modelId: DataId,
    values: StyleValues,
  ): Promise<void> {
    await modelCommonStyle.mutateModelComponentTypeStyle(modelId, "Corner", {
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

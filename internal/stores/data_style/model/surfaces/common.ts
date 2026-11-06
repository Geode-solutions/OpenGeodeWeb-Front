import type { DataId, ModelComponentId } from "@ogw_front/types/identifiers";
import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import merge from "lodash/merge";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";

interface UseModelSurfacesCommonStyleReturn {
  modelSurfacesStyle: (modelId: DataId) => StyleValues;
  modelSurfaceStyle: (modelId: DataId, surface_id?: ModelComponentId) => StyleValues;
  modelSurfaceColoring: (modelId: DataId, surface_id?: ModelComponentId) => StyleValues;
  mutateModelSurfacesColoring: (
    modelId: DataId,
    surfaces_ids: readonly ModelComponentId[],
    values: StyleValues,
  ) => Promise<void>;
  mutateModelSurfacesTypeColoring: (modelId: DataId, values: StyleValues) => Promise<void>;
}

export function useModelSurfacesCommonStyle(): UseModelSurfacesCommonStyleReturn {
  const dataStyleState = useDataStyleState();
  const modelCommonStyle = useModelCommonStyle();

  function modelSurfacesStyle(modelId: DataId): StyleValues {
    return dataStyleState.getStyle(modelId).surfaces ?? {};
  }

  function modelComponentTypeSurfacesStyle(modelId: DataId): StyleValues {
    const defaultStyle = modelSurfacesStyle(modelId);
    const typeStyle = dataStyleState.getModelComponentTypeStyle(modelId, "Surface");
    return merge({}, defaultStyle, typeStyle);
  }

  function modelSurfaceStyle(modelId: DataId, surface_id?: ModelComponentId): StyleValues {
    if (surface_id === undefined) {
      return modelComponentTypeSurfacesStyle(modelId);
    }
    const typeStyle = modelComponentTypeSurfacesStyle(modelId);
    const individualStyle = dataStyleState.getComponentStyle(modelId, surface_id);
    return merge({}, typeStyle, individualStyle);
  }

  function modelSurfaceColoring(modelId: DataId, surface_id?: ModelComponentId): StyleValues {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring shape is defined by the data style schema.
    return modelSurfaceStyle(modelId, surface_id).coloring as StyleValues;
  }

  async function mutateModelSurfacesColoring(
    modelId: DataId,
    surfaces_ids: readonly ModelComponentId[],
    values: StyleValues,
  ): Promise<void> {
    await modelCommonStyle.mutateComponentStyles(modelId, [...surfaces_ids], {
      coloring: values,
    });
  }

  async function mutateModelSurfacesTypeColoring(
    modelId: DataId,
    values: StyleValues,
  ): Promise<void> {
    await modelCommonStyle.mutateModelComponentTypeStyle(modelId, "Surface", {
      coloring: values,
    });
  }

  return {
    modelSurfacesStyle,
    modelSurfaceStyle,
    modelSurfaceColoring,
    mutateModelSurfacesColoring,
    mutateModelSurfacesTypeColoring,
  };
}

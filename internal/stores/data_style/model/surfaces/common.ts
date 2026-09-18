import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import merge from "lodash/merge";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";

interface UseModelSurfacesCommonStyleReturn {
  modelSurfacesStyle: (id: string) => StyleValues;
  modelSurfaceStyle: (id: string, surface_id?: string) => StyleValues;
  modelSurfaceColoring: (id: string, surface_id?: string) => StyleValues;
  mutateModelSurfacesColoring: (
    id: string,
    surfaces_ids: readonly string[],
    values: StyleValues,
  ) => Promise<void>;
  mutateModelSurfacesTypeColoring: (id: string, values: StyleValues) => Promise<void>;
}

export function useModelSurfacesCommonStyle(): UseModelSurfacesCommonStyleReturn {
  const dataStyleState = useDataStyleState();
  const modelCommonStyle = useModelCommonStyle();

  function modelSurfacesStyle(id: string): StyleValues {
    return dataStyleState.getStyle(id).surfaces ?? {};
  }

  function modelComponentTypeSurfacesStyle(id: string): StyleValues {
    const defaultStyle = modelSurfacesStyle(id);
    const typeStyle = dataStyleState.getModelComponentTypeStyle(id, "Surface");
    return merge({}, defaultStyle, typeStyle);
  }

  function modelSurfaceStyle(id: string, surface_id?: string): StyleValues {
    if (surface_id === undefined) {
      return modelComponentTypeSurfacesStyle(id);
    }
    const typeStyle = modelComponentTypeSurfacesStyle(id);
    const individualStyle = dataStyleState.getComponentStyle(id, surface_id);
    return merge({}, typeStyle, individualStyle);
  }

  function modelSurfaceColoring(id: string, surface_id?: string): StyleValues {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring shape is defined by the data style schema.
    return modelSurfaceStyle(id, surface_id).coloring as StyleValues;
  }

  async function mutateModelSurfacesColoring(
    id: string,
    surfaces_ids: readonly string[],
    values: StyleValues,
  ): Promise<void> {
    await modelCommonStyle.mutateComponentStyles(id, [...surfaces_ids], {
      coloring: values,
    });
  }

  async function mutateModelSurfacesTypeColoring(id: string, values: StyleValues): Promise<void> {
    await modelCommonStyle.mutateModelComponentTypeStyle(id, "Surface", {
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

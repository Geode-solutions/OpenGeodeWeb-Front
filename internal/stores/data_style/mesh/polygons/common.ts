import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";

export function useMeshPolygonsCommonStyle(): {
  meshPolygonsStyle: (id: string) => StyleValues;
  meshPolygonsColoring: (id: string) => StyleValues;
  mutateMeshPolygonsStyle: (id: string, values: StyleValues) => Promise<string>;
  mutateMeshPolygonsColoring: (id: string, values: StyleValues) => Promise<string>;
  mutateMeshPolygonsPolygonStyle: (id: string, values: StyleValues) => Promise<string>;
} {
  const dataStyleState = useDataStyleState();

  async function mutateMeshPolygonsStyle(id: string, values: StyleValues): Promise<string> {
    const result = await dataStyleState.mutateStyle(id, {
      polygons: values,
    });
    return result;
  }

  function meshPolygonsStyle(id: string): StyleValues {
    return dataStyleState.getStyle(id).polygons ?? {};
  }

  function meshPolygonsColoring(id: string): StyleValues {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring shape is defined by the data style schema.
    return meshPolygonsStyle(id).coloring as StyleValues;
  }

  async function mutateMeshPolygonsColoring(id: string, values: StyleValues): Promise<string> {
    const result = await mutateMeshPolygonsStyle(id, {
      coloring: values,
    });
    return result;
  }

  async function mutateMeshPolygonsPolygonStyle(id: string, values: StyleValues): Promise<string> {
    const result = await mutateMeshPolygonsColoring(id, {
      polygon: values,
    });
    return result;
  }

  return {
    meshPolygonsStyle,
    meshPolygonsColoring,
    mutateMeshPolygonsStyle,
    mutateMeshPolygonsColoring,
    mutateMeshPolygonsPolygonStyle,
  };
}

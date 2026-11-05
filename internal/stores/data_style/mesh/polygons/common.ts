import type { DataId } from "@ogw_front/types/identifiers";
import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";

export function useMeshPolygonsCommonStyle(): {
  meshPolygonsStyle: (meshId: DataId) => StyleValues;
  meshPolygonsColoring: (meshId: DataId) => StyleValues;
  mutateMeshPolygonsStyle: (meshId: DataId, values: StyleValues) => Promise<string>;
  mutateMeshPolygonsColoring: (meshId: DataId, values: StyleValues) => Promise<string>;
  mutateMeshPolygonsPolygonStyle: (meshId: DataId, values: StyleValues) => Promise<string>;
} {
  const dataStyleState = useDataStyleState();

  async function mutateMeshPolygonsStyle(meshId: DataId, values: StyleValues): Promise<string> {
    const result = await dataStyleState.mutateStyle(meshId, {
      polygons: values,
    });
    return result;
  }

  function meshPolygonsStyle(meshId: DataId): StyleValues {
    return dataStyleState.getStyle(meshId).polygons ?? {};
  }

  function meshPolygonsColoring(meshId: DataId): StyleValues {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring shape is defined by the data style schema.
    return meshPolygonsStyle(meshId).coloring as StyleValues;
  }

  async function mutateMeshPolygonsColoring(meshId: DataId, values: StyleValues): Promise<string> {
    const result = await mutateMeshPolygonsStyle(meshId, {
      coloring: values,
    });
    return result;
  }

  async function mutateMeshPolygonsPolygonStyle(
    meshId: DataId,
    values: StyleValues,
  ): Promise<string> {
    const result = await mutateMeshPolygonsColoring(meshId, {
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

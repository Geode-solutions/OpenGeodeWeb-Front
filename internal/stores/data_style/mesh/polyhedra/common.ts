import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";

export function useMeshPolyhedraCommonStyle(): {
  meshPolyhedraStyle: (id: string) => StyleValues;
  meshPolyhedraColoring: (id: string) => StyleValues;
  mutateMeshPolyhedraStyle: (id: string, values: StyleValues) => Promise<string>;
  mutateMeshPolyhedraColoring: (id: string, values: StyleValues) => Promise<string>;
} {
  const dataStyleState = useDataStyleState();

  async function mutateMeshPolyhedraStyle(id: string, values: StyleValues): Promise<string> {
    const result = await dataStyleState.mutateStyle(id, {
      polyhedra: values,
    });
    return result;
  }

  function meshPolyhedraStyle(id: string): StyleValues {
    return dataStyleState.getStyle(id).polyhedra as StyleValues;
  }

  function meshPolyhedraColoring(id: string): StyleValues {
    return meshPolyhedraStyle(id).coloring as StyleValues;
  }

  async function mutateMeshPolyhedraColoring(id: string, values: StyleValues): Promise<string> {
    const result = await mutateMeshPolyhedraStyle(id, {
      coloring: values,
    });
    return result;
  }

  return {
    meshPolyhedraStyle,
    meshPolyhedraColoring,
    mutateMeshPolyhedraStyle,
    mutateMeshPolyhedraColoring,
  };
}

import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";

export function useMeshEdgesCommonStyle(): {
  meshEdgesStyle: (id: string) => StyleValues;
  meshEdgesColoring: (id: string) => StyleValues;
  mutateMeshEdgesStyle: (id: string, values: StyleValues) => Promise<string>;
  mutateMeshEdgesColoring: (id: string, values: StyleValues) => Promise<string>;
} {
  const dataStyleState = useDataStyleState();

  async function mutateMeshEdgesStyle(id: string, values: StyleValues): Promise<string> {
    const result = await dataStyleState.mutateStyle(id, {
      edges: values,
    });
    return result;
  }

  function meshEdgesStyle(id: string): StyleValues {
    return dataStyleState.getStyle(id).edges ?? {};
  }

  function meshEdgesColoring(id: string): StyleValues {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring shape is defined by the data style schema.
    return meshEdgesStyle(id).coloring as StyleValues;
  }

  async function mutateMeshEdgesColoring(id: string, values: StyleValues): Promise<string> {
    const result = await mutateMeshEdgesStyle(id, {
      coloring: values,
    });
    return result;
  }

  return {
    meshEdgesStyle,
    meshEdgesColoring,
    mutateMeshEdgesStyle,
    mutateMeshEdgesColoring,
  };
}

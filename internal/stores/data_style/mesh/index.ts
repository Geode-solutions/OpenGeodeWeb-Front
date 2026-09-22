// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useViewerStore } from "@ogw_front/stores/viewer";

import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useMeshCellsStyle } from "./cells";
import { useMeshEdgesStyle } from "./edges";
import { useMeshPointsStyle } from "./points";
import { useMeshPolygonsStyle } from "./polygons";
import { useMeshPolyhedraStyle } from "./polyhedra";

// Local constants
const meshSchemas = viewer_schemas.opengeodeweb_viewer.mesh;

// oxlint-disable-next-line max-lines-per-function
export function useMeshStyle(): {
  meshVisibility: (id: string) => boolean | undefined;
  setMeshVisibility: (id: string, visibility: boolean | undefined) => Promise<unknown>;
  meshColor: (id: string) => unknown;
  setMeshColor: (id: string, color: unknown) => Promise<unknown>;
  applyMeshStyle: (id: string) => Promise<unknown[]>;
} & ReturnType<typeof useMeshPointsStyle> &
  ReturnType<typeof useMeshEdgesStyle> &
  ReturnType<typeof useMeshCellsStyle> &
  ReturnType<typeof useMeshPolygonsStyle> &
  ReturnType<typeof useMeshPolyhedraStyle> {
  const hybridViewerStore = useHybridViewerStore();
  const viewerStore = useViewerStore();
  const dataStyleState = useDataStyleState();
  const meshPointsStyle = useMeshPointsStyle();
  const meshEdgesStyle = useMeshEdgesStyle();
  const meshCellsStyle = useMeshCellsStyle();
  const meshPolygonsStyle = useMeshPolygonsStyle();
  const meshPolyhedraStyle = useMeshPolyhedraStyle();

  function meshVisibility(id: string): boolean | undefined {
    return dataStyleState.getStyle(id).visibility;
  }
  async function setMeshVisibility(id: string, visibility: boolean | undefined): Promise<unknown> {
    const schema = meshSchemas.visibility;
    const params = { id, visibility };
    const result = await viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: async () => {
          if (visibility !== undefined) {
            hybridViewerStore.setVisibility(id, visibility);
          }
          const mutatedId = await dataStyleState.mutateStyle(id, { visibility });
          return mutatedId;
        },
      },
    );
    return result;
  }

  function meshColor(id: string): unknown {
    return dataStyleState.getStyle(id).color;
  }

  async function setMeshColor(id: string, color: unknown): Promise<unknown> {
    const schema = meshSchemas.color;
    const params = { id, color };
    const result = await viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: async () => {
          const mutatedId = await dataStyleState.mutateStyle(id, { color });
          return mutatedId;
        },
      },
    );
    return result;
  }

  async function applyMeshStyle(id: string): Promise<unknown[]> {
    const style = dataStyleState.getStyle(id);
    const promise_array: unknown[] = [];
    for (const [key, value] of Object.entries(style)) {
      if (key === "visibility") {
        promise_array.push(setMeshVisibility(id, style.visibility));
      } else if (key === "color") {
        promise_array.push(setMeshColor(id, value));
      } else if (key === "points") {
        promise_array.push(meshPointsStyle.applyMeshPointsStyle(id));
      } else if (key === "edges") {
        promise_array.push(meshEdgesStyle.applyMeshEdgesStyle(id));
      } else if (key === "cells") {
        promise_array.push(meshCellsStyle.applyMeshCellsStyle(id));
      } else if (key === "polygons") {
        promise_array.push(meshPolygonsStyle.applyMeshPolygonsStyle(id));
      } else if (key === "polyhedra") {
        promise_array.push(meshPolyhedraStyle.applyMeshPolyhedraStyle(id));
      } else if (
        key === "corners" ||
        key === "lines" ||
        key === "surfaces" ||
        key === "blocks" ||
        key === "attributes" ||
        key === "id"
      ) {
        // These keys are either handled elsewhere or not applicable to mesh objects
        continue;
      } else {
        throw new Error(`Unknown mesh key: ${key}`);
      }
    }
    const results = await Promise.all(promise_array);
    return results;
  }

  return {
    meshVisibility,
    setMeshVisibility,
    meshColor,
    setMeshColor,
    applyMeshStyle,
    ...meshPointsStyle,
    ...meshEdgesStyle,
    ...meshCellsStyle,
    ...meshPolygonsStyle,
    ...meshPolyhedraStyle,
  };
}

import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";
// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useViewerStore } from "@ogw_front/stores/viewer";

import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useMeshCellsStyle } from "./cells";
import { useMeshEdgesStyle } from "./edges";
import { useMeshPointsStyle } from "./points";
import { useMeshPolygonsStyle } from "./polygons";
import { useMeshPolyhedraStyle } from "./polyhedra";
import { whenDefined } from "@ogw_internal/stores/data_style/when_defined";

// Local constants
const meshSchemas = viewer_schemas.opengeodeweb_viewer.mesh;

// oxlint-disable-next-line max-lines-per-function
export function useMeshStyle(): {
  meshVisibility: (id: string) => boolean | undefined;
  setMeshVisibility: (id: string, visibility: boolean) => Promise<unknown>;
  meshColor: (id: string) => RGBAColor | undefined;
  setMeshColor: (id: string, color: RGBAColor) => Promise<unknown>;
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
  async function setMeshVisibility(id: string, visibility: boolean): Promise<unknown> {
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

  function meshColor(id: string): RGBAColor | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- color shape is defined by the data style schema.
    return dataStyleState.getStyle(id).color as RGBAColor | undefined;
  }

  async function setMeshColor(id: string, color: RGBAColor): Promise<unknown> {
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

  const pointsCard = {
    key: "points",
    name: meshPointsStyle.meshPointsVertexAttributeName,
    active: meshPointsStyle.meshPointsActiveColoring,
    setActive: meshPointsStyle.setMeshPointsActiveColoring,
    setTimeStep: meshPointsStyle.setMeshPointsVertexAttributeTimeStep,
  };
  const edgesCard = {
    key: "edges",
    name: meshEdgesStyle.meshEdgesVertexAttributeName,
    active: meshEdgesStyle.meshEdgesActiveColoring,
    setActive: meshEdgesStyle.setMeshEdgesActiveColoring,
    setTimeStep: meshEdgesStyle.setMeshEdgesVertexAttributeTimeStep,
  };
  const cellsCard = {
    key: "cells",
    name: meshCellsStyle.meshCellsVertexAttributeName,
    active: meshCellsStyle.meshCellsActiveColoring,
    setActive: meshCellsStyle.setMeshCellsActiveColoring,
    setTimeStep: meshCellsStyle.setMeshCellsVertexAttributeTimeStep,
  };
  const polygonsCard = {
    key: "polygons",
    name: meshPolygonsStyle.meshPolygonsVertexAttributeName,
    active: meshPolygonsStyle.meshPolygonsActiveColoring,
    setActive: meshPolygonsStyle.setMeshPolygonsActiveColoring,
    setTimeStep: meshPolygonsStyle.setMeshPolygonsVertexAttributeTimeStep,
  };
  const polyhedraCard = {
    key: "polyhedra",
    name: meshPolyhedraStyle.meshPolyhedraVertexAttributeName,
    active: meshPolyhedraStyle.meshPolyhedraActiveColoring,
    setActive: meshPolyhedraStyle.setMeshPolyhedraActiveColoring,
    setTimeStep: meshPolyhedraStyle.setMeshPolyhedraVertexAttributeTimeStep,
  };
  const vertexCards = [pointsCard, edgesCard, cellsCard, polygonsCard, polyhedraCard];

  // The vertex series is shared by all the cards: re-render the other cards showing it
  function sharedVertexTimeStep(
    card: (typeof vertexCards)[number],
  ): (id: string, timeStep: number) => Promise<unknown> {
    return async (id, timeStep) => {
      const result = await card.setTimeStep(id, timeStep);
      const name = card.name(id);
      const style = dataStyleState.getStyle(id);
      const others = vertexCards.filter(
        (other) =>
          other !== card &&
          style[other.key] !== undefined &&
          other.active(id) === "vertex" &&
          other.name(id) === name,
      );
      if (name !== undefined) {
        await Promise.all(
          others.map(async (other) => {
            await other.setActive(id, "vertex");
          }),
        );
      }
      return result;
    };
  }

  async function applyMeshStyle(id: string): Promise<unknown[]> {
    const style = dataStyleState.getStyle(id);
    const promise_array: unknown[] = [];
    for (const key of Object.keys(style)) {
      if (key === "visibility") {
        promise_array.push(
          whenDefined(style.visibility, async (visibility) => {
            const applied = await setMeshVisibility(id, visibility);
            return applied;
          }),
        );
      } else if (key === "color") {
        promise_array.push(
          whenDefined(meshColor(id), async (color) => {
            const applied = await setMeshColor(id, color);
            return applied;
          }),
        );
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
    setMeshPointsVertexAttributeTimeStep: sharedVertexTimeStep(pointsCard),
    setMeshEdgesVertexAttributeTimeStep: sharedVertexTimeStep(edgesCard),
    setMeshCellsVertexAttributeTimeStep: sharedVertexTimeStep(cellsCard),
    setMeshPolygonsVertexAttributeTimeStep: sharedVertexTimeStep(polygonsCard),
    setMeshPolyhedraVertexAttributeTimeStep: sharedVertexTimeStep(polyhedraCard),
  };
}

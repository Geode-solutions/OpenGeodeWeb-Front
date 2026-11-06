import type { AttributeTimeStep } from "@ogw_front/types/attribute";
import type { MeshId } from "@ogw_front/types/identifiers";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";
import type { Visibility } from "@ogw_front/types/style";

// Local imports
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useMeshBaseStyle } from "./base_style";
import { useMeshCellsStyle } from "./cells";
import { useMeshEdgesStyle } from "./edges";
import { useMeshPointsStyle } from "./points";
import { useMeshPolygonsStyle } from "./polygons";
import { useMeshPolyhedraStyle } from "./polyhedra";
import { whenDefined } from "@ogw_internal/stores/data_style/when_defined";

// oxlint-disable-next-line max-lines-per-function
export function useMeshStyle(): {
  meshVisibility: (meshId: MeshId) => Visibility | undefined;
  setMeshVisibility: (meshId: MeshId, visibility: Visibility) => Promise<unknown>;
  meshColor: (meshId: MeshId) => RGBAColor | undefined;
  setMeshColor: (meshId: MeshId, color: RGBAColor) => Promise<unknown>;
  applyMeshStyle: (meshId: MeshId) => Promise<unknown[]>;
} & ReturnType<typeof useMeshPointsStyle> &
  ReturnType<typeof useMeshEdgesStyle> &
  ReturnType<typeof useMeshCellsStyle> &
  ReturnType<typeof useMeshPolygonsStyle> &
  ReturnType<typeof useMeshPolyhedraStyle> {
  const dataStyleState = useDataStyleState();
  const { meshVisibility, setMeshVisibility, meshColor, setMeshColor } = useMeshBaseStyle();
  const meshPointsStyle = useMeshPointsStyle();
  const meshEdgesStyle = useMeshEdgesStyle();
  const meshCellsStyle = useMeshCellsStyle();
  const meshPolygonsStyle = useMeshPolygonsStyle();
  const meshPolyhedraStyle = useMeshPolyhedraStyle();

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
  ): (meshId: MeshId, timeStep: AttributeTimeStep) => Promise<unknown> {
    return async (meshId, timeStep) => {
      const result = await card.setTimeStep(meshId, timeStep);
      const name = card.name(meshId);
      const style = dataStyleState.getStyle(meshId);
      const others = vertexCards.filter(
        (other) =>
          other !== card &&
          style[other.key] !== undefined &&
          other.active(meshId) === "vertex" &&
          other.name(meshId) === name,
      );
      if (name !== undefined) {
        await Promise.all(
          others.map(async (other) => {
            await other.setActive(meshId, "vertex");
          }),
        );
      }
      return result;
    };
  }

  async function applyMeshStyle(meshId: MeshId): Promise<unknown[]> {
    const style = dataStyleState.getStyle(meshId);
    const promise_array: unknown[] = [];
    for (const key of Object.keys(style)) {
      if (key === "visibility") {
        promise_array.push(
          whenDefined(style.visibility, async (visibility) => {
            const applied = await setMeshVisibility(meshId, visibility);
            return applied;
          }),
        );
      } else if (key === "color") {
        promise_array.push(
          whenDefined(meshColor(meshId), async (color) => {
            const applied = await setMeshColor(meshId, color);
            return applied;
          }),
        );
      } else if (key === "points") {
        promise_array.push(meshPointsStyle.applyMeshPointsStyle(meshId));
      } else if (key === "edges") {
        promise_array.push(meshEdgesStyle.applyMeshEdgesStyle(meshId));
      } else if (key === "cells") {
        promise_array.push(meshCellsStyle.applyMeshCellsStyle(meshId));
      } else if (key === "polygons") {
        promise_array.push(meshPolygonsStyle.applyMeshPolygonsStyle(meshId));
      } else if (key === "polyhedra") {
        promise_array.push(meshPolyhedraStyle.applyMeshPolyhedraStyle(meshId));
      } else if (
        key === "corners" ||
        key === "lines" ||
        key === "surfaces" ||
        key === "blocks" ||
        key === "attributes" ||
        key === "data_id"
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

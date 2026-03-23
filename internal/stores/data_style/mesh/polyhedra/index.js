// Third party imports

// Local imports
import { useMeshPolyhedraColorStyle } from "./color";
import { useMeshPolyhedraCommonStyle } from "./common";
import { useMeshPolyhedraPolyhedronAttributeStyle } from "./polyhedron";
import { useMeshPolyhedraVertexAttributeStyle } from "./vertex";
import { useMeshPolyhedraVisibilityStyle } from "./visibility";
import { useDataStyleStateStore } from "@ogw_internal/stores/data_style/state";

// Local constants

export function useMeshPolyhedraStyle() {
  const meshPolyhedraCommonStyle = useMeshPolyhedraCommonStyle();
  const meshPolyhedraVisibility = useMeshPolyhedraVisibilityStyle();
  const meshPolyhedraColorStyle = useMeshPolyhedraColorStyle();

  function meshPolyhedraColoring(id) {
    return meshPolyhedraCommonStyle.meshPolyhedraColoring(id);
  }
  const meshPolyhedraVertexAttributeStyle = useMeshPolyhedraVertexAttributeStyle();
  const meshPolyhedraPolyhedronAttributeStyle = useMeshPolyhedraPolyhedronAttributeStyle();

  function meshPolyhedraActiveColoring(id) {
    return meshPolyhedraColoring(id).active;
  }

  async function setMeshPolyhedraActiveColoring(id, type) {
    await meshPolyhedraCommonStyle.mutateMeshPolyhedraStyle(id, {
      coloring: { active: type },
    });
    console.log(setMeshPolyhedraActiveColoring.name, { id }, type);
    if (type === "color") {
      return meshPolyhedraColorStyle.setMeshPolyhedraColor(
        id,
        meshPolyhedraColorStyle.meshPolyhedraColor(id),
      );
    } else if (type === "vertex") {
      const name = meshPolyhedraVertexAttributeStyle.meshPolyhedraVertexAttributeName(id);
      if (name === undefined) {
        return Promise.resolve();
      }
      return meshPolyhedraVertexAttributeStyle.setMeshPolyhedraVertexAttributeName(id, name);
    } else if (type === "polyhedron") {
      const name = meshPolyhedraPolyhedronAttributeStyle.meshPolyhedraPolyhedronAttributeName(id);
      if (name === undefined) {
        return Promise.resolve();
      }
      return meshPolyhedraPolyhedronAttributeStyle.setMeshPolyhedraPolyhedronAttributeName(
        id,
        name,
      );
    } else {
      throw new Error(`Unknown mesh polyhedra coloring type: ${type}`);
    }
    if (type === "vertex") {
      const name = meshPolyhedraVertexAttributeStyle.meshPolyhedraVertexAttributeName(id);
      if (name === undefined) {
        return;
      }
      return meshPolyhedraVertexAttributeStyle.setMeshPolyhedraVertexAttributeName(id, name);
    }
    if (type === "polyhedron") {
      const name = meshPolyhedraPolyhedronAttributeStyle.meshPolyhedraPolyhedronAttributeName(id);
      if (name === undefined) {
        return;
      }
      await meshPolyhedraPolyhedronAttributeStyle.setMeshPolyhedraPolyhedronAttributeName(id, name);
      return;
    }
    throw new Error(`Unknown mesh polyhedra coloring type: ${type}`);
  }

  function applyMeshPolyhedraStyle(id) {
    return Promise.all([
      meshPolyhedraVisibility.setMeshPolyhedraVisibility(
        id,
        meshPolyhedraVisibility.meshPolyhedraVisibility(id),
      ),
      setMeshPolyhedraActiveColoring(id, meshPolyhedraActiveColoring(id)),
    ]);
  }

  return {
    ...meshPolyhedraCommonStyle,
    meshPolyhedraColoring,
    meshPolyhedraActiveColoring,
    setMeshPolyhedraActiveColoring,
    applyMeshPolyhedraStyle,
    ...meshPolyhedraVisibility,
    ...meshPolyhedraColorStyle,
    ...meshPolyhedraVertexAttributeStyle,
    ...meshPolyhedraPolyhedronAttributeStyle,
  };
}

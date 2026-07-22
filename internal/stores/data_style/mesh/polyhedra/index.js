// Third party imports

// Local imports
import {
  isMeshPolyhedraPolyhedronAttributeValid,
  useMeshPolyhedraPolyhedronAttributeStyle,
} from "./polyhedron";
import {
  isMeshPolyhedraVertexAttributeValid,
  useMeshPolyhedraVertexAttributeStyle,
} from "./vertex";
import { useMeshPolyhedraColorStyle } from "./color";
import { useMeshPolyhedraCommonStyle } from "./common";
import { useMeshPolyhedraVisibilityStyle } from "./visibility";

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
    if (type === "constant") {
      return meshPolyhedraColorStyle.setMeshPolyhedraColor(
        id,
        meshPolyhedraColorStyle.meshPolyhedraColor(id),
      );
    }
    if (type === "vertex") {
      const name = meshPolyhedraVertexAttributeStyle.meshPolyhedraVertexAttributeName(id);
      const item = meshPolyhedraVertexAttributeStyle.meshPolyhedraVertexAttributeItem(id);
      const [minimum, maximum] =
        meshPolyhedraVertexAttributeStyle.meshPolyhedraVertexAttributeRange(id);
      const colorMap = meshPolyhedraVertexAttributeStyle.meshPolyhedraVertexAttributeColorMap(id);
      const vertex_attribute = { name, item, minimum, maximum, colorMap };
      if (!isMeshPolyhedraVertexAttributeValid(vertex_attribute)) {
        return;
      }
      return meshPolyhedraVertexAttributeStyle.setMeshPolyhedraVertexAttribute(
        id,
        vertex_attribute,
      );
    }
    if (type === "polyhedron") {
      const name = meshPolyhedraPolyhedronAttributeStyle.meshPolyhedraPolyhedronAttributeName(id);
      const item = meshPolyhedraPolyhedronAttributeStyle.meshPolyhedraPolyhedronAttributeItem(id);
      const [minimum, maximum] =
        meshPolyhedraPolyhedronAttributeStyle.meshPolyhedraPolyhedronAttributeRange(id);
      const colorMap =
        meshPolyhedraPolyhedronAttributeStyle.meshPolyhedraPolyhedronAttributeColorMap(id);
      const polyhedron_attribute = { name, item, minimum, maximum, colorMap };
      if (!isMeshPolyhedraPolyhedronAttributeValid(polyhedron_attribute)) {
        return;
      }
      return meshPolyhedraPolyhedronAttributeStyle.setMeshPolyhedraPolyhedronAttribute(
        id,
        polyhedron_attribute,
      );
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

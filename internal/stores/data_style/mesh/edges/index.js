// Third party imports

// Local imports
import { isMeshEdgesEdgeAttributeValid, useMeshEdgesEdgeAttributeStyle } from "./edge";
import { isMeshEdgesVertexAttributeValid, useMeshEdgesVertexAttributeStyle } from "./vertex";
import { useMeshEdgesColorStyle } from "./color";
import { useMeshEdgesCommonStyle } from "./common";
import { useMeshEdgesVisibilityStyle } from "./visibility";
import { useMeshEdgesWidthStyle } from "./width";

// Local constants

export function useMeshEdgesStyle() {
  const meshEdgesVisibility = useMeshEdgesVisibilityStyle();
  const meshEdgesColorStyle = useMeshEdgesColorStyle();
  const meshEdgesWidthStyle = useMeshEdgesWidthStyle();
  const meshEdgesVertexAttributeStyle = useMeshEdgesVertexAttributeStyle();
  const meshEdgesEdgeAttributeStyle = useMeshEdgesEdgeAttributeStyle();
  const meshEdgesCommonStyle = useMeshEdgesCommonStyle();

  function meshEdgesColoring(id) {
    return meshEdgesCommonStyle.meshEdgesColoring(id);
  }

  function meshEdgesActiveColoring(id) {
    return meshEdgesColoring(id).active;
  }

  async function setMeshEdgesActiveColoring(id, type) {
    await meshEdgesCommonStyle.mutateMeshEdgesStyle(id, {
      coloring: { active: type },
    });
    if (type === "constant") {
      return meshEdgesColorStyle.setMeshEdgesColor(id, meshEdgesColorStyle.meshEdgesColor(id));
    }
    if (type === "vertex") {
      const name = meshEdgesVertexAttributeStyle.meshEdgesVertexAttributeName(id);
      const item = meshEdgesVertexAttributeStyle.meshEdgesVertexAttributeItem(id);
      const [minimum, maximum] = meshEdgesVertexAttributeStyle.meshEdgesVertexAttributeRange(id);
      const colorMap = meshEdgesVertexAttributeStyle.meshEdgesVertexAttributeColorMap(id);
      const vertex_attribute = { name, item, minimum, maximum, colorMap };
      if (!isMeshEdgesVertexAttributeValid(vertex_attribute)) {
        return;
      }
      return meshEdgesVertexAttributeStyle.setMeshEdgesVertexAttribute(id, vertex_attribute);
    }
    if (type === "edge") {
      const name = meshEdgesEdgeAttributeStyle.meshEdgesEdgeAttributeName(id);
      const item = meshEdgesEdgeAttributeStyle.meshEdgesEdgeAttributeItem(id);
      const [minimum, maximum] = meshEdgesEdgeAttributeStyle.meshEdgesEdgeAttributeRange(id);
      const colorMap = meshEdgesEdgeAttributeStyle.meshEdgesEdgeAttributeColorMap(id);
      const edge_attribute = { name, item, minimum, maximum, colorMap };
      if (!isMeshEdgesEdgeAttributeValid(edge_attribute)) {
        return;
      }
      return meshEdgesEdgeAttributeStyle.setMeshEdgesEdgeAttribute(id, edge_attribute);
    }
    throw new Error(`Unknown mesh edges coloring type: ${type}`);
  }

  function applyMeshEdgesStyle(id) {
    return Promise.all([
      meshEdgesVisibility.setMeshEdgesVisibility(id, meshEdgesVisibility.meshEdgesVisibility(id)),
      meshEdgesWidthStyle.setMeshEdgesWidth(id, meshEdgesWidthStyle.meshEdgesWidth(id)),
      setMeshEdgesActiveColoring(id, meshEdgesActiveColoring(id)),
    ]);
  }

  return {
    meshEdgesColoring,
    meshEdgesActiveColoring,
    setMeshEdgesActiveColoring,
    applyMeshEdgesStyle,
    ...meshEdgesCommonStyle,
    ...meshEdgesVisibility,
    ...meshEdgesColorStyle,
    ...meshEdgesWidthStyle,
    ...meshEdgesVertexAttributeStyle,
    ...meshEdgesEdgeAttributeStyle,
  };
}

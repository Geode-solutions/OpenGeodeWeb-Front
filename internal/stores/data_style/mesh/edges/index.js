// Third party imports

// Local imports
import { useMeshEdgesColorStyle } from "./color";
import { useMeshEdgesCommonStyle } from "./common";
import { useMeshEdgesEdgeAttributeStyle } from "./edge";
import { useMeshEdgesVertexAttributeStyle } from "./vertex";
import { useMeshEdgesVisibilityStyle } from "./visibility";
import { useMeshEdgesWidthStyle } from "./width";

// Local constants

export function useMeshEdgesStyle() {
  const meshEdgesVisibility = useMeshEdgesVisibilityStyle();
  const meshEdgesColorStyle = useMeshEdgesColorStyle();

  function meshEdgesColoring(id) {
    return meshEdgesCommonStyle.meshEdgesColoring(id);
  }
  const meshEdgesWidthStyle = useMeshEdgesWidthStyle();
  const meshEdgesVertexAttributeStyle = useMeshEdgesVertexAttributeStyle();
  const meshEdgesEdgeAttributeStyle = useMeshEdgesEdgeAttributeStyle();
  const meshEdgesCommonStyle = useMeshEdgesCommonStyle();

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
      const { colorMap } = meshEdgesVertexAttributeStyle.meshEdgesVertexAttributeStoredConfig(id, name);
      return Promise.all([
        meshEdgesVertexAttributeStyle.setMeshEdgesVertexAttributeName(id, name),
        meshEdgesVertexAttributeStyle.setMeshEdgesVertexAttributeColorMap(id, colorMap),
      ]);
    }
    if (type === "edge") {
      const name = meshEdgesEdgeAttributeStyle.meshEdgesEdgeAttributeName(id);
      const { colorMap } = meshEdgesEdgeAttributeStyle.meshEdgesEdgeAttributeStoredConfig(id, name);
      return Promise.all([
        meshEdgesEdgeAttributeStyle.setMeshEdgesEdgeAttributeName(id, name),
        meshEdgesEdgeAttributeStyle.setMeshEdgesEdgeAttributeColorMap(id, colorMap),
      ]);
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

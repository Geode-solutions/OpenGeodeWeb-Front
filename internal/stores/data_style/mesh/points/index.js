// Third party imports

// Local imports
import { isMeshPointsVertexAttributeValid, useMeshPointsVertexAttributeStyle } from "./vertex";
import { useMeshPointsColorStyle } from "./color";
import { useMeshPointsCommonStyle } from "./common";
import { useMeshPointsSizeStyle } from "./size";
import { useMeshPointsVisibilityStyle } from "./visibility";

// Local constants

function useMeshPointsColoringStyle() {
  const meshPointsCommonStyle = useMeshPointsCommonStyle();
  const meshPointsColorStyle = useMeshPointsColorStyle();
  const meshPointsVertexAttributeStyle = useMeshPointsVertexAttributeStyle();

  function meshPointsColoring(id) {
    return meshPointsCommonStyle.meshPointsColoring(id);
  }

  function meshPointsActiveColoring(id) {
    return meshPointsColoring(id).active;
  }

  async function setMeshPointsActiveColoring(id, type) {
    await meshPointsCommonStyle.mutateMeshPointsStyle(id, {
      coloring: { active: type },
    });
    if (type === "constant") {
      return meshPointsColorStyle.setMeshPointsColor(id, meshPointsColorStyle.meshPointsColor(id));
    }
    if (type === "vertex") {
      const name = meshPointsVertexAttributeStyle.meshPointsVertexAttributeName(id);
      const item = meshPointsVertexAttributeStyle.meshPointsVertexAttributeItem(id);
      const [minimum, maximum] = meshPointsVertexAttributeStyle.meshPointsVertexAttributeRange(id);
      const colorMap = meshPointsVertexAttributeStyle.meshPointsVertexAttributeColorMap(id);
      const vertex_attribute = { name, item, minimum, maximum, colorMap };
      if (!isMeshPointsVertexAttributeValid(vertex_attribute)) {
        return;
      }
      return meshPointsVertexAttributeStyle.setMeshPointsVertexAttribute(id, vertex_attribute);
    }
    throw new Error(`Unknown mesh points coloring type: ${type}`);
  }

  return {
    meshPointsColoring,
    meshPointsActiveColoring,
    setMeshPointsActiveColoring,
    ...meshPointsColorStyle,
    ...meshPointsVertexAttributeStyle,
  };
}

export function useMeshPointsStyle() {
  const meshPointsCommonStyle = useMeshPointsCommonStyle();
  const meshPointsVisibility = useMeshPointsVisibilityStyle();
  const meshPointsSizeStyle = useMeshPointsSizeStyle();
  const meshPointsColoringStyle = useMeshPointsColoringStyle();

  function applyMeshPointsStyle(id) {
    return Promise.all([
      meshPointsVisibility.setMeshPointsVisibility(
        id,
        meshPointsVisibility.meshPointsVisibility(id),
      ),
      meshPointsSizeStyle.setMeshPointsSize(id, meshPointsSizeStyle.meshPointsSize(id)),
      meshPointsColoringStyle.setMeshPointsActiveColoring(
        id,
        meshPointsColoringStyle.meshPointsActiveColoring(id),
      ),
    ]);
  }

  return {
    ...meshPointsCommonStyle,
    ...meshPointsColoringStyle,
    applyMeshPointsStyle,
    ...meshPointsVisibility,
    ...meshPointsSizeStyle,
  };
}

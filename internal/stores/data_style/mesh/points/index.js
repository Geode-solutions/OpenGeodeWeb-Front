// Third party imports

// Local imports
import { useMeshPointsColorStyle } from "./color";
import { useMeshPointsCommonStyle } from "./common";
import { useMeshPointsSizeStyle } from "./size";
import { useMeshPointsVertexAttributeStyle } from "./vertex";
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
    if (type === "color") {
      return meshPointsColorStyle.setMeshPointsColor(id, meshPointsColorStyle.meshPointsColor(id));
    } else if (type === "vertex") {
      const name = meshPointsVertexAttributeStyle.meshPointsVertexAttributeName(id);
      if (name === undefined) {
        return;
      }
      return meshPointsVertexAttributeStyle.setMeshPointsVertexAttributeName(id, name);
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

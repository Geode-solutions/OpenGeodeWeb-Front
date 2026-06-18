// Third party imports

// Local imports
import { useMeshPolygonsColorStyle } from "./color";
import { useMeshPolygonsCommonStyle } from "./common";
import { useMeshPolygonsPolygonAttributeStyle } from "./polygon";
import { useMeshPolygonsTexturesStyle } from "./textures";
import { useMeshPolygonsVertexAttributeStyle } from "./vertex";
import { useMeshPolygonsVisibilityStyle } from "./visibility";

// Local constants

function useMeshPolygonsColoringStyle() {
  const meshPolygonsCommonStyle = useMeshPolygonsCommonStyle();
  const meshPolygonsColorStyle = useMeshPolygonsColorStyle();
  const meshPolygonsTexturesStyle = useMeshPolygonsTexturesStyle();
  const meshPolygonsVertexAttributeStyle = useMeshPolygonsVertexAttributeStyle();
  const meshPolygonsPolygonAttributeStyle = useMeshPolygonsPolygonAttributeStyle();

  function meshPolygonsColoring(id) {
    return meshPolygonsCommonStyle.meshPolygonsColoring(id);
  }

  function meshPolygonsActiveColoring(id) {
    return meshPolygonsColoring(id).active;
  }

  async function setMeshPolygonsActiveColoring(id, type) {
    await meshPolygonsCommonStyle.mutateMeshPolygonsStyle(id, {
      coloring: { active: type },
    });
    if (type === "constant") {
      return meshPolygonsColorStyle.setMeshPolygonsColor(
        id,
        meshPolygonsColorStyle.meshPolygonsColor(id),
      );
    }
    if (type === "textures") {
      const textures = meshPolygonsTexturesStyle.meshPolygonsTextures(id);
      return meshPolygonsTexturesStyle.setMeshPolygonsTextures(id, textures);
    }
    if (type === "vertex") {
      const name = meshPolygonsVertexAttributeStyle.meshPolygonsVertexAttributeName(id);
      const { colorMap } = meshPolygonsVertexAttributeStyle.meshPolygonsVertexAttributeStoredConfig(id, name);
      return Promise.all([
        meshPolygonsVertexAttributeStyle.setMeshPolygonsVertexAttributeName(id, name),
        meshPolygonsVertexAttributeStyle.setMeshPolygonsVertexAttributeColorMap(id, colorMap),
      ]);
    }
    if (type === "polygon") {
      const name = meshPolygonsPolygonAttributeStyle.meshPolygonsPolygonAttributeName(id);
      const { colorMap } = meshPolygonsPolygonAttributeStyle.meshPolygonsPolygonAttributeStoredConfig(id, name);
      return Promise.all([
        meshPolygonsPolygonAttributeStyle.setMeshPolygonsPolygonAttributeName(id, name),
        meshPolygonsPolygonAttributeStyle.setMeshPolygonsPolygonAttributeColorMap(id, colorMap),
      ]);
    }
    throw new Error(`Unknown mesh polygons coloring type: ${type}`);
  }

  return {
    meshPolygonsColoring,
    meshPolygonsActiveColoring,
    setMeshPolygonsActiveColoring,
    ...meshPolygonsColorStyle,
    ...meshPolygonsTexturesStyle,
    ...meshPolygonsVertexAttributeStyle,
    ...meshPolygonsPolygonAttributeStyle,
  };
}

export function useMeshPolygonsStyle() {
  const meshPolygonsCommonStyle = useMeshPolygonsCommonStyle();
  const meshPolygonsVisibility = useMeshPolygonsVisibilityStyle();
  const coloringStyle = useMeshPolygonsColoringStyle();

  function applyMeshPolygonsStyle(id) {
    return Promise.all([
      meshPolygonsVisibility.setMeshPolygonsVisibility(
        id,
        meshPolygonsVisibility.meshPolygonsVisibility(id),
      ),
      coloringStyle.setMeshPolygonsActiveColoring(id, coloringStyle.meshPolygonsActiveColoring(id)),
    ]);
  }

  return {
    ...meshPolygonsCommonStyle,
    ...coloringStyle,
    applyMeshPolygonsStyle,
    ...meshPolygonsVisibility,
  };
}

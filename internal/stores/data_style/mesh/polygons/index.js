// Third party imports

// Local imports
import {
  isMeshPolygonsPolygonAttributeValid,
  useMeshPolygonsPolygonAttributeStyle,
} from "./polygon";
import { isMeshPolygonsVertexAttributeValid, useMeshPolygonsVertexAttributeStyle } from "./vertex";
import { useMeshPolygonsColorStyle } from "./color";
import { useMeshPolygonsCommonStyle } from "./common";
import { useMeshPolygonsTexturesStyle } from "./textures";
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
      const item = meshPolygonsVertexAttributeStyle.meshPolygonsVertexAttributeItem(id);
      const [minimum, maximum] =
        meshPolygonsVertexAttributeStyle.meshPolygonsVertexAttributeRange(id);
      const colorMap = meshPolygonsVertexAttributeStyle.meshPolygonsVertexAttributeColorMap(id);
      const vertex_attribute = { name, item, minimum, maximum, colorMap };
      if (!isMeshPolygonsVertexAttributeValid(vertex_attribute)) {
        return;
      }
      return meshPolygonsVertexAttributeStyle.setMeshPolygonsVertexAttribute(id, vertex_attribute);
    }
    if (type === "polygon") {
      const name = meshPolygonsPolygonAttributeStyle.meshPolygonsPolygonAttributeName(id);
      const item = meshPolygonsPolygonAttributeStyle.meshPolygonsPolygonAttributeItem(id);
      const [minimum, maximum] =
        meshPolygonsPolygonAttributeStyle.meshPolygonsPolygonAttributeRange(id);
      const colorMap = meshPolygonsPolygonAttributeStyle.meshPolygonsPolygonAttributeColorMap(id);
      const polygon_attribute = { name, item, minimum, maximum, colorMap };
      if (!isMeshPolygonsPolygonAttributeValid(polygon_attribute)) {
        return;
      }
      return meshPolygonsPolygonAttributeStyle.setMeshPolygonsPolygonAttribute(
        id,
        polygon_attribute,
      );
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

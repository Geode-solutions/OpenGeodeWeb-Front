// Third party imports

// Local imports
import { useMeshPolygonsColorStyle } from "./color"
import { useMeshPolygonsCommonStyle } from "./common"
import { useMeshPolygonsPolygonAttributeStyle } from "./polygon"
import { useMeshPolygonsTexturesStyle } from "./textures"
import { useMeshPolygonsVertexAttributeStyle } from "./vertex"
import { useMeshPolygonsVisibilityStyle } from "./visibility"
import { useDataStyleStateStore } from "@ogw_internal/stores/data_style/state"

// Local constants

export function useMeshPolygonsStyle() {
  const meshPolygonsCommonStyle = useMeshPolygonsCommonStyle()
  const meshPolygonsVisibility = useMeshPolygonsVisibilityStyle()
  const meshPolygonsColorStyle = useMeshPolygonsColorStyle()
  const meshPolygonsTexturesStyle = useMeshPolygonsTexturesStyle()

  function meshPolygonsColoring(id) {
    return meshPolygonsCommonStyle.meshPolygonsColoring(id)
  }
  const meshPolygonsVertexAttributeStyle = useMeshPolygonsVertexAttributeStyle()
  const meshPolygonsPolygonAttributeStyle =
    useMeshPolygonsPolygonAttributeStyle()

  function meshPolygonsActiveColoring(id) {
    return meshPolygonsColoring(id).active
  }

  async function setMeshPolygonsActiveColoring(id, type) {
    await meshPolygonsCommonStyle.mutateMeshPolygonsStyle(id, {
      coloring: { active: type },
    })
    console.log(setMeshPolygonsActiveColoring.name, { id }, type)
    if (type === "color") {
      return meshPolygonsColorStyle.setMeshPolygonsColor(
        id,
        meshPolygonsColorStyle.meshPolygonsColor(id),
      )
    } else if (type === "textures") {
      const textures = meshPolygonsTexturesStyle.meshPolygonsTextures(id)
      if (textures === undefined) {
        return Promise.resolve()
      }
      return meshPolygonsTexturesStyle.setMeshPolygonsTextures(id, textures)
    } else if (type === "vertex") {
      const name =
        meshPolygonsVertexAttributeStyle.meshPolygonsVertexAttributeName(id)
      if (name === undefined) {
        return Promise.resolve()
      }
      return meshPolygonsVertexAttributeStyle.setMeshPolygonsVertexAttributeName(
        id,
        name,
      )
    } else if (type === "polygon") {
      const name =
        meshPolygonsPolygonAttributeStyle.meshPolygonsPolygonAttributeName(id)
      if (name === undefined) {
        return Promise.resolve()
      }
      return meshPolygonsPolygonAttributeStyle.setMeshPolygonsPolygonAttributeName(
        id,
        name,
      )
    } else {
      throw new Error(`Unknown mesh polygons coloring type: ${type}`)
    }
    if (type === "textures") {
      const textures = meshPolygonsTexturesStyle.meshPolygonsTextures(id);
      if (textures === undefined) {
        return;
      }
      return meshPolygonsTexturesStyle.setMeshPolygonsTextures(id, textures);
    }
    if (type === "vertex") {
      const name = meshPolygonsVertexAttributeStyle.meshPolygonsVertexAttributeName(id);
      if (name === undefined) {
        return;
      }
      return meshPolygonsVertexAttributeStyle.setMeshPolygonsVertexAttributeName(id, name);
    }
    if (type === "polygon") {
      const name = meshPolygonsPolygonAttributeStyle.meshPolygonsPolygonAttributeName(id);
      if (name === undefined) {
        return;
      }
      await meshPolygonsPolygonAttributeStyle.setMeshPolygonsPolygonAttributeName(id, name);
      return;
    }
    throw new Error(`Unknown mesh polygons coloring type: ${type}`);
  }

  function applyMeshPolygonsStyle(id) {
    return Promise.all([
      meshPolygonsVisibility.setMeshPolygonsVisibility(
        id,
        meshPolygonsVisibility.meshPolygonsVisibility(id),
      ),
      setMeshPolygonsActiveColoring(id, meshPolygonsActiveColoring(id)),
    ])
  }

  return {
    ...meshPolygonsCommonStyle,
    meshPolygonsColoring,
    meshPolygonsActiveColoring,
    setMeshPolygonsActiveColoring,
    applyMeshPolygonsStyle,
    ...meshPolygonsVisibility,
    ...meshPolygonsColorStyle,
    ...meshPolygonsTexturesStyle,
    ...meshPolygonsVertexAttributeStyle,
    ...meshPolygonsPolygonAttributeStyle,
  };
}

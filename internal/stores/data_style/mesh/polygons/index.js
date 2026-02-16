// Third party imports

// Local imports
import { useMeshPolygonsColorStyle } from "./color"
import { useMeshPolygonsCommonStyle } from "./common"
import { useMeshPolygonsPolygonAttributeStyle } from "./polygon"
import { useMeshPolygonsTexturesStyle } from "./textures"
import { useMeshPolygonsVertexAttributeStyle } from "./vertex"
import { useMeshPolygonsVisibilityStyle } from "./visibility"

// Local constants

export function useMeshPolygonsStyle() {
  const meshPolygonsCommonStyle = useMeshPolygonsCommonStyle()
  const meshPolygonsVisibility = useMeshPolygonsVisibilityStyle()
  const meshPolygonsColorStyle = useMeshPolygonsColorStyle()
  const meshPolygonsTexturesStyle = useMeshPolygonsTexturesStyle()
  const meshPolygonsVertexAttributeStyle = useMeshPolygonsVertexAttributeStyle()
  const meshPolygonsPolygonAttributeStyle =
    useMeshPolygonsPolygonAttributeStyle()

  async function setMeshPolygonsActiveColoring(id, type) {
    const coloring = meshPolygonsCommonStyle.meshPolygonsColoring(id)
    coloring.active = type
    console.log(
      setMeshPolygonsActiveColoring.name,
      { id },
      meshPolygonsCommonStyle.meshPolygonsActiveColoring(id),
    )
    if (type === "color") {
      return meshPolygonsColorStyle.setMeshPolygonsColor(
        id,
        meshPolygonsColorStyle.meshPolygonsColor(id),
      )
    } else if (type === "textures") {
      const textures = meshPolygonsTexturesStyle.meshPolygonsTextures(id)
      if (textures === null) {
        return Promise.resolve()
      }
      return meshPolygonsTexturesStyle.setMeshPolygonsTextures(id, textures)
    } else if (type === "vertex") {
      const name =
        meshPolygonsVertexAttributeStyle.meshPolygonsVertexAttributeName(id)
      if (name === null) {
        return Promise.resolve()
      }
      return meshPolygonsVertexAttributeStyle.setMeshPolygonsVertexAttributeName(
        id,
        name,
      )
    } else if (type === "polygon") {
      const name =
        meshPolygonsPolygonAttributeStyle.meshPolygonsPolygonAttributeName(id)
      if (name === null) {
        return Promise.resolve()
      }
      await meshPolygonsPolygonAttributeStyle.setMeshPolygonsPolygonAttributeName(
        id,
        name,
      )
    } else {
      throw new Error(`Unknown mesh polygons coloring type: ${type}`)
    }
  }

  function applyMeshPolygonsStyle(id) {
    return Promise.all([
      meshPolygonsVisibility.setMeshPolygonsVisibility(
        id,
        meshPolygonsVisibility.meshPolygonsVisibility(id),
      ),
      setMeshPolygonsActiveColoring(
        id,
        meshPolygonsCommonStyle.meshPolygonsActiveColoring(id),
      ),
    ])
  }

  return {
    setMeshPolygonsActiveColoring,
    applyMeshPolygonsStyle,
    ...meshPolygonsCommonStyle,
    ...meshPolygonsVisibility,
    ...meshPolygonsColorStyle,
    ...meshPolygonsTexturesStyle,
    ...meshPolygonsVertexAttributeStyle,
    ...meshPolygonsPolygonAttributeStyle,
  }
}

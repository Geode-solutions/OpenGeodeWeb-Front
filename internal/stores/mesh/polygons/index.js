// Third party imports

// Local imports
import { useMeshPolygonsSharedStore } from "./shared"
import { useMeshPolygonsVisibilityStyle } from "./visibility"
import { useMeshPolygonsColorStyle } from "./color"
import { useMeshPolygonsTexturesStyle } from "./textures"
import { useMeshPolygonsVertexAttributeStyle } from "./vertex"
import { useMeshPolygonsPolygonAttributeStyle } from "./polygon"

// Local constants

export function useMeshPolygonsStyle() {
  const meshPolygonsSharedStore = useMeshPolygonsSharedStore()
  const meshPolygonsVisibility = useMeshPolygonsVisibilityStyle()
  const meshPolygonsColorStyle = useMeshPolygonsColorStyle()
  const meshPolygonsTexturesStore = useMeshPolygonsTexturesStyle()
  const meshPolygonsVertexAttributeStyleStore =
    useMeshPolygonsVertexAttributeStyle()
  const meshPolygonsPolygonAttributeStyleStore =
    useMeshPolygonsPolygonAttributeStyle()

  async function setMeshPolygonsActiveColoring(id, type) {
    const coloring = meshPolygonsSharedStore.meshPolygonsColoring(id)
    coloring.active = type
    console.log(
      setMeshPolygonsActiveColoring.name,
      { id },
      meshPolygonsSharedStore.meshPolygonsActiveColoring(id),
    )
    if (type === "color") {
      return meshPolygonsColorStyle.setMeshPolygonsColor(
        id,
        meshPolygonsColorStyle.meshPolygonsColor(id),
      )
    } else if (type === "textures") {
      const textures = meshPolygonsTexturesStore.meshPolygonsTextures(id)
      if (textures === null) {
        return Promise.resolve()
      }
      return meshPolygonsTexturesStore.setMeshPolygonsTextures(id, textures)
    } else if (type === "vertex") {
      const name =
        meshPolygonsVertexAttributeStyleStore.meshPolygonsVertexAttributeName(
          id,
        )
      if (name === undefined) {
        return Promise.resolve()
      }
      return meshPolygonsVertexAttributeStyleStore.setMeshPolygonsVertexAttributeName(
        id,
        name,
      )
    } else if (type === "polygon") {
      const name =
        meshPolygonsPolygonAttributeStyleStore.meshPolygonsPolygonAttributeName(
          id,
        )
      if (name === undefined) {
        return Promise.resolve()
      }
      await meshPolygonsPolygonAttributeStyleStore.setMeshPolygonsPolygonAttributeName(
        id,
        name,
      )
    } else {
      throw new Error("Unknown mesh polygons coloring type: " + type)
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
        meshPolygonsSharedStore.meshPolygonsActiveColoring(id),
      ),
    ])
  }

  return {
    ...meshPolygonsSharedStore,
    setMeshPolygonsActiveColoring,
    applyMeshPolygonsStyle,
    ...meshPolygonsVisibility,
    ...meshPolygonsColorStyle,
    ...meshPolygonsTexturesStore,
    ...meshPolygonsVertexAttributeStyleStore,
    ...meshPolygonsPolygonAttributeStyleStore,
  }
}

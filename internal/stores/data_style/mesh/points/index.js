// Third party imports

// Local imports
import { useMeshPointsColorStyle } from "./color"
import { useMeshPointsCommonStyle } from "./common"
import { useMeshPointsSizeStyle } from "./size"
import { useMeshPointsVertexAttributeStyle } from "./vertex"
import { useMeshPointsVisibilityStyle } from "./visibility"

// Local constants

export function useMeshPointsStyle() {
  const meshPointsCommonStyle = useMeshPointsCommonStyle()
  const meshPointsVisibility = useMeshPointsVisibilityStyle()
  const meshPointsColorStyle = useMeshPointsColorStyle()
  const meshPointsSizeStyle = useMeshPointsSizeStyle()
  const meshPointsVertexAttributeStyle = useMeshPointsVertexAttributeStyle()

  async function setMeshPointsActiveColoring(id, type) {
    const coloring = meshPointsCommonStyle.meshPointsColoring(id)
    coloring.active = type
    console.log(
      setMeshPointsActiveColoring.name,
      { id },
      meshPointsCommonStyle.meshPointsActiveColoring(id),
    )
    if (type === "color") {
      return meshPointsColorStyle.setMeshPointsColor(
        id,
        meshPointsColorStyle.meshPointsColor(id),
      )
    }
    if (type === "textures") {
      const textures = meshPointsTexturesStore.meshPointsTextures(id)
      if (textures === undefined) {
        return
      }
      return meshPointsTexturesStore.setMeshPointsTextures(id, textures)
    }
    if (type === "vertex") {
      const name =
        meshPointsVertexAttributeStyle.meshPointsVertexAttributeName(id)
      if (name === undefined) {
        return
      }
      return meshPointsVertexAttributeStyle.setMeshPointsVertexAttributeName(
        id,
        name,
      )
    }
    if (type === "polygon") {
      const name =
        meshPointsPolygonAttributeStyleStore.meshPointsPolygonAttributeName(id)
      if (name === undefined) {
        return
      }
      await meshPointsPolygonAttributeStyleStore.setMeshPointsPolygonAttributeName(
        id,
        name,
      )
      return
    }
    throw new Error(`Unknown mesh points coloring type: ${type}`)
  }

  function applyMeshPointsStyle(id) {
    return Promise.all([
      meshPointsVisibility.setMeshPointsVisibility(
        id,
        meshPointsVisibility.meshPointsVisibility(id),
      ),
      meshPointsSizeStyle.setMeshPointsSize(
        id,
        meshPointsSizeStyle.meshPointsSize(id),
      ),
      setMeshPointsActiveColoring(
        id,
        meshPointsCommonStyle.meshPointsActiveColoring(id),
      ),
    ])
  }

  return {
    setMeshPointsActiveColoring,
    applyMeshPointsStyle,
    ...meshPointsCommonStyle,
    ...meshPointsVisibility,
    ...meshPointsColorStyle,
    ...meshPointsSizeStyle,
    ...meshPointsVertexAttributeStyle,
  }
}

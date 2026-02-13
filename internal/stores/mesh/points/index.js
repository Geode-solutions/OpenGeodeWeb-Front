// Third party imports

// Local imports
import { useMeshPointsCommonStyle } from "./common"
import { useMeshPointsVisibilityStyle } from "./visibility"
import { useMeshPointsColorStyle } from "./color"
import { useMeshPointsSizeStyle } from "./size"
import { useMeshPointsVertexAttributeStyle } from "./vertex"

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
    } else if (type === "textures") {
      const textures = meshPointsTexturesStore.meshPointsTextures(id)
      if (textures === null) {
        return Promise.resolve()
      }
      return meshPointsTexturesStore.setMeshPointsTextures(id, textures)
    } else if (type === "vertex") {
      const name =
        meshPointsVertexAttributeStyle.meshPointsVertexAttributeName(id)
      if (name === null) {
        return Promise.resolve()
      }
      return meshPointsVertexAttributeStyle.setMeshPointsVertexAttributeName(
        id,
        name,
      )
    } else if (type === "polygon") {
      const name =
        meshPointsPolygonAttributeStyleStore.meshPointsPolygonAttributeName(id)
      if (name === null) {
        return Promise.resolve()
      }
      await meshPointsPolygonAttributeStyleStore.setMeshPointsPolygonAttributeName(
        id,
        name,
      )
    } else {
      throw new Error("Unknown mesh points coloring type: " + type)
    }
  }

  function applyMeshPointsStyle(id) {
    return Promise.all([
      meshPointsVisibility.setMeshPointsVisibility(
        id,
        meshPointsVisibility.meshPointsVisibility(id),
      ),
      setMeshPointsActiveColoring(
        id,
        meshPointsCommonStyle.meshPointsActiveColoring(id),
      ),
      meshPointsSizeStyle.setMeshPointsSize(
        id,
        meshPointsSizeStyle.meshPointsSize(id),
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

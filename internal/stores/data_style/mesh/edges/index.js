// Third party imports

// Local imports
import { useMeshEdgesColorStyle } from "./color"
import { useMeshEdgesCommonStyle } from "./common"
import { useMeshEdgesEdgeAttributeStyle } from "./edge"
import { useMeshEdgesVertexAttributeStyle } from "./vertex"
import { useMeshEdgesVisibilityStyle } from "./visibility"
import { useMeshEdgesWidthStyle } from "./width"

// Local constants

export function useMeshEdgesStyle() {
  const meshEdgesCommonStyle = useMeshEdgesCommonStyle()
  const meshEdgesVisibility = useMeshEdgesVisibilityStyle()
  const meshEdgesColorStyle = useMeshEdgesColorStyle()
  const meshEdgesWidthStyle = useMeshEdgesWidthStyle()
  const meshEdgesVertexAttributeStyle = useMeshEdgesVertexAttributeStyle()
  const meshEdgesEdgeAttributeStyle = useMeshEdgesEdgeAttributeStyle()

  async function setMeshEdgesActiveColoring(id, type) {
    const coloring = meshEdgesCommonStyle.meshEdgesColoring(id)
    coloring.active = type
    console.log(
      setMeshEdgesActiveColoring.name,
      { id },
      meshEdgesCommonStyle.meshEdgesActiveColoring(id),
    )
    if (type === "color") {
      return meshEdgesColorStyle.setMeshEdgesColor(
        id,
        meshEdgesColorStyle.meshEdgesColor(id),
      )
    } else if (type === "textures") {
      const textures = meshEdgesTexturesStore.meshEdgesTextures(id)
      if (textures === null) {
        return Promise.resolve()
      }
      return meshEdgesTexturesStore.setMeshEdgesTextures(id, textures)
    } else if (type === "vertex") {
      const name =
        meshEdgesVertexAttributeStyle.meshEdgesVertexAttributeName(id)
      if (name === null) {
        return Promise.resolve()
      }
      return meshEdgesVertexAttributeStyle.setMeshEdgesVertexAttributeName(
        id,
        name,
      )
    } else if (type === "edge") {
      const name = meshEdgesEdgeAttributeStyle.meshEdgesEdgeAttributeName(id)
      if (name === null) {
        return Promise.resolve()
      }
      return meshEdgesEdgeAttributeStyle.setMeshEdgesEdgeAttributeName(id, name)
    } else {
      throw new Error(`Unknown mesh edges coloring type: ${type}`)
    }
  }

  function applyMeshEdgesStyle(id) {
    return Promise.all([
      meshEdgesVisibility.setMeshEdgesVisibility(
        id,
        meshEdgesVisibility.meshEdgesVisibility(id),
      ),
      meshEdgesWidthStyle.setMeshEdgesWidth(
        id,
        meshEdgesWidthStyle.meshEdgesWidth(id),
      ),
      setMeshEdgesActiveColoring(
        id,
        meshEdgesCommonStyle.meshEdgesActiveColoring(id),
      ),
    ])
  }

  return {
    setMeshEdgesActiveColoring,
    applyMeshEdgesStyle,
    ...meshEdgesCommonStyle,
    ...meshEdgesVisibility,
    ...meshEdgesColorStyle,
    ...meshEdgesWidthStyle,
    ...meshEdgesVertexAttributeStyle,
    ...meshEdgesEdgeAttributeStyle,
  }
}

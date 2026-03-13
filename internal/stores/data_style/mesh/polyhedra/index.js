// Third party imports

// Local imports
import { useMeshPolyhedraColorStyle } from "./color"
import { useMeshPolyhedraCommonStyle } from "./common"
import { useMeshPolyhedraPolyhedronAttributeStyle } from "./polyhedron"
import { useMeshPolyhedraVertexAttributeStyle } from "./vertex"
import { useMeshPolyhedraVisibilityStyle } from "./visibility"

// Local constants

export function useMeshPolyhedraStyle() {
  const meshPolyhedraCommonStyle = useMeshPolyhedraCommonStyle()
  const meshPolyhedraVisibility = useMeshPolyhedraVisibilityStyle()
  const meshPolyhedraColorStyle = useMeshPolyhedraColorStyle()
  const meshPolyhedraVertexAttributeStyle =
    useMeshPolyhedraVertexAttributeStyle()
  const meshPolyhedraPolyhedronAttributeStyle =
    useMeshPolyhedraPolyhedronAttributeStyle()

  async function setMeshPolyhedraActiveColoring(id, type) {
    const coloring = meshPolyhedraCommonStyle.meshPolyhedraColoring(id)
    coloring.active = type
    console.log(
      setMeshPolyhedraActiveColoring.name,
      { id },
      meshPolyhedraCommonStyle.meshPolyhedraActiveColoring(id),
    )
    if (type === "color") {
      return meshPolyhedraColorStyle.setMeshPolyhedraColor(
        id,
        meshPolyhedraColorStyle.meshPolyhedraColor(id),
      )
    } else if (type === "vertex") {
      const name =
        meshPolyhedraVertexAttributeStyle.meshPolyhedraVertexAttributeName(id)
      if (name === undefined) {
        return Promise.resolve()
      }
      return meshPolyhedraVertexAttributeStyle.setMeshPolyhedraVertexAttributeName(
        id,
        name,
      )
    } else if (type === "polyhedron") {
      const name =
        meshPolyhedraPolyhedronAttributeStyle.meshPolyhedraPolyhedronAttributeName(
          id,
        )
      if (name === undefined) {
        return Promise.resolve()
      }
      await meshPolyhedraPolyhedronAttributeStyle.setMeshPolyhedraPolyhedronAttributeName(
        id,
        name,
      )
    } else {
      throw new Error(`Unknown mesh polyhedra coloring type: ${type}`)
    }
  }

  function applyMeshPolyhedraStyle(id) {
    return Promise.all([
      meshPolyhedraVisibility.setMeshPolyhedraVisibility(
        id,
        meshPolyhedraVisibility.meshPolyhedraVisibility(id),
      ),
      setMeshPolyhedraActiveColoring(
        id,
        meshPolyhedraCommonStyle.meshPolyhedraActiveColoring(id),
      ),
    ])
  }

  return {
    setMeshPolyhedraActiveColoring,
    applyMeshPolyhedraStyle,
    ...meshPolyhedraCommonStyle,
    ...meshPolyhedraVisibility,
    ...meshPolyhedraColorStyle,
    ...meshPolyhedraVertexAttributeStyle,
    ...meshPolyhedraPolyhedronAttributeStyle,
  }
}

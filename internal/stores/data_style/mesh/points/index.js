// Third party imports

// Local imports
import { useMeshPointsColorStyle } from "./color"
import { useMeshPointsCommonStyle } from "./common"
import { useMeshPointsSizeStyle } from "./size"
import { useMeshPointsVertexAttributeStyle } from "./vertex"
import { useMeshPointsVisibilityStyle } from "./visibility"
import { useDataStyleStateStore } from "../../state"

// Local constants

export function useMeshPointsStyle() {
  const meshPointsCommonStyle = useMeshPointsCommonStyle()
  const meshPointsVisibility = useMeshPointsVisibilityStyle()
  const meshPointsColorStyle = useMeshPointsColorStyle()
  const meshPointsSizeStyle = useMeshPointsSizeStyle()
  const meshPointsVertexAttributeStyle = useMeshPointsVertexAttributeStyle()

  async function setMeshPointsActiveColoring(id, type) {
    const dataStyleStateStore = useDataStyleStateStore()
    await dataStyleStateStore.mutateStyle(id, (style) => {
      style.points.coloring.active = type
    })
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
    } else if (type === "vertex") {
      const name =
        meshPointsVertexAttributeStyle.meshPointsVertexAttributeName(id)
      if (name === undefined) {
        return Promise.resolve()
      }
      return meshPointsVertexAttributeStyle.setMeshPointsVertexAttributeName(
        id,
        name,
      )
    } else {
      throw new Error(`Unknown mesh points coloring type: ${type}`)
    }
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

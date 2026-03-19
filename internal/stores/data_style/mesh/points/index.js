// Third party imports

// Local imports
import { useMeshPointsColorStyle } from "./color"
import { useMeshPointsCommonStyle } from "./common"
import { useMeshPointsSizeStyle } from "./size"
import { useMeshPointsVertexAttributeStyle } from "./vertex"
import { useMeshPointsVisibilityStyle } from "./visibility"
import { useDataStyleStateStore } from "@ogw_internal/stores/data_style/state"

// Local constants

export function useMeshPointsStyle() {
  const meshPointsCommonStyle = useMeshPointsCommonStyle()
  const meshPointsVisibility = useMeshPointsVisibilityStyle()
  const meshPointsColorStyle = useMeshPointsColorStyle()
  const meshPointsSizeStyle = useMeshPointsSizeStyle()
  const meshPointsVertexAttributeStyle = useMeshPointsVertexAttributeStyle()
 
  function meshPointsColoring(id) {
    return meshPointsCommonStyle.meshPointsColoring(id)
  }


  function meshPointsActiveColoring(id) {
    return meshPointsColoring(id).active
  }

  async function setMeshPointsActiveColoring(id, type) {
    await meshPointsCommonStyle.mutateMeshPointsStyle(id, {
      coloring: { active: type },
    })
    console.log(setMeshPointsActiveColoring.name, { id }, type)
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
      setMeshPointsActiveColoring(id, meshPointsActiveColoring(id)),
    ])
  }

  return {
    ...meshPointsCommonStyle,
    meshPointsColoring,
    meshPointsActiveColoring,
    setMeshPointsActiveColoring,
    applyMeshPointsStyle,
    ...meshPointsVisibility,
    ...meshPointsColorStyle,
    ...meshPointsSizeStyle,
    ...meshPointsVertexAttributeStyle,
  }
}

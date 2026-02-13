// Third party imports

// Local imports
import { useMeshCellsCommonStyle } from "./common"
import { useMeshCellsVisibilityStyle } from "./visibility"
import { useMeshCellsColorStyle } from "./color"
import { useMeshCellsTexturesStyle } from "./textures"
import { useMeshCellsVertexAttributeStyle } from "./vertex"
import { useMeshCellsCellAttributeStyle } from "./cell"

// Local constants

export function useMeshCellsStyle() {
  const meshCellsCommonStyle = useMeshCellsCommonStyle()
  const meshCellsVisibility = useMeshCellsVisibilityStyle()
  const meshCellsColorStyle = useMeshCellsColorStyle()
  const meshCellsTexturesStore = useMeshCellsTexturesStyle()
  const meshCellsVertexAttributeStyle = useMeshCellsVertexAttributeStyle()
  const meshCellsCellAttributeStyle = useMeshCellsCellAttributeStyle()

  async function setMeshCellsActiveColoring(id, type) {
    const coloring = meshCellsCommonStyle.meshCellsColoring(id)
    coloring.active = type
    console.log(
      setMeshCellsActiveColoring.name,
      { id },
      meshCellsCommonStyle.meshCellsActiveColoring(id),
    )
    if (type === "color") {
      return meshCellsColorStyle.setMeshCellsColor(
        id,
        meshCellsColorStyle.meshCellsColor(id),
      )
    } else if (type === "textures") {
      const textures = meshCellsTexturesStore.meshCellsTextures(id)
      if (textures === null) {
        return Promise.resolve()
      }
      return meshCellsTexturesStore.setMeshCellsTextures(id, textures)
    } else if (type === "vertex") {
      const name =
        meshCellsVertexAttributeStyle.meshCellsVertexAttributeName(id)
      if (name === null) {
        return Promise.resolve()
      }
      return meshCellsVertexAttributeStyle.setMeshCellsVertexAttributeName(
        id,
        name,
      )
    } else if (type === "cell") {
      const name = meshCellsCellAttributeStyle.meshCellsCellAttributeName(id)
      if (name === null) {
        return Promise.resolve()
      }
      await meshCellsCellAttributeStyle.setMeshCellsCellAttributeName(id, name)
    } else {
      throw new Error("Unknown mesh cells coloring type: " + type)
    }
  }

  function applyMeshCellsStyle(id) {
    return Promise.all([
      meshCellsVisibility.setMeshCellsVisibility(
        id,
        meshCellsVisibility.meshCellsVisibility(id),
      ),
      setMeshCellsActiveColoring(
        id,
        meshCellsCommonStyle.meshCellsActiveColoring(id),
      ),
    ])
  }

  return {
    ...meshCellsCommonStyle,
    setMeshCellsActiveColoring,
    applyMeshCellsStyle,
    ...meshCellsVisibility,
    ...meshCellsColorStyle,
    ...meshCellsTexturesStore,
    ...meshCellsVertexAttributeStyle,
    ...meshCellsCellAttributeStyle,
  }
}

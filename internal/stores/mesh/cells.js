// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

import { useDataStyleStore } from "../data.js"
import { useViewerStore } from "../viewer.js"

// Local constants
const mesh_cells_schemas = viewer_schemas.opengeodeweb_viewer.mesh.cells
export function useMeshCellsStyle() {
  const dataStyleStore = useDataStyleStore()
  const viewerStore = useViewerStore()

  function meshCellsStyle(id) {
    return dataStyleStore.getStyle(id).cells
  }

  function meshCellsVisibility(id) {
    return meshCellsStyle(id).visibility
  }
  function setMeshCellsVisibility(id, visibility) {
    const cells_style = meshCellsStyle(id)
    return viewerStore.request(
      mesh_cells_schemas.visibility,
      { id, visibility },
      {
        response_function: () => {
          cells_style.visibility = visibility
          console.log(
            setMeshCellsVisibility.name,
            { id },
            meshCellsVisibility(id),
          )
        },
      },
    )
  }

  function meshCellsColor(id) {
    return meshCellsStyle(id).coloring.color
  }
  function setMeshCellsColor(id, color) {
    const coloring_style = meshCellsStyle(id).coloring
    return viewerStore.request(
      mesh_cells_schemas.color,
      { id, color },
      {
        response_function: () => {
          coloring_style.color = color
          console.log(
            setMeshCellsColor.name,
            { id },
            JSON.stringify(meshCellsColor(id)),
          )
        },
      },
    )
  }

  function meshCellsTextures(id) {
    return meshCellsStyle(id).coloring.textures
  }
  function setMeshCellsTextures(id, textures) {
    const coloring_style = meshCellsStyle(id).coloring
    return viewerStore.request(
      mesh_cells_schemas.apply_textures,
      { id, textures },
      {
        response_function: () => {
          coloring_style.textures = textures
          console.log(setMeshCellsTextures.name, { id }, meshCellsTextures(id))
        },
      },
    )
  }

  function meshCellsVertexAttribute(id) {
    return meshCellsStyle(id).coloring.vertex
  }

  function setMeshCellsVertexAttribute(id, vertex_attribute) {
    const coloring_style = meshCellsStyle(id).coloring
    return viewerStore.request(
      mesh_cells_schemas.vertex_attribute,
      { id, ...vertex_attribute },
      {
        response_function: () => {
          coloring_style.vertex = vertex_attribute
          console.log(
            setMeshCellsVertexAttribute.name,
            { id },
            meshCellsVertexAttribute(id),
          )
        },
      },
    )
  }

  function meshCellsCellAttribute(id) {
    return meshCellsStyle(id).coloring.cell
  }
  function setMeshCellsCellAttribute(id, cell_attribute) {
    const coloring_style = meshCellsStyle(id).coloring
    return viewerStore.request(
      mesh_cells_schemas.cell_attribute,
      { id, ...cell_attribute },
      {
        response_function: () => {
          coloring_style.cell = cell_attribute
          console.log(
            setMeshCellsCellAttribute.name,
            { id },
            meshCellsCellAttribute(id),
          )
        },
      },
    )
  }

  function meshCellsActiveColoring(id) {
    return meshCellsStyle(id).coloring.active
  }
  function setMeshCellsActiveColoring(id, type) {
    const coloring = meshCellsStyle(id).coloring
    coloring.active = type
    console.log(
      setMeshCellsActiveColoring.name,
      { id },
      meshCellsActiveColoring(id),
    )
    if (type === "color") {
      return setMeshCellsColor(id, coloring.color)
    } else if (type === "textures") {
      if (coloring.textures === null) {
        return
      }
      return setMeshCellsTextures(id, coloring.textures)
    } else if (type === "vertex") {
      if (coloring.vertex === null) {
        return
      }
      return setMeshCellsVertexAttribute(id, coloring.vertex)
    } else if (type === "cell") {
      if (coloring.cell === null) {
        return
      }
      return setMeshCellsCellAttribute(id, coloring.cell)
    } else {
      throw new Error("Unknown mesh cells coloring type: " + type)
    }
  }

  function applyMeshCellsStyle(id) {
    const style = meshCellsStyle(id)
    return Promise.all([
      setMeshCellsVisibility(id, style.visibility),
      setMeshCellsActiveColoring(id, style.coloring.active),
    ])
  }

  return {
    meshCellsVisibility,
    meshCellsActiveColoring,
    meshCellsColor,
    meshCellsTextures,
    meshCellsCellAttribute,
    meshCellsVertexAttribute,
    setMeshCellsVisibility,
    setMeshCellsActiveColoring,
    setMeshCellsColor,
    setMeshCellsTextures,
    setMeshCellsVertexAttribute,
    setMeshCellsCellAttribute,
    applyMeshCellsStyle,
  }
}

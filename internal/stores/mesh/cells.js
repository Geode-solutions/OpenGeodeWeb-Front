// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useDataStyleStateStore } from "../data_style_state"
import { useViewerStore } from "@ogw_front/stores/viewer"
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap"

// Local constants
const mesh_cells_schemas = viewer_schemas.opengeodeweb_viewer.mesh.cells

export function useMeshCellsStyle() {
  const dataStyleStateStore = useDataStyleStateStore()
  const viewerStore = useViewerStore()

  function meshCellsStyle(id) {
    return dataStyleStateStore.getStyle(id).cells
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
    const { name } = vertex_attribute
    return viewerStore.request(
      mesh_cells_schemas.vertex_attribute,
      { id, name },
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
    const { name } = cell_attribute
    return viewerStore.request(
      mesh_cells_schemas.cell_attribute,
      { id, name },
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

  function setMeshCellsCellScalarRange(id, minimum, maximum) {
    const cells_style = meshCellsStyle(id)
    return viewerStore.request(
      mesh_cells_schemas.cell_scalar_range,
      { id, minimum, maximum },
      {
        response_function: () => {
          cells_style.coloring.cell.min = minimum
          cells_style.coloring.cell.max = maximum
          console.log(setMeshCellsCellScalarRange.name, {
            id,
            minimum,
            maximum,
          })
        },
      },
    )
  }

  function setMeshCellsVertexScalarRange(id, minimum, maximum) {
    const cells_style = meshCellsStyle(id)
    return viewerStore.request(
      mesh_cells_schemas.vertex_scalar_range,
      { id, minimum, maximum },
      {
        response_function: () => {
          cells_style.coloring.vertex.min = minimum
          cells_style.coloring.vertex.max = maximum
          console.log(setMeshCellsVertexScalarRange.name, {
            id,
            minimum,
            maximum,
          })
        },
      },
    )
  }

  function setMeshCellsVertexColorMap(id, points, minimum, maximum) {
    const cells_style = meshCellsStyle(id)
    if (typeof points === "string") {
      points = getRGBPointsFromPreset(points)
    }
    return viewerStore.request(
      mesh_cells_schemas.vertex_color_map,
      { id, points, minimum, maximum },
      {
        response_function: () => {
          cells_style.coloring.vertex.colorMap = points
          console.log(setMeshCellsVertexColorMap.name, {
            id,
            points,
            minimum,
            maximum,
          })
        },
      },
    )
  }

  function setMeshCellsCellColorMap(id, points, minimum, maximum) {
    const cells_style = meshCellsStyle(id)
    if (typeof points === "string") {
      points = getRGBPointsFromPreset(points)
    }
    return viewerStore.request(
      mesh_cells_schemas.cell_color_map,
      { id, points, minimum, maximum },
      {
        response_function: () => {
          cells_style.coloring.cell.colorMap = points
          console.log(setMeshCellsCellColorMap.name, {
            id,
            points,
            minimum,
            maximum,
          })
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
        throw new Error("Textures not set")
      }
      return setMeshCellsTextures(id, coloring.textures)
    } else if (type === "vertex") {
      if (coloring.vertex) {
        return setMeshCellsVertexAttribute(id, coloring.vertex)
      }
      return Promise.resolve()
    } else if (type === "cell") {
      if (coloring.cell) {
        return setMeshCellsCellAttribute(id, coloring.cell)
      }
      return Promise.resolve()
    } else {
      throw new Error("Unknown mesh cells coloring type: " + type)
    }
  }

  function applyMeshCellsStyle(id) {
    const style = meshCellsStyle(id)
    const promises = [
      setMeshCellsVisibility(id, style.visibility),
      setMeshCellsActiveColoring(id, style.coloring.active),
    ]

    if (style.coloring.active === "vertex" && style.coloring.vertex) {
      const { min, max, colorMap } = style.coloring.vertex
      if (min !== undefined && max !== undefined) {
        promises.push(setMeshCellsVertexScalarRange(id, min, max))
        if (colorMap) {
          promises.push(setMeshCellsVertexColorMap(id, colorMap, min, max))
        }
      }
    } else if (style.coloring.active === "cell" && style.coloring.cell) {
      const { min, max, colorMap } = style.coloring.cell
      if (min !== undefined && max !== undefined) {
        promises.push(setMeshCellsCellScalarRange(id, min, max))
        if (colorMap) {
          promises.push(setMeshCellsCellColorMap(id, colorMap, min, max))
        }
      }
    }

    return Promise.all(promises)
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
    setMeshCellsCellScalarRange,
    setMeshCellsVertexScalarRange,
    setMeshCellsVertexColorMap,
    setMeshCellsCellColorMap,
    applyMeshCellsStyle,
  }
}

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
    return setMeshCellsVertexAttributeName(id, vertex_attribute.name)
  }
  function meshCellsVertexAttributeName(id) {
    const vertex = meshCellsStyle(id).coloring.vertex
    return vertex ? vertex.name : ""
  }
  function setMeshCellsVertexAttributeName(id, name) {
    const coloring_style = meshCellsStyle(id).coloring
    return viewerStore.request(
      mesh_cells_schemas.attribute.vertex.name,
      { id, name },
      {
        response_function: () => {
          if (!coloring_style.vertex) {
            coloring_style.vertex = {}
          }
          coloring_style.vertex.name = name
          console.log(setMeshCellsVertexAttributeName.name, { id }, name)
        },
      },
    )
  }
  function meshCellsVertexAttributeRange(id) {
    const vertex = meshCellsStyle(id).coloring.vertex
    return vertex ? [vertex.minimum, vertex.maximum] : [0, 1]
  }
  function setMeshCellsVertexAttributeRange(id, min, max) {
    const coloring_style = meshCellsStyle(id).coloring
    return viewerStore.request(
      mesh_cells_schemas.attribute.vertex.scalar_range,
      { id, minimum: min, maximum: max },
      {
        response_function: () => {
          if (!coloring_style.vertex) {
            coloring_style.vertex = {}
          }
          coloring_style.vertex.minimum = min
          coloring_style.vertex.maximum = max
          console.log(setMeshCellsVertexAttributeRange.name, { id, min, max })
        },
      },
    )
  }
  function meshCellsVertexAttributeColorMap(id) {
    const vertex = meshCellsStyle(id).coloring.vertex
    return vertex ? vertex.colorMap : null
  }
  function setMeshCellsVertexAttributeColorMap(id, points, minimum, maximum) {
    const coloring_style = meshCellsStyle(id).coloring
    if (typeof points === "string") {
      points = getRGBPointsFromPreset(points)
    }
    return viewerStore.request(
      mesh_cells_schemas.attribute.vertex.color_map,
      { id, points, minimum, maximum },
      {
        response_function: () => {
          if (!coloring_style.vertex) {
            coloring_style.vertex = {}
          }
          coloring_style.vertex.colorMap = points
          console.log(setMeshCellsVertexAttributeColorMap.name, { id, points })
        },
      },
    )
  }

  function meshCellsCellAttribute(id) {
    return meshCellsStyle(id).coloring.cell
  }
  function setMeshCellsCellAttribute(id, cell_attribute) {
    return setMeshCellsCellAttributeName(id, cell_attribute.name)
  }
  function meshCellsCellAttributeName(id) {
    const cell = meshCellsStyle(id).coloring.cell
    return cell ? cell.name : ""
  }
  function setMeshCellsCellAttributeName(id, name) {
    const coloring_style = meshCellsStyle(id).coloring
    return viewerStore.request(
      mesh_cells_schemas.attribute.cell.name,
      { id, name },
      {
        response_function: () => {
          if (!coloring_style.cell) {
            coloring_style.cell = {}
          }
          coloring_style.cell.name = name
          console.log(setMeshCellsCellAttributeName.name, { id }, name)
        },
      },
    )
  }
  function meshCellsCellAttributeRange(id) {
    const cell = meshCellsStyle(id).coloring.cell
    return cell ? [cell.minimum, cell.maximum] : [0, 1]
  }
  function setMeshCellsCellAttributeRange(id, min, max) {
    const coloring_style = meshCellsStyle(id).coloring
    return viewerStore.request(
      mesh_cells_schemas.attribute.cell.scalar_range,
      { id, minimum: min, maximum: max },
      {
        response_function: () => {
          if (!coloring_style.cell) {
            coloring_style.cell = {}
          }
          coloring_style.cell.minimum = min
          coloring_style.cell.maximum = max
          console.log(setMeshCellsCellAttributeRange.name, { id, min, max })
        },
      },
    )
  }
  function meshCellsCellAttributeColorMap(id) {
    const cell = meshCellsStyle(id).coloring.cell
    return cell ? cell.colorMap : null
  }
  function setMeshCellsCellAttributeColorMap(id, points, minimum, maximum) {
    const coloring_style = meshCellsStyle(id).coloring
    if (typeof points === "string") {
      points = getRGBPointsFromPreset(points)
    }
    return viewerStore.request(
      mesh_cells_schemas.attribute.cell.color_map,
      { id, points, minimum, maximum },
      {
        response_function: () => {
          if (!coloring_style.cell) {
            coloring_style.cell = {}
          }
          coloring_style.cell.colorMap = points
          console.log(setMeshCellsCellAttributeColorMap.name, { id, points })
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
      if (coloring.vertex && coloring.vertex.name) {
        return setMeshCellsVertexAttributeName(id, coloring.vertex.name)
      }
      return Promise.resolve()
    } else if (type === "cell") {
      if (coloring.cell && coloring.cell.name) {
        return setMeshCellsCellAttributeName(id, coloring.cell.name)
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
      const { name, min, max, colorMap } = style.coloring.vertex
      if (name) {
        promises.push(setMeshCellsVertexAttributeName(id, name))
      }
      if (min !== undefined && max !== undefined) {
        promises.push(setMeshCellsVertexAttributeRange(id, min, max))
        if (colorMap) {
          promises.push(
            setMeshCellsVertexAttributeColorMap(id, colorMap, min, max),
          )
        }
      }
    } else if (style.coloring.active === "cell" && style.coloring.cell) {
      const { name, min, max, colorMap } = style.coloring.cell
      if (name) {
        promises.push(setMeshCellsCellAttributeName(id, name))
      }
      if (min !== undefined && max !== undefined) {
        promises.push(setMeshCellsCellAttributeRange(id, min, max))
        if (colorMap) {
          promises.push(
            setMeshCellsCellAttributeColorMap(id, colorMap, min, max),
          )
        }
      }
    }

    return Promise.all(promises)
  }

  return {
    meshCellsVisibility: meshCellsVisibility,
    meshCellsActiveColoring: meshCellsActiveColoring,
    meshCellsColor: meshCellsColor,
    meshCellsTextures: meshCellsTextures,
    meshCellsVertexAttribute: meshCellsVertexAttribute,
    meshCellsVertexAttributeName: meshCellsVertexAttributeName,
    meshCellsVertexAttributeRange: meshCellsVertexAttributeRange,
    meshCellsVertexAttributeColorMap: meshCellsVertexAttributeColorMap,
    meshCellsCellAttribute: meshCellsCellAttribute,
    meshCellsCellAttributeName: meshCellsCellAttributeName,
    meshCellsCellAttributeRange: meshCellsCellAttributeRange,
    meshCellsCellAttributeColorMap: meshCellsCellAttributeColorMap,
    setMeshCellsVisibility: setMeshCellsVisibility,
    setMeshCellsActiveColoring: setMeshCellsActiveColoring,
    setMeshCellsColor: setMeshCellsColor,
    setMeshCellsTextures: setMeshCellsTextures,
    setMeshCellsVertexAttribute: setMeshCellsVertexAttribute,
    setMeshCellsVertexAttributeName: setMeshCellsVertexAttributeName,
    setMeshCellsVertexAttributeRange: setMeshCellsVertexAttributeRange,
    setMeshCellsVertexAttributeColorMap: setMeshCellsVertexAttributeColorMap,
    setMeshCellsCellAttribute: setMeshCellsCellAttribute,
    setMeshCellsCellAttributeName: setMeshCellsCellAttributeName,
    setMeshCellsCellAttributeRange: setMeshCellsCellAttributeRange,
    setMeshCellsCellAttributeColorMap: setMeshCellsCellAttributeColorMap,
    applyMeshCellsStyle: applyMeshCellsStyle,
  }
}

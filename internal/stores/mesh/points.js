// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useDataStyleStateStore } from "../data_style_state"
import { useViewerStore } from "@ogw_front/stores/viewer"
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap"

// Local constants
const mesh_points_schemas = viewer_schemas.opengeodeweb_viewer.mesh.points

export function useMeshPointsStyle() {
  const dataStyleStateStore = useDataStyleStateStore()
  const viewerStore = useViewerStore()

  function meshPointsStyle(id) {
    return dataStyleStateStore.getStyle(id).points
  }

  function meshPointsVisibility(id) {
    return meshPointsStyle(id).visibility
  }
  function setMeshPointsVisibility(id, visibility) {
    const points_style = meshPointsStyle(id)
    return viewerStore.request(
      mesh_points_schemas.visibility,
      { id, visibility },
      {
        response_function: () => {
          points_style.visibility = visibility
          console.log(
            setMeshPointsVisibility.name,
            { id },
            meshPointsVisibility(id),
          )
        },
      },
    )
  }

  function meshPointsActiveColoring(id) {
    return meshPointsStyle(id).coloring.active
  }
  function setMeshPointsActiveColoring(id, type) {
    const coloring = meshPointsStyle(id).coloring
    coloring.active = type
    console.log(
      setMeshPointsActiveColoring.name,
      { id },
      meshPointsActiveColoring(id),
    )
    if (type === "color") {
      return setMeshPointsColor(id, coloring.color)
    } else if (type === "vertex") {
      if (coloring.vertex.name === undefined) {
        throw new Error("Vertex attribute not set")
      }
      return setMeshPointsVertexAttributeName(id, coloring.vertex.name).then(() => {
        if (coloring.vertex.minimum !== undefined && coloring.vertex.maximum !== undefined) {
          return setMeshPointsVertexAttributeRange(id, coloring.vertex.minimum, coloring.vertex.maximum).then(() => {
            if (coloring.vertex.colorMap) {
              return setMeshPointsVertexAttributeColorMap(id, coloring.vertex.colorMap, coloring.vertex.minimum, coloring.vertex.maximum)
            }
          })
        }
      })
    } else {
      throw new Error("Unknown mesh points coloring type: " + type)
    }
  }

  function meshPointsColor(id) {
    return meshPointsStyle(id).coloring.color
  }
  function setMeshPointsColor(id, color) {
    const coloring_style = meshPointsStyle(id).coloring
    return viewerStore.request(
      mesh_points_schemas.color,
      { id, color },
      {
        response_function: () => {
          coloring_style.color = color
          console.log(
            setMeshPointsColor.name,
            { id },
            JSON.stringify(meshPointsColor(id)),
          )
        },
      },
    )
  }
  function meshPointsVertexAttribute(id) {
    return meshPointsStyle(id).coloring.vertex
  }
  function setMeshPointsVertexAttribute(id, vertex_attribute) {
    return setMeshPointsVertexAttributeName(id, vertex_attribute.name)
  }
  function meshPointsVertexAttributeName(id) {
    const vertex = meshPointsStyle(id).coloring.vertex
    return vertex ? vertex.name : ""
  }
  function setMeshPointsVertexAttributeName(id, name) {
    const coloring_style = meshPointsStyle(id).coloring
    return viewerStore.request(
      mesh_points_schemas.attribute.vertex.name,
      { id, name },
      {
        response_function: () => {
          if (!coloring_style.vertex) {
            coloring_style.vertex = {}
          }
          coloring_style.vertex.name = name
          console.log(setMeshPointsVertexAttributeName.name, { id }, name)
        },
      },
    )
  }
  function meshPointsVertexAttributeRange(id) {
    const vertex = meshPointsStyle(id).coloring.vertex
    return vertex ? [vertex.minimum, vertex.maximum] : [0, 1]
  }
  function setMeshPointsVertexAttributeRange(id, min, max) {
    const coloring_style = meshPointsStyle(id).coloring
    return viewerStore.request(
      mesh_points_schemas.attribute.vertex.scalar_range,
      { id, minimum: min, maximum: max },
      {
        response_function: () => {
          if (!coloring_style.vertex) {
            coloring_style.vertex = {}
          }
          coloring_style.vertex.minimum = min
          coloring_style.vertex.maximum = max
          console.log(setMeshPointsVertexAttributeRange.name, { id, min, max })
        },
      },
    )
  }
  function meshPointsVertexAttributeColorMap(id) {
    const vertex = meshPointsStyle(id).coloring.vertex
    return vertex ? vertex.colorMap : null
  }
  function setMeshPointsVertexAttributeColorMap(id, colorMapName, minimum, maximum) {
    const coloring_style = meshPointsStyle(id).coloring
    let points = colorMapName
    if (typeof colorMapName === "string") {
      points = getRGBPointsFromPreset(colorMapName)
    }
    return viewerStore.request(
      mesh_points_schemas.attribute.vertex.color_map,
      { id, points, minimum, maximum },
      {
        response_function: () => {
          if (!coloring_style.vertex) {
            coloring_style.vertex = {}
          }
          coloring_style.vertex.colorMap = colorMapName
          console.log(setMeshPointsVertexAttributeColorMap.name, { id, colorMapName })
        },
      },
    )
  }

  function meshPointsSize(id) {
    return meshPointsStyle(id).size
  }
  function setMeshPointsSize(id, size) {
    return viewerStore.request(
      mesh_points_schemas.size,
      { id, size },
      {
        response_function: () => {
          meshPointsStyle(id).size = size
          console.log(setMeshPointsSize.name, { id }, meshPointsSize(id))
        },
      },
    )
  }

  function applyMeshPointsStyle(id) {
    const style = meshPointsStyle(id)
    return Promise.all([
      setMeshPointsVisibility(id, style.visibility),
      setMeshPointsActiveColoring(id, style.coloring.active),
      setMeshPointsSize(id, style.size),
    ])
  }

  return {
    meshPointsVisibility,
    meshPointsActiveColoring,
    meshPointsColor,
    meshPointsVertexAttribute,
    meshPointsVertexAttributeName,
    meshPointsVertexAttributeRange,
    meshPointsVertexAttributeColorMap,
    meshPointsSize,
    setMeshPointsVisibility,
    setMeshPointsActiveColoring,
    setMeshPointsColor,
    setMeshPointsVertexAttribute,
    setMeshPointsVertexAttributeName,
    setMeshPointsVertexAttributeRange,
    setMeshPointsVertexAttributeColorMap,
    setMeshPointsSize,
    applyMeshPointsStyle,
  }
}

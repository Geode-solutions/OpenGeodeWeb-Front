// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useDataStyleStateStore } from "../data_style_state"
import { useViewerStore } from "@ogw_front/stores/viewer"
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap"

// Local constants
const mesh_edges_schemas = viewer_schemas.opengeodeweb_viewer.mesh.edges

export function useMeshEdgesStyle() {
  const dataStyleStateStore = useDataStyleStateStore()
  const viewerStore = useViewerStore()

  function meshEdgesStyle(id) {
    return dataStyleStateStore.getStyle(id).edges
  }

  function meshEdgesVisibility(id) {
    return meshEdgesStyle(id).visibility
  }
  function setMeshEdgesVisibility(id, visibility) {
    return viewerStore.request(
      mesh_edges_schemas.visibility,
      { id, visibility },
      {
        response_function: () => {
          meshEdgesStyle(id).visibility = visibility
          console.log(
            setMeshEdgesVisibility.name,
            { id },
            meshEdgesVisibility(id),
          )
        },
      },
    )
  }

  function meshEdgesActiveColoring(id) {
    return meshEdgesStyle(id).coloring.active
  }
  function setMeshEdgesActiveColoring(id, type) {
    const coloring = meshEdgesStyle(id).coloring
    coloring.active = type
    console.log(
      setMeshEdgesActiveColoring.name,
      { id },
      meshEdgesActiveColoring(id),
    )
    if (type === "color") {
      return setMeshEdgesColor(id, coloring.color)
    } else if (type === "vertex") {
      if (coloring.vertex === null) {
        throw new Error("Vertex attribute not set")
      }
      if (coloring.vertex.name) {
        return setMeshEdgesVertexAttributeName(id, coloring.vertex.name).then(() => {
          if (coloring.vertex.minimum !== undefined && coloring.vertex.maximum !== undefined) {
            return setMeshEdgesVertexAttributeRange(id, coloring.vertex.minimum, coloring.vertex.maximum).then(() => {
              if (coloring.vertex.colorMap) {
                return setMeshEdgesVertexAttributeColorMap(id, coloring.vertex.colorMap, coloring.vertex.minimum, coloring.vertex.maximum)
              }
            })
          }
        })
      }
      return Promise.resolve()
    } else if (type === "edge") {
      if (coloring.edge === null) {
        throw new Error("Edge attribute not set")
      }
      if (coloring.edge.name) {
        return setMeshEdgesEdgeAttributeName(id, coloring.edge.name).then(() => {
          if (coloring.edge.minimum !== undefined && coloring.edge.maximum !== undefined) {
            return setMeshEdgesEdgeAttributeRange(id, coloring.edge.minimum, coloring.edge.maximum).then(() => {
              if (coloring.edge.colorMap) {
                return setMeshEdgesEdgeAttributeColorMap(id, coloring.edge.colorMap, coloring.edge.minimum, coloring.edge.maximum)
              }
            })
          }
        })
      }
      return Promise.resolve()
    } else {
      throw new Error("Unknown mesh edges coloring type: " + type)
    }
  }

  function meshEdgesColor(id) {
    return meshEdgesStyle(id).coloring.color
  }
  function setMeshEdgesColor(id, color) {
    const coloring_style = meshEdgesStyle(id).coloring
    return viewerStore.request(
      mesh_edges_schemas.color,
      { id, color },
      {
        response_function: () => {
          coloring_style.color = color
          console.log(
            setMeshEdgesColor.name,
            { id },
            JSON.stringify(meshEdgesColor(id)),
          )
        },
      },
    )
  }

  function meshEdgesWidth(id) {
    return meshEdgesStyle(id).width
  }
  function setMeshEdgesWidth(id, width) {
    const edges_style = meshEdgesStyle(id)
    return viewerStore.request(
      mesh_edges_schemas.width,
      { id, width },
      {
        response_function: () => {
          edges_style.width = width
          console.log(setMeshEdgesWidth.name, { id }, meshEdgesWidth(id))
        },
      },
    )
  }

  function meshEdgesVertexAttribute(id) {
    return meshEdgesStyle(id).coloring.vertex
  }
  function setMeshEdgesVertexAttribute(id, vertex_attribute) {
    return setMeshEdgesVertexAttributeName(id, vertex_attribute.name)
  }
  function meshEdgesVertexAttributeName(id) {
    const vertex = meshEdgesStyle(id).coloring.vertex
    return vertex ? vertex.name : ""
  }
  function setMeshEdgesVertexAttributeName(id, name) {
    const coloring_style = meshEdgesStyle(id).coloring
    return viewerStore.request(
      mesh_edges_schemas.attribute.vertex.name,
      { id, name },
      {
        response_function: () => {
          if (!coloring_style.vertex) {
            coloring_style.vertex = {}
          }
          coloring_style.vertex.name = name
          console.log(setMeshEdgesVertexAttributeName.name, { id }, name)
        },
      },
    )
  }
  function meshEdgesVertexAttributeRange(id) {
    const vertex = meshEdgesStyle(id).coloring.vertex
    return vertex ? [vertex.minimum, vertex.maximum] : [0, 1]
  }
  function setMeshEdgesVertexAttributeRange(id, min, max) {
    const coloring_style = meshEdgesStyle(id).coloring
    return viewerStore.request(
      mesh_edges_schemas.attribute.vertex.scalar_range,
      { id, minimum: min, maximum: max },
      {
        response_function: () => {
          if (!coloring_style.vertex) {
            coloring_style.vertex = {}
          }
          coloring_style.vertex.minimum = min
          coloring_style.vertex.maximum = max
          console.log(setMeshEdgesVertexAttributeRange.name, { id, min, max })
        },
      },
    )
  }
  function meshEdgesVertexAttributeColorMap(id) {
    const vertex = meshEdgesStyle(id).coloring.vertex
    return vertex ? vertex.colorMap : null
  }
  function setMeshEdgesVertexAttributeColorMap(id, colorMapName, minimum, maximum) {
    const coloring_style = meshEdgesStyle(id).coloring
    let points = colorMapName
    if (typeof colorMapName === "string") {
      points = getRGBPointsFromPreset(colorMapName)
    }
    return viewerStore.request(
      mesh_edges_schemas.attribute.vertex.color_map,
      { id, points, minimum, maximum },
      {
        response_function: () => {
          if (!coloring_style.vertex) {
            coloring_style.vertex = {}
          }
          coloring_style.vertex.colorMap = colorMapName
          console.log(setMeshEdgesVertexAttributeColorMap.name, { id, colorMapName })
        },
      },
    )
  }

  function meshEdgesEdgeAttribute(id) {
    return meshEdgesStyle(id).coloring.edge
  }
  function setMeshEdgesEdgeAttribute(id, edge_attribute) {
    return setMeshEdgesEdgeAttributeName(id, edge_attribute.name)
  }
  function meshEdgesEdgeAttributeName(id) {
    const edge = meshEdgesStyle(id).coloring.edge
    return edge ? edge.name : ""
  }
  function setMeshEdgesEdgeAttributeName(id, name) {
    const coloring_style = meshEdgesStyle(id).coloring
    return viewerStore.request(
      mesh_edges_schemas.attribute.edge.name,
      { id, name },
      {
        response_function: () => {
          if (!coloring_style.edge) {
            coloring_style.edge = {}
          }
          coloring_style.edge.name = name
          console.log(setMeshEdgesEdgeAttributeName.name, { id }, name)
        },
      },
    )
  }
  function meshEdgesEdgeAttributeRange(id) {
    const edge = meshEdgesStyle(id).coloring.edge
    return edge ? [edge.minimum, edge.maximum] : [0, 1]
  }
  function setMeshEdgesEdgeAttributeRange(id, min, max) {
    const coloring_style = meshEdgesStyle(id).coloring
    if (!mesh_edges_schemas.edge_scalar_range) {
      console.warn("setMeshEdgesEdgeAttributeRange: RPC not available")
      if (!coloring_style.edge) {
        coloring_style.edge = {}
      }
      coloring_style.edge.minimum = min
      coloring_style.edge.maximum = max
      return Promise.resolve()
    }
    return viewerStore.request(
      mesh_edges_schemas.edge_scalar_range,
      { id, minimum: min, maximum: max },
      {
        response_function: () => {
          if (!coloring_style.edge) {
            coloring_style.edge = {}
          }
          coloring_style.edge.minimum = min
          coloring_style.edge.maximum = max
          console.log(setMeshEdgesEdgeAttributeRange.name, { id, min, max })
        },
      },
    )
  }
  function meshEdgesEdgeAttributeColorMap(id) {
    const edge = meshEdgesStyle(id).coloring.edge
    return edge ? edge.colorMap : null
  }
  function setMeshEdgesEdgeAttributeColorMap(id, colorMapName, minimum, maximum) {
    const coloring_style = meshEdgesStyle(id).coloring
    let points = colorMapName
    if (typeof colorMapName === "string") {
      points = getRGBPointsFromPreset(colorMapName)
    }
    if (!mesh_edges_schemas.edge_color_map) {
      console.warn("setMeshEdgesEdgeAttributeColorMap: RPC not available")
      if (!coloring_style.edge) {
        coloring_style.edge = {}
      }
      coloring_style.edge.colorMap = colorMapName
      return Promise.resolve()
    }
    return viewerStore.request(
      mesh_edges_schemas.edge_color_map,
      { id, points, minimum, maximum },
      {
        response_function: () => {
          if (!coloring_style.edge) {
            coloring_style.edge = {}
          }
          coloring_style.edge.colorMap = colorMapName
          console.log(setMeshEdgesEdgeAttributeColorMap.name, { id, colorMapName })
        },
      },
    )
  }

  function applyMeshEdgesStyle(id) {
    const style = meshEdgesStyle(id)
    return Promise.all([
      setMeshEdgesVisibility(id, style.visibility),
      setMeshEdgesActiveColoring(id, style.coloring.active),
      setMeshEdgesWidth(id, style.width),
    ])
  }

  return {
    meshEdgesVisibility,
    meshEdgesActiveColoring,
    meshEdgesColor,
    meshEdgesWidth,
    meshEdgesVertexAttribute,
    meshEdgesVertexAttributeName,
    meshEdgesVertexAttributeRange,
    meshEdgesVertexAttributeColorMap,
    meshEdgesEdgeAttribute,
    meshEdgesEdgeAttributeName,
    meshEdgesEdgeAttributeRange,
    meshEdgesEdgeAttributeColorMap,
    setMeshEdgesVisibility,
    setMeshEdgesActiveColoring,
    setMeshEdgesColor,
    setMeshEdgesWidth,
    setMeshEdgesVertexAttribute,
    setMeshEdgesVertexAttributeName,
    setMeshEdgesVertexAttributeRange,
    setMeshEdgesVertexAttributeColorMap,
    setMeshEdgesEdgeAttribute,
    setMeshEdgesEdgeAttributeName,
    setMeshEdgesEdgeAttributeRange,
    setMeshEdgesEdgeAttributeColorMap,
    applyMeshEdgesStyle,
  }
}

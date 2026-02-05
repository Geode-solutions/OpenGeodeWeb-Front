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
      const name = coloring.vertex.name
      if (name === undefined) {
        return Promise.resolve()
      }
      const attributes = coloring.vertex.attributes
      const minimum = attributes[name]?.minimum
      const maximum = attributes[name]?.maximum
      const colorMap = attributes[name]?.colorMap
      return setMeshEdgesVertexAttributeName(id, name).then(() => {
        if (minimum !== undefined && maximum !== undefined) {
          return setMeshEdgesVertexAttributeRange(id, minimum, maximum).then(
            () => {
              if (colorMap) {
                return setMeshEdgesVertexAttributeColorMap(
                  id,
                  colorMap,
                  minimum,
                  maximum,
                )
              }
            },
          )
        }
      })
    } else if (type === "edge") {
      const name = coloring.edge.name
      if (name === undefined) {
        return Promise.resolve()
      }
      const attributes = coloring.edge.attributes
      const minimum = attributes[name]?.minimum
      const maximum = attributes[name]?.maximum
      const colorMap = attributes[name]?.colorMap
      return setMeshEdgesEdgeAttributeName(id, name).then(() => {
        if (minimum !== undefined && maximum !== undefined) {
          return setMeshEdgesEdgeAttributeRange(id, minimum, maximum).then(
            () => {
              if (colorMap) {
                return setMeshEdgesEdgeAttributeColorMap(
                  id,
                  colorMap,
                  minimum,
                  maximum,
                )
              }
            },
          )
        }
      })
    } else {
      throw new Error("Unknown active coloring type: " + type)
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
  function setMeshEdgesVertexAttributeName(id, name, defaultMin, defaultMax) {
    const coloring_style = meshEdgesStyle(id).coloring
    return viewerStore.request(
      mesh_edges_schemas.attribute.vertex.name,
      { id, name },
      {
        response_function: () => {
          const saved_preset = coloring_style.vertex.attributes[name]
          coloring_style.vertex.name = name

          let minimum, maximum, colorMap
          if (saved_preset) {
            if (
              saved_preset.minimum !== undefined &&
              saved_preset.maximum !== undefined
            ) {
              minimum = saved_preset.minimum
              maximum = saved_preset.maximum
              colorMap = saved_preset.colorMap
            }
          } else if (defaultMin !== undefined && defaultMax !== undefined) {
            minimum = defaultMin
            maximum = defaultMax
            colorMap = "Cool to Warm"
            coloring_style.vertex.attributes[name] = {
              minimum,
              maximum,
              colorMap,
            }
          }
          if (minimum !== undefined && maximum !== undefined) {
            setMeshEdgesVertexAttributeRange(id, minimum, maximum)
            setMeshEdgesVertexAttributeColorMap(id, colorMap, minimum, maximum)
          }
          console.log(
            setMeshEdgesVertexAttributeName.name,
            { id },
            meshEdgesVertexAttributeName(id),
          )
        },
      },
    )
  }
  function meshEdgesVertexAttributeRange(id) {
    const name = meshEdgesVertexAttributeName(id)
    const saved_preset = meshEdgesStyle(id).coloring.vertex.attributes[name]
    return saved_preset ? [saved_preset.minimum, saved_preset.maximum] : [0, 1]
  }
  function setMeshEdgesVertexAttributeRange(id, minimum, maximum) {
    const coloring_style = meshEdgesStyle(id).coloring
    return viewerStore.request(
      mesh_edges_schemas.attribute.vertex.scalar_range,
      { id, minimum, maximum },
      {
        response_function: () => {
          const name = coloring_style.vertex.name
          const saved_preset = coloring_style.vertex.attributes[name]
          saved_preset.minimum = minimum
          saved_preset.maximum = maximum
          console.log(
            setMeshEdgesVertexAttributeRange.name,
            { id },
            meshEdgesVertexAttributeRange(id),
          )
        },
      },
    )
  }
  function meshEdgesVertexAttributeColorMap(id) {
    const name = meshEdgesVertexAttributeName(id)
    const saved_preset = meshEdgesStyle(id).coloring.vertex.attributes[name]
    return saved_preset ? saved_preset.colorMap : null
  }
  function setMeshEdgesVertexAttributeColorMap(
    id,
    colorMapName,
    minimum,
    maximum,
  ) {
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
          const name = coloring_style.vertex.name
          const saved_preset = coloring_style.vertex.attributes[name]
          saved_preset.colorMap = colorMapName
          console.log(setMeshEdgesVertexAttributeColorMap.name, {
            id,
            colorMapName,
          })
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
  function setMeshEdgesEdgeAttributeName(id, name, defaultMin, defaultMax) {
    const coloring_style = meshEdgesStyle(id).coloring
    return viewerStore.request(
      mesh_edges_schemas.attribute.edge.name,
      { id, name },
      {
        response_function: () => {
          const saved_preset = coloring_style.edge.attributes[name]
          coloring_style.edge.name = name

          let minimum, maximum, colorMap
          if (saved_preset) {
            if (
              saved_preset.minimum !== undefined &&
              saved_preset.maximum !== undefined
            ) {
              minimum = saved_preset.minimum
              maximum = saved_preset.maximum
              colorMap = saved_preset.colorMap
            }
          } else if (defaultMin !== undefined && defaultMax !== undefined) {
            minimum = defaultMin
            maximum = defaultMax
            colorMap = "Cool to Warm"
            coloring_style.edge.attributes[name] = {
              minimum,
              maximum,
              colorMap,
            }
          }
          if (minimum !== undefined && maximum !== undefined) {
            setMeshEdgesEdgeAttributeRange(id, minimum, maximum)
            setMeshEdgesEdgeAttributeColorMap(id, colorMap, minimum, maximum)
          }
          console.log(
            setMeshEdgesEdgeAttributeName.name,
            { id },
            meshEdgesEdgeAttributeName(id),
          )
        },
      },
    )
  }
  function meshEdgesEdgeAttributeRange(id) {
    const name = meshEdgesEdgeAttributeName(id)
    const saved_preset = meshEdgesStyle(id).coloring.edge.attributes[name]
    return saved_preset ? [saved_preset.minimum, saved_preset.maximum] : [0, 1]
  }
  function setMeshEdgesEdgeAttributeRange(id, minimum, maximum) {
    const coloring_style = meshEdgesStyle(id).coloring
    if (!mesh_edges_schemas.edge_scalar_range) {
      console.warn("setMeshEdgesEdgeAttributeRange: RPC not available")
      const name = coloring_style.edge.name
      const saved_preset = coloring_style.edge.attributes[name]
      saved_preset.minimum = minimum
      saved_preset.maximum = maximum
      return Promise.resolve()
    }
    return viewerStore.request(
      mesh_edges_schemas.edge_scalar_range,
      { id, minimum, maximum },
      {
        response_function: () => {
          const name = coloring_style.edge.name
          const saved_preset = coloring_style.edge.attributes[name]
          saved_preset.minimum = minimum
          saved_preset.maximum = maximum
          console.log(
            setMeshEdgesEdgeAttributeRange.name,
            { id },
            meshEdgesEdgeAttributeRange(id),
          )
        },
      },
    )
  }
  function meshEdgesEdgeAttributeColorMap(id) {
    const name = meshEdgesEdgeAttributeName(id)
    const saved_preset = meshEdgesStyle(id).coloring.edge.attributes[name]
    return saved_preset ? saved_preset.colorMap : null
  }
  function setMeshEdgesEdgeAttributeColorMap(
    id,
    colorMapName,
    minimum,
    maximum,
  ) {
    const coloring_style = meshEdgesStyle(id).coloring
    let points = colorMapName
    if (typeof colorMapName === "string") {
      points = getRGBPointsFromPreset(colorMapName)
    }
    if (!mesh_edges_schemas.edge_color_map) {
      console.warn("setMeshEdgesEdgeAttributeColorMap: RPC not available")
      const name = coloring_style.edge.name
      const saved_preset = coloring_style.edge.attributes[name]
      saved_preset.colorMap = colorMapName
      return Promise.resolve()
    }
    return viewerStore.request(
      mesh_edges_schemas.edge_color_map,
      { id, points, minimum, maximum },
      {
        response_function: () => {
          const name = coloring_style.edge.name
          const saved_preset = coloring_style.edge.attributes[name]
          saved_preset.colorMap = colorMapName
          console.log(setMeshEdgesEdgeAttributeColorMap.name, {
            id,
            colorMapName,
          })
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

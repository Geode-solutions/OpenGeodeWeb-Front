// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useDataStyleStateStore } from "../data_style_state"
import { useViewerStore } from "@ogw_front/stores/viewer"
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap"
import { ensureAttributeEntry } from "./utils"

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
  async function setMeshEdgesActiveColoring(id, type) {
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
      await setMeshEdgesVertexAttributeName(id, name)
      if (minimum !== undefined && maximum !== undefined) {
        await setMeshEdgesVertexAttributeRange(id, minimum, maximum)
        if (colorMap) {
          await setMeshEdgesVertexAttributeColorMap(
            id,
            colorMap,
            minimum,
            maximum,
          )
        }
      }
    } else if (type === "edge") {
      const name = coloring.edge.name
      if (name === undefined) {
        return Promise.resolve()
      }
      const attributes = coloring.edge.attributes
      const minimum = attributes[name]?.minimum
      const maximum = attributes[name]?.maximum
      const colorMap = attributes[name]?.colorMap
      await setMeshEdgesEdgeAttributeName(id, name)
      if (minimum !== undefined && maximum !== undefined) {
        await setMeshEdgesEdgeAttributeRange(id, minimum, maximum)
        if (colorMap) {
          await setMeshEdgesEdgeAttributeColorMap(
            id,
            colorMap,
            minimum,
            maximum,
          )
        }
      }
    } else {
      throw new Error("Unknown mesh edges active coloring type: " + type)
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
          const saved_preset = coloring_style.vertex.attributes[name]
          coloring_style.vertex.name = name

          let minimum, maximum, colorMap
          if (
            saved_preset &&
            saved_preset.minimum !== undefined &&
            saved_preset.maximum !== undefined
          ) {
            minimum = saved_preset.minimum
            maximum = saved_preset.maximum
            colorMap = saved_preset.colorMap
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
    const name = coloring_style.vertex.name
    ensureAttributeEntry(coloring_style.vertex, name)
    const saved_preset = coloring_style.vertex.attributes[name]
    saved_preset.minimum = minimum
    saved_preset.maximum = maximum
    return viewerStore.request(
      mesh_edges_schemas.attribute.vertex.scalar_range,
      { id, minimum, maximum },
      {
        response_function: () => {
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
    const name = coloring_style.vertex.name
    ensureAttributeEntry(coloring_style.vertex, name)
    const saved_preset = coloring_style.vertex.attributes[name]
    saved_preset.colorMap = colorMapName
    const points =
      typeof colorMapName === "string"
        ? getRGBPointsFromPreset(colorMapName)
        : colorMapName
    return viewerStore.request(
      mesh_edges_schemas.attribute.vertex.color_map,
      { id, points, minimum, maximum },
      {
        response_function: () => {
          console.log(setMeshEdgesVertexAttributeColorMap.name, {
            id,
            colorMapName: meshEdgesVertexAttributeColorMap(id),
          })
        },
      },
    )
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
          const saved_preset = coloring_style.edge.attributes[name]
          coloring_style.edge.name = name

          let minimum, maximum, colorMap
          if (
            saved_preset &&
            saved_preset.minimum !== undefined &&
            saved_preset.maximum !== undefined
          ) {
            minimum = saved_preset.minimum
            maximum = saved_preset.maximum
            colorMap = saved_preset.colorMap
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
    const name = coloring_style.edge.name
    ensureAttributeEntry(coloring_style.edge, name)
    const saved_preset = coloring_style.edge.attributes[name]
    saved_preset.minimum = minimum
    saved_preset.maximum = maximum
    if (!mesh_edges_schemas.edge_scalar_range) {
      console.warn("setMeshEdgesEdgeAttributeRange: RPC not available")
      return Promise.resolve()
    }
    return viewerStore.request(
      mesh_edges_schemas.edge_scalar_range,
      { id, minimum, maximum },
      {
        response_function: () => {
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
    const name = coloring_style.edge.name
    ensureAttributeEntry(coloring_style.edge, name)
    const saved_preset = coloring_style.edge.attributes[name]
    saved_preset.colorMap = colorMapName
    const points =
      typeof colorMapName === "string"
        ? getRGBPointsFromPreset(colorMapName)
        : colorMapName
    if (!mesh_edges_schemas.edge_color_map) {
      console.warn("setMeshEdgesEdgeAttributeColorMap: RPC not available")
      return Promise.resolve()
    }
    return viewerStore.request(
      mesh_edges_schemas.edge_color_map,
      { id, points, minimum, maximum },
      {
        response_function: () => {
          console.log(setMeshEdgesEdgeAttributeColorMap.name, {
            id,
            colorMapName: meshEdgesEdgeAttributeColorMap(id),
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
    meshEdgesVertexAttributeName,
    meshEdgesVertexAttributeRange,
    meshEdgesVertexAttributeColorMap,
    meshEdgesEdgeAttributeName,
    meshEdgesEdgeAttributeRange,
    meshEdgesEdgeAttributeColorMap,
    setMeshEdgesVisibility,
    setMeshEdgesActiveColoring,
    setMeshEdgesColor,
    setMeshEdgesWidth,
    setMeshEdgesVertexAttributeName,
    setMeshEdgesVertexAttributeRange,
    setMeshEdgesVertexAttributeColorMap,
    setMeshEdgesEdgeAttributeName,
    setMeshEdgesEdgeAttributeRange,
    setMeshEdgesEdgeAttributeColorMap,
    applyMeshEdgesStyle,
  }
}

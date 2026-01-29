// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useDataStyleStateStore } from "../data_style_state"
import { useViewerStore } from "@ogw_front/stores/viewer"

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
        return
      }
      return setMeshEdgesVertexAttribute(id, coloring.vertex)
    } else if (type === "edge") {
      if (coloring.edge === null) {
        return
      }
      return setMeshEdgesEdgeAttribute(id, coloring.edge)
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
    const coloring_style = meshEdgesStyle(id).coloring
    const { name } = vertex_attribute
    return viewerStore.request(
      mesh_edges_schemas.vertex_attribute,
      { id, name },
      {
        response_function: () => {
          coloring_style.vertex = vertex_attribute
          console.log(
            setMeshEdgesVertexAttribute.name,
            { id },
            meshEdgesVertexAttribute(id),
          )
        },
      },
    )
  }

  function meshEdgesEdgeAttribute(id) {
    return meshEdgesStyle(id).coloring.edge
  }
  function setMeshEdgesEdgeAttribute(id, edge_attribute) {
    const coloring_style = meshEdgesStyle(id).coloring
    const { name } = edge_attribute
    return viewerStore.request(
      mesh_edges_schemas.edge_attribute,
      { id, name },
      {
        response_function: () => {
          coloring_style.edge = edge_attribute
          console.log(
            setMeshEdgesEdgeAttribute.name,
            { id },
            meshEdgesEdgeAttribute(id),
          )
        },
      },
    )
  }

  function setMeshEdgesVertexScalarRange(id, minimum, maximum) {
    return viewerStore.request(
      mesh_edges_schemas.vertex_scalar_range,
      { id, minimum, maximum },
      {
        response_function: () => {
          console.log(setMeshEdgesVertexScalarRange.name, {
            id,
            minimum,
            maximum,
          })
        },
      },
    )
  }

  function setMeshEdgesVertexColorMap(id, points) {
    return viewerStore.request(
      mesh_edges_schemas.vertex_color_map,
      { id, points },
      {
        response_function: () => {
          console.log(setMeshEdgesVertexColorMap.name, { id, points })
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
    applyMeshEdgesStyle,
    meshEdgesActiveColoring,
    meshEdgesColor,
    meshEdgesVisibility,
    meshEdgesWidth,
    meshEdgesVertexAttribute,
    meshEdgesEdgeAttribute,
    setMeshEdgesActiveColoring,
    setMeshEdgesColor,
    setMeshEdgesVisibility,
    setMeshEdgesWidth,
    setMeshEdgesVertexAttribute,
    setMeshEdgesEdgeAttribute,
    setMeshEdgesVertexScalarRange,
    setMeshEdgesVertexColorMap,
  }
}

// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useDataStyleStateStore } from "../data_style_state"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const mesh_polyhedra_schemas = viewer_schemas.opengeodeweb_viewer.mesh.polyhedra

export function useMeshPolyhedraStyle() {
  const dataStyleStateStore = useDataStyleStateStore()
  const viewerStore = useViewerStore()

  function meshPolyhedraStyle(id) {
    return dataStyleStateStore.getStyle(id).polyhedra
  }

  function meshPolyhedraVisibility(id) {
    return meshPolyhedraStyle(id).visibility
  }
  function setMeshPolyhedraVisibility(id, visibility) {
    const polyhedra_style = meshPolyhedraStyle(id)
    return viewerStore.request(
      mesh_polyhedra_schemas.visibility,
      { id, visibility },
      {
        response_function: () => {
          polyhedra_style.visibility = visibility
          console.log(
            setMeshPolyhedraVisibility.name,
            { id },
            meshPolyhedraVisibility(id),
          )
        },
      },
    )
  }
  function meshPolyhedraActiveColoring(id) {
    return meshPolyhedraStyle(id).coloring.active
  }
  function setMeshPolyhedraActiveColoring(id, type) {
    const coloring = meshPolyhedraStyle(id).coloring
    coloring.active = type
    console.log(
      setMeshPolyhedraActiveColoring.name,
      { id },
      meshPolyhedraActiveColoring(id),
    )
    if (type === "color") {
      return setMeshPolyhedraColor(id, coloring.color)
    } else if (type === "vertex") {
      if (coloring.vertex === null) {
        return
      }
      return setPolyhedraVertexAttribute(id, coloring.vertex)
    } else if (type === "polyhedron") {
      if (coloring.polyhedron === null) {
        return
      }
      return setPolyhedraPolyhedronAttribute(id, coloring.polyhedron)
    } else {
      throw new Error("Unknown mesh polyhedra coloring type: " + type)
    }
  }

  function meshPolyhedraColor(id) {
    return meshPolyhedraStyle(id).coloring.color
  }
  function setMeshPolyhedraColor(id, color) {
    const coloring = meshPolyhedraStyle(id).coloring
    return viewerStore.request(
      mesh_polyhedra_schemas.color,
      { id, color },
      {
        response_function: () => {
          coloring.color = color
          console.log(
            setMeshPolyhedraColor.name,
            { id },
            JSON.stringify(meshPolyhedraColor(id)),
          )
        },
      },
    )
  }

  function polyhedraVertexAttribute(id) {
    return meshPolyhedraStyle(id).coloring.vertex
  }
  function setPolyhedraVertexAttribute(id, vertex_attribute) {
    const coloring_style = meshPolyhedraStyle(id).coloring
    const { name } = vertex_attribute
    return viewerStore.request(
      mesh_polyhedra_schemas.vertex_attribute,
      { id, name },
      {
        response_function: () => {
          coloring_style.vertex = vertex_attribute
          console.log(
            setPolyhedraVertexAttribute.name,
            { id },
            polyhedraVertexAttribute(id),
          )
        },
      },
    )
  }

  function polyhedraPolyhedronAttribute(id) {
    return meshPolyhedraStyle(id).coloring.polyhedron
  }
  function setPolyhedraPolyhedronAttribute(id, polyhedron_attribute) {
    const coloring = meshPolyhedraStyle(id).coloring
    const { name } = polyhedron_attribute
    return viewerStore.request(
      mesh_polyhedra_schemas.polyhedron_attribute,
      { id, name },
      {
        response_function: () => {
          coloring.polyhedron = polyhedron_attribute
          console.log(
            setPolyhedraPolyhedronAttribute.name,
            { id },
            polyhedraPolyhedronAttribute(id),
          )
        },
      },
    )
  }

  function setPolyhedraPolyhedronScalarRange(id, minimum, maximum) {
    return viewerStore.request(
      mesh_polyhedra_schemas.polyhedron_scalar_range,
      { id, minimum, maximum },
      {
        response_function: () => {
          console.log(
            setPolyhedraPolyhedronScalarRange.name,
            { id, minimum, maximum },
          )
        },
      },
    )
  }

  function setPolyhedraVertexScalarRange(id, minimum, maximum) {
    return viewerStore.request(
      mesh_polyhedra_schemas.vertex_scalar_range,
      { id, minimum, maximum },
      {
        response_function: () => {
          console.log(
            setPolyhedraVertexScalarRange.name,
            { id, minimum, maximum },
          )
        },
      },
    )
  }

  function applyMeshPolyhedraStyle(id) {
    const style = meshPolyhedraStyle(id)
    return Promise.all([
      setMeshPolyhedraVisibility(id, style.visibility),
      setMeshPolyhedraActiveColoring(id, style.coloring.active),
    ])
  }

  return {
    applyMeshPolyhedraStyle,
    meshPolyhedraActiveColoring,
    meshPolyhedraColor,
    polyhedraVertexAttribute,
    meshPolyhedraVisibility,
    polyhedraPolyhedronAttribute,
    setMeshPolyhedraActiveColoring,
    setMeshPolyhedraColor,
    setPolyhedraPolyhedronAttribute,
    setPolyhedraVertexAttribute,
    setPolyhedraPolyhedronScalarRange,
    setPolyhedraVertexScalarRange,
    setMeshPolyhedraVisibility,
  }
}

// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useDataStyleStore } from "@ogw_front/stores/data_style"
import { useViewerStore } from "@ogw_front/stores/viewer"

// Local constants
const mesh_polyhedra_schemas = viewer_schemas.opengeodeweb_viewer.mesh.polyhedra

export function useMeshPolyhedraStyle() {
  const dataStyleStore = useDataStyleStore()
  const viewerStore = useViewerStore()

  function meshPolyhedraStyle(id) {
    return dataStyleStore.getStyle(id).polyhedra
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
      // } else if (type === "vertex" && coloring.vertex !== null) {
      //   return setPolyhedraVertexAttribute(id, coloring.vertex)
      // } else if (type === "polyhedron" && coloring.polyhedron !== null) {
      //   return setPolyhedraPolyhedronAttribute(id, coloring.polyhedron)
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

  // function polyhedraVertexAttribute(id) {
  //   return meshPolyhedraStyle(id).coloring.vertex
  // }
  // function setPolyhedraVertexAttribute(id, vertex_attribute) {
  //   const coloring_style = meshPolyhedraStyle(id).coloring
  //   return viewerStore.request(
  //     mesh_polyhedra_schemas.vertex_attribute,
  //     { id, ...vertex_attribute },
  //     {
  //       response_function: () => {
  //         coloring_style.vertex = vertex_attribute
  //         console.log(
  //           setPolyhedraVertexAttribute.name} ${polyhedraVertexAttribute(id),
  //         )
  //       },
  //     },
  //   )
  // }

  // function polyhedraPolygonAttribute(id) {
  //   return meshPolyhedraStyle(id).coloring.polygon
  // }
  // function setPolyhedraPolygonAttribute(id, polygon_attribute) {
  //   const coloring_style = meshPolyhedraStyle(id).coloring
  //   return viewerStore.request(
  //     mesh_polyhedra_schemas.polygon_attribute,
  //     { id, ...polygon_attribute },
  //     {
  //       response_function: () => {
  //         coloring_style.polygon = polygon_attribute
  //         console.log(
  //           setPolyhedraPolygonAttribute.name} ${polyhedraPolygonAttribute(id),
  //         )
  //       },
  //     },
  //   )
  // }

  // function polyhedraPolyhedronAttribute(id) {
  //   return meshPolyhedraStyle(id).coloring.polyhedron
  // }
  // function setPolyhedraPolyhedronAttribute(id, polyhedron_attribute) {
  //   const coloring = meshPolyhedraStyle(id).coloring
  //   return viewerStore.request(
  //     mesh_polyhedra_schemas.polyhedron_attribute,
  //     { id, ...polyhedron_attribute },
  //     {
  //       response_function: () => {
  //         coloring.polyhedron = polyhedron_attribute
  //         console.log(
  //           setPolyhedraPolyhedronAttribute.name} ${polyhedraPolyhedronAttribute(id),
  //         )
  //       },
  //     },
  //   )
  // }

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
    // polyhedraVertexAttribute,
    meshPolyhedraVisibility,
    // polyhedraPolyhedronAttribute,
    // polyhedraPolygonAttribute,
    setMeshPolyhedraActiveColoring,
    setMeshPolyhedraColor,
    // setPolyhedraPolyhedronAttribute,
    // setPolyhedraPolygonAttribute,
    // setPolyhedraVertexAttribute,
    setMeshPolyhedraVisibility,
  }
}

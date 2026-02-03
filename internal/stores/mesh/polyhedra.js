// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useDataStyleStateStore } from "../data_style_state"
import { useViewerStore } from "@ogw_front/stores/viewer"
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap"

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
      if (coloring.vertex) {
        return setMeshPolyhedraVertexAttribute(id, coloring.vertex)
      }
      return Promise.resolve()
    } else if (type === "polyhedron") {
      if (coloring.polyhedron) {
        return setMeshPolyhedraPolyhedronAttribute(id, coloring.polyhedron)
      }
      return Promise.resolve()
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

  function meshPolyhedraVertexAttribute(id) {
    return meshPolyhedraStyle(id).coloring.vertex
  }
  function setMeshPolyhedraVertexAttribute(id, vertex_attribute) {
    const coloring_style = meshPolyhedraStyle(id).coloring
    const { name } = vertex_attribute
    return viewerStore.request(
      mesh_polyhedra_schemas.vertex_attribute,
      { id, name },
      {
        response_function: () => {
          coloring_style.vertex = vertex_attribute
          console.log(
            setMeshPolyhedraVertexAttribute.name,
            { id },
            meshPolyhedraVertexAttribute(id),
          )
        },
      },
    )
  }

  function meshPolyhedraPolyhedronAttribute(id) {
    return meshPolyhedraStyle(id).coloring.polyhedron
  }
  function setMeshPolyhedraPolyhedronAttribute(id, polyhedron_attribute) {
    const coloring = meshPolyhedraStyle(id).coloring
    const { name } = polyhedron_attribute
    return viewerStore.request(
      mesh_polyhedra_schemas.polyhedron_attribute,
      { id, name },
      {
        response_function: () => {
          coloring.polyhedron = polyhedron_attribute
          console.log(
            setMeshPolyhedraPolyhedronAttribute.name,
            { id },
            meshPolyhedraPolyhedronAttribute(id),
          )
        },
      },
    )
  }

  function setMeshPolyhedraPolyhedronScalarRange(id, minimum, maximum) {
    const polyhedra_style = meshPolyhedraStyle(id)
    return viewerStore.request(
      mesh_polyhedra_schemas.polyhedron_scalar_range,
      { id, minimum, maximum },
      {
        response_function: () => {
          polyhedra_style.coloring.polyhedron.min = minimum
          polyhedra_style.coloring.polyhedron.max = maximum
          console.log(setMeshPolyhedraPolyhedronScalarRange.name, {
            id,
            minimum,
            maximum,
          })
        },
      },
    )
  }

  function setMeshPolyhedraVertexScalarRange(id, minimum, maximum) {
    const polyhedra_style = meshPolyhedraStyle(id)
    return viewerStore.request(
      mesh_polyhedra_schemas.vertex_scalar_range,
      { id, minimum, maximum },
      {
        response_function: () => {
          polyhedra_style.coloring.vertex.min = minimum
          polyhedra_style.coloring.vertex.max = maximum
          console.log(setMeshPolyhedraVertexScalarRange.name, {
            id,
            minimum,
            maximum,
          })
        },
      },
    )
  }

  function setMeshPolyhedraVertexColorMap(id, points, minimum, maximum) {
    const polyhedra_style = meshPolyhedraStyle(id)
    if (typeof points === "string") {
      points = getRGBPointsFromPreset(points)
    }
    return viewerStore.request(
      mesh_polyhedra_schemas.vertex_color_map,
      { id, points, minimum, maximum },
      {
        response_function: () => {
          polyhedra_style.coloring.vertex.colorMap = points
          console.log(setMeshPolyhedraVertexColorMap.name, {
            id,
            points,
            minimum,
            maximum,
          })
        },
      },
    )
  }

  function setMeshPolyhedraPolyhedronColorMap(id, points, minimum, maximum) {
    const polyhedra_style = meshPolyhedraStyle(id)
    if (typeof points === "string") {
      points = getRGBPointsFromPreset(points)
    }
    return viewerStore.request(
      mesh_polyhedra_schemas.polyhedra_color_map,
      { id, points, minimum, maximum },
      {
        response_function: () => {
          polyhedra_style.coloring.polyhedron.colorMap = points
          console.log(setMeshPolyhedraPolyhedronColorMap.name, {
            id,
            points,
            minimum,
            maximum,
          })
        },
      },
    )
  }

  function applyMeshPolyhedraStyle(id) {
    const style = meshPolyhedraStyle(id)
    const promises = [
      setMeshPolyhedraVisibility(id, style.visibility),
      setMeshPolyhedraActiveColoring(id, style.coloring.active),
    ]

    if (style.coloring.active === "vertex" && style.coloring.vertex) {
      const { min, max, colorMap } = style.coloring.vertex
      if (min !== undefined && max !== undefined) {
        promises.push(setMeshPolyhedraVertexScalarRange(id, min, max))
        if (colorMap) {
          promises.push(setMeshPolyhedraVertexColorMap(id, colorMap, min, max))
        }
      }
    } else if (
      style.coloring.active === "polyhedron" &&
      style.coloring.polyhedron
    ) {
      const { min, max, colorMap } = style.coloring.polyhedron
      if (min !== undefined && max !== undefined) {
        promises.push(setMeshPolyhedraPolyhedronScalarRange(id, min, max))
        if (colorMap) {
          promises.push(
            setMeshPolyhedraPolyhedronColorMap(id, colorMap, min, max),
          )
        }
      }
    }

    return Promise.all(promises)
  }

  return {
    applyMeshPolyhedraStyle,
    meshPolyhedraActiveColoring,
    meshPolyhedraColor,
    meshPolyhedraVertexAttribute,
    meshPolyhedraVisibility,
    meshPolyhedraPolyhedronAttribute,
    setMeshPolyhedraActiveColoring,
    setMeshPolyhedraColor,
    setMeshPolyhedraPolyhedronAttribute,
    setMeshPolyhedraVertexAttribute,
    setMeshPolyhedraPolyhedronScalarRange,
    setMeshPolyhedraVertexScalarRange,
    setMeshPolyhedraVertexColorMap,
    setMeshPolyhedraPolyhedronColorMap,
    setMeshPolyhedraVisibility,
  }
}

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
    return setMeshPolyhedraVertexAttributeName(id, vertex_attribute.name)
  }
  function meshPolyhedraVertexAttributeName(id) {
    const vertex = meshPolyhedraStyle(id).coloring.vertex
    return vertex ? vertex.name : ""
  }
  function setMeshPolyhedraVertexAttributeName(id, name) {
    const coloring_style = meshPolyhedraStyle(id).coloring
    return viewerStore.request(
      mesh_polyhedra_schemas.attribute.vertex.name,
      { id, name },
      {
        response_function: () => {
          if (!coloring_style.vertex) {
            coloring_style.vertex = {}
          }
          coloring_style.vertex.name = name
          console.log(setMeshPolyhedraVertexAttributeName.name, { id }, name)
        },
      },
    )
  }
  function meshPolyhedraVertexAttributeRange(id) {
    const vertex = meshPolyhedraStyle(id).coloring.vertex
    return vertex ? [vertex.minimum, vertex.maximum] : [0, 1]
  }
  function setMeshPolyhedraVertexAttributeRange(id, min, max) {
    const coloring_style = meshPolyhedraStyle(id).coloring
    return viewerStore.request(
      mesh_polyhedra_schemas.attribute.vertex.scalar_range,
      { id, minimum: min, maximum: max },
      {
        response_function: () => {
          if (!coloring_style.vertex) {
            coloring_style.vertex = {}
          }
          coloring_style.vertex.minimum = min
          coloring_style.vertex.maximum = max
          console.log(setMeshPolyhedraVertexAttributeRange.name, {
            id,
            min,
            max,
          })
        },
      },
    )
  }
  function meshPolyhedraVertexAttributeColorMap(id) {
    const vertex = meshPolyhedraStyle(id).coloring.vertex
    return vertex ? vertex.colorMap : null
  }
  function setMeshPolyhedraVertexAttributeColorMap(
    id,
    points,
    minimum,
    maximum,
  ) {
    const coloring_style = meshPolyhedraStyle(id).coloring
    if (typeof points === "string") {
      points = getRGBPointsFromPreset(points)
    }
    return viewerStore.request(
      mesh_polyhedra_schemas.attribute.vertex.color_map,
      { id, points, minimum, maximum },
      {
        response_function: () => {
          if (!coloring_style.vertex) {
            coloring_style.vertex = {}
          }
          coloring_style.vertex.colorMap = points
          console.log(setMeshPolyhedraVertexAttributeColorMap.name, {
            id,
            points,
          })
        },
      },
    )
  }

  function meshPolyhedraPolyhedronAttribute(id) {
    return meshPolyhedraStyle(id).coloring.polyhedron
  }
  function setMeshPolyhedraPolyhedronAttribute(id, polyhedron_attribute) {
    return setMeshPolyhedraPolyhedronAttributeName(
      id,
      polyhedron_attribute.name,
    )
  }
  function meshPolyhedraPolyhedronAttributeName(id) {
    const polyhedron = meshPolyhedraStyle(id).coloring.polyhedron
    return polyhedron ? polyhedron.name : ""
  }
  function setMeshPolyhedraPolyhedronAttributeName(id, name) {
    const coloring_style = meshPolyhedraStyle(id).coloring
    return viewerStore.request(
      mesh_polyhedra_schemas.attribute.polyhedron.name,
      { id, name },
      {
        response_function: () => {
          if (!coloring_style.polyhedron) {
            coloring_style.polyhedron = {}
          }
          coloring_style.polyhedron.name = name
          console.log(
            setMeshPolyhedraPolyhedronAttributeName.name,
            { id },
            name,
          )
        },
      },
    )
  }
  function meshPolyhedraPolyhedronAttributeRange(id) {
    const polyhedron = meshPolyhedraStyle(id).coloring.polyhedron
    return polyhedron ? [polyhedron.minimum, polyhedron.maximum] : [0, 1]
  }
  function setMeshPolyhedraPolyhedronAttributeRange(id, min, max) {
    const coloring_style = meshPolyhedraStyle(id).coloring
    return viewerStore.request(
      mesh_polyhedra_schemas.attribute.polyhedron.scalar_range,
      { id, minimum: min, maximum: max },
      {
        response_function: () => {
          if (!coloring_style.polyhedron) {
            coloring_style.polyhedron = {}
          }
          coloring_style.polyhedron.minimum = min
          coloring_style.polyhedron.maximum = max
          console.log(setMeshPolyhedraPolyhedronAttributeRange.name, {
            id,
            min,
            max,
          })
        },
      },
    )
  }
  function meshPolyhedraPolyhedronAttributeColorMap(id) {
    const polyhedron = meshPolyhedraStyle(id).coloring.polyhedron
    return polyhedron ? polyhedron.colorMap : null
  }
  function setMeshPolyhedraPolyhedronAttributeColorMap(
    id,
    points,
    minimum,
    maximum,
  ) {
    const coloring_style = meshPolyhedraStyle(id).coloring
    if (typeof points === "string") {
      points = getRGBPointsFromPreset(points)
    }
    return viewerStore.request(
      mesh_polyhedra_schemas.attribute.polyhedron.color_map,
      { id, points, minimum, maximum },
      {
        response_function: () => {
          if (!coloring_style.polyhedron) {
            coloring_style.polyhedron = {}
          }
          coloring_style.polyhedron.colorMap = points
          console.log(setMeshPolyhedraPolyhedronAttributeColorMap.name, {
            id,
            points,
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
      const { name, minimum, maximum, colorMap } = style.coloring.vertex
      if (name) {
        promises.push(setMeshPolyhedraVertexAttributeName(id, name))
      }
      if (minimum !== undefined && maximum !== undefined) {
        promises.push(
          setMeshPolyhedraVertexAttributeRange(id, minimum, maximum),
        )
        if (colorMap) {
          promises.push(
            setMeshPolyhedraVertexAttributeColorMap(
              id,
              colorMap,
              minimum,
              maximum,
            ),
          )
        }
      }
    } else if (
      style.coloring.active === "polyhedron" &&
      style.coloring.polyhedron
    ) {
      const { name, minimum, maximum, colorMap } = style.coloring.polyhedron
      if (name) {
        promises.push(setMeshPolyhedraPolyhedronAttributeName(id, name))
      }
      if (minimum !== undefined && maximum !== undefined) {
        promises.push(
          setMeshPolyhedraPolyhedronScalarRange(id, minimum, maximum),
        )
        if (colorMap) {
          promises.push(
            setMeshPolyhedraPolyhedronColorMap(id, colorMap, minimum, maximum),
          )
        }
      }
    }

    return Promise.all(promises)
  }

  return {
    meshPolyhedraVisibility,
    meshPolyhedraActiveColoring,
    meshPolyhedraColor,
    meshPolyhedraVertexAttribute,
    meshPolyhedraVertexAttributeName,
    meshPolyhedraVertexAttributeRange,
    meshPolyhedraVertexAttributeColorMap,
    meshPolyhedraPolyhedronAttribute,
    meshPolyhedraPolyhedronAttributeName,
    meshPolyhedraPolyhedronAttributeRange,
    meshPolyhedraPolyhedronAttributeColorMap,
    setMeshPolyhedraVisibility,
    setMeshPolyhedraActiveColoring,
    setMeshPolyhedraColor,
    setMeshPolyhedraVertexAttribute,
    setMeshPolyhedraVertexAttributeName,
    setMeshPolyhedraVertexAttributeRange,
    setMeshPolyhedraVertexAttributeColorMap,
    setMeshPolyhedraPolyhedronAttribute,
    setMeshPolyhedraPolyhedronAttributeName,
    setMeshPolyhedraPolyhedronAttributeRange,
    setMeshPolyhedraPolyhedronAttributeColorMap,
    applyMeshPolyhedraStyle,
  }
}
